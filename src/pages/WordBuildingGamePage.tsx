// src/pages/WordBuildingGamePage.tsx
// FINAL VERSION: All issues fixed for neurodivergent children
import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { storage } from '@/lib/utils'
import { AdaptiveWordBank } from '@/data/wordBank'

interface WordBuildingGamePageProps {
  theme: string
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

  // Performance tracking (invisible to user)
  const [wordStartTime, setWordStartTime] = useState<number>(Date.now())
  const [hintsUsed, setHintsUsed] = useState<number>(0)
  const [resetsUsed, setResetsUsed] = useState<number>(0)
  
  // Adaptive system
  const adaptiveWordBank = useRef<AdaptiveWordBank | null>(null)
  const [currentWords, setCurrentWords] = useState<string[]>([])
  const [isInitialized, setIsInitialized] = useState(false)

  // Speech queue for preventing interruptions
  const speechQueueRef = useRef<string[]>([])
  const isSpeakingRef = useRef(false)

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
      
      setCurrentWords(words)
      setIsInitialized(true)
      
      console.log(`🎯 Adaptive system initialized for age ${userAge}`)
    }

    initializeAdaptiveSystem()
  }, [theme])

  // Get current word
  const currentWord = currentWords[currentWordIndex] || 'CAT'
  
  // Initialize word chunks when word changes
  useEffect(() => {
    if (currentWord && adaptiveWordBank.current) {
      // Use adaptive word bank's enhanced chunking
      let chunks = adaptiveWordBank.current.getWordChunks(currentWord)
      
      // FIXED: Ensure we get proper phonetic chunks for gameplay too
      if (chunks.length > 3 || chunks.some(chunk => chunk.length === 1)) {
        chunks = getPhoneticChunks(currentWord)
      }
      
      console.log(`📝 Word: ${currentWord}, Phonetic Chunks:`, chunks)
      
      // Shuffle chunks for the game
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

  // Check if word is correctly arranged
  useEffect(() => {
    const checkWordCompletion = () => {
      // Only check if we have chunks arranged
      if (arrangedChunks.length === 0) return
      
      const arrangedWord = arrangedChunks.join('').toUpperCase()
      const targetWord = currentWord.toUpperCase()
      
      // Get the correct chunks in order (using same phonetic chunking)
      let correctChunks = adaptiveWordBank.current?.getWordChunks(currentWord) || []
      if (correctChunks.length > 3 || correctChunks.some(chunk => chunk.length === 1)) {
        correctChunks = getPhoneticChunks(currentWord)
      }
      const isCorrectOrder = arrangedChunks.length === correctChunks.length && 
                            arrangedChunks.every((chunk, index) => chunk.toUpperCase() === correctChunks[index].toUpperCase())
      
      if (arrangedWord === targetWord && isCorrectOrder) {
        setIsWordComplete(true)
        setShowCelebration(true)
        setShowWrongOrderMessage(false)
        
        // TTS for completed word (with delay to let chunk sound finish)
        setTimeout(() => {
          handleWordCompletionTTS()
        }, 500)
        
        // Add to completed words
        setWordsCompleted(prev => [...prev, currentWord])
        
        // Record performance metrics
        if (adaptiveWordBank.current) {
          const timeSpent = Date.now() - wordStartTime
          adaptiveWordBank.current.recordWordPerformance({
            timePerWord: timeSpent,
            hintsUsed,
            resets: resetsUsed,
            completed: true
          })
        }
      } else if (arrangedChunks.length === correctChunks.length && arrangedWord === targetWord) {
        // Right letters, wrong order
        setShowWrongOrderMessage(true)
        setTimeout(() => setShowWrongOrderMessage(false), 4000) // Auto-hide after 4 seconds
      }
    }

    checkWordCompletion()
  }, [arrangedChunks, currentWord, wordStartTime, hintsUsed, resetsUsed])

  // FIXED: Child-friendly TTS with proper speed and voice selection
  const speakText = async (text: string, isChunk = false): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!('speechSynthesis' in window)) {
        console.warn('Speech synthesis not supported')
        resolve()
        return
      }

      try {
        setIsReading(true)
        
        // Stop any current speech gently
        if (speechSynthesis.speaking) {
          speechSynthesis.cancel()
          // Small delay to ensure cancellation
          setTimeout(() => proceedWithSpeech(), 100)
        } else {
          proceedWithSpeech()
        }

        function proceedWithSpeech() {
          // Get saved accent preference
          const savedAccent = storage.get('tts-accent', 'US')
          console.log(`🎤 Using accent: ${savedAccent}`)
          
          // Create utterance
          const utterance = new SpeechSynthesisUtterance(text)
          
          // FIXED: Child-friendly speech parameters
          utterance.rate = isChunk ? 0.4 : 0.5  // Much slower for children
          utterance.pitch = 1.1  // Slightly higher, friendlier pitch
          utterance.volume = 0.8
          
          // Get child-friendly voice
          const voices = speechSynthesis.getVoices()
          let selectedVoice = null
          
          // Prioritize child-friendly voices
          const childFriendlyVoices = voices.filter(voice => {
            const name = voice.name.toLowerCase()
            const lang = voice.lang.toLowerCase()
            
            // Filter by accent first
            let matchesAccent = false
            if (savedAccent === 'US') {
              matchesAccent = lang.includes('en-us') || 
                            (lang.startsWith('en') && !lang.includes('gb') && !lang.includes('in'))
            } else if (savedAccent === 'GB') {
              matchesAccent = lang.includes('en-gb') || lang.includes('en-uk')
            } else if (savedAccent === 'IN') {
              matchesAccent = lang.includes('en-in')
            }
            
            // Then filter for child-friendly characteristics
            const isChildFriendly = name.includes('female') ||
                                   name.includes('woman') ||
                                   name.includes('neural') ||
                                   name.includes('natural') ||
                                   !name.includes('male')
            
            return matchesAccent && isChildFriendly
          })
          
          if (childFriendlyVoices.length > 0) {
            // Prefer neural/natural voices if available
            selectedVoice = childFriendlyVoices.find(voice => 
              voice.name.toLowerCase().includes('neural') || 
              voice.name.toLowerCase().includes('natural')
            ) || childFriendlyVoices[0]
          } else {
            // Fallback to any English voice
            selectedVoice = voices.find(voice => voice.lang.startsWith('en'))
          }
          
          if (selectedVoice) {
            utterance.voice = selectedVoice
            console.log(`🗣️ Using child-friendly voice: ${selectedVoice.name} (${selectedVoice.lang})`)
          }
          
          // Set up event handlers
          utterance.onend = () => {
            setIsReading(false)
            resolve()
          }
          
          utterance.onerror = (event) => {
            console.error('Speech error:', event)
            setIsReading(false)
            resolve() // Resolve anyway to continue game flow
          }
          
          // Speak
          speechSynthesis.speak(utterance)
        }
        
      } catch (error) {
        console.error('TTS error:', error)
        setIsReading(false)
        resolve()
      }
    })
  }

  // FIXED: Sequential phonetic chunk speaking without interruption
  const handleHearChunks = async () => {
    if (adaptiveWordBank.current && !isReading) {
      let chunks = adaptiveWordBank.current.getWordChunks(currentWord)
      
      // FIXED: Ensure we get proper phonetic chunks, not individual letters
      if (chunks.length > 3 || chunks.some(chunk => chunk.length === 1)) {
        // If we're getting too many single letters, use better chunking
        chunks = getPhoneticChunks(currentWord)
      }
      
      console.log('Speaking phonetic chunks sequentially:', chunks)
      
      setIsReading(true)
      
      try {
        for (let i = 0; i < chunks.length; i++) {
          console.log(`Speaking chunk ${i + 1}/${chunks.length}: ${chunks[i]}`)
          await speakText(chunks[i], true)
          
          // Pause between chunks for processing
          if (i < chunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800))
          }
        }
      } catch (error) {
        console.error('Error in chunk sequence:', error)
      } finally {
        setIsReading(false)
      }
    }
  }

  // FIXED: Better phonetic chunking for TTS
  const getPhoneticChunks = (word: string): string[] => {
    const upperWord = word.toUpperCase()
    
    // Common word patterns that should stay together
    const patterns = [
      // Double consonant + LE endings
      { pattern: /^(.+)(APPLE|BATTLE|LITTLE|BOTTLE|CATTLE)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)(CKLE|FFLE|ZZLE|SSLE)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      
      // Common endings
      { pattern: /^(.+)(ING|TION|SION|NESS|MENT|ABLE)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)(ED|ER|EST|LY)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      
      // Magic E patterns
      { pattern: /^(.+)([BCDFGHJKLMNPQRSTVWXYZ])E$/i, chunks: (match: string[]) => [match[1] + match[2][0], match[2][1]] },
      
      // Double consonants - split between them
      { pattern: /^(.+?)([BCDFGHJKLMNPQRSTVWXYZ])\2(.+)$/i, chunks: (match: string[]) => [match[1] + match[2], match[2] + match[3]] },
      
      // Consonant blends at start
      { pattern: /^(BL|BR|CL|CR|DR|FL|FR|GL|GR|PL|PR|SC|SK|SL|SM|SN|SP|ST|SW|TR|TW|TH|SH|CH|WH)(.+)$/i, chunks: (match: string[]) => [match[1], match[2]] }
    ]
    
    // Try patterns first
    for (const { pattern, chunks } of patterns) {
      const match = upperWord.match(pattern)
      if (match) {
        const result = chunks(match)
        if (result.every(chunk => chunk.length > 0)) {
          return result
        }
      }
    }
    
    // For words like APPLE, use syllable-based chunking
    if (upperWord.length >= 4) {
      const vowels = 'AEIOU'
      
      // Special cases for common patterns
      if (upperWord.endsWith('LE') && upperWord.length > 3) {
        const beforeLE = upperWord.slice(0, -2)
        const lastConsonant = upperWord.slice(-3, -2)
        if (!vowels.includes(lastConsonant)) {
          // ap-ple, bat-tle, etc.
          return [beforeLE.slice(0, -1), lastConsonant + 'LE']
        }
      }
      
      // Look for vowel-consonant-vowel pattern
      for (let i = 1; i < upperWord.length - 1; i++) {
        const prev = upperWord[i - 1]
        const curr = upperWord[i]
        const next = upperWord[i + 1]
        
        if (vowels.includes(prev) && !vowels.includes(curr) && vowels.includes(next)) {
          return [upperWord.slice(0, i + 1), upperWord.slice(i + 1)]
        }
      }
      
      // Simple split in middle for longer words
      const mid = Math.ceil(upperWord.length / 2)
      return [upperWord.slice(0, mid), upperWord.slice(mid)]
    }
    
    // For short words, keep whole
    return [upperWord]
  }

  // FIXED: TTS for completed word
  const handleWordCompletionTTS = async () => {
    if (!isReading) {
      await speakText(`Fantastic! You built the word: ${currentWord}`)
    }
  }

  // FIXED: Chunk click handler - play sound before moving
  const handleChunkClick = async (chunk: string, index: number, source: 'available' | 'arranged') => {
    console.log(`Clicked chunk: ${chunk} from ${source}`)
    
    // Don't allow clicks during speech
    if (isReading) return
    
    // First, play the TTS for the chunk
    await speakText(chunk, true)
    
    // Then move the chunk
    if (source === 'available') {
      // Move from available to arranged
      setAvailableChunks(prev => prev.filter((_, i) => i !== index))
      setArrangedChunks(prev => [...prev, chunk])
    } else {
      // Move from arranged back to available
      setArrangedChunks(prev => prev.filter((_, i) => i !== index))
      setAvailableChunks(prev => [...prev, chunk])
    }
  }

  // Audio options
  const handleHearWord = async () => {
    if (!isReading) {
      await speakText(currentWord)
    }
  }

  // Next word progression
  const handleNextWord = () => {
    if (currentWordIndex < currentWords.length - 1) {
      setCurrentWordIndex(prev => prev + 1)
      setShowCelebration(false)
      setIsWordComplete(false)
      setShowWrongOrderMessage(false)
    } else {
      // All words completed for this theme
      setLocation('/word-interest-selection')
    }
  }

  // Reset current word
  const handleReset = () => {
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
    }
  }

  // Get hint
  const handleHint = () => {
    if (adaptiveWordBank.current && arrangedChunks.length < currentWord.length) {
      let correctChunks = adaptiveWordBank.current.getWordChunks(currentWord)
      if (correctChunks.length > 3 || correctChunks.some(chunk => chunk.length === 1)) {
        correctChunks = getPhoneticChunks(currentWord)
      }
      
      const nextChunk = correctChunks[arrangedChunks.length]
      
      if (nextChunk && availableChunks.includes(nextChunk)) {
        const chunkIndex = availableChunks.findIndex(chunk => chunk === nextChunk)
        handleChunkClick(nextChunk, chunkIndex, 'available')
        setHintsUsed(prev => prev + 1)
      }
    }
  }

  // Dismiss wrong order message
  const handleTryAgain = () => {
    setShowWrongOrderMessage(false)
    handleReset()
  }

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky flex items-center justify-center">
        <p className="text-lg text-autism-primary">Loading your words...</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky p-4">
      <div className="max-w-4xl mx-auto">
        
        {/* Header with Audio Options */}
        <div className="text-center mb-6">
          <h1 className="text-2xl md:text-3xl font-bold text-autism-primary mb-4">
            Build: {currentWord}
          </h1>
          
          {/* Audio buttons */}
          <div className="flex flex-col sm:flex-row gap-3 justify-center mb-4">
            <Button
              onClick={handleHearWord}
              disabled={isReading}
              variant="outline"
              className="px-4 py-2 border-autism-primary text-autism-primary hover:bg-autism-primary hover:text-white"
            >
              🔊 {isReading ? 'Playing...' : 'Hear Word'}
            </Button>
            <Button
              onClick={handleHearChunks}
              disabled={isReading}
              variant="outline" 
              className="px-4 py-2 border-autism-secondary text-autism-secondary hover:bg-autism-secondary hover:text-white"
            >
              🎵 {isReading ? 'Playing...' : 'Hear Chunks'}
            </Button>
          </div>
          
          <p className="text-sm text-autism-primary/70">
            Tap word pieces to hear them, then build the word!
          </p>
        </div>

        {/* FIXED: Wrong Order Message */}
        {showWrongOrderMessage && (
          <div className="mb-6">
            <Card className="bg-orange-50 border-2 border-orange-300 animate-pulse">
              <CardContent className="p-4 text-center">
                <div className="text-2xl mb-2">🤔</div>
                <h3 className="text-lg font-medium text-orange-800 mb-2">Oops!</h3>
                <p className="text-orange-700 mb-3">
                  The word parts don't seem to be in the right order. 
                </p>
                <Button
                  onClick={handleTryAgain}
                  className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2"
                >
                  Try Again 🔄
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Word Building Area */}
        <Card className="mb-6 border-2 border-autism-primary bg-white/90">
          <CardContent className="p-6">
            
            {/* Arranged Chunks Area - Word being built */}
            <div className="mb-6">
              <div className="text-center mb-3">
                <span className="text-lg font-medium text-autism-primary">Your Word:</span>
              </div>
              <div className="min-h-[80px] p-4 bg-autism-neutral rounded-lg border-2 border-dashed border-autism-secondary flex flex-wrap gap-3 justify-center items-center">
                {arrangedChunks.length === 0 ? (
                  <span className="text-autism-primary/50 text-lg">Tap word pieces below to build here</span>
                ) : (
                  arrangedChunks.map((chunk, index) => (
                    <button
                      key={`arranged-${index}`}
                      onClick={() => handleChunkClick(chunk, index, 'arranged')}
                      disabled={isReading}
                      className="px-4 py-3 bg-autism-secondary text-grey-800 rounded-lg font-bold text-xl hover:bg-autism-secondary/80 transition-colors min-h-[56px] min-w-[56px] shadow-lg cursor-pointer border-2 border-autism-secondary disabled:opacity-50"
                    >
                      {chunk}
                    </button>
                  ))
                )}
              </div>
            </div>

            {/* Available Chunks - Pieces to use */}
            <div className="mb-6">
              <div className="text-center mb-3">
                <span className="text-lg font-medium text-autism-primary">Word Pieces:</span>
              </div>
              <div className="flex flex-wrap gap-3 justify-center">
                {availableChunks.map((chunk, index) => (
                  <button
                    key={`available-${index}`}
                    onClick={() => handleChunkClick(chunk, index, 'available')}
                    disabled={isReading}
                    className="px-4 py-3 bg-autism-primary text-grey-800 rounded-lg font-bold text-xl hover:bg-autism-primary/80 transition-colors min-h-[56px] min-w-[56px] shadow-lg cursor-pointer border-2 border-autism-primary hover:shadow-xl transform hover:scale-105 disabled:opacity-50 disabled:transform-none"
                  >
                    {chunk}
                  </button>
                ))}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 justify-center">
              <Button
                onClick={handleHint}
                disabled={isReading}
                variant="outline"
                className="px-4 py-2 border-autism-secondary text-autism-secondary hover:bg-autism-secondary hover:text-white disabled:opacity-50"
              >
                💡 Hint
              </Button>
              <Button
                onClick={handleReset}
                disabled={isReading}
                variant="outline"
                className="px-4 py-2 border-autism-primary text-autism-primary hover:bg-autism-primary hover:text-white disabled:opacity-50"
              >
                🔄 Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Celebration & Next Button */}
        {showCelebration && (
          <div className="text-center mb-6">
            <Card className="bg-green-50 border-2 border-green-400 mb-4">
              <CardContent className="p-6">
                <div className="text-4xl mb-3">🎉</div>
                <h3 className="text-2xl font-bold text-green-800 mb-2">Fantastic!</h3>
                <p className="text-green-700 text-lg">You built: <span className="font-bold text-xl">{currentWord}</span></p>
              </CardContent>
            </Card>
            
            <Button
              onClick={handleNextWord}
              disabled={isReading}
              size="lg"
              className="bg-autism-secondary hover:bg-autism-secondary/90 text-grey-700 px-8 py-4 text-xl font-bold rounded-lg shadow-lg disabled:opacity-50"
            >
              {currentWordIndex >= currentWords.length - 1 ? "🎯 Choose New Theme" : "Next Word! →"}
            </Button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="text-center bg-white/80 rounded-lg p-4 border-2 border-autism-primary">
          <div className="flex justify-center gap-2 mb-2">
            {currentWords.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full ${
                  index < currentWordIndex 
                    ? 'bg-green-500' 
                    : index === currentWordIndex
                    ? 'bg-autism-secondary'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm text-autism-primary/70 font-medium">
            Word {currentWordIndex + 1} of {currentWords.length} • Theme: {theme}
          </p>
        </div>
      </div>
    </div>
  )
}

export default WordBuildingGamePage