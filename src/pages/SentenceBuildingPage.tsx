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

type TtsAccent = 'US' | 'GB' | 'AU' | 'CA'

const SentenceBuildingPage: React.FC<SentenceBuildingPageProps> = ({ theme }) => {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0)
  const [sentenceSlots, setSentenceSlots] = useState<SentenceSlot[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [currentSlotIndex, setCurrentSlotIndex] = useState<number | null>(null)
  const [isSentenceComplete, setIsSentenceComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [wordFeedback, setWordFeedback] = useState<string>('')
  const [showHints, setShowHints] = useState(false) // Changed to default false
  const [audioEnabled, setAudioEnabled] = useState(false) // New audio toggle
  const [lastClickTime, setLastClickTime] = useState<number>(0)
  const [lastClickedSlot, setLastClickedSlot] = useState<number>(-1)
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
          content: word.toUpperCase(),
          filled: true
        })
      }
    })
    
    return slots
  }

  // Get valid words for each slot type - LIMITED TO 3-4 APPROPRIATE WORDS
  const getValidWordsForSlotType = (slotType: string): string[] => {
    // Get theme words first
    const availableThemeWords = themeWords.slice(0, 4) // Limit theme words to 4
    
    switch (slotType) {
      case 'animal':
        return availableThemeWords.length > 0 ? availableThemeWords.slice(0, 3) : 
        currentTemplate.animals?.slice(0, 3) || ['CAT', 'DOG', 'BIRD']
        
      case 'adjective':
        return currentTemplate.adjectives?.slice(0, 4) || ['BIG', 'SMALL', 'CUTE', 'FAST']
        
      case 'action':
        return currentTemplate.actions?.slice(0, 4) || ['RUNS', 'JUMPS', 'PLAYS', 'SLEEPS']
        
      case 'color':
        return ['RED', 'BLUE', 'GREEN', 'YELLOW'].slice(0, 4)
        
      case 'number':
        return currentTemplate.numbers?.slice(0, 3) || ['ONE', 'TWO', 'THREE']
        
      case 'object':
        return currentTemplate.objects?.slice(0, 4) || ['BALL', 'BOOK', 'TOY', 'TREE']
        
      case 'place':
        return currentTemplate.places?.slice(0, 4) || ['HOME', 'PARK', 'SCHOOL', 'GARDEN']
        
      case 'taste':
        return currentTemplate.tastes?.slice(0, 3) || ['SWEET', 'YUMMY', 'DELICIOUS']
        
      case 'meal':
        return currentTemplate.meals?.slice(0, 4) || ['LUNCH', 'DINNER', 'SNACK', 'TREAT']
        
      case 'temperature':
        return currentTemplate.temperatures?.slice(0, 3) || ['HOT', 'COLD', 'WARM']
        
      case 'speed':
        return currentTemplate.speeds?.slice(0, 3) || ['FAST', 'SLOW', 'QUICK']
        
      case 'part':
        return currentTemplate.parts?.slice(0, 4) || ['WHEELS', 'DOORS', 'SEATS', 'ENGINE']
        
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
      
      // Only read if audio is enabled
      if (audioEnabled) {
        setTimeout(() => {
          const sentence = sentenceSlots.map(slot => slot.content).join(' ')
          handleReadAloud(sentence)
        }, 500)
      }
    } else {
      setIsSentenceComplete(false)
      setShowCelebration(false)
    }
  }, [sentenceSlots, audioEnabled])

  // Handle double-click/tap to remove words
  const handleFilledSlotClick = async (slotIndex: number) => {
    const now = Date.now()
    const timeDiff = now - lastClickTime
    
    // Double-click/tap detection (within 500ms)
    if (lastClickedSlot === slotIndex && timeDiff < 500) {
      // Double-click detected - remove the word
      await handleSlotClear(slotIndex)
    } else {
      // Single click - just give feedback
      setWordFeedback('💡 Double-click this word to remove it!')
      setTimeout(() => setWordFeedback(''), 2000)
    }
    
    setLastClickTime(now)
    setLastClickedSlot(slotIndex)
  }

  // Enhanced slot click handler with audio feedback
  const handleSlotClick = async (slotIndex: number) => {
    const slot = sentenceSlots[slotIndex]
    if (slot.type === 'fixed') return
    
    // If slot is filled, handle double-click for removal
    if (slot.filled) {
      await handleFilledSlotClick(slotIndex)
      return
    }
    
    setCurrentSlotIndex(slotIndex)
    setWordFeedback('')
    
    // Audio feedback for slot selection only if enabled
    if (audioEnabled && audio.isSpeechSynthesisSupported()) {
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
      
      // Audio feedback for wrong choice only if enabled
      if (audioEnabled && audio.isSpeechSynthesisSupported()) {
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
    
    // Audio celebration for correct choice only if enabled
    if (audioEnabled && audio.isSpeechSynthesisSupported()) {
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
    
    // Audio feedback only if enabled
    if (audioEnabled && audio.isSpeechSynthesisSupported()) {
      await handleReadAloud(`${originalWord} removed`)
    }
    
    setTimeout(() => setWordFeedback(''), 2000)
  }

  // FIXED: Get only relevant words for current slot type - LIMITED TO 3-4 WORDS
  const getFilteredWordsForDisplay = () => {
    if (currentSlotIndex === null) {
      return [] // Show no words when no slot is selected
    }
    
    const currentSlot = sentenceSlots[currentSlotIndex]
    if (!currentSlot.validWords) {
      return []
    }
    
    // Return only words that match the current slot type, limited to 3-4 words
    return availableWords.filter(word => currentSlot.validWords!.includes(word)).slice(0, 4)
  }

  const handleReadAloud = async (text: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    
    setIsReading(true)
    try {
      const savedAccent = storage.get('tts-accent', 'GB') as TtsAccent
      const selectedVoice = audio.getBestVoiceForAccent(savedAccent)

      await audio.speak(text, {
        voice: selectedVoice,
        rate: 0.8,
        pitch: 1.1,
        accent: savedAccent
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
      // Complete!
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

  const filteredWords = getFilteredWordsForDisplay()

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-pink-50">
      <div className="px-4 py-6 md:px-6 lg:px-8 max-w-6xl mx-auto">
        
        {/* Header - responsive */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-autism-primary mb-2">
            Sentence Builder! ✨
          </h1>
          <p className="text-base md:text-lg text-autism-primary/80">
            Use your {getThemeLabel().toLowerCase()} words to create awesome sentences!
          </p>
        </div>

        {/* Instructions - responsive */}
        <Card className="mb-6 bg-autism-neutral border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-lg md:text-xl text-autism-primary">
              📖 How to Build:
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center space-y-3">
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 justify-center items-center text-base md:text-lg">
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">1️⃣</span>
                <span>Click an empty box</span>
              </div>
              <div className="hidden sm:block text-autism-primary">→</div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">2️⃣</span>
                <span>Click a word</span>
              </div>
              <div className="hidden sm:block text-autism-primary">→</div>
              <div className="flex items-center gap-2">
                <span className="text-xl md:text-2xl">3️⃣</span>
                <span>Build your sentence!</span>
              </div>
            </div>
            <p className="text-xs md:text-sm text-autism-primary/60 mt-4">
              Template: <strong>"{currentTemplate.template}"</strong>
            </p>
            
            {/* Show/Hide Hint Button */}
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowHints(!showHints)}
                className="text-xs md:text-sm"
              >
                {showHints ? 'Hide Hint' : 'Show Hint'}
              </Button>
            </div>
            
            {/* Collapsible Hint */}
            {showHints && currentTemplate.hint && (
              <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-xs md:text-sm text-blue-700 italic">
                  💡 {currentTemplate.hint}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Sentence Frame - responsive */}
        <Card className="mb-6 bg-white border-autism-secondary border-2">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="text-center text-lg md:text-xl text-autism-primary flex-1">
                ✍️ Your Sentence
              </CardTitle>
              
              {/* Audio Toggle */}
              <div className="flex items-center gap-2">
                <span className="text-sm text-autism-primary">Read aloud:</span>
                <Button
                  variant={audioEnabled ? "default" : "outline"}
                  size="sm"
                  onClick={() => setAudioEnabled(!audioEnabled)}
                  className="text-xs px-3 py-1"
                >
                  {audioEnabled ? 'ON' : 'OFF'}
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {/* Mobile-optimized sentence slots */}
            <div className="flex flex-wrap justify-center gap-2 md:gap-3 mb-6">
              {sentenceSlots.map((slot, index) => (
                <div
                  key={slot.id}
                  onClick={() => handleSlotClick(index)}
                  className={`
                    relative min-w-[80px] md:min-w-[100px] min-h-[48px] md:min-h-[70px] border-3 rounded-xl flex items-center justify-center
                    text-sm md:text-lg font-bold cursor-pointer transition-all duration-300 transform
                    ${slot.type === 'fixed' 
                      ? 'bg-autism-neutral text-autism-primary border-autism-primary/30 cursor-default shadow-sm' 
                      : slot.filled
                        ? 'bg-autism-secondary text-white border-autism-secondary hover:scale-105 shadow-lg'
                        : currentSlotIndex === index
                          ? 'bg-blue-50 border-blue-400 border-dashed hover:bg-blue-100 shadow-md'
                          : 'bg-gray-50 border-gray-300 border-dashed hover:bg-gray-100 hover:border-gray-400'
                    }
                  `}
                >
                  <div className="text-center px-2">
                    {slot.filled ? (
                      slot.content
                    ) : slot.content ? (
                      slot.content
                    ) : (
                      <span className="text-xs md:text-sm text-gray-500 break-words">
                        {slot.type.replace('_', ' ')}
                      </span>
                    )}
                  </div>
                  
                  {/* Mobile-friendly selection indicator */}
                  {currentSlotIndex === index && slot.type !== 'fixed' && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-autism-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs md:text-sm font-bold">👆</span>
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Double-click instruction */}
            <div className="text-center mb-4">
              <p className="text-xs md:text-sm text-autism-primary/70">
                Double-click a word twice to remove
              </p>
            </div>

            {/* Word feedback - responsive */}
            {wordFeedback && (
              <div className="text-center mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                <p className="text-sm md:text-base text-blue-700">{wordFeedback}</p>
              </div>
            )}

            {/* Hint system - responsive */}
            {showHints && currentSlotIndex !== null && sentenceSlots[currentSlotIndex] && (
              <div className="text-center mb-4 p-3 bg-green-50 border border-green-200 rounded-lg">
                <p className="text-sm md:text-base text-green-700">
                  💡 Choose a <strong>{sentenceSlots[currentSlotIndex].type.replace('_', ' ')}</strong> word below!
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Word Bank - mobile-optimized - Hide when sentence complete */}
        {!isSentenceComplete && (
        <Card className="mb-6 bg-white border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-lg md:text-xl text-autism-primary">
              {currentSlotIndex !== null && sentenceSlots[currentSlotIndex] 
                ? `📝 ${sentenceSlots[currentSlotIndex].type.replace('_', ' ').toUpperCase()} Words`
                : '📝 Word Bank'
              }
            </CardTitle>
          </CardHeader>
          <CardContent>
            {currentSlotIndex === null ? (
              <div className="text-center p-6">
                <div className="text-4xl md:text-6xl mb-4">👆</div>
                <p className="text-base md:text-lg text-autism-primary/70">
                  Click on an empty box above to see words for that slot!
                </p>
              </div>
            ) : filteredWords.length === 0 ? (
              <div className="text-center p-6">
                <div className="text-4xl md:text-6xl mb-4">🎯</div>
                <p className="text-base md:text-lg text-autism-primary/70">
                  No more words available for this slot type!
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 md:gap-4">
                {filteredWords.map(word => (
                  <Button
                    key={word}
                    onClick={() => handleWordClick(word)}
                    variant="outline"
                    size="comfortable"
                    className="min-h-[48px] md:min-h-[60px] text-base md:text-lg px-4 py-3 border-2 border-autism-primary/30 hover:border-autism-primary hover:bg-autism-primary hover:text-white transition-all duration-200 transform hover:scale-105"
                  >
                    {word}
                  </Button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* Celebration Banner */}
        {showCelebration && (
          <Card className="mb-6 bg-gradient-to-r from-green-100 to-blue-100 border-green-400 border-2">
            <CardContent className="text-center py-6">
              <div className="text-4xl md:text-6xl mb-4">🎉</div>
              <h3 className="text-xl md:text-2xl font-bold text-green-700 mb-2">
                Fantastic Sentence!
              </h3>
              <div className="text-lg md:text-xl bg-white p-4 rounded-lg border border-green-200 mb-4">
                <strong>"{sentenceSlots.map(slot => slot.content).join(' ')}"</strong>
              </div>
              <p className="text-base md:text-lg text-green-600 mb-6">
                You're officially a sentence building superstar! 🌟
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                {audioEnabled && (
                  <Button
                    variant="outline"
                    onClick={() => handleReadAloud(sentenceSlots.map(slot => slot.content).join(' '))}
                    disabled={isReading}
                    className="min-h-[48px] text-base md:text-lg px-6 py-3"
                  >
                    {isReading ? '🗣️ Reading...' : '🔊 Hear My Sentence Again'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Controls - responsive */}
        <div className="flex flex-col sm:flex-row justify-center gap-4 mb-6">
          <Button
            variant="outline"
            onClick={handleReset}
            size="comfortable"
            className="min-h-[48px] text-base md:text-lg px-6 py-3"
          >
            🔄 Start Over
          </Button>
          
          {isSentenceComplete && (
            <Button
              variant="outline"
              onClick={handleNextTemplate}
              size="comfortable"
              className="min-h-[48px] text-base md:text-lg px-6 py-3"
            >
              {currentTemplateIndex < templates.length - 1 ? 
                "Build Another Sentence! →" : 
                "Celebrate My Success! 🎉"
              }
            </Button>
          )}
        </div>

        {/* Progress Indicator - responsive */}
        <div className="text-center">
          <div className="flex justify-center gap-2 mb-2 flex-wrap">
            {templates.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                  index === currentTemplateIndex 
                    ? 'bg-autism-secondary' 
                    : index < currentTemplateIndex 
                      ? 'bg-green-400' 
                      : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-xs md:text-sm text-autism-primary/70">
            Sentence {currentTemplateIndex + 1} of {templates.length}
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are building sentences using a click-based system. First click on an empty slot to select it, 
            then click on a word from the word bank to fill that slot. Only words that fit the selected slot will 
            be shown. You can double-click filled words to remove them and try different options.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SentenceBuildingPage