// src/pages/AdaptiveWordBuildingGamePage.tsx
// Enhanced word building game with invisible adaptive difficulty
// POLISHED UX for neurodivergent children

import React, { useState, useEffect, useRef } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'
import { AdaptiveWordBank, breakWordIntoChunks } from '@/data/wordBank'

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
  const [wordsCompleted, setWordsCompleted] = useState<string[]>([])
  const [showPatternRecognition, setShowPatternRecognition] = useState(false)
  const [showSentenceChoice, setShowSentenceChoice] = useState(false)
  const [sentenceChoiceDismissed, setSentenceChoiceDismissed] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [wordFeedback, setWordFeedback] = useState<string>('')
  const [selectedChunkIndex, setSelectedChunkIndex] = useState<number | null>(null)
  const [showWrongAttemptModal, setShowWrongAttemptModal] = useState(false)
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
      await new Promise(resolve => setTimeout(resolve, 200))
      
      // Get initial words
      const words = adaptiveWordBank.current.getWordsForTheme(theme)
      setCurrentWords(words)
      setIsInitialized(true)
      
      console.log(`🎯 Adaptive system initialized for age ${userAge}, starting with ${adaptiveWordBank.current.getCurrentDifficulty()} difficulty`)
    }

    initializeAdaptiveSystem()
  }, [theme])

  // Get current word
  const currentWord = currentWords[currentWordIndex] || 'CAT'
  
  // Brain state for presentation
  const brainState = storage.get('current-brain-state', 'focused')

  // Initialize word chunks when word changes (FIXED: Only after initialization)
  useEffect(() => {
    if (currentWord && adaptiveWordBank.current && isInitialized) {
      // Clear any previous feedback first
      setWordFeedback('')
      setShowWrongAttemptModal(false)
      setIsWordComplete(false)
      setShowCelebration(false)
      
      // Use enhanced chunking from JSON or fallback to phonemic analysis
      const chunks = adaptiveWordBank.current.getWordChunks(currentWord)
      
      // Shuffle chunks for the game
      const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
      setAvailableChunks(shuffledChunks)
      setArrangedChunks([])
      setSelectedChunkIndex(null)
      setShowPatternRecognition(false)
      
      // Reset performance tracking for new word
      setWordStartTime(Date.now())
      setHintsUsed(0)
      setResetsUsed(0)
    }
  }, [currentWord, isInitialized])

  // Check for sentence choice trigger
  useEffect(() => {
    if (wordsCompleted.length >= 6 && !sentenceChoiceDismissed && !showSentenceChoice) {
      setShowSentenceChoice(true)
    }
  }, [wordsCompleted.length, sentenceChoiceDismissed, showSentenceChoice])

  const handleReadAloud = async (textToRead?: string) => {
    if (isReading) return
    setIsReading(true)
    
    const text = textToRead || currentWord
    await audio.speak(text, { 
      rate: brainState === 'excited' ? 1.2 : 0.9,
      pitch: 1.1 
    })
    
    setTimeout(() => setIsReading(false), 1000)
  }

  // FIXED: Added TTS when moving chunks
  const handleChunkClick = async (chunkIndex: number) => {
    const chunk = availableChunks[chunkIndex]
    
    // Play TTS for the chunk
    if (!isReading) {
      setIsReading(true)
      await audio.speak(chunk, { 
        rate: 1.0,
        pitch: 1.2 
      })
      setTimeout(() => setIsReading(false), 800)
    }
    
    setArrangedChunks(prev => [...prev, chunk])
    setAvailableChunks(prev => prev.filter((_, index) => index !== chunkIndex))
    setSelectedChunkIndex(null)
    setWordFeedback('')
    setShowWrongAttemptModal(false)
  }

  const handleRemoveChunk = (arrangedIndex: number) => {
    const chunk = arrangedChunks[arrangedIndex]
    setAvailableChunks(prev => [...prev, chunk])
    setArrangedChunks(prev => prev.filter((_, index) => index !== arrangedIndex))
    setWordFeedback('')
    setShowWrongAttemptModal(false)
  }

  const handleSmartHint = () => {
    setHintsUsed(prev => prev + 1)
    
    if (arrangedChunks.length === 0) {
      const correctChunks = adaptiveWordBank.current?.getWordChunks(currentWord) || breakWordIntoChunks(currentWord)
      const firstChunk = correctChunks[0]
      const chunkIndex = availableChunks.findIndex(chunk => chunk === firstChunk)
      
      if (chunkIndex !== -1) {
        handleChunkClick(chunkIndex)
        setWordFeedback(`💡 Great start! "${firstChunk}" comes first.`)
      }
    } else {
      const correctChunks = adaptiveWordBank.current?.getWordChunks(currentWord) || breakWordIntoChunks(currentWord)
      const nextCorrectChunk = correctChunks[arrangedChunks.length]
      
      if (nextCorrectChunk) {
        setWordFeedback(`💡 Next piece: Look for "${nextCorrectChunk}"`)
      }
    }
  }

  const handleResetWord = () => {
    setResetsUsed(prev => prev + 1)
    
    const chunks = adaptiveWordBank.current?.getWordChunks(currentWord) || breakWordIntoChunks(currentWord)
    const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
    setAvailableChunks(shuffledChunks)
    setArrangedChunks([])
    setWordFeedback('🔄 Reset! Try building the word again.')
    setSelectedChunkIndex(null)
    setShowWrongAttemptModal(false)
  }

  // FIXED: Better wrong attempt handling + word completion TTS
  const handleCheckWord = async () => {
    const builtWord = arrangedChunks.join('')
    const isCorrect = builtWord === currentWord
    
    if (isCorrect) {
      setIsWordComplete(true)
      setWordFeedback("🎉 Perfect! You built the word correctly!")
      
      // FIXED: Read the completed word aloud
      await handleReadAloud(currentWord)
      
      // Record successful completion
      recordWordPerformance(true)
      
      setTimeout(() => {
        setWordsCompleted(prev => [...prev, currentWord])
        setShowCelebration(true)
      }, 1500) // Give time for TTS
    } else {
      // FIXED: Show gentle error modal instead of harsh feedback
      setShowWrongAttemptModal(true)
      setWordFeedback('')
    }
  }

  // INVISIBLE PERFORMANCE TRACKING
  const recordWordPerformance = (completed: boolean) => {
    if (!adaptiveWordBank.current) return
    
    const timeSpent = Date.now() - wordStartTime
    
    adaptiveWordBank.current.recordWordPerformance({
      timePerWord: timeSpent,
      hintsUsed,
      resets: resetsUsed,
      completed
    })
    
    // Check if difficulty changed and refresh word list
    const newWords = adaptiveWordBank.current.getWordsForTheme(theme)
    if (newWords !== currentWords) {
      setCurrentWords(newWords)
      console.log('🔄 Word list refreshed after difficulty adaptation')
    }
  }

  const handleNextWord = () => {
    // Record performance if word was abandoned
    if (!isWordComplete) {
      recordWordPerformance(false)
    }
    
    if (currentWordIndex === currentWords.length - 1) {
      const difficulty = adaptiveWordBank.current?.getCurrentDifficulty() || 'regular'
      
      if (difficulty === 'challenge') {
        setLocation(`/sentence-building/${theme}`)
      } else {
        // Level up - get new words for next difficulty
        const newWords = adaptiveWordBank.current?.getWordsForTheme(theme) || []
        setCurrentWords(newWords)
        setCurrentWordIndex(0)
      }
    } else {
      setCurrentWordIndex(prev => prev + 1)
    }
    
    setShowCelebration(false)
    setShowPatternRecognition(false)
  }

  const getDifficultyLabel = () => {
    const difficulty = adaptiveWordBank.current?.getCurrentDifficulty() || 'regular'
    switch (difficulty) {
      case 'easy': return 'Building Confidence'
      case 'regular': return 'Getting Stronger'
      case 'challenge': return 'Challenge Mode'
    }
  }

  // Add pattern recognition celebration
  const triggerPatternRecognition = () => {
    if (wordsCompleted.length >= 3 && !showPatternRecognition) {
      setShowPatternRecognition(true)
    }
  }

  useEffect(() => {
    if (showCelebration) {
      triggerPatternRecognition()
    }
  }, [showCelebration, wordsCompleted.length])

  // Don't render until initialized
  if (!isInitialized) {
    return (
      <div className="page-container bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky">
        <div className="container">
          <div className="content-area flex items-center justify-center">
            <p className="text-lg text-autism-primary">Loading your words...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky">
      <div className="container">
        <div className="content-area">
          
          {/* Compact Header */}
          <div className="text-center pt-2 pb-3">
            <div className="flex items-center justify-center gap-3 mb-2">
              <h1 className="text-xl md:text-2xl lg:text-3xl font-bold text-autism-primary">
                Build: {currentWord}
              </h1>
              <Button
                onClick={() => handleReadAloud()}
                disabled={isReading}
                size="sm"
                variant="outline"
                className="text-xs px-2 py-1 border-autism-primary text-autism-primary hover:bg-autism-primary hover:text-white"
              >
                🔊 {isReading ? '...' : 'Say it'}
              </Button>
            </div>
            
            <p className="text-sm text-autism-primary/70 leading-relaxed">
              Drag the word pieces together in the right order
            </p>
          </div>

          {/* Word Building Area */}
          <Card className="mx-auto max-w-2xl border-2 border-autism-primary bg-white/90 backdrop-blur-sm mb-4">
            <CardContent className="p-4">
              
              {/* Arranged Chunks Area */}
              <div className="mb-4">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-autism-primary">Your Word:</span>
                </div>
                <div className="min-h-[60px] p-3 bg-autism-neutral rounded-lg border-2 border-dashed border-autism-secondary flex flex-wrap gap-2 justify-center items-center">
                  {arrangedChunks.length === 0 ? (
                    <span className="text-autism-primary/50 text-sm">Drop word pieces here</span>
                  ) : (
                    arrangedChunks.map((chunk, index) => (
                      <button
                        key={`arranged-${index}`}
                        onClick={() => handleRemoveChunk(index)}
                        className="px-3 py-2 bg-autism-secondary text-white rounded-lg font-bold text-lg border-2 border-autism-secondary hover:bg-autism-secondary/80 transition-colors"
                      >
                        {chunk}
                      </button>
                    ))
                  )}
                </div>
              </div>

              {/* Available Chunks - FIXED: Better text contrast */}
              <div className="mb-4">
                <div className="text-center mb-2">
                  <span className="text-sm font-medium text-autism-primary">Word Pieces:</span>
                </div>
                <div className="flex flex-wrap gap-2 justify-center">
                  {availableChunks.map((chunk, index) => (
                    <button
                      key={`available-${index}`}
                      onClick={() => handleChunkClick(index)}
                      className={`px-3 py-2 bg-white border-2 rounded-lg font-bold text-lg transition-all hover:scale-105 text-gray-700 ${
                        selectedChunkIndex === index
                          ? 'border-autism-secondary bg-autism-secondary/10'
                          : 'border-autism-primary/30 hover:border-autism-primary hover:text-autism-primary'
                      }`}
                    >
                      {chunk}
                    </button>
                  ))}
                </div>
              </div>

              {/* Feedback */}
              {wordFeedback && (
                <div className="text-center mb-3 p-2 bg-autism-calm-mint rounded-lg">
                  <p className="text-sm text-autism-primary">{wordFeedback}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Action Buttons - FIXED: Updated styling for accessibility */}
          <div className="flex justify-center gap-3 mb-4 flex-wrap">
            <Button
              onClick={handleSmartHint}
              className="text-sm px-3 py-2 bg-yellow-500 text-white border-2 border-yellow-500 hover:bg-yellow-600"
            >
              💡 Smart Hint
            </Button>
            <Button
              onClick={handleResetWord}
              className="text-sm px-3 py-2 bg-white text-gray-700 border-2 border-gray-400 hover:bg-gray-50 hover:border-gray-500"
            >
              🔄 Reset
            </Button>
            <Button
              onClick={handleCheckWord}
              disabled={arrangedChunks.length === 0}
              className="text-sm px-3 py-2 bg-white text-gray-700 border-2 border-gray-400 hover:bg-gray-50 hover:border-gray-500 disabled:opacity-50 disabled:bg-gray-200"
            >
              ✓ Check My Word
            </Button>
            {(isWordComplete || showCelebration) && (
              <Button
                onClick={handleNextWord}
                className="text-sm px-4 py-2 bg-green-600 text-white border-2 border-green-600 hover:bg-green-700"
              >
                {currentWordIndex === currentWords.length - 1 ? 
                  adaptiveWordBank.current?.getCurrentDifficulty() === 'challenge' ? 
                    "Build Sentences! 🎯" :
                    "Level Up! →" :
                  "Next Word! →"
                }
              </Button>
            )}
          </div>

          {/* Compact Progress Indicator */}
          <div className="text-center bg-autism-neutral rounded-lg p-2 border-2 border-autism-primary mx-auto max-w-md">
            <div className="flex justify-center gap-1 mb-1">
              {Array.from({ length: 8 }).map((_, index) => (
                <div
                  key={index}
                  className={`w-3 h-3 rounded-full ${
                    index < wordsCompleted.length 
                      ? 'bg-autism-secondary' 
                      : 'bg-gray-300'
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-autism-primary/70">
              Progress: {wordsCompleted.length}/8 words • {getDifficultyLabel()}
            </p>
          </div>

          {/* FIXED: Gentle Wrong Attempt Modal */}
          {showWrongAttemptModal && (
            <Card className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 border-2 border-orange-400 bg-orange-50 backdrop-blur-sm max-w-md mx-auto">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-orange-700">🤔 Almost There!</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-orange-700 mb-4">
                  Oops, all the word parts are there, but you could try again. 
                  You've got this! 💪
                </p>
                <Button
                  onClick={() => setShowWrongAttemptModal(false)}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  Try Again! 🎯
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Pattern Recognition Celebration */}
          {showPatternRecognition && (
            <Card className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 border-2 border-autism-secondary bg-autism-calm-mint backdrop-blur-sm max-w-md mx-auto">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-autism-primary">🎯 Pattern Detective!</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-autism-primary mb-3">
                  You're getting great at spotting word patterns! Keep going to unlock more challenges.
                </p>
                <Button
                  onClick={() => setShowPatternRecognition(false)}
                  className="bg-autism-secondary hover:bg-autism-secondary/80 text-white"
                >
                  Keep Building! 🚀
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Sentence Choice Modal */}
          {showSentenceChoice && (
            <Card className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 border-2 border-autism-secondary bg-autism-calm-mint backdrop-blur-sm max-w-md mx-auto">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-autism-primary">🎉 Amazing Work!</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-autism-primary mb-4">
                  You've built so many words! Ready to put them together into sentences?
                </p>
                <div className="flex gap-2 justify-center">
                  <Button
                    onClick={() => setLocation(`/sentence-building/${theme}`)}
                    className="bg-autism-secondary hover:bg-autism-secondary/80 text-white"
                  >
                    Build Sentences! 📝
                  </Button>
                  <Button
                    onClick={() => {
                      setShowSentenceChoice(false)
                      setSentenceChoiceDismissed(true)
                    }}
                    variant="outline"
                    className="border-autism-primary text-autism-primary hover:bg-autism-primary hover:text-white"
                  >
                    Keep Building Words
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Celebration Modal */}
          {showCelebration && (
            <Card className="fixed inset-x-4 top-1/2 transform -translate-y-1/2 z-50 border-2 border-autism-secondary bg-autism-calm-mint backdrop-blur-sm max-w-md mx-auto">
              <CardHeader className="text-center pb-2">
                <CardTitle className="text-lg text-autism-primary">🎉 Fantastic!</CardTitle>
              </CardHeader>
              <CardContent className="text-center pt-0">
                <p className="text-sm text-autism-primary mb-3">
                  You built "{currentWord}" perfectly! 
                  {wordsCompleted.length >= 3 && " You're becoming a word-building expert!"}
                </p>
                <Button
                  onClick={() => setShowCelebration(false)}
                  className="bg-autism-secondary hover:bg-autism-secondary/80 text-white"
                >
                  {currentWordIndex === currentWords.length - 1 ? "Continue! 🚀" : "Next Word! 🎯"}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <style jsx>{`
        .page-container {
          height: 100vh;
          display: flex;
          flex-direction: column;
          overflow: hidden;
          background: linear-gradient(to bottom, hsl(var(--autism-calm-mint)), hsl(var(--autism-calm-sky)));
          padding: 8px;
          box-sizing: border-box;
        }

        .content-area {
          flex: 1;
          display: flex;
          flex-direction: column;
          justify-content: space-between;
          max-width: 100%;
        }

        @media (max-height: 700px) {
          .page-container {
            padding: 4px;
          }
        }

        @media (max-height: 600px) {
          .text-2xl { font-size: 1.25rem; }
          .text-3xl { font-size: 1.5rem; }
          .text-lg { font-size: 1rem; }
          .text-sm { font-size: 0.75rem; }
          .text-xs { font-size: 0.7rem; }
          .p-3 { padding: 0.5rem; }
          .p-2 { padding: 0.375rem; }
          .mb-3 { margin-bottom: 0.5rem; }
          .mb-2 { margin-bottom: 0.375rem; }
        }
      `}</style>
    </div>
  )
}

export default WordBuildingGamePage