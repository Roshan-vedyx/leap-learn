// src/pages/SentenceBuildingPage.tsx
// Enhanced click-to-build system optimized for motor planning accessibility
import React, { useState, useEffect, useRef, useMemo } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'
import { sentenceTemplates, getWordsByThemeAndDifficulty, AdaptiveWordBank } from '@/data/wordBank'

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

// Helper: Fallback nouns if JSON fails
const getThemeFallback = (slotType: string): string[] => {
  const fallbacks = {
    animal: ['CAT', 'DOG', 'BIRD'],
    space: ['SUN', 'MOON', 'STAR'],
    food: ['CAKE', 'PIZZA', 'APPLE'],
    vehicle: ['CAR', 'BUS', 'BIKE']
  }
  return fallbacks[slotType as keyof typeof fallbacks] || []
}

// Helper: Get words from current template
const getTemplateWords = (currentTemplate: any, slotType: string): string[] => {
  const templateMap = {
    action: currentTemplate.actions,
    color: ['RED', 'BLUE', 'GREEN', 'YELLOW', 'BROWN'],
    number: currentTemplate.numbers,
    taste: currentTemplate.tastes,
    meal: currentTemplate.meals,
    temperature: ['HOT', 'COLD', 'WARM'],
    speed: ['FAST', 'SLOW', 'QUICK'],
    part: currentTemplate.parts
  }
  
  const words = templateMap[slotType as keyof typeof templateMap]
  return Array.isArray(words) ? words.slice(0, 3) : []
}

const getGrammarLabel = (slotType: string): string => {
  const labels = {
    'animal': 'WHO (The main character)',
    'adjective': 'DESCRIBING word (What is it like?)',
    'action': 'DOING word (What\'s happening?)',
    'color': 'COLOR word (What color?)',
    'number': 'HOW MANY (Count them!)',
    'object': 'WHAT (What thing?)',
    'place': 'WHERE (What place?)',
    'food': 'WHAT (What food?)',
    'vehicle': 'WHAT (Which vehicle?)',
    'space': 'WHAT (Which space thing?)',
    'taste': 'HOW (What does it taste like?)',
    'meal': 'WHEN (Which meal?)',
    'temperature': 'HOW (What temperature?)',
    'speed': 'HOW FAST (What speed?)',
    'part': 'WHICH PART (What part?)'
  }
  return labels[slotType] || `${slotType.toUpperCase()} word`
}

const getPatternCelebration = (slots: SentenceSlot[]): string => {
  // Build pattern description from filled slots
  const pattern = slots
    .filter(slot => slot.type !== 'fixed' && slot.filled)
    .map(slot => getGrammarLabel(slot.type).split('(')[0].trim()) // Get just the main part
    .join(' + ')
  
  return `Amazing! You built a ${pattern} sentence!`
}

const getPatternExample = (slots: SentenceSlot[]): string => {
  // Create a simple example following the same pattern
  const examples = {
    'WHO + DOING': 'Dogs run',
    'WHO + DESCRIBING': 'Cats are big', 
    'WHO + DOING + WHERE': 'Birds fly home',
    'DESCRIBING + WHO + DOING': 'Big dogs run',
    'WHO + DOING + COLOR': 'Dogs see red'
  }
  
  const pattern = slots
    .filter(slot => slot.type !== 'fixed' && slot.filled)
    .map(slot => getGrammarLabel(slot.type).split('(')[0].trim())
    .join(' + ')
    
  const example = examples[pattern] || 'The cat runs'
  return `This follows the same pattern as '${example}' - can you see it?`
}

const shouldShowSlot = (slots: SentenceSlot[], slotIndex: number): boolean => {
  // Always show fixed words
  if (slots[slotIndex].type === 'fixed') {
    return true
  }
  
  // Show if this slot is filled
  if (slots[slotIndex].filled) {
    return true
  }
  
  // Show if all previous fillable slots are filled
  for (let i = 0; i < slotIndex; i++) {
    if (slots[i].type !== 'fixed' && !slots[i].filled) {
      return false // Previous unfilled slot exists
    }
  }
  
  return true // All previous slots are filled/fixed
}

