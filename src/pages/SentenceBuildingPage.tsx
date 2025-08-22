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
          content: word,
          filled: true
        })
      }
    })
    
    return slots
  }

  // Get valid words for a specific slot type with enhanced filtering
  const getValidWordsForSlotType = (slotType: string): string[] => {
    switch (slotType) {
      case 'animal':
        // Get animal words from wordBank, not filtered themeWords
        return [
          ...getWordsByThemeAndDifficulty('animals', 'easy'),
          ...getWordsByThemeAndDifficulty('animals', 'regular')
        ].map(w => w.toUpperCase())
        
      case 'space':
        // Get space words from wordBank
        return [
          ...getWordsByThemeAndDifficulty('space', 'easy'),
          ...getWordsByThemeAndDifficulty('space', 'regular')
        ].map(w => w.toUpperCase())
        
      case 'food':
        // Get food words from wordBank
        return [
          ...getWordsByThemeAndDifficulty('food', 'easy'),
          ...getWordsByThemeAndDifficulty('food', 'regular')
        ].map(w => w.toUpperCase())
        
      case 'vehicle':
        // Get vehicle words from wordBank + template-specific vehicles
        const vehicleWords = [
          ...getWordsByThemeAndDifficulty('vehicles', 'easy'),
          ...getWordsByThemeAndDifficulty('vehicles', 'regular')
        ].map(w => w.toUpperCase())
        
        const templateVehicles = currentTemplate.vehicles || ['ROCKET', 'SPACESHIP', 'SHUTTLE', 'UFO', 'CAR', 'TRUCK', 'BUS', 'BIKE']
        
        return [...new Set([...vehicleWords, ...templateVehicles])]
        
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
      setWordFeedback('💡 Double-tap this word to remove it!')
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

  // FIXED: Get only relevant words for current slot type
  const getFilteredWordsForDisplay = () => {
    if (currentSlotIndex === null) {
      return [] // Show no words when no slot is selected
    }
    
    const currentSlot = sentenceSlots[currentSlotIndex]
    if (!currentSlot.validWords) {
      return []
    }
    
    // Return only words that match the current slot type
    return availableWords.filter(word => currentSlot.validWords!.includes(word))
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
            {currentTemplate.hint && (
              <p className="text-xs md:text-sm text-autism-primary/70 italic">
                💡 {currentTemplate.hint}
              </p>
            )}
          </CardContent>
        </Card>

        {/* Sentence Frame - responsive */}
        <Card className="mb-6 bg-white border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-center text-lg md:text-xl text-autism-primary">
              ✍️ Your Sentence
            </CardTitle>
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
                        ? 'bg-autism-secondary text-white border-autism-secondary hover:bg-autism-secondary/80 hover:scale-105 shadow-lg'
                        : currentSlotIndex === index
                          ? 'border-autism-primary border-4 bg-autism-primary/10 animate-pulse'
                          : 'border-gray-300 border-dashed bg-gray-50 hover:border-autism-primary hover:bg-autism-primary/5'
                    }
                    ${slot.type !== 'fixed' ? 'active:scale-95 touch-manipulation' : ''}
                  `}
                >
                  {slot.filled ? (
                    <div className="flex items-center gap-1 md:gap-2">
                      <span className="px-2 py-1 text-center break-words max-w-[60px] md:max-w-none">
                        {slot.content}
                      </span>
                      {slot.type !== 'fixed' && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSlotClear(index)
                          }}
                          className="text-xs md:text-sm bg-red-500 text-white rounded-full w-4 h-4 md:w-5 md:h-5 flex items-center justify-center hover:bg-red-600 transition-colors active:scale-95"
                          aria-label={`Remove ${slot.content}`}
                        >
                          ×
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="text-center px-2">
                      {slot.type === 'fixed' ? slot.content : (
                        <span className="text-xs md:text-sm text-gray-500 break-words">
                          {slot.type.replace('_', ' ')}
                        </span>
                      )}
                    </div>
                  )}
                  
                  {/* Mobile-friendly selection indicator */}
                  {currentSlotIndex === index && slot.type !== 'fixed' && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-autism-primary rounded-full flex items-center justify-center">
                      <span className="text-white text-xs md:text-sm font-bold">👆</span>
                    </div>
                  )}
                </div>
              ))}
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
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowHints(false)}
                  className="mt-2 text-xs"
                >
                  Hide Hints
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Word Bank - mobile-optimized */}
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
            ) : (
              /* Mobile-first word grid */
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3 max-h-[300px] md:max-h-[400px] overflow-y-auto">
                {getFilteredWordsForDisplay().map((word, index) => (
                  <button
                    key={`word-${index}`}
                    onClick={() => handleWordClick(word)}
                    disabled={isReading}
                    className="min-h-[48px] px-3 py-2 bg-white border-2 border-autism-primary text-autism-primary rounded-lg font-medium text-sm md:text-base hover:bg-autism-primary hover:text-white transition-colors disabled:opacity-50 active:scale-95 touch-manipulation break-words"
                  >
                    {word}
                  </button>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Celebration - responsive */}
        {showCelebration && (
          <Card className="mb-6 bg-gradient-to-r from-yellow-100 to-orange-100 border-3 border-yellow-400">
            <CardContent className="p-4 md:p-8 text-center">
              <div className="text-4xl md:text-6xl mb-4">🎉</div>
              <h3 className="text-xl md:text-2xl font-bold text-orange-800 mb-4">
                Amazing Work!
              </h3>
              <div className="text-lg md:text-2xl text-green-700 font-semibold mb-4 p-4 bg-white/60 rounded-lg">
                "{sentenceSlots.map(slot => slot.content).join(' ')}."
              </div>
              <p className="text-base md:text-lg text-green-600 mb-6">
                You're officially a sentence building superstar! 🌟
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  onClick={() => handleReadAloud(sentenceSlots.map(slot => slot.content).join(' '))}
                  disabled={isReading}
                  className="min-h-[48px] text-base md:text-lg px-6 py-3"
                >
                  {isReading ? '🗣️ Reading...' : '🔊 Hear My Sentence Again'}
                </Button>
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
              variant="celebration"
              onClick={handleNextTemplate}
              size="comfortable"
              className="min-h-[48px] text-lg md:text-xl px-8 py-4"
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
            be shown. You can click the X button next to filled words to remove them and try different options.
          </p>
        </div>
      </div>
    </div>
  )
}

export default SentenceBuildingPage