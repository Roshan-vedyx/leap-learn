// src/pages/SentenceBuildingPage.tsx
// Enhanced with visual scaffolding and smart word filtering
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'
import { sentenceTemplates, getWordsByThemeAndDifficulty } from '@/data/wordBank'

interface SentenceBuildingPageProps {
  theme: string
}

// NEW: Sentence slot interface for visual scaffolding
interface SentenceSlot {
  id: string
  type: 'fixed' | 'animal' | 'adjective' | 'action' | 'color' | 'number' | 'object' | 'place' | 'space' | 'food' | 'vehicle' | 'taste' | 'meal' | 'temperature' | 'speed' | 'part'
  content: string
  filled: boolean
  validWords?: string[]
}

const SentenceBuildingPage: React.FC<SentenceBuildingPageProps> = ({ theme }) => {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0)
  const [sentenceSlots, setSentenceSlots] = useState<SentenceSlot[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null)
  const [isSentenceComplete, setIsSentenceComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [, setLocation] = useLocation()

  // Get theme-specific templates
  const templates = sentenceTemplates[theme as keyof typeof sentenceTemplates] || sentenceTemplates.animals
  const currentTemplate = templates[currentTemplateIndex]
  
  // Get words built in previous session
  const themeWords = [
    ...getWordsByThemeAndDifficulty(theme, 'easy'),
    ...getWordsByThemeAndDifficulty(theme, 'regular')
  ].map(word => word.toUpperCase())

  // NEW: Parse template into visual sentence slots
  const parseTemplateIntoSlots = (template: string) => {
    const words = template.split(' ')
    const slots: SentenceSlot[] = []
    
    words.forEach((word, index) => {
      if (word.startsWith('[') && word.endsWith(']')) {
        // This is a fillable slot
        const slotType = word.slice(1, -1).toLowerCase()
        slots.push({
          id: `slot-${index}`,
          type: slotType as any,
          content: '',
          filled: false,
          validWords: getValidWordsForSlotType(slotType)
        })
      } else {
        // This is a fixed word
        slots.push({
          id: `fixed-${index}`,
          type: 'fixed',
          content: word,
          filled: true
        })
      }
    })
    
    return slots
  }

  // NEW: Get valid words for a specific slot type (smart filtering!)
  const getValidWordsForSlotType = (slotType: string): string[] => {
    switch (slotType) {
      case 'animal':
        return themeWords.filter(word => 
          getWordsByThemeAndDifficulty('animals', 'easy').concat(
            getWordsByThemeAndDifficulty('animals', 'regular')
          ).map(w => w.toUpperCase()).includes(word)
        )
      case 'space':
        return themeWords.filter(word => 
          getWordsByThemeAndDifficulty('space', 'easy').concat(
            getWordsByThemeAndDifficulty('space', 'regular')
          ).map(w => w.toUpperCase()).includes(word)
        )
      case 'food':
        return themeWords.filter(word => 
          getWordsByThemeAndDifficulty('food', 'easy').concat(
            getWordsByThemeAndDifficulty('food', 'regular')
          ).map(w => w.toUpperCase()).includes(word)
        )
      case 'vehicle':
        return themeWords.filter(word => 
          getWordsByThemeAndDifficulty('vehicles', 'easy').concat(
            getWordsByThemeAndDifficulty('vehicles', 'regular')
          ).map(w => w.toUpperCase()).includes(word)
        )
      case 'adjective':
        return currentTemplate.adjectives || ['BIG', 'SMALL', 'FAST', 'CUTE', 'FUNNY', 'SMART']
      case 'action':
        return currentTemplate.actions || ['RUN', 'JUMP', 'SWIM', 'FLY', 'PLAY', 'SLEEP']
      case 'color':
        return currentTemplate.colors || ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'BLACK']
      case 'number':
        return currentTemplate.numbers || ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'MANY']
      case 'object':
        return currentTemplate.objects || ['BALL', 'BOOK', 'CHAIR', 'TREE', 'HOUSE']
      case 'place':
        return currentTemplate.places || ['HOME', 'SCHOOL', 'PARK', 'STORE', 'BEACH']
      case 'taste':
        return currentTemplate.tastes || ['SWEET', 'SOUR', 'SPICY', 'SALTY', 'YUMMY']
      case 'meal':
        return currentTemplate.meals || ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK']
      case 'temperature':
        return currentTemplate.temperatures || ['HOT', 'COLD', 'WARM', 'FROZEN']
      case 'speed':
        return currentTemplate.speeds || ['FAST', 'SLOW', 'QUICK']
      case 'part':
        return currentTemplate.parts || ['WHEELS', 'DOORS', 'WINDOWS', 'SEATS']
      default:
        return []
    }
  }

  // Initialize sentence slots when template changes
  useEffect(() => {
    if (currentTemplate) {
      const slots = parseTemplateIntoSlots(currentTemplate.template)
      setSentenceSlots(slots)
      
      // Create word bank from all possible words
      const allValidWords = new Set<string>()
      
      slots.forEach(slot => {
        if (slot.validWords) {
          slot.validWords.forEach(word => allValidWords.add(word))
        }
      })
      
      // Add theme words
      themeWords.forEach(word => allValidWords.add(word))
      
      setAvailableWords(Array.from(allValidWords))
      setCurrentSlotIndex(null)
      setIsSentenceComplete(false)
      setShowCelebration(false)
    }
  }, [currentTemplate, theme])

  // Check if sentence is complete
  useEffect(() => {
    const allSlotsFilled = sentenceSlots.every(slot => slot.filled)
    
    if (allSlotsFilled && sentenceSlots.length > 0) {
      setIsSentenceComplete(true)
      setShowCelebration(true)
      
      // Read the completed sentence
      const sentence = sentenceSlots.map(slot => slot.content).join(' ')
      handleReadAloud(sentence)
    } else {
      setIsSentenceComplete(false)
      setShowCelebration(false)
    }
  }, [sentenceSlots])

  // NEW: Handle slot click (to select for filling)
  const handleSlotClick = (slotIndex: number) => {
    const slot = sentenceSlots[slotIndex]
    if (slot.type !== 'fixed') {
      setCurrentSlotIndex(slotIndex)
    }
  }

  // NEW: Handle word click (to fill current slot)
  const handleWordClick = (word: string) => {
    if (currentSlotIndex === null) return
    
    const currentSlot = sentenceSlots[currentSlotIndex]
    
    // Check if word is valid for this slot
    if (currentSlot.validWords && !currentSlot.validWords.includes(word)) {
      // Show gentle feedback instead of rejecting
      console.log(`"${word}" doesn't quite fit here. Try another word!`)
      return
    }
    
    // Fill the slot
    const newSlots = [...sentenceSlots]
    newSlots[currentSlotIndex] = {
      ...currentSlot,
      content: word,
      filled: true
    }
    
    setSentenceSlots(newSlots)
    
    // Remove word from available words
    setAvailableWords(prev => prev.filter(w => w !== word))
    
    // Move to next empty slot
    const nextEmptySlot = newSlots.findIndex((slot, index) => 
      index > currentSlotIndex && !slot.filled && slot.type !== 'fixed'
    )
    
    setCurrentSlotIndex(nextEmptySlot === -1 ? null : nextEmptySlot)
  }

  // NEW: Handle slot clearing
  const handleSlotClear = (slotIndex: number) => {
    const slot = sentenceSlots[slotIndex]
    if (slot.type === 'fixed' || !slot.filled) return
    
    // Clear the slot
    const newSlots = [...sentenceSlots]
    newSlots[slotIndex] = {
      ...slot,
      content: '',
      filled: false
    }
    
    setSentenceSlots(newSlots)
    
    // Add word back to available words
    setAvailableWords(prev => [...prev, slot.content])
    
    // Select this slot for refilling
    setCurrentSlotIndex(slotIndex)
  }

  // NEW: Get filtered words for current slot
  const getFilteredWordsForCurrentSlot = (): string[] => {
    if (currentSlotIndex === null) return availableWords
    
    const currentSlot = sentenceSlots[currentSlotIndex]
    if (!currentSlot.validWords) return availableWords
    
    return availableWords.filter(word => currentSlot.validWords!.includes(word))
  }

  const handleReadAloud = async (text: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    
    setIsReading(true)
    try {
      const voices = audio.getChildVoices()
      const selectedVoice = voices[0] || audio.getVoices()[0]
      
      await audio.speak(text, {
        voice: selectedVoice,
        rate: 0.8,
        pitch: 1.1
      })
    } catch (error) {
      console.error('Text-to-speech error:', error)
    } finally {
      setIsReading(false)
    }
  }

  const handleNextTemplate = () => {
    if (currentTemplateIndex < templates.length - 1) {
      setCurrentTemplateIndex(currentTemplateIndex + 1)
    } else {
      // Complete! Go to celebration
      storage.set('word-building-completed', {
        theme,
        completedAt: new Date().toISOString(),
        sentencesBuilt: currentTemplateIndex + 1
      })
      setLocation('/celebrate')
    }
  }

  const handleReset = () => {
    const slots = parseTemplateIntoSlots(currentTemplate.template)
    setSentenceSlots(slots)
    
    // Reset available words
    const allValidWords = new Set<string>()
    slots.forEach(slot => {
      if (slot.validWords) {
        slot.validWords.forEach(word => allValidWords.add(word))
      }
    })
    themeWords.forEach(word => allValidWords.add(word))
    setAvailableWords(Array.from(allValidWords))
    
    setCurrentSlotIndex(null)
  }

  const getThemeLabel = () => {
    switch (theme) {
      case 'animals': return 'Amazing Animals'
      case 'space': return 'Space Adventure'
      case 'food': return 'Yummy Food'
      case 'vehicles': return 'Cool Vehicles'
      default: return 'Word Building'
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-sage to-autism-calm-mint p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-autism-primary mb-2">
            Time to Build Sentences! 
          </h1>
          <p className="text-lg text-autism-primary/80">
            Use your {getThemeLabel().toLowerCase()} words to create awesome sentences!
          </p>
        </div>

        {/* Template Helper */}
        <Card className="mb-6 bg-autism-neutral border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              💡 Sentence Idea:
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-autism-primary/80 mb-4">
              Try making a sentence like: <strong>"{currentTemplate.template}"</strong>
            </p>
            <p className="text-sm text-autism-primary/60">
              {currentTemplate.hint || "Use the words below to fill in the blanks and make it your own!"}
            </p>
          </CardContent>
        </Card>

        {/* NEW: Visual Sentence Frame */}
        <Card className="mb-6 bg-white border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              ✍️ Build Your Sentence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <p className="text-center text-sm text-autism-primary/70 mb-6">
                Click on the empty boxes to fill them with words!
              </p>
              
              {/* NEW: Visual Sentence Slots */}
              <div className="flex flex-wrap justify-center gap-3 mb-6">
                {sentenceSlots.map((slot, index) => (
                  <div
                    key={slot.id}
                    onClick={() => handleSlotClick(index)}
                    className={`
                      relative min-w-[80px] min-h-[60px] border-2 rounded-lg flex items-center justify-center
                      text-lg font-semibold cursor-pointer transition-all duration-200
                      ${slot.type === 'fixed' 
                        ? 'bg-autism-neutral text-autism-primary border-autism-primary/30 cursor-default' 
                        : slot.filled
                          ? 'bg-autism-secondary text-white border-autism-secondary hover:bg-autism-secondary/80'
                          : currentSlotIndex === index
                            ? 'bg-yellow-100 border-yellow-400 border-dashed animate-pulse'
                            : 'bg-gray-100 border-gray-300 border-dashed hover:bg-gray-200'
                      }
                    `}
                  >
                    {slot.filled ? (
                      <div className="flex items-center gap-2">
                        <span>{slot.content}</span>
                        {slot.type !== 'fixed' && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleSlotClear(index)
                            }}
                            className="text-xs bg-white/20 rounded-full w-5 h-5 flex items-center justify-center hover:bg-white/40"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-500 text-sm">
                        {slot.type.toUpperCase()}
                      </span>
                    )}
                  </div>
                ))}
              </div>

              {/* NEW: Current Slot Hint */}
              {currentSlotIndex !== null && (
                <div className="text-center mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm text-yellow-800">
                    Choose a <strong>{sentenceSlots[currentSlotIndex].type}</strong> word from below:
                  </p>
                </div>
              )}
            </div>

            {/* NEW: Available Words (Filtered) */}
            <div>
              <p className="text-center text-sm text-autism-primary/70 mb-3">
                Available words:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {getFilteredWordsForCurrentSlot().map((word, index) => (
                  <button
                    key={`word-${index}`}
                    onClick={() => handleWordClick(word)}
                    className={`
                      px-4 py-2 rounded-lg text-lg font-semibold transition-colors border-2
                      ${currentSlotIndex !== null && 
                        sentenceSlots[currentSlotIndex]?.validWords?.includes(word)
                        ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200'
                        : 'bg-gray-200 text-autism-primary border-autism-primary/20 hover:bg-gray-300'
                      }
                    `}
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Celebration */}
        {showCelebration && (
          <Card className="mb-6 bg-green-100 border-green-400 border-2 animate-pulse">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Fantastic sentence!
              </h3>
              <p className="text-green-700 text-lg mb-4">
                "{sentenceSlots.map(slot => slot.content).join(' ')}."
              </p>
              <p className="text-green-600">
                You're officially a sentence building superstar!
              </p>
              
              {/* Read Sentence Button */}
              <Button
                variant="outline"
                onClick={() => handleReadAloud(sentenceSlots.map(slot => slot.content).join(' '))}
                disabled={isReading}
                className="mt-4 text-lg"
              >
                {isReading ? '🗣️ Reading...' : '🔊 Hear my sentence again'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isSentenceComplete && (
            <Button
              variant="outline"
              onClick={handleReset}
              size="comfortable"
            >
              🔄 Start over
            </Button>
          )}
          
          {isSentenceComplete && (
            <Button
              variant="celebration"
              onClick={handleNextTemplate}
              size="comfortable"
              className="text-xl px-8 py-4"
            >
              {currentTemplateIndex < templates.length - 1 ? 
                "Build Another Sentence! →" : 
                "Celebrate My Success! 🎉"
              }
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <p className="text-sm text-autism-primary/70">
            Sentence {currentTemplateIndex + 1} of {templates.length}
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are building sentences using words from the {theme} theme. 
            Click on empty slots to select them, then click on available words to fill them.
            Try to follow the suggested sentence pattern, but feel free to be creative!
          </p>
        </div>
      </div>
    </div>
  )
}

export default SentenceBuildingPage