const getProgressiveMessage = (slots: SentenceSlot[], currentIndex: number): string => {
  const currentSlot = slots[currentIndex]
  if (!currentSlot || currentSlot.type === 'fixed') return ''
  
  const slotPosition = slots.filter((s, i) => i <= currentIndex && s.type !== 'fixed').length
  const totalSlots = slots.filter(s => s.type !== 'fixed').length
  
  if (slotPosition === 1) {
    return `First, choose ${getGrammarLabel(currentSlot.type)} to start your sentence...`
  } else if (slotPosition === totalSlots) {
    return `Finally, choose ${getGrammarLabel(currentSlot.type)} to complete your sentence!`
  } else {
    return `Great! Now choose ${getGrammarLabel(currentSlot.type)} to continue...`
  }
}

const getEducationalFeedback = (word: string, slotType: string): string => {
  const feedbackMap = {
    'animal': `Perfect! "${word}" is a WHO word - it tells us about the main character in our sentence!`,
    'adjective': `Great choice! "${word}" is a describing word - it tells us what something looks like!`,
    'action': `Excellent! "${word}" is a doing word - it shows what's happening in our sentence!`,
    'color': `Nice pick! "${word}" is a color word - it helps us picture what we're talking about!`,
    'number': `Smart choice! "${word}" tells us how many - counting words make sentences clearer!`,
    'object': `Good selection! "${word}" is a WHAT word - it names something important!`,
    'place': `Well done! "${word}" is a WHERE word - it tells us about location!`,
    'food': `Yummy choice! "${word}" is a food word - it makes our sentence tasty!`,
    'vehicle': `Cool pick! "${word}" is a vehicle word - now we're moving!`,
    'space': `Stellar choice! "${word}" is a space word - out of this world!`,
    'taste': `Tasty pick! "${word}" describes how something tastes!`,
    'meal': `Perfect timing! "${word}" tells us when we eat!`,
    'temperature': `Great choice! "${word}" tells us how hot or cold something is!`,
    'speed': `Fast thinking! "${word}" tells us how quickly something moves!`,
    'part': `Good eye! "${word}" names an important part!`
  }
  
  return feedbackMap[slotType] || `Great choice! "${word}" fits perfectly here!`
}

