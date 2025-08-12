// src/pages/WordBuildingGamePage.tsx
// Enhanced with choice-driven sentence transition and motor planning accessibility
// ND-FRIENDLY VERSION: No scrolling required, viewport-optimized layout
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'
import { wordBank, breakWordIntoChunks, getWordsByThemeAndDifficulty } from '@/data/wordBank'

interface WordBuildingGamePageProps {
  theme: string
}

const WordBuildingGamePage: React.FC<WordBuildingGamePageProps> = ({ theme }) => {
  const [currentWordIndex, setCurrentWordIndex] = useState(0)
  const [currentDifficulty, setCurrentDifficulty] = useState<'easy' | 'regular' | 'challenge'>('easy')
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
  const [, setLocation] = useLocation()

  // Get brain state for adaptive presentation
  const brainState = storage.get('current-brain-state', 'focused')
  
  // Get words for current theme and difficulty
  const currentWords = getWordsByThemeAndDifficulty(theme, currentDifficulty)
  const currentWord = currentWords[currentWordIndex] || 'CAT'
  
  // Initialize word chunks when word changes
  useEffect(() => {
    if (currentWord) {
      // Use the enhanced phonemic chunking
      const chunks = breakWordIntoChunks(currentWord)
      
      // Shuffle chunks for the game
      const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
      setAvailableChunks(shuffledChunks)
      setArrangedChunks([])
      setIsWordComplete(false)
      setShowCelebration(false)
      setSelectedChunkIndex(null)
      setWordFeedback('')
      setShowPatternRecognition(false)
    }
  }, [currentWord])

  // Check for sentence choice trigger
  useEffect(() => {
    if (wordsCompleted.length >= 6 && !sentenceChoiceDismissed && !showSentenceChoice) {
      setShowSentenceChoice(true)
    }
  }, [wordsCompleted.length, sentenceChoiceDismissed, showSentenceChoice])

  const handleReadAloud = async (textToRead?: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    
    const text = textToRead || currentWord
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

  const handleChunkClick = (clickedChunk: string, fromAvailable: boolean) => {
    if (fromAvailable) {
      // Move from available to arranged
      setArrangedChunks(prev => [...prev, clickedChunk])
      setAvailableChunks(prev => prev.filter(chunk => chunk !== clickedChunk))
      
      // Check if word is complete
      const newArrangedChunks = [...arrangedChunks, clickedChunk]
      const assembledWord = newArrangedChunks.join('').toUpperCase()
      
      if (assembledWord === currentWord.toUpperCase()) {
        setIsWordComplete(true)
        setWordFeedback("🎉 Perfect! You built the word correctly!")
        
        // Add to completed words after short delay
        setTimeout(() => {
          setWordsCompleted(prev => [...prev, currentWord])
          setShowCelebration(true)
        }, 1000)
      } else if (newArrangedChunks.length === breakWordIntoChunks(currentWord).length) {
        setWordFeedback("🤔 Oops! The chunks are all there, but try a different order.")
      }
    } else {
      // Move from arranged back to available
      setArrangedChunks(prev => prev.filter(chunk => chunk !== clickedChunk))
      setAvailableChunks(prev => [...prev, clickedChunk])
      setWordFeedback('')
      setIsWordComplete(false)
    }
  }

  const handleSmartHint = () => {
    if (arrangedChunks.length === 0) {
      const correctChunks = breakWordIntoChunks(currentWord)
      const firstChunk = correctChunks[0]
      if (availableChunks.includes(firstChunk)) {
        handleChunkClick(firstChunk, true)
        setWordFeedback(`💡 Good start! "${firstChunk}" is the first part of ${currentWord}.`)
      }
    } else {
      const correctChunks = breakWordIntoChunks(currentWord)
      const nextNeededChunk = correctChunks[arrangedChunks.length]
      if (nextNeededChunk && availableChunks.includes(nextNeededChunk)) {
        setWordFeedback(`💡 Try adding "${nextNeededChunk}" next!`)
      }
    }
  }

  const handleResetWord = () => {
    const chunks = breakWordIntoChunks(currentWord)
    const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
    setAvailableChunks(shuffledChunks)
    setArrangedChunks([])
    setIsWordComplete(false)
    setWordFeedback('')
    setSelectedChunkIndex(null)
  }

  const handleNextWord = () => {
    if (currentWordIndex < currentWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
      setShowCelebration(false)
    } else {
      // Level up or move to sentences
      if (currentDifficulty === 'easy') {
        setCurrentDifficulty('regular')
        setCurrentWordIndex(0)
      } else if (currentDifficulty === 'regular') {
        setCurrentDifficulty('challenge')
        setCurrentWordIndex(0)
      } else {
        // Move to sentence building
        setLocation(`/sentence-building/${theme}`)
      }
      setShowCelebration(false)
    }
  }

  const handleSentenceChoice = (choice: 'continue' | 'sentences') => {
    setSentenceChoiceDismissed(true)
    setShowSentenceChoice(false)
    
    if (choice === 'sentences') {
      setLocation(`/sentence-building/${theme}`)
    }
    // If 'continue', just dismiss the choice and keep building words
  }

  const getDifficultyLabel = () => {
    switch (currentDifficulty) {
      case 'easy': return 'Getting Started'
      case 'regular': return 'Building Skills'
      case 'challenge': return 'Word Expert'
      default: return 'Learning'
    }
  }

  return (
    <div className="page-container">
      <div className="content-area">
        {/* Combined Header and Audio Controls */}
        <Card className="mb-2 bg-green-100 border-2 border-autism-primary mx-auto max-w-2xl">
          <CardContent className="text-center p-3">
            <h1 className="text-2xl font-bold text-autism-primary mb-1">
              🎯 Build this word: <span className="text-3xl font-mono text-autism-secondary">{currentWord.toUpperCase()}</span>
            </h1>
            <p className="text-sm text-autism-primary/80 mb-3">
              {getDifficultyLabel()} • Word {currentWordIndex + 1} of {currentWords.length}
              {wordsCompleted.length > 0 && ` • 🏆 ${wordsCompleted.length} mastered`}
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Button
                variant="outline"
                onClick={() => handleReadAloud(currentWord)}
                disabled={isReading}
                className="text-sm bg-white text-autism-primary border-autism-primary hover:bg-gray-50"
              >
                {isReading ? '🗣️ Saying...' : '🔊 Hear the word'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReadAloud(currentWord.split('').join(' '))}
                disabled={isReading}
                className="text-sm bg-white text-autism-primary border-autism-primary hover:bg-gray-50"
              >
                🔤 Hear it spelled out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Sentence Choice */}
        {showSentenceChoice && (
          <Card className="mb-2 bg-blue-100 border-blue-400 border-2 mx-auto max-w-2xl">
            <CardContent className="text-center p-3">
              <div className="text-2xl mb-2">🎯</div>
              <h3 className="text-lg font-bold text-blue-800 mb-2">You're becoming a word expert!</h3>
              <p className="text-sm text-blue-700 mb-3">
                You've built <strong>{wordsCompleted.length} amazing words</strong>! What sounds more fun?
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <Button 
                  onClick={() => handleSentenceChoice('continue')}
                  variant="outline"
                  className="text-sm px-4 py-2 bg-white text-blue-800 border-blue-400 hover:bg-blue-50"
                >
                  📚 Build More Words!
                </Button>
                <Button 
                  onClick={() => handleSentenceChoice('sentences')}
                  className="text-sm px-4 py-2 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                >
                  ✍️ Make Sentences!
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Word Building Area - MOVED UP */}
        <Card className="flex-1 bg-blue-50 border-autism-secondary border-2 mx-auto max-w-2xl">
          <CardHeader className="pb-2">
            <CardTitle className="text-center text-lg text-autism-primary">
              🔧 Your Word Builder
            </CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            {/* Word Feedback */}
            {wordFeedback && (
              <div className={`text-center mb-2 p-3 rounded-lg border-2 ${
                wordFeedback.includes('🎉') 
                  ? 'bg-green-100 border-green-400 shadow-lg' 
                  : wordFeedback.includes('Oops') 
                  ? 'bg-orange-50 border-orange-300' 
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <p className={`text-sm font-bold ${
                  wordFeedback.includes('🎉') 
                    ? 'text-green-800 text-base' 
                    : wordFeedback.includes('Oops') 
                    ? 'text-orange-800' 
                    : 'text-yellow-800'
                }`}>
                  {wordFeedback}
                </p>
                {(isWordComplete || showCelebration) && (
                  <Button
                    onClick={() => handleReadAloud(currentWord)}
                    disabled={isReading}
                    className="mt-2 text-sm px-4 py-2 bg-green-600 text-white border-2 border-green-600 hover:bg-green-700"
                  >
                    {isReading ? '🗣️ Playing...' : '🔊 Hear My Word Again!'}
                  </Button>
                )}
              </div>
            )}

            {/* Arranged Chunks Display */}
            <div className="mb-3">
              <p className="text-center text-xs text-autism-primary/70 mb-1">
                Your word so far:
              </p>
              <div className="min-h-[60px] border-2 border-dashed border-autism-primary/30 rounded-lg p-3 bg-autism-calm-mint/20">
                <div className="flex flex-wrap justify-center gap-2 items-center min-h-[40px]">
                  {arrangedChunks.length === 0 ? (
                    <div className="text-autism-primary/50 text-sm italic">
                      Click chunks below to build your word!
                    </div>
                  ) : (
                    arrangedChunks.map((chunk, index) => (
                      <div
                        key={index}
                        onClick={() => {
                          handleChunkClick(chunk, false)
                          handleReadAloud(chunk)
                        }}
                        className="bg-autism-secondary text-autism-primary px-3 py-2 rounded-lg font-bold cursor-pointer 
                                   hover:bg-autism-secondary/80 transition-all duration-200 hover:scale-105
                                   border-2 border-autism-secondary shadow-sm text-sm relative"
                        title="Click to remove and hear sound"
                      >
                        {chunk}
                        <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 text-[10px] text-autism-primary/60 whitespace-nowrap">
                          🔊
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
              {arrangedChunks.length > 0 && (
                <p className="text-center text-[10px] text-autism-primary/60 mt-1">
                  Click to remove tile and hear sound
                </p>
              )}
            </div>

            {/* Available Chunks */}
            <div>
              <p className="text-center text-xs text-autism-primary/70 mb-1">
                Available chunks:
              </p>
              <div className="flex flex-wrap justify-center gap-2 min-h-[40px]">
                {availableChunks.map((chunk, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      handleChunkClick(chunk, true)
                      handleReadAloud(chunk)
                    }}
                    className="bg-autism-calm-mint text-autism-primary px-3 py-2 rounded-lg font-bold 
                               cursor-pointer hover:bg-autism-calm-mint/70 transition-all duration-200 
                               hover:scale-105 border-2 border-autism-primary/30 shadow-sm text-sm"
                    title="Click to add and hear sound"
                  >
                    {chunk}
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-2 justify-center mb-2">
          <Button
            onClick={handleSmartHint}
            variant="outline"
            className="text-sm px-3 py-2 bg-white text-autism-primary border-autism-primary hover:bg-gray-50"
          >
            💡 Smart Hint
          </Button>
          <Button
            onClick={handleResetWord}
            variant="outline"
            className="text-sm px-3 py-2 bg-white text-autism-primary border-autism-primary hover:bg-gray-50"
          >
            🔄 Reset Word
          </Button>
          <Button
            onClick={() => {
              const assembledWord = arrangedChunks.join('').toUpperCase()
              if (assembledWord === currentWord.toUpperCase()) {
                setIsWordComplete(true)
                setWordFeedback("🎉 Perfect! You built the word correctly!")
                setTimeout(() => {
                  setWordsCompleted(prev => [...prev, currentWord])
                  setShowCelebration(true)
                }, 1000)
              } else {
                setWordFeedback("🤔 Not quite right. Try rearranging the chunks!")
              }
            }}
            disabled={arrangedChunks.length === 0}
            className="text-sm px-3 py-2 bg-blue-600 text-white border-2 border-blue-600 hover:bg-blue-700 disabled:opacity-50 disabled:bg-gray-400"
          >
            ✓ Check My Word
          </Button>
          {(isWordComplete || showCelebration) && (
            <Button
              onClick={handleNextWord}
              className="text-sm px-4 py-2 bg-green-600 text-white border-2 border-green-600 hover:bg-green-700"
            >
              {currentWordIndex === currentWords.length - 1 ? 
                currentDifficulty === 'challenge' ? 
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