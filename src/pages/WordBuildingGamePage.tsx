// src/pages/WordBuildingGamePage.tsx
// UPDATED VERSION: TTS chunks support with EXACT same UI/UX as original

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
      // Use visual chunks for the game pieces
      let chunks = adaptiveWordBank.current.getWordChunks(currentWord)
      
      // Ensure we get proper phonetic chunks for gameplay
      if (chunks.length > 3 || chunks.some(chunk => chunk.length === 1)) {
        chunks = getPhoneticChunks(currentWord)
      }
      
      console.log(`📝 Word: ${currentWord}, Visual Chunks:`, chunks)
      
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
      if (arrangedChunks.length === 0) return
      
      const arrangedWord = arrangedChunks.join('').toUpperCase()
      const targetWord = currentWord.toUpperCase()
      
      // Get the correct chunks in order (using same chunking as gameplay)
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
        setTimeout(() => setShowWrongOrderMessage(false), 4000)
      }
    }

    checkWordCompletion()
  }, [arrangedChunks, currentWord, wordStartTime, hintsUsed, resetsUsed])

  // Child-friendly TTS with proper speed and voice selection
  const speakText = async (text: string, isChunk = false): Promise<void> => {
    return new Promise((resolve) => {
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
          setTimeout(() => proceedWithSpeech(), 100)
        } else {
          proceedWithSpeech()
        }
  
        function proceedWithSpeech() {
          // Get saved accent preference (default to GB)
          const savedAccent = storage.get('tts-accent', 'GB') as TtsAccent
          console.log(`🎤 Using accent: ${savedAccent}`)
          
          // Create utterance
          const utterance = new SpeechSynthesisUtterance(text)
          
          // Child-friendly speech parameters (consistent for neurodivergent users)
          utterance.rate = isChunk ? 0.6 : 0.7  // Slower speeds
          utterance.pitch = 0.9  // Calm pitch
          utterance.volume = 0.8  // Clear volume
          
          // Get the specific hardcoded voice for selected accent
          const selectedVoice = audio.getBestVoiceForAccent(savedAccent)
          
          if (selectedVoice) {
            utterance.voice = selectedVoice
            console.log(`🗣️ Using ${savedAccent} voice: ${selectedVoice.name}`)
          }
          
          // Set up event handlers
          utterance.onend = () => {
            setIsReading(false)
            resolve()
          }
          
          utterance.onerror = (event) => {
            console.error('Speech error:', event)
            setIsReading(false)
            resolve()
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

  // UPDATED: Use TTS chunks for "Hear Chunks" button
  const handleHearChunks = async () => {
    if (adaptiveWordBank.current && !isReading) {
      // Get TTS-optimized chunks for better pronunciation
      const ttsChunks = adaptiveWordBank.current.getTTSChunks(currentWord)
      
      console.log('🎵 Speaking TTS chunks sequentially:', ttsChunks)
      
      setIsReading(true)
      
      try {
        for (let i = 0; i < ttsChunks.length; i++) {
          console.log(`Speaking TTS chunk ${i + 1}/${ttsChunks.length}: ${ttsChunks[i]}`)
          await speakText(ttsChunks[i], true)
          
          // Pause between chunks for processing
          if (i < ttsChunks.length - 1) {
            await new Promise(resolve => setTimeout(resolve, 800))
          }
        }
      } catch (error) {
        console.error('Error in TTS chunk sequence:', error)
      } finally {
        setIsReading(false)
      }
    }
  }

  // Better phonetic chunking for fallback
  const getPhoneticChunks = (word: string): string[] => {
    const upperWord = word.toUpperCase()
    
    // Common word patterns
    const patterns = [
      { pattern: /^(.+)(APPLE|BATTLE|LITTLE|BOTTLE|CATTLE)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)(CKLE|FFLE|ZZLE|SSLE)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)(ING|TION|SION|NESS|MENT|ABLE)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)(ED|ER|EST|LY)$/i, chunks: (match: string[]) => [match[1], match[2]] },
      { pattern: /^(.+)([BCDFGHJKLMNPQRSTVWXYZ])E$/i, chunks: (match: string[]) => [match[1] + match[2][0], match[2][1]] },
      { pattern: /^(.+?)([BCDFGHJKLMNPQRSTVWXYZ])\2(.+)$/i, chunks: (match: string[]) => [match[1] + match[2], match[2] + match[3]] },
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

  // TTS for completed word
  const handleWordCompletionTTS = async () => {
    if (!isReading) {
      await speakText(`Fantastic! You built the word: ${currentWord}`)
    }
  }

  // UPDATED: Chunk click handler - use TTS chunks for individual chunk pronunciation
  const handleChunkClick = async (chunk: string, index: number, source: 'available' | 'arranged') => {
    console.log(`Clicked chunk: ${chunk} from ${source}`)
    
    if (isReading) return
    
    // Find the corresponding TTS pronunciation for this visual chunk
    let ttsToSpeak = chunk
    
    if (adaptiveWordBank.current) {
      const ttsChunks = adaptiveWordBank.current.getTTSChunks(currentWord)
      const visualChunks = adaptiveWordBank.current.getWordChunks(currentWord)
      
      // Try to map visual chunk to TTS chunk
      const chunkIndex = visualChunks.findIndex(visualChunk => 
        visualChunk.toUpperCase() === chunk.toUpperCase()
      )
      
      if (chunkIndex !== -1 && chunkIndex < ttsChunks.length) {
        ttsToSpeak = ttsChunks[chunkIndex]
        console.log(`🎵 Using TTS pronunciation: ${ttsToSpeak} for visual chunk: ${chunk}`)
      }
    }
    
    // First, play the TTS for the chunk
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50">
      {/* Mobile-first container */}
      <div className="px-4 py-6 md:px-6 lg:px-8 max-w-4xl mx-auto">
        
        {/* Header - responsive */}
        <div className="text-center mb-6 md:mb-8">
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-autism-primary mb-2">
            Build the Word! 🧩
          </h1>
          <p className="text-base md:text-lg text-autism-primary/70">
            Target: <span className="font-bold text-lg md:text-xl">{currentWords[currentWordIndex]}</span>
          </p>
        </div>

        {/* Action buttons - responsive stack */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6 md:mb-8">
          <Button
            onClick={handleShowHint}
            disabled={isWordComplete || isReading || arrangedChunks.length >= getChunksForWord(currentWords[currentWordIndex]).length}
            className="flex-1 min-h-[48px] bg-green-500 hover:bg-green-600 text-white font-medium text-base"
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
          <Button
            onClick={handleReadCurrentWord}
            disabled={isReading}
            className="flex-1 min-h-[48px] bg-purple-500 hover:bg-purple-600 text-white font-medium text-base"
          >
            {isReading ? '🔊 Reading...' : '🔊 Hear Word'}
          </Button>
        </div>

        {/* Celebration - responsive */}
        {showCelebration && (
          <div className="mb-6">
            <Card className="bg-green-50 border-2 border-green-300 animate-bounce">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-4xl md:text-5xl mb-3">🎉</div>
                <h3 className="text-xl md:text-2xl font-bold text-green-800 mb-2">Perfect!</h3>
                <p className="text-base md:text-lg text-green-700 mb-4">
                  You built "{currentWords[currentWordIndex]}" correctly!
                </p>
                <Button
                  onClick={handleWordCompletionTTS}
                  disabled={isReading}
                  className="w-full sm:w-auto min-h-[48px] mb-3 sm:mb-0 sm:mr-3 bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 text-base font-medium"
                >
                  {isReading ? '🔊 Reading...' : '🔊 Hear Success'}
                </Button>
                <Button
                  onClick={handleNextWord}
                  className="w-full sm:w-auto min-h-[48px] bg-green-600 hover:bg-green-700 text-white px-6 py-3 text-base font-medium"
                >
                  {currentWordIndex >= currentWords.length - 1 ? "🎯 Choose New Theme" : "Next Word! →"}
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Wrong order message - responsive */}
        {showWrongOrderMessage && (
          <div className="mb-6">
            <Card className="bg-orange-50 border-2 border-orange-300 animate-pulse">
              <CardContent className="p-4 md:p-6 text-center">
                <div className="text-3xl md:text-4xl mb-3">🤔</div>
                <h3 className="text-lg md:text-xl font-medium text-orange-800 mb-2">Oops!</h3>
                <p className="text-base md:text-lg text-orange-700 mb-4">
                  The word parts don't seem to be in the right order.
                </p>
                <Button
                  onClick={handleTryAgain}
                  className="w-full sm:w-auto min-h-[48px] bg-orange-500 hover:bg-orange-600 text-white px-6 py-3 text-base font-medium"
                >
                  Try Again 🔄
                </Button>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Main game area - responsive */}
        <Card className="mb-6 md:mb-8 border-2 border-autism-primary bg-white/90">
          <CardContent className="p-4 md:p-6">
            
            {/* Word building area */}
            <div className="mb-6 md:mb-8">
              <div className="text-center mb-3">
                <span className="text-lg md:text-xl font-medium text-autism-primary">Your Word:</span>
              </div>
              <div className="min-h-[80px] md:min-h-[100px] p-4 bg-autism-neutral rounded-lg border-2 border-dashed border-autism-secondary">
                <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center items-center min-h-[48px]">
                  {arrangedChunks.length === 0 ? (
                    <span className="text-autism-primary/50 text-base md:text-lg text-center px-2">
                      Tap word pieces below to build here
                    </span>
                  ) : (
                    arrangedChunks.map((chunk, index) => (
                      <button
                        key={`arranged-${index}`}
                        onClick={() => handleChunkClick(chunk, index, 'arranged')}
                        disabled={isReading}
                        className="min-h-[48px] min-w-[48px] px-4 py-3 bg-autism-secondary text-gray-800 rounded-lg font-bold text-lg md:text-xl hover:bg-autism-secondary/80 transition-colors shadow-lg cursor-pointer border-2 border-autism-secondary disabled:opacity-50 active:scale-95 touch-manipulation"
                      >
                        {chunk}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Available chunks - mobile-optimized */}
            <div className="mb-4 md:mb-6">
              <div className="text-center mb-3">
                <span className="text-lg md:text-xl font-medium text-autism-primary">Word Pieces:</span>
              </div>
              <div className="grid grid-cols-2 sm:flex sm:flex-wrap gap-3 justify-center max-h-[300px] md:max-h-none overflow-y-auto">
                {availableChunks.map((chunk, index) => (
                  <button
                    key={`available-${index}`}
                    onClick={() => handleChunkClick(chunk, index, 'available')}
                    disabled={isReading}
                    className="min-h-[48px] min-w-[48px] px-4 py-3 bg-white border-2 border-autism-primary text-autism-primary rounded-lg font-bold text-lg md:text-xl hover:bg-autism-primary hover:text-white transition-colors shadow-md cursor-pointer disabled:opacity-50 active:scale-95 touch-manipulation"
                  >
                    {chunk}
                  </button>
                ))}
              </div>
            </div>

            {/* TTS Controls - responsive */}
            <div className="flex flex-col sm:flex-row gap-2 mb-4">
              <Button
                onClick={handleListenToArrangedChunks}
                disabled={arrangedChunks.length === 0 || isReading}
                className="flex-1 min-h-[44px] bg-blue-500 hover:bg-blue-600 text-white text-sm md:text-base"
              >
                {isReading ? '🔊 Reading...' : `🔊 Hear "${arrangedChunks.join('')}"`}
              </Button>
              <Button
                onClick={handleListenToAvailableChunks}
                disabled={availableChunks.length === 0 || isReading}
                className="flex-1 min-h-[44px] bg-indigo-500 hover:bg-indigo-600 text-white text-sm md:text-base"
              >
                {isReading ? '🔊 Reading...' : '🔊 Hear All Pieces'}
              </Button>
            </div>

          </CardContent>
        </Card>

        {/* Progress indicator - responsive */}
        <div className="text-center bg-white/80 rounded-lg p-4 border-2 border-autism-primary">
          <div className="flex justify-center gap-2 mb-3 flex-wrap">
            {currentWords.map((_, index) => (
              <div
                key={index}
                className={`w-3 h-3 md:w-4 md:h-4 rounded-full ${
                  index < currentWordIndex 
                    ? 'bg-green-500' 
                    : index === currentWordIndex
                    ? 'bg-autism-secondary'
                    : 'bg-gray-300'
                }`}
              />
            ))}
          </div>
          <p className="text-sm md:text-base text-autism-primary/70 font-medium">
            Word {currentWordIndex + 1} of {currentWords.length} • Theme: {theme}
          </p>
        </div>

      </div>
    </div>
  )
}

export default WordBuildingGamePage