// src/pages/WordBuildingGamePage.tsx
// ENHANCED VERSION: Context-rich learning adventure for ND learners

import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { Volume2, Heart } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'
import { AdaptiveWordBank } from '@/data/wordBank'
import type { TtsAccent } from '@/types'
import { useLearningAnalytics } from '../hooks/useLearningAnalytics'
import { useSessionStore } from '../stores/sessionStore'
import { useCurrentUserId } from '@/lib/auth-utils'

interface WordBuildingGamePageProps {
  theme: string
}

// Enhanced word entry interface
interface EnhancedWordEntry {
  id: string
  word: string
  complexity: string
  chunks: string[]
  alternative_chunks: string[]
  phonics_focus: string
  themes: string[]
  high_frequency: boolean
  meaning_support: string
  difficulty_level: number
  context_introduction?: string
  completion_sentence?: string
  visual_context?: string
  personal_connection_question?: string
  story_connection?: string
  pattern_family?: string
  celebration_message?: string
}

// Pattern discovery tracking
interface PatternProgress {
  family: string
  wordsCompleted: string[]
  totalEncountered: number
  lastCelebrated: number
}

// Theme choice interface
interface ThemeChoice {
  name: string
  display: string
  emoji: string
  description: string
}

const WordBuildingGamePage: React.FC<WordBuildingGamePageProps> = ({ theme }) => {
  // Core game state
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [arrangedChunks, setArrangedChunks] = useState<string[]>([])
  const [availableChunks, setAvailableChunks] = useState<string[]>([])
  const [isWordComplete, setIsWordComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [showWrongOrderMessage, setShowWrongOrderMessage] = useState(false)
  const [wordsCompleted, setWordsCompleted] = useState<string[]>([])
  const [isReading, setIsReading] = useState(false)
  const [, setLocation] = useLocation()

  // Enhanced engagement state
  const [currentWordData, setCurrentWordData] = useState<EnhancedWordEntry | null>(null)
  const [showContextIntro, setShowContextIntro] = useState(true)
  const [showMeaningIntegration, setShowMeaningIntegration] = useState(false)
  const [showPatternCelebration, setShowPatternCelebration] = useState(false)
  const [showThemeChoice, setShowThemeChoice] = useState(false)
  const [patternProgress, setPatternProgress] = useState<Record<string, PatternProgress>>({})
  const [sessionPatterns, setSessionPatterns] = useState<Set<string>>(new Set())
  const [lastPatternCelebration, setLastPatternCelebration] = useState<string>('')
  
  // ADD ANALYTICS HOOKS
  const userId = useCurrentUserId()
  const { trackBreakthrough, trackChallengeOvercome, trackSupportUsage, trackWordPractice } = useLearningAnalytics(userId)
  const { currentBrainState } = useSessionStore()

  // Performance tracking (invisible to user)
  const [wordStartTime, setWordStartTime] = useState<number>(Date.now())
  const [hintsUsed, setHintsUsed] = useState<number>(0)
  const [resetsUsed, setResetsUsed] = useState<number>(0)
  
  // Adaptive system
  const adaptiveWordBank = useRef<AdaptiveWordBank | null>(null)
  const [currentWords, setCurrentWords] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Theme choice options
  const themeChoices: ThemeChoice[] = [
    { name: 'ocean', display: 'Ocean Adventures', emoji: '🌊', description: 'Dive into underwater mysteries!' },
    { name: 'space', display: 'Space Exploration', emoji: '🚀', description: 'Blast off to the stars!' },
    { name: 'animals', display: 'Animal Friends', emoji: '🐾', description: 'Meet amazing creatures!' },
    { name: 'mystery', display: 'Mystery Solving', emoji: '🔍', description: 'Solve exciting puzzles!' },
    { name: 'friendship', display: 'Friendship Stories', emoji: '👫', description: 'Adventures with friends!' }
  ]

  // Initialize adaptive system
  useEffect(() => {
    const initializeAdaptiveSystem = async () => {
      const userAge = storage.get('user-age', 10)
      adaptiveWordBank.current = new AdaptiveWordBank(userAge)
      
      // Wait for word bank to load
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Get initial words for the specified theme
      const words = adaptiveWordBank.current.getWordsForTheme(theme)
      console.log(`🎯 Loading words for theme: ${theme}`, words)

      // Validate that we actually got theme-appropriate words
      if (words.length === 0) {
        console.warn(`⚠️ No words found for theme '${theme}', falling back to universal`)
        const fallbackWords = adaptiveWordBank.current.getWordsForTheme('universal')
        setCurrentWords(fallbackWords.length > 0 ? fallbackWords : ['CAT', 'DOG', 'SUN'])
      } else {
        console.log(`✅ Successfully loaded ${words.length} words for ${theme} theme`)
        setCurrentWords(words)
      }
      setIsInitialized(true)
      
      // Load saved pattern progress
      const savedPatterns = storage.get('pattern-progress', {})
      setPatternProgress(savedPatterns)
      
      console.log(`🎯 Adaptive system initialized for age ${userAge}`)
    }

    initializeAdaptiveSystem()
  }, [theme])

  // Get current word
  const currentWord = currentWords[currentWordIndex] || 'CAT'
  
  // Load enhanced word data from JSON
  useEffect(() => {
    const loadWordData = async () => {
      if (!currentWord) return
      
      try {
        // In real implementation, this would fetch from your words.json
        // For now, creating enhanced data structure
        const enhancedData: EnhancedWordEntry = {
          id: `w${currentWordIndex + 1}`,
          word: currentWord,
          complexity: 'regular',
          chunks: adaptiveWordBank.current?.getWordChunks(currentWord) || [currentWord],
          alternative_chunks: [],
          phonics_focus: 'pattern_focus',
          themes: [theme],
          high_frequency: true,
          meaning_support: `A ${currentWord} is an important word to learn!`,
          difficulty_level: 2,
          context_introduction: generateContextIntro(currentWord, theme),
          completion_sentence: generateCompletionSentence(currentWord, theme),
          visual_context: generateVisualContext(currentWord),
          personal_connection_question: generatePersonalQuestion(currentWord),
          story_connection: generateStoryConnection(currentWord, theme),
          pattern_family: detectPatternFamily(currentWord),
          celebration_message: generateCelebrationMessage(currentWord)
        }
        
        setCurrentWordData(enhancedData)
        setShowContextIntro(true)
        setShowMeaningIntegration(false)
        setShowPatternCelebration(false)
        
      } catch (error) {
        console.error('Error loading word data:', error)
      }
    }
    
    loadWordData()
  }, [currentWord, theme, currentWordIndex])
  
  // Initialize word chunks when word changes
  useEffect(() => {
    if (currentWord && adaptiveWordBank.current) {
      let chunks = adaptiveWordBank.current.getWordChunks(currentWord)
      
      if (!chunks || chunks.length === 0) {
        console.warn(`⚠️ No JSON chunks found for ${currentWord}, using phonetic fallback`)
        chunks = getPhoneticChunks(currentWord)
      }
      
      console.log(`🔍 Word: ${currentWord}, Visual Chunks:`, chunks)
      
      const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
      setAvailableChunks(shuffledChunks)
      setArrangedChunks([])
      setIsWordComplete(false)
      setShowCelebration(false)
      setShowWrongOrderMessage(false)
      setWordStartTime(Date.now())
      setHintsUsed(0)
      setResetsUsed(0)
    }
  }, [currentWord])

  // Track when user starts new word (existing useEffect likely handles this)
  useEffect(() => {
    if (currentWord && currentWords.length > 0) {
      setWordStartTime(Date.now())
      setHintsUsed(0)
      setResetsUsed(0)
    }
  }, [currentWordIndex, currentWord])

  
  // Context generation helpers
  const generateContextIntro = (word: string, theme: string): string => {
    const contexts: Record<string, string[]> = {
      ocean: [
        `Maya is exploring underwater. Build the word for what she discovers: ${word.toUpperCase()}`,
        `The deep sea holds secrets! What word describes this underwater treasure: ${word.toUpperCase()}`,
        `Captain Finn needs help! Build this ocean word to continue his adventure: ${word.toUpperCase()}`
      ],
      space: [
        `Astronaut Alex is on a mission! Build this space word: ${word.toUpperCase()}`,
        `The rocket is ready! What word will help complete the journey: ${word.toUpperCase()}`,
        `Among the stars, we find something amazing. Build: ${word.toUpperCase()}`
      ],
      animals: [
        `In the forest, something wonderful appears! Build: ${word.toUpperCase()}`,
        `Zoe the zookeeper needs help! What animal word is this: ${word.toUpperCase()}`,
        `The animal sanctuary has a new friend! Build: ${word.toUpperCase()}`
      ],
      mystery: [
        `Detective Sam found a clue! Build this mystery word: ${word.toUpperCase()}`,
        `The puzzle box holds a secret. Build: ${word.toUpperCase()}`,
        `Something mysterious appeared! Build: ${word.toUpperCase()}`
      ],
      friendship: [
        `Best friends are planning something fun! Build: ${word.toUpperCase()}`,
        `The friendship club needs this word: ${word.toUpperCase()}`,
        `Together, friends can do anything! Build: ${word.toUpperCase()}`
      ]
    }
    
    const themeContexts = contexts[theme] || contexts.friendship
    return themeContexts[Math.floor(Math.random() * themeContexts.length)]
  }

  const generateCompletionSentence = (word: string, theme: string): string => {
    const sentences: Record<string, string[]> = {
      ocean: [
        `Maya discovered a beautiful ${word.toUpperCase()} in the coral reef!`,
        `The ${word.toUpperCase()} sparkled in the underwater sunlight!`,
        `Captain Finn sailed past the magnificent ${word.toUpperCase()}!`
      ],
      space: [
        `The ${word.toUpperCase()} glowed brightly in the cosmic darkness!`,
        `Astronaut Alex marveled at the incredible ${word.toUpperCase()}!`,
        `The spaceship approached the mysterious ${word.toUpperCase()}!`
      ],
      animals: [
        `The gentle ${word.toUpperCase()} became everyone's favorite friend!`,
        `Zoe carefully watched the playful ${word.toUpperCase()}!`,
        `The ${word.toUpperCase()} found a perfect home at the sanctuary!`
      ],
      mystery: [
        `The ${word.toUpperCase()} held the key to solving the puzzle!`,
        `Detective Sam carefully examined the ${word.toUpperCase()}!`,
        `The mysterious ${word.toUpperCase()} revealed an important clue!`
      ],
      friendship: [
        `Friends shared the wonderful ${word.toUpperCase()} together!`,
        `The ${word.toUpperCase()} brought everyone closer as friends!`,
        `The friendship grew stronger with ${word.toUpperCase()}!`
      ]
    }
    
    const themeSentences = sentences[theme] || sentences.friendship
    return themeSentences[Math.floor(Math.random() * themeSentences.length)]
  }

  const generateVisualContext = (word: string): string => {
    const visuals: Record<string, string> = {
      ocean: '🌊 Deep blue water with gentle waves',
      whale: '🐋 Gentle giant swimming peacefully',
      fish: '🐠 Colorful swimmer darting through coral',
      ship: '⛵ Brave vessel sailing the seas',
      space: '🌌 Vast cosmic expanse full of wonder',
      rocket: '🚀 Powerful explorer reaching for stars',
      star: '⭐ Twinkling light in the darkness',
      moon: '🌙 Glowing companion in the night',
      cat: '🐱 Friendly feline companion',
      dog: '🐶 Loyal four-legged friend'
    }
    
    return visuals[word.toLowerCase()] || `✨ Something special: ${word}`
  }

  const generatePersonalQuestion = (word: string): string => {
    const questions: Record<string, string> = {
      ocean: "Have you ever seen the ocean or dreamed about underwater adventures?",
      star: "Do you like to look at stars in the night sky?",
      friend: "What makes someone a really good friend?",
      happy: "What makes you feel really happy?",
      home: "What's your favorite thing about your home?"
    }
    
    return questions[word.toLowerCase()] || `When have you seen or thought about ${word}?`
  }

  const generateStoryConnection = (word: string, theme: string): string => {
    return `Great job! ${word.toUpperCase()} will appear in your next ${theme} adventure story!`
  }

  const detectPatternFamily = (word: string): string => {
    const patterns: Record<string, RegExp> = {
      'vowel_team_family': /[aeiou]{2}/i,
      'silent_e_family': /[aeiou][bcdfghjklmnpqrstvwxyz]e$/i,
      'consonant_blend_family': /^[bcdfghjklmnpqrstvwxyz]{2}/i,
      'ending_le_family': /le$/i,
      'double_consonant_family': /([bcdfghjklmnpqrstvwxyz])\1/i
    }
    
    for (const [family, pattern] of Object.entries(patterns)) {
      if (pattern.test(word)) return family
    }
    
    return 'basic_pattern_family'
  }

  const generateCelebrationMessage = (word: string): string => {
    const family = detectPatternFamily(word)
    const messages: Record<string, string> = {
      'vowel_team_family': `Excellent! ${word.toUpperCase()} has a vowel team that works together!`,
      'silent_e_family': `Amazing! ${word.toUpperCase()} uses the magic silent E pattern!`,
      'consonant_blend_family': `Fantastic! ${word.toUpperCase()} starts with blended consonants!`,
      'ending_le_family': `Wonderful! ${word.toUpperCase()} ends with the -LE pattern!`,
      'double_consonant_family': `Great work! ${word.toUpperCase()} has double consonants!`,
      'basic_pattern_family': `Perfect! You built ${word.toUpperCase()} beautifully!`
    }
    
    return messages[family] || `Outstanding work on ${word.toUpperCase()}!`
  }

  // Pattern discovery system - FIXED to avoid duplicates
  const checkPatternDiscovery = (word: string) => {
    if (!currentWordData) return
    
    const family = currentWordData.pattern_family || 'basic_pattern_family'
    
    // Update pattern progress
    setPatternProgress(prev => {
      const current = prev[family] || { family, wordsCompleted: [], totalEncountered: 0, lastCelebrated: 0 }
      
      // Check if word is already in the completed list to avoid duplicates
      if (current.wordsCompleted.includes(word.toUpperCase())) {
        return prev // Don't add duplicate
      }
      
      const updated = {
        ...current,
        wordsCompleted: [...current.wordsCompleted, word.toUpperCase()],
        totalEncountered: current.totalEncountered + 1
      }
      
      // Celebrate pattern mastery at milestones (3, 5, 7+ words)
      const milestones = [3, 5, 7]
      if (milestones.includes(updated.wordsCompleted.length) && updated.lastCelebrated < updated.wordsCompleted.length) {
        setLastPatternCelebration(createPatternCelebration(family, updated.wordsCompleted))
        setShowPatternCelebration(true)
        updated.lastCelebrated = updated.wordsCompleted.length
      }
      
      // Save to storage
      const newProgress = { ...prev, [family]: updated }
      storage.set('pattern-progress', newProgress)
      
      return newProgress
    })
  }

  const createPatternCelebration = (family: string, words: string[]): string => {
    const familyNames: Record<string, string> = {
      'vowel_team_family': 'vowel team',
      'silent_e_family': 'silent E',
      'consonant_blend_family': 'consonant blend',
      'ending_le_family': '-LE ending',
      'double_consonant_family': 'double consonant',
      'basic_pattern_family': 'word building'
    }
    
    const name = familyNames[family] || 'pattern'
    const count = words.length
    const recentWords = words.slice(-3).join(', ')
    
    if (count === 3) {
      return `🎉 Amazing! You've mastered 3 ${name} words: ${recentWords}! You're becoming a ${name} expert!`
    } else if (count === 5) {
      return `🌟 Incredible! You've conquered 5 ${name} words! You're a ${name} champion!`
    } else {
      return `🏆 Outstanding! You've mastered ${count} ${name} words! You're a true ${name} master!`
    }
  }

  // Word completion with enhanced celebrations - FIXED wrong order logic
  useEffect(() => {
    if (arrangedChunks.length === 0) {
      setShowWrongOrderMessage(false)  // Clear any lingering message
      return
    }
    const checkWordCompletion = () => {
      if (arrangedChunks.length === 0) return
      
      const arrangedWord = arrangedChunks.join('').toUpperCase()
      const targetWord = currentWord.toUpperCase()
      
      if (arrangedWord === targetWord) {
        console.log(`✅ Word completed: ${currentWord}`)
        setIsWordComplete(true)
        setShowCelebration(true)
        setShowMeaningIntegration(true)
        setShowContextIntro(false)
        setShowWrongOrderMessage(false)
        setWordsCompleted(prev => [...prev, currentWord])
        
        // Track pattern discovery
        checkPatternDiscovery(currentWord)
        
        // Performance tracking
        const completionTime = Date.now() - wordStartTime
        console.log(`📊 Word "${currentWord}" completed in ${completionTime}ms with ${hintsUsed} hints and ${resetsUsed} resets`)
        
        // ADD ANALYTICS TRACKING FOR WORD SUCCESS
        if (userId) {
          trackWordPractice({
            words: [currentWord],
            correctWords: [currentWord],
            timeSpent: completionTime,
            hintsUsed,
            difficulty: currentWordData?.complexity as any || 'regular',
            theme
          })
          
          // Track breakthrough for challenging words
          if (currentWord.length > 6 && hintsUsed <= 1) {
            trackBreakthrough(`Built challenging word: ${currentWord}`)
          }
        }
        
        // Auto-play success TTS message
        //setTimeout(() => {
        //  handleWordCompletionTTS()
        //}, 500)
        
        // Update adaptive system with your existing recordWordPerformance method
        if (adaptiveWordBank.current) {
          const completionTime = Date.now() - wordStartTime
          adaptiveWordBank.current.recordWordPerformance({
            timePerWord: completionTime,
            hintsUsed,
            resets: resetsUsed,
            completed: true,
            difficulty: 'regular' as 'easy' | 'regular' | 'challenge',
            timestamp: Date.now()
          })
        }
        return
      } else if (arrangedChunks.length >= (adaptiveWordBank.current?.getWordChunks(currentWord)?.length || 0) && !isWordComplete && !showCelebration && !showMeaningIntegration) {
        // Only show wrong order message if word is NOT complete, NOT celebrating, and NOT in success state
        setShowWrongOrderMessage(true)
        setTimeout(() => setShowWrongOrderMessage(false), 4000)
      }
    }
    
    checkWordCompletion()
  }, [arrangedChunks, currentWord, wordStartTime, hintsUsed, resetsUsed, isWordComplete, showCelebration, userId])

  // FIXED: Back to your original working TTS implementation
  const speakText = async (text: string, isChunk = false): Promise<void> => {
    return new Promise(async (resolve) => {
      if (!audio.isSpeechSynthesisSupported() || !('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported')
        resolve()
        return
      }
  
      try {
        setIsReading(true)
        console.log(`🔊 Speaking: "${text}"`)
        
        // Stop any current speech
        speechSynthesis.cancel()
        await new Promise(r => setTimeout(r, 100))
  
        // Get current accent
        const savedAccent = storage.get('tts-accent', 'GB') as TtsAccent
        console.log(`🎤 Using accent: ${savedAccent}`)
        
        // FIXED: Use the new async voice selection
        await audio.speak(text, {
          accent: savedAccent,
          rate: isChunk ? 0.6 : 0.7,
          pitch: 0.9,
          volume: 0.8
        })
        
      } catch (error) {
        console.error('TTS error:', error)
      } finally {
        setIsReading(false)
        resolve()
      }
    })
  }

  // Phonetic chunking fallback
  const getPhoneticChunks = (word: string): string[] => {
    const upperWord = word.toUpperCase()
    
    const patterns = [
      { pattern: /^(QU)(.+)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)(ING|TION|SION)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)(ED|ER|EST|LY)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)([BCDFGHJKLMNPQRSTVWXYZ])LE$/i, chunks: (match: string[]) => [match[1], match[2] + match[3]] },
      { pattern: /^(.+)([BCDFGHJKLMNPQRSTVWXYZ])\2(.+)$/i, chunks: (match: string[]) => [match[1] + match[2], match[2] + match[3]] },
      { pattern: /^(BL|BR|CL|CR|DR|FL|FR|GL|GR|PL|PR|SC|SK|SL|SM|SN|SP|ST|SW|TR|TW|TH|SH|CH|WH)(.+)$/i, chunks: (match: string[]) => [match[1], match[2]] }
    ]
    
    for (const { pattern, chunks } of patterns) {
      const match = upperWord.match(pattern)
      if (match) {
        const result = chunks(match)
        if (result.every(chunk => chunk.length > 0)) {
          return result
        }
      }
    }
    
    if (upperWord.length >= 4) {
      const vowels = 'AEIOU'
      
      if (upperWord.endsWith('LE') && upperWord.length > 3) {
        const beforeLE = upperWord.slice(0, -2)
        const lastConsonant = upperWord.slice(-3, -2)
        if (!vowels.includes(lastConsonant)) {
          return [beforeLE.slice(0, -1), lastConsonant + 'LE']
        }
      }
      
      for (let i = 1; i < upperWord.length - 1; i++) {
        const prev = upperWord[i - 1]
        const curr = upperWord[i]
        const next = upperWord[i + 1]
        
        if (vowels.includes(prev) && !vowels.includes(curr) && vowels.includes(next)) {
          return [upperWord.slice(0, i + 1), upperWord.slice(i + 1)]
        }
      }
      
      const mid = Math.ceil(upperWord.length / 2)
      return [upperWord.slice(0, mid), upperWord.slice(mid)]
    }
    
    return [upperWord]
  }

  // Interaction handlers - Fixed TTS for chunks and hear word
  const handleChunkClick = async (chunk: string, index: number, source: 'available' | 'arranged') => {
    if (isReading || isWordComplete) return
    
    console.log(`🔊 Chunk clicked: ${chunk} from ${source}`)
    
    let ttsToSpeak = chunk
    if (adaptiveWordBank.current) {
      const ttsChunks = adaptiveWordBank.current.getTTSChunks(currentWord)
      const visualChunks = adaptiveWordBank.current.getWordChunks(currentWord)
      const chunkIndex = visualChunks.findIndex(visualChunk => 
        visualChunk.toUpperCase() === chunk.toUpperCase()
      )
      
      if (chunkIndex !== -1 && chunkIndex < ttsChunks.length) {
        ttsToSpeak = ttsChunks[chunkIndex]
        console.log(`🎵 Using TTS pronunciation: ${ttsToSpeak} for visual chunk: ${chunk}`)
      }
    }
    
    // First, play the TTS for the chunk
    console.log(`🔊 About to speak chunk: "${ttsToSpeak}"`)
    await speakText(ttsToSpeak, true)
    
    // Then move the chunk
    if (source === 'available') {
      setAvailableChunks(prev => prev.filter((_, i) => i !== index))
      setArrangedChunks(prev => [...prev, chunk])
    } else {
      setArrangedChunks(prev => prev.filter((_, i) => i !== index))
      setAvailableChunks(prev => [...prev, chunk])
    }
  }

  const handleContextContinue = () => {
    setShowContextIntro(false)
  }

  const handleListenToAvailableChunks = async () => {
    if (availableChunks.length === 0 || isReading) return
    const originalChunks = adaptiveWordBank.current?.getWordChunks(currentWord) || [currentWord]
    const chunksText = originalChunks.join(', ')
    console.log(`🔊 Speaking available chunks: "${chunksText}"`)
    await speakText(`Listen to the word pieces: ${chunksText}`)
  }

  const handleHearWord = async () => {
    if (!isReading) {
      console.log(`🔊 Speaking current word: "${currentWord}"`)
      await speakText(currentWord)
    }
  }

  const handleWordCompletionTTS = async () => {
    if (!isReading) {
      // Always say "You have built [WORD]" first
      const successMessage = `You have built ${currentWord.toUpperCase()}!`
      await speakText(successMessage)
           
    }
  }

  const handleNextWord = async () => {
    if (currentWordIndex < currentWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setShowCelebration(false)
      setIsWordComplete(false)
      setShowWrongOrderMessage(false)
      setShowMeaningIntegration(false)
      setShowPatternCelebration(false)
      setShowContextIntro(true)
      
      // Reset word tracking for next word
      setWordStartTime(Date.now())
      setHintsUsed(0)
      setResetsUsed(0)
    } else {
      // Theme completed - ADD ANALYTICS TRACKING
      if (userId) {
        await trackBreakthrough(`Completed ${theme} theme with ${wordsCompleted.length} words!`)
      }

      // Check if we should show theme choice
      if (wordsCompleted.length >= 3) {
        setShowThemeChoice(true)
      } else {
        setLocation('/word-interest-selection')
      }
    }
  }

  const handleReset = async () => {
    if (adaptiveWordBank.current) {
      let chunks = adaptiveWordBank.current.getWordChunks(currentWord)
      if (chunks.length > 3 || chunks.some(chunk => chunk.length === 1)) {
        chunks = getPhoneticChunks(currentWord)
      }
      
      const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
      setAvailableChunks(shuffledChunks)
      setArrangedChunks([])
      setIsWordComplete(false)
      setShowCelebration(false)
      setShowWrongOrderMessage(false)
      setResetsUsed(prev => prev + 1)

      // ADD ANALYTICS TRACKING FOR RESET
      if (userId) {
        if (resetsUsed > 1) {
          await trackChallengeOvercome(`Persisted through ${currentWord} difficulty`)
        }
      }
    }
  }

  const handleHint = async () => {
    if (adaptiveWordBank.current && arrangedChunks.length < currentWord.length) {
      let correctChunks = adaptiveWordBank.current.getWordChunks(currentWord)
      if (correctChunks.length > 3 || correctChunks.some(chunk => chunk.length === 1)) {
        correctChunks = getPhoneticChunks(currentWord)
      }
      
      const nextChunk = correctChunks[arrangedChunks.length]
      
      if (nextChunk && availableChunks.includes(nextChunk)) {
        const chunkIndex = availableChunks.indexOf(nextChunk)
        setAvailableChunks(prev => prev.filter((_, i) => i !== chunkIndex))
        setArrangedChunks(prev => [...prev, nextChunk])
        setHintsUsed(prev => prev + 1)

        // ADD ANALYTICS TRACKING FOR HINT USAGE
        if (userId) {
          await trackSupportUsage({
            type: 'visual_aid',
            triggeredBy: `word_building_${currentWord}`,
            effectiveness: 'helped'
          })
        }
      }
    }
  }

  const handleTryAgain = () => {
    setArrangedChunks([])
    setAvailableChunks(prev => {
      const allChunks = [...prev, ...arrangedChunks]
      return allChunks.sort(() => Math.random() - 0.5)
    })
    setShowWrongOrderMessage(false)
    setIsWordComplete(false) // Reset word completion state
  }

  const handleThemeChoice = (selectedTheme: string) => {
    // Simply navigate without analytics for theme choice
    setLocation(`/word-building/${selectedTheme}`)
  }

  const handlePersonalResponse = () => {
    // Could integrate with user's response logging in the future
    console.log('Personal connection engagement recorded')
  }

  if (!isInitialized) {
    return (
      <div className="flex-1 bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky flex items-center justify-center p-4">
        <Card className="bg-white/80 border-2 border-blue-300 shadow-lg opacity-0 animate-[fade-in_0.3s_ease-in-out_0.2s_forwards]">
          <CardContent className="p-6 text-center">
            <div className="text-4xl mb-4">🎯</div>
            <h2 className="text-xl font-medium text-blue-800 mb-2">Loading Your Word Adventure...</h2>
            <p className="text-blue-600">Getting ready for {theme} words!</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="flex-1 bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky px-4 sm:px-6 lg:px-8 py-4 sm:py-6 lg:py-8">
      <div className="max-w-4xl mx-auto">
        
        {/* Context Introduction - appears before word building */}
        {showContextIntro && currentWordData && (
          <div className="mb-6">
            <Card className="bg-slate-50 border-2 border-slate-200 shadow-gentle">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-3xl md:text-4xl mb-3">🌟</div>
                <h3 className="text-lg md:text-xl font-medium text-purple-800 mb-3">Story Time!</h3>
                <p className="text-base md:text-lg text-purple-700 mb-4 leading-relaxed">
                  {currentWordData.context_introduction}
                </p>
                <Button
                  onClick={handleContextContinue}
                  className="min-h-[48px] bg-deep-ocean-blue hover:bg-deep-ocean-blue/90 text-white px-4 sm:px-6 py-3 text-sm sm:text-base font-medium transition-colors"
                >
                  Let's Build It! ✨
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Pattern Discovery Celebration */}
        {showPatternCelebration && (
          <div className="mb-6">
            <Card className="bg-gradient-to-br from-sage-green/10 to-soft-lavender/10 border-2 border-sage-green/30 shadow-gentle">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-3xl md:text-4xl mb-3">🎉</div>
                <h3 className="text-lg md:text-xl font-medium text-yellow-800 mb-3">Pattern Master!</h3>
                <p className="text-base md:text-lg text-yellow-700 mb-4 leading-relaxed">
                  {lastPatternCelebration}
                </p>
                <Button
                  onClick={() => setShowPatternCelebration(false)}
                  className="min-h-[48px] bg-yellow-500 hover:bg-yellow-600 text-white px-6 py-3 text-base font-medium"
                >
                  Keep Building! 🚀
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Theme Choice Modal */}
        {showThemeChoice && (
          <div className="mb-6">
            <Card className="bg-gradient-to-br from-sage-green/10 to-cool-mint/10 border-2 border-sage-green/30 shadow-gentle">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-3xl md:text-4xl mb-3">🎯</div>
                <h3 className="text-lg md:text-xl font-medium text-green-800 mb-3">You Mastered {theme} Words!</h3>
                <p className="text-base md:text-lg text-green-700 mb-6">What adventures next?</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                  {themeChoices.filter(choice => choice.name !== theme).map((choice) => (
                    <Button
                      key={choice.name}
                      onClick={() => handleThemeChoice(choice.name)}
                      className="min-h-[60px] bg-green-500 hover:bg-green-600 text-white p-3 text-sm font-medium flex flex-col items-center gap-1"
                    >
                      <span className="text-xl">{choice.emoji}</span>
                      <span>{choice.display}</span>
                      <span className="text-xs opacity-80">{choice.description}</span>
                    </Button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Meaning Integration - appears after word completion */}
        {showMeaningIntegration && currentWordData && (
          <div className="mb-6">
            <Card className="bg-teal-50 border-2 border-teal-300 shadow-lg">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-3xl md:text-4xl mb-3">💫</div>
                <h3 className="text-lg md:text-xl font-medium text-teal-800 mb-3">Word Meaning</h3>
                <div className="mb-4">
                  <p className="text-base md:text-lg text-teal-700 mb-2">
                    {currentWordData.visual_context}
                  </p>
                  <p className="text-sm md:text-base text-teal-600 italic mb-4">
                    {currentWordData.meaning_support}
                  </p>
                  <p className="text-base md:text-lg text-teal-700 font-medium mb-4">
                    {currentWordData.completion_sentence}
                  </p>
                </div>
                
                {currentWordData.personal_connection_question && (
                  <div className="bg-white/60 rounded-lg p-3 mb-4">
                    <Button
                      onClick={() => speakText(currentWordData.completion_sentence || `The ${currentWord} is amazing!`)}
                      className="..."
                    >
                      <Volume2 className="..." />
                      Hear the sentence
                    </Button>
                  </div>
                )}
                
                {currentWordData.story_connection && (
                  <div className="bg-white/60 rounded-lg p-3">
                    <p className="text-sm md:text-base text-teal-600">
                      {currentWordData.story_connection}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Success celebration - enhanced */}
        {showCelebration && currentWordData && (
          <div className="mb-6">
            <Card className="bg-gradient-to-br from-sage-green/10 to-cool-mint/10 border-2 border-sage-green/30 shadow-gentle">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-4xl md:text-5xl mb-4">🎉</div>
                <h2 className="text-xl md:text-2xl font-bold text-green-800 mb-3">Outstanding!</h2>
                <p className="text-lg md:text-xl text-green-700 mb-4">
                  You built: <span className="font-bold text-2xl text-green-900">{currentWord.toUpperCase()}</span>
                </p>
                <p className="text-base md:text-lg text-green-600 mb-6">
                  {currentWordData.celebration_message}
                </p>
                <div className="flex flex-col sm:flex-row gap-3 justify-center">
                  <Button
                    onClick={handleWordCompletionTTS}
                    disabled={isReading}
                    className="min-h-[48px] bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-base font-medium"
                  >
                    {isReading ? '🔊 Reading...' : '🔊 What did i build?'}
                  </Button>
                  <Button
                    onClick={handleNextWord}
                    className="min-h-[48px] bg-green-500 hover:bg-green-600 text-white px-6 py-3 text-base font-medium"
                  >
                    {currentWordIndex >= currentWords.length - 1 ? "🎯 Choose New Theme" : "Next Adventure! →"}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Gentle wrong order message */}
        {showWrongOrderMessage && (
          <div className="mb-6">
            <Card className="bg-slate-50 border-2 border-muted-coral/30 shadow-gentle">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-3xl md:text-4xl mb-3">🤔</div>
                <h3 className="text-lg md:text-xl font-medium text-orange-800 mb-2">Oops!</h3>
                <p className="text-base md:text-lg text-orange-700 mb-4">
                  The word parts don't seem to be in the right order, do you want to try again?
                </p>
                <Button
                  onClick={() => {
                    handleTryAgain()
                    setShowWrongOrderMessage(false)  // Dismiss the message
                  }}
                  className="min-h-[48px] bg-deep-ocean-blue hover:bg-deep-ocean-blue/90 text-white px-6 py-3 text-base font-medium"
                >
                  Try Again 🔄
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main game area - enhanced with context awareness */}
        <Card className="mb-6 md:mb-8 border-2 border-autism-primary/20 bg-white shadow-gentle">
          <CardContent className="p-4 md:p-6">
            
            {/* Enhanced word building area */}
            <div className="mb-6 md:mb-8">
              <div className="text-center mb-3">
                <span className="text-lg md:text-xl font-medium text-blue-800">Build Your Word:</span>
                {currentWordData?.visual_context && !showContextIntro && (
                  <p className="text-sm text-blue-600 mt-1">{currentWordData.visual_context}</p>
                )}
              </div>
              <div className="min-h-[80px] md:min-h-[100px] p-4 bg-white/70 rounded-lg border-2 border-dashed border-blue-300">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-center min-h-[48px]">
                  {arrangedChunks.length === 0 ? (
                    <div className="text-blue-500 text-center">
                      <p className="text-sm md:text-base">Click word pieces below to build your word!</p>
                    </div>
                  ) : (
                    arrangedChunks.map((chunk, index) => (
                      <button
                        key={`arranged-${index}`}
                        onClick={() => handleChunkClick(chunk, index, 'arranged')}
                        disabled={isWordComplete || isReading}
                        className="px-4 py-3 bg-blue-200 hover:bg-blue-300 disabled:bg-blue-100 rounded-lg border-2 border-blue-400 text-lg md:text-xl font-medium text-blue-900 transition-colors min-w-[60px] cursor-pointer disabled:cursor-not-allowed"
                        style={{ minHeight: '48px', touchAction: 'manipulation' }}
                      >
                        {chunk}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Available chunks */}
            <div className="mb-6 md:mb-8">
              <div className="text-center mb-3">
                <span className="text-base md:text-lg font-medium text-blue-700">Word Pieces:</span>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {availableChunks.map((chunk, index) => (
                  <button
                    key={`available-${index}`}
                    onClick={() => handleChunkClick(chunk, index, 'available')}
                    disabled={isWordComplete || isReading}
                    className="px-4 py-3 bg-white hover:bg-blue-50 disabled:bg-gray-100 rounded-lg border-2 border-blue-300 text-lg md:text-xl font-medium text-blue-800 transition-colors shadow-sm min-w-[60px] cursor-pointer disabled:cursor-not-allowed"
                    style={{ minHeight: '48px', touchAction: 'manipulation' }}
                  >
                    {chunk}
                  </button>
                ))}
              </div>
            </div>

            {/* Audio controls - enhanced */}
            <div className="mb-6">
              <div className="text-center mb-3">
                <span className="text-base md:text-lg font-medium text-blue-700">Listen & Learn:</span>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button
                  onClick={handleHearWord}
                  disabled={isReading}
                  className="flex-1 min-h-[48px] bg-blue-500 hover:bg-blue-600 text-white font-medium text-base"
                >
                  {isReading ? '🔊 Playing...' : `🔊 Hear "${currentWord}"`}
                </Button>
                <Button
                  onClick={handleListenToAvailableChunks}
                  disabled={availableChunks.length === 0 || isReading}
                  className="flex-1 min-h-[48px] bg-blue-500 hover:bg-blue-600 text-white text-base"
                >
                  {isReading ? '🔊 Reading...' : '🔊 Hear Pieces'}
                </Button>
              </div>
            </div>

            {/* Game controls */}
            <div className="text-center mb-4">
              <span className="text-base md:text-lg font-medium text-blue-700">Need Help?</span>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                onClick={handleHint}
                disabled={isWordComplete || isReading || arrangedChunks.length >= (adaptiveWordBank.current?.getWordChunks(currentWord)?.length || 0)}
                className="flex-1 min-h-[48px] bg-yellow-500 hover:bg-yellow-600 text-white font-medium text-base"
              >
                💡 Hint
              </Button>
              <Button
                onClick={handleReset}
                disabled={isWordComplete || isReading}
                className="flex-1 min-h-[48px] bg-orange-500 hover:bg-orange-600 text-white font-medium text-base"
              >
                🔄 Reset
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Enhanced progress indicator */}
        <div className="text-center bg-white/80 rounded-lg p-4 border-2 border-blue-300">
          <div className="flex justify-center gap-2 mb-3 flex-wrap">
            {currentWords.map((word, index) => (
              <div key={index} className="flex flex-col items-center">
                <div
                  className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                    index < currentWordIndex 
                      ? 'bg-green-500' 
                      : index === currentWordIndex
                      ? 'bg-blue-500'
                      : 'bg-gray-300'
                  }`}
                />
                {index < currentWordIndex && (
                  <span className="text-xs text-green-600 mt-1">✓</span>
                )}
              </div>
            ))}
          </div>
          <p className="text-sm md:text-base text-blue-700 font-medium mb-2">
            Word {currentWordIndex + 1} of {currentWords.length} • Theme: {theme}
          </p>
          {wordsCompleted.length > 0 && (
            <p className="text-xs md:text-sm text-green-600">
              🎉 {wordsCompleted.length} words mastered!
            </p>
          )}
        </div>

        {/* Pattern progress summary - appears after 2+ words */}
        {wordsCompleted.length >= 2 && Object.keys(patternProgress).length > 0 && (
          <div className="mt-4 bg-purple-50/80 rounded-lg p-3 border border-purple-200">
            <h4 className="text-sm font-medium text-purple-800 mb-2">🏆 Your Pattern Mastery:</h4>
            <div className="flex flex-wrap gap-2">
              {Object.entries(patternProgress).map(([family, progress]) => (
                <span key={family} className="text-xs bg-purple-100 text-purple-700 px-2 py-1 rounded">
                  {family.replace('_family', '').replace('_', ' ')}: {progress.wordsCompleted.length}
                </span>
              ))}
            </div>
          </div>
        )}

      </div>
    </div>
  )
}

export default WordBuildingGamePage