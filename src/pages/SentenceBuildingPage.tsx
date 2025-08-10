// src/pages/SentenceBuildingPage.tsx
// Enhanced click-to-build system optimized for motor planning accessibility
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'
import { sentenceTemplates, getWordsByThemeAndDifficulty } from '@/data/wordBank'

interface SentenceBuildingPageProps {
  theme: string
}

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
  const [wordFeedback, setWordFeedback] = useState<string>('')
  const [showHints, setShowHints] = useState(true)
  const [, setLocation] = useLocation()

  // Get theme-specific templates
  const templates = sentenceTemplates[theme as keyof typeof sentenceTemplates] || sentenceTemplates.animals
  const currentTemplate = templates[currentTemplateIndex]
  
  // Get words built in previous session
  const themeWords = [
    ...getWordsByThemeAndDifficulty(theme, 'easy'),
    ...getWordsByThemeAndDifficulty(theme, 'regular')
  ].map(word => word.toUpperCase())

  // Parse template into visual sentence slots
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

  // Get valid words for a specific slot type with enhanced filtering
  const getValidWordsForSlotType = (slotType: string): string[] => {
    const baseWords = (() => {
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
          return currentTemplate.adjectives || ['BIG', 'SMALL', 'FAST', 'CUTE', 'FUNNY', 'SMART', 'HAPPY', 'BRAVE']
        case 'action':
          return currentTemplate.actions || ['RUN', 'JUMP', 'SWIM', 'FLY', 'PLAY', 'SLEEP', 'EAT', 'DANCE']
        case 'color':
          return currentTemplate.colors || ['RED', 'BLUE', 'GREEN', 'YELLOW', 'PURPLE', 'BLACK', 'WHITE', 'PINK']
        case 'number':
          return currentTemplate.numbers || ['ONE', 'TWO', 'THREE', 'FOUR', 'FIVE', 'MANY', 'SOME']
        case 'object':
          return currentTemplate.objects || ['BALL', 'BOOK', 'CHAIR', 'TREE', 'HOUSE', 'TOY', 'FLOWER']
        case 'place':
          return currentTemplate.places || ['HOME', 'SCHOOL', 'PARK', 'STORE', 'BEACH', 'GARDEN', 'PLAYGROUND']
        case 'taste':
          return currentTemplate.tastes || ['SWEET', 'SOUR', 'SPICY', 'SALTY', 'YUMMY', 'DELICIOUS']
        case 'meal':
          return currentTemplate.meals || ['BREAKFAST', 'LUNCH', 'DINNER', 'SNACK', 'TREAT']
        case 'temperature':
          return currentTemplate.temperatures || ['HOT', 'COLD', 'WARM', 'COOL', 'FROZEN']
        case 'speed':
          return currentTemplate.speeds || ['FAST', 'SLOW', 'QUICK', 'SUPER FAST']
        case 'part':
          return currentTemplate.parts || ['WHEELS', 'DOORS', 'WINDOWS', 'SEATS', 'ENGINE']
        default:
          return []
      }
    })()
    
    // Always include theme words as backup options
    return [...new Set([...baseWords, ...themeWords])]
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
      
      // Auto-select first empty slot for better UX
      const firstEmptySlot = slots.findIndex(slot => !slot.filled && slot.type !== 'fixed')
      setCurrentSlotIndex(firstEmptySlot === -1 ? null : firstEmptySlot)
      
      setIsSentenceComplete(false)
      setShowCelebration(false)
      setWordFeedback('')
    }
  }, [currentTemplate, theme])

  // Check if sentence is complete
  useEffect(() => {
    const allSlotsFilled = sentenceSlots.every(slot => slot.filled)
    
    if (allSlotsFilled && sentenceSlots.length > 0) {
      setIsSentenceComplete(true)
      setShowCelebration(true)
      setCurrentSlotIndex(null)
      
      // Read the completed sentence with a small delay for better UX
      setTimeout(() => {
        const sentence = sentenceSlots.map(slot => slot.content).join(' ')
        handleReadAloud(sentence)
      }, 500)
    } else {
      setIsSentenceComplete(false)
      setShowCelebration(false)
    }
  }, [sentenceSlots])

  // Enhanced slot click handler with audio feedback
  const handleSlotClick = async (slotIndex: number) => {
    const slot = sentenceSlots[slotIndex]
    if (slot.type === 'fixed') return
    
    setCurrentSlotIndex(slotIndex)
    setWordFeedback('')
    
    // Audio feedback for slot selection
    if (audio.isSpeechSynthesisSupported()) {
      const slotType = slot.type.replace('_', ' ')
      await handleReadAloud(`Choose a ${slotType} word`)
    }
  }

  // Enhanced word click handler with smart feedback
  const handleWordClick = async (word: string) => {
    if (currentSlotIndex === null) {
      // Auto-select first available slot if none selected
      const firstEmptySlot = sentenceSlots.findIndex(slot => !slot.filled && slot.type !== 'fixed')
      if (firstEmptySlot !== -1) {
        setCurrentSlotIndex(firstEmptySlot)
        // Retry with the auto-selected slot
        setTimeout(() => handleWordClick(word), 100)
        return
      }
      setWordFeedback('👆 First click on an empty box, then choose your word!')
      return
    }
    
    const currentSlot = sentenceSlots[currentSlotIndex]
    
    // Enhanced word validation with helpful feedback
    if (currentSlot.validWords && !currentSlot.validWords.includes(word)) {
      setWordFeedback(`💡 "${word}" doesn't fit here. Try a ${currentSlot.type} word!`)
      
      // Audio feedback for wrong choice
      if (audio.isSpeechSynthesisSupported()) {
        await handleReadAloud(`Try a ${currentSlot.type} word instead`)
      }
      
      // Clear feedback after 3 seconds
      setTimeout(() => setWordFeedback(''), 3000)
      return
    }
    
    // Success! Fill the slot
    const newSlots = [...sentenceSlots]
    newSlots[currentSlotIndex] = {
      ...currentSlot,
      content: word,
      filled: true
    }
    
    setSentenceSlots(newSlots)
    
    // Remove word from available words
    setAvailableWords(prev => prev.filter(w => w !== word))
    
    // Positive feedback
    setWordFeedback(`✨ Great choice! "${word}" fits perfectly!`)
    
    // Audio celebration for correct choice
    if (audio.isSpeechSynthesisSupported()) {
      await handleReadAloud(`Great! ${word}`)
    }
    
    // Auto-advance to next empty slot
    const nextEmptySlot = newSlots.findIndex((slot, index) => 
      index > currentSlotIndex && !slot.filled && slot.type !== 'fixed'
    )
    
    setCurrentSlotIndex(nextEmptySlot === -1 ? null : nextEmptySlot)
    
    // Clear feedback after 2 seconds
    setTimeout(() => setWordFeedback(''), 2000)
  }

  // Enhanced slot clearing with confirmation
  const handleSlotClear = async (slotIndex: number) => {
    const slot = sentenceSlots[slotIndex]
    if (slot.type === 'fixed' || !slot.filled) return
    
    // Clear the slot
    const newSlots = [...sentenceSlots]
    const originalWord = slot.content
    
    newSlots[slotIndex] = {
      ...slot,
      content: '',
      filled: false
    }
    
    setSentenceSlots(newSlots)
    
    // Add word back to available words
    setAvailableWords(prev => [...prev, originalWord].sort())
    
    // Select this slot for refilling
    setCurrentSlotIndex(slotIndex)
    
    // Feedback
    setWordFeedback(`🔄 "${originalWord}" is back in your word bank!`)
    
    // Audio feedback
    if (audio.isSpeechSynthesisSupported()) {
      await handleReadAloud(`${originalWord} removed`)
    }
    
    setTimeout(() => setWordFeedback(''), 2000)
  }

  // Get filtered and highlighted words for current slot
  const getWordDisplayInfo = () => {
    if (currentSlotIndex === null) {
      return {
        validWords: availableWords,
        invalidWords: []
      }
    }
    
    const currentSlot = sentenceSlots[currentSlotIndex]
    if (!currentSlot.validWords) {
      return {
        validWords: availableWords,
        invalidWords: []
      }
    }
    
    const validWords = availableWords.filter(word => currentSlot.validWords!.includes(word))
    const invalidWords = availableWords.filter(word => !currentSlot.validWords!.includes(word))
    
    return { validWords, invalidWords }
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
    setAvailableWords(Array.from(allValidWords).sort())
    
    // Auto-select first empty slot
    const firstEmptySlot = slots.findIndex(slot => !slot.filled && slot.type !== 'fixed')
    setCurrentSlotIndex(firstEmptySlot === -1 ? null : firstEmptySlot)
    setWordFeedback('')
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

  const { validWords, invalidWords } = getWordDisplayInfo()

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-sage to-autism-calm-mint p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-autism-primary mb-2">
            Click to Build Sentences! 
          </h1>
          <p className="text-lg text-autism-primary/80">
            Use your {getThemeLabel().toLowerCase()} words to create awesome sentences!
          </p>
        </div>

        {/* Enhanced Instructions */}
        <Card className="mb-6 bg-autism-neutral border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              📖 How to Build:
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center text-lg">
              <div className="flex items-center gap-2">
                <span className="text-2xl">1️⃣</span>
                <span>Click an empty box</span>
              </div>
              <div className="hidden sm:block text-autism-primary">→</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">2️⃣</span>
                <span>Click a word</span>
              </div>
              <div className="hidden sm:block text-autism-primary">→</div>
              <div className="flex items-center gap-2">
                <span className="text-2xl">3️⃣</span>
                <span>Build your sentence!</span>
              </div>
            </div>
            <p className="text-sm text-autism-primary/60 mt-4">
              Template: <strong>"{currentTemplate.template}"</strong>
            </p>
            {currentTemplate.hint && (
              <p className="text-sm text-autism-primary/70 italic">
                💡 {currentTemplate.hint}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Sentence Frame */}
        <Card className="mb-6 bg-white border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              ✍️ Your Sentence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Visual Sentence Slots */}
            <div className="flex flex-wrap justify-center gap-3 mb-6">
              {sentenceSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  onClick={() => handleSlotClick(index)}
                  className={`
                    relative min-w-[100px] min-h-[70px] border-3 rounded-xl flex items-center justify-center
                    text-lg font-bold cursor-pointer transition-all duration-300 transform
                    ${slot.type === 'fixed' 
                      ? 'bg-autism-neutral text-autism-primary border-autism-primary/30 cursor-default shadow-sm' 
                      : slot.filled
                        ? 'bg-autism-secondary text-white border-autism-secondary hover:bg-autism-secondary/80 hover:scale-105 shadow-lg'
                        : currentSlotIndex === index
                          ? 'bg-yellow-100 border-yellow-400 border-dashed animate-pulse shadow-lg scale-105'
                          : 'bg-gray-100 border-gray-400 border-dashed hover:bg-gray-200 hover:scale-105 hover:shadow-md'
                    }
                  `}
                >
                  {slot.filled ? (
                    <div className="flex items-center gap-2">
                      <span className="text-center px-2">{slot.content}</span>
                      {slot.type !== 'fixed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSlotClear(index)
                          }}
                          className="text-sm bg-white/30 rounded-full w-6 h-6 flex items-center justify-center hover:bg-white/60 transition-colors"
                          aria-label="Remove word"
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center px-2">
                      <div className="text-gray-500 text-sm font-medium">
                        {slot.type.replace('_', ' ').toUpperCase()}
                      </div>
                      {currentSlotIndex === index && (
                        <div className="text-xs text-yellow-600 mt-1">
                          👆 SELECTED
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Enhanced Current Slot Guidance */}
            {currentSlotIndex !== null && !showCelebration && (
              <div className="text-center mb-4 p-4 bg-yellow-50 border-2 border-yellow-300 rounded-xl">
                <p className="text-lg font-semibold text-yellow-800 mb-2">
                  🎯 Choose a <span className="text-yellow-900 underline">{sentenceSlots[currentSlotIndex].type}</span> word:
                </p>
                <p className="text-sm text-yellow-700">
                  Green words fit perfectly! Other words might not work for this spot.
                </p>
              </div>
            )}

            {/* Word Feedback */}
            {wordFeedback && (
              <div className="text-center mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-blue-800 font-medium">{wordFeedback}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Word Bank */}
        <Card className="mb-6 bg-white border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              🔤 Word Bank
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Valid Words (Highlighted) */}
            {validWords.length > 0 && (
              <div className="mb-4">
                <p className="text-center text-sm text-green-700 font-medium mb-3">
                  ✅ Perfect words for your selected spot:
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {validWords.map((word, index) => (
                    <button
                      key={`valid-${index}`}
                      onClick={() => handleWordClick(word)}
                      className="px-6 py-3 rounded-xl text-lg font-bold transition-all duration-200 transform
                                bg-green-100 text-green-800 border-2 border-green-300 
                                hover:bg-green-200 hover:scale-110 hover:shadow-lg
                                focus:outline-none focus:ring-4 focus:ring-green-300"
                      aria-label={`Use word ${word}`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Other Available Words */}
            {invalidWords.length > 0 && (
              <div>
                <p className="text-center text-sm text-gray-600 mb-3">
                  💭 Other words (try these in different spots):
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  {invalidWords.map((word, index) => (
                    <button
                      key={`other-${index}`}
                      onClick={() => handleWordClick(word)}
                      className="px-6 py-3 rounded-xl text-lg font-semibold transition-all duration-200
                                bg-gray-200 text-autism-primary border-2 border-gray-300 
                                hover:bg-gray-300 hover:scale-105
                                focus:outline-none focus:ring-4 focus:ring-gray-300"
                      aria-label={`Try word ${word}`}
                    >
                      {word}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* No slot selected message */}
            {currentSlotIndex === null && !isSentenceComplete && (
              <div className="text-center p-6">
                <p className="text-lg text-autism-primary/70 mb-4">
                  👆 Click on an empty box above to get started!
                </p>
                <div className="text-6xl mb-4">⬆️</div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Enhanced Success Celebration */}
        {showCelebration && (
          <Card className="mb-6 bg-green-100 border-green-400 border-3 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-8xl mb-4 animate-bounce">🎉</div>
              <h3 className="text-3xl font-bold text-green-800 mb-4">
                AMAZING SENTENCE!
              </h3>
              <div className="text-2xl text-green-700 font-semibold mb-4 p-4 bg-white/60 rounded-lg">
                "{sentenceSlots.map(slot => slot.content).join(' ')}."
              </div>
              <p className="text-green-600 text-lg mb-6">
                You're officially a sentence building superstar! 🌟
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleReadAloud(sentenceSlots.map(slot => slot.content).join(' '))}
                  disabled={isReading}
                  className="text-lg px-6 py-3"
                >
                  {isReading ? '🗣️ Reading...' : '🔊 Hear My Sentence Again'}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          <Button
            variant="outline"
            onClick={handleReset}
            size="comfortable"
            className="text-lg px-6 py-3"
          >
            🔄 Start Over
          </Button>
          
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
          <div className="flex justify-center gap-2 mb-2">
            {templates.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 rounded-full ${
                  index === currentTemplateIndex 
                    ? 'bg-autism-secondary' 
                    : index < currentTemplateIndex 
                      ? 'bg-green-400' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-autism-primary/70">
            Sentence {currentTemplateIndex + 1} of {templates.length}
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are building sentences using a click-based system. First click on an empty slot to select it, 
            then click on a word from the word bank to fill that slot. Words that fit the selected slot will 
            be highlighted in green. You can click the X button next to filled words to remove them and try different options.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SentenceBuildingPage