const generateModelSentence = (template: string, theme: string): string => {
  // Create example sentences for each template
  const modelExamples = {
    animals: {
      "THE [ANIMAL] IS [ADJECTIVE]": "THE DOG IS BIG",
      "I SEE A [ADJECTIVE] [ANIMAL]": "I SEE A CUTE CAT", 
      "THE [ANIMAL] CAN [ACTION]": "THE BIRD CAN FLY",
      "MY [COLOR] [ANIMAL] LIKES TO [ACTION]": "MY BROWN DOG LIKES TO PLAY"
    },
    space: {
      "THE [SPACE] IS [ADJECTIVE]": "THE SUN IS BRIGHT",
      "I FLY TO THE [SPACE] IN MY [VEHICLE]": "I FLY TO THE MOON IN MY ROCKET",
      "THE [SPACE] HAS [NUMBER] [OBJECT]": "THE PLANET HAS MANY MOONS"
    },
    food: {
      "THE [FOOD] IS [ADJECTIVE]": "THE CAKE IS SWEET",
      "I EAT [ADJECTIVE] [FOOD]": "I EAT YUMMY PIZZA",
      "MY [FOOD] TASTES [TASTE]": "MY SOUP TASTES HOT"
    },
    vehicles: {
      "THE [VEHICLE] IS [ADJECTIVE]": "THE CAR IS FAST",
      "I RIDE THE [ADJECTIVE] [VEHICLE]": "I RIDE THE BIG BUS",
      "MY [VEHICLE] CAN [ACTION]": "MY BIKE CAN GO"
    }
  }
  
  const themeExamples = modelExamples[theme as keyof typeof modelExamples] || modelExamples.animals
  return themeExamples[template] || "THE CAT RUNS FAST"
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
  const [showHints, setShowHints] = useState(false) // Changed to default false
  const [audioEnabled, setAudioEnabled] = useState(false) // New audio toggle
  const [lastClickTime, setLastClickTime] = useState<number>(0)
  const [lastClickedSlot, setLastClickedSlot] = useState<number>(-1)
  const [, setLocation] = useLocation()
  const adaptiveWordBank = useRef<AdaptiveWordBank | null>(null)
  const [wordsLoaded, setWordsLoaded] = useState(false)
  const [showModelSentence, setShowModelSentence] = useState(true)

  // Get theme-specific templates
  const templates = sentenceTemplates[theme as keyof typeof sentenceTemplates] || sentenceTemplates.animals
  const currentTemplate = templates[currentTemplateIndex]
  
  // Get words built in previous session
  const themeWords = useMemo(() => {
    if (!adaptiveWordBank.current || !wordsLoaded) {
      return getWordsByThemeAndDifficulty(theme, 'easy').concat(
        getWordsByThemeAndDifficulty(theme, 'regular')
      ).map(word => word.toUpperCase())
    }
    
    // Use JSON words
    return adaptiveWordBank.current.getWordsForTheme(theme).slice(0, 8)
  }, [theme, wordsLoaded])

  // Initialize AdaptiveWordBank to load JSON words
  useEffect(() => {
    const initWordBank = async () => {
      adaptiveWordBank.current = new AdaptiveWordBank(12)
      // Wait for JSON to load
      setTimeout(() => setWordsLoaded(true), 500)
    }
    initWordBank()
  }, [])
  
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
    // 1. NOUNS: Get from JSON words for current theme
    if (['animal', 'space', 'food', 'vehicle'].includes(slotType)) {
      return themeWords.length > 0 ? themeWords.slice(0, 3) : getThemeFallback(slotType)
    }
    
    // 2. ADJECTIVES: Theme-specific hardcoded lists
    if (slotType === 'adjective') {
      const themeAdjectives = {
        animals: ['BIG', 'SMALL', 'CUTE', 'FURRY'],
        space: ['BRIGHT', 'HUGE', 'HOT', 'COLD'], 
        food: ['YUMMY', 'SWEET', 'FRESH', 'SPICY'],
        vehicles: ['FAST', 'BIG', 'SHINY', 'COOL']
      }
      return themeAdjectives[theme as keyof typeof themeAdjectives] || ['GOOD', 'NICE', 'COOL']
    }
    
    // 3. TEMPLATE WORDS: Get from current template
    return getTemplateWords(currentTemplate, slotType)
  }

  // Initialize sentence slots when template changes
  useEffect(() => {
    if (currentTemplate) {
      const slots = parseTemplateIntoSlots(currentTemplate.template)
      setSentenceSlots(slots)
      setShowModelSentence(true)
      
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
      
      const firstVisibleEmptySlot = slots.findIndex((slot, index) => 
        !slot.filled && slot.type !== 'fixed' && shouldShowSlot(slots, index)
      )
      setCurrentSlotIndex(firstVisibleEmptySlot === -1 ? null : firstVisibleEmptySlot)

      // Set progressive instruction feedback
      if (firstVisibleEmptySlot !== -1) {
        const message = getProgressiveMessage(slots, firstVisibleEmptySlot)
        setWordFeedback(message)
      }
      
      setIsSentenceComplete(false)
      setShowCelebration(false)
      setWordFeedback('')
    }
  }, [currentTemplate, theme, wordsLoaded])

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
          const celebration = getPatternCelebration(sentenceSlots)
          handleReadAloud(`${sentence}. ${celebration}`)
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
      await handleReadAloud(`Choose a ${getGrammarLabel(slot.type)}`)
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
    
    // Educational feedback - why this works
    const educationalMessage = getEducationalFeedback(word, currentSlot.type)
    setWordFeedback(educationalMessage)
    
    // Audio celebration for correct choice only if enabled
    if (audioEnabled && audio.isSpeechSynthesisSupported()) {
      await handleReadAloud(educationalMessage)
    }
    
    // Auto-advance to next empty slot
    const nextEmptySlot = newSlots.findIndex((slot, index) => 
      index > currentSlotIndex && !slot.filled && slot.type !== 'fixed' && shouldShowSlot(newSlots, index)
    )
    
    const nextSlotIndex = nextEmptySlot === -1 ? null : nextEmptySlot
    
    // Set progressive message for next slot
    if (nextSlotIndex !== null) {
      const message = getProgressiveMessage(newSlots, nextSlotIndex)
      setTimeout(() => setWordFeedback(message), 1000) // Brief delay for better UX
    }
    
    setCurrentSlotIndex(nextEmptySlot === -1 ? null : nextEmptySlot)
    
    // Clear feedback after 2 seconds
    setTimeout(() => setWordFeedback(''), 4000)
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
    setShowModelSentence(true)
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
        
    // Auto-select first VISIBLE empty slot
    const firstVisibleEmptySlot = slots.findIndex((slot, index) => 
      !slot.filled && slot.type !== 'fixed' && shouldShowSlot(slots, index)
    )
    setCurrentSlotIndex(firstVisibleEmptySlot === -1 ? null : firstVisibleEmptySlot)

    // Set progressive instruction feedback
    if (firstVisibleEmptySlot !== -1) {
      const message = getProgressiveMessage(slots, firstVisibleEmptySlot)
      setWordFeedback(message)
    }
    setShowModelSentence(true)
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

        {/* Model Sentence Display - Show before building */}
        {showModelSentence && (
          <Card className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-300 border-2">
            <CardContent className="text-center py-6">
              <div className="text-3xl md:text-4xl mb-4">📖</div>
              <h3 className="text-lg md:text-xl font-bold text-blue-700 mb-3">
                Here's how this pattern works:
              </h3>
              <div className="text-xl md:text-2xl bg-white p-4 rounded-lg border border-blue-200 mb-4 font-bold text-blue-800">
                "{generateModelSentence(currentTemplate.template, theme)}"
              </div>
              <p className="text-base md:text-lg text-blue-600 mb-6">
                Now you try making a sentence like this!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={() => setShowModelSentence(false)}
                  className="min-h-[48px] bg-blue-500 hover:bg-blue-600 text-white px-6 py-3 text-base font-medium"
                >
                  Let's Build! 🚀
                </Button>
                
                {audioEnabled && (
                  <Button
                    variant="outline"
                    onClick={() => handleReadAloud(generateModelSentence(currentTemplate.template, theme))}
                    disabled={isReading}
                    className="min-h-[48px] text-base px-6 py-3 border-blue-300 text-blue-700 hover:bg-blue-50"
                  >
                    {isReading ? '🗣️ Reading...' : '🔊 Hear Example'}
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        )}
        {!showModelSentence && (
          <>
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
                  {sentenceSlots.map((slot, index) => {
                    const isVisible = shouldShowSlot(sentenceSlots, index)
                    
                    return (
                      <div
                        key={slot.id}
                        onClick={() => handleSlotClick(index)}
                        className={`
                          relative min-w-[80px] md:min-w-[100px] min-h-[48px] md:min-h-[70px] border-3 rounded-xl flex items-center justify-center
                          text-sm md:text-lg font-bold cursor-pointer transition-all duration-300 transform
                          ${!isVisible 
                            ? 'opacity-30 bg-gray-100 border-gray-200 cursor-not-allowed pointer-events-none' 
                            : slot.type === 'fixed' 
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
                          {!isVisible ? (
                            <span className="text-xs text-gray-400">?</span>
                          ) : slot.filled ? (
                            slot.content
                          ) : slot.content ? (
                            slot.content
                          ) : (
                            <span className="text-xs md:text-sm text-gray-500 break-words">
                              {getGrammarLabel(slot.type)}
                            </span>
                          )}
                        </div>
                        
                        {/* Selection indicator - only show if visible */}
                        {isVisible && currentSlotIndex === index && slot.type !== 'fixed' && (
                          <div className="absolute -top-2 -right-2 w-4 h-4 md:w-6 md:h-6 bg-autism-primary rounded-full flex items-center justify-center">
                            <span className="text-white text-xs md:text-sm font-bold">👆</span>
                          </div>
                        )}
                      </div>
                    )
                  })}
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
                      💡 Choose a <strong>{getGrammarLabel(sentenceSlots[currentSlotIndex].type)}</strong> below!
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
                      ? `📝 ${getGrammarLabel(sentenceSlots[currentSlotIndex].type)} Words`
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
          </>
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

              {/* Pattern Recognition Teaching */}
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                <p className="text-base md:text-lg text-green-700 font-semibold mb-2">
                  {getPatternCelebration(sentenceSlots)}
                </p>
                <p className="text-sm md:text-base text-green-600">
                  {getPatternExample(sentenceSlots)}
                </p>
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