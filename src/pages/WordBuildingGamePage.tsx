// src/pages/WordBuildingGamePage.tsx
// Enhanced to work with new phonemic chunking algorithm
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
  const [isReading, setIsReading] = useState(false)
  const [, setLocation] = useLocation()

  // Get brain state for adaptive presentation
  const brainState = storage.get('current-brain-state', 'focused')
  
  // Get words for current theme and difficulty
  const currentWords = getWordsByThemeAndDifficulty(theme, currentDifficulty)
  const currentWord = currentWords[currentWordIndex] || 'CAT'
  
  // Initialize word chunks when word changes
  useEffect(() => {
    if (currentWord) {
      // Use the NEW enhanced phonemic chunking
      const chunks = breakWordIntoChunks(currentWord)
      
      // Shuffle chunks for the game
      const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
      setAvailableChunks(shuffledChunks)
      setArrangedChunks([])
      setIsWordComplete(false)
      setShowCelebration(false)
      
      // Debug: Log the phonemic chunks being created
      console.log(`🎯 Phonemic chunking for "${currentWord}":`, chunks)
    }
  }, [currentWord])

  // Check if word is complete when chunks change
  useEffect(() => {
    const builtWord = arrangedChunks.join('')
    const targetWord = currentWord.toUpperCase()
    
    if (builtWord === targetWord && arrangedChunks.length > 0 && !isWordComplete) {
      setIsWordComplete(true)
      setShowCelebration(true)
      
      // Only add to completed words if not already there
      if (!wordsCompleted.includes(currentWord)) {
        setWordsCompleted(prev => [...prev, currentWord])
        
        // Speak the completed word
        handleReadAloud(currentWord)
        
        // Check if we should show pattern recognition
        if (wordsCompleted.length === 2) { // After 3rd word (0, 1, 2)
          setTimeout(() => setShowPatternRecognition(true), 2000)
        }
      }
    } else if (builtWord !== targetWord) {
      setIsWordComplete(false)
      setShowCelebration(false)
    }
  }, [arrangedChunks, currentWord, isWordComplete, wordsCompleted])

  const handleChunkClick = (chunk: string, fromArranged: boolean = false) => {
    if (fromArranged) {
      // Remove from arranged, add back to available
      setArrangedChunks(prev => prev.filter((c, i) => i !== prev.indexOf(chunk)))
      setAvailableChunks(prev => [...prev, chunk])
    } else {
      // Add to arranged, remove from available
      setArrangedChunks(prev => [...prev, chunk])
      setAvailableChunks(prev => prev.filter((c, i) => i !== prev.indexOf(chunk)))
    }
  }

  const handleReadAloud = async (text: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    
    setIsReading(true)
    try {
      const voices = audio.getChildVoices()
      const selectedVoice = voices[0] || audio.getVoices()[0]
      
      await audio.speak(text, {
        voice: selectedVoice,
        rate: 0.7, // Slower for word building
        pitch: 1.1
      })
    } catch (error) {
      console.error('Text-to-speech error:', error)
    } finally {
      setIsReading(false)
    }
  }

  const handleNextWord = () => {
    if (currentWordIndex < currentWords.length - 1) {
      setCurrentWordIndex(currentWordIndex + 1)
    } else {
      // Move to next difficulty or finish
      if (currentDifficulty === 'easy') {
        setCurrentDifficulty('regular')
        setCurrentWordIndex(0)
      } else if (currentDifficulty === 'regular') {
        setCurrentDifficulty('challenge')
        setCurrentWordIndex(0)
      } else {
        // Complete! Go to sentence building
        setLocation(`/sentence-building/${theme}`)
      }
    }
    // Reset word completion state for next word
    setIsWordComplete(false)
    setShowCelebration(false)
    setShowPatternRecognition(false)
  }

  const handleHint = () => {
    if (availableChunks.length > 0) {
      // Auto-place the first chunk as a hint
      const firstChunk = availableChunks[0]
      handleChunkClick(firstChunk)
    }
  }

  const handleReset = () => {
    const chunks = breakWordIntoChunks(currentWord)
    const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
    setAvailableChunks(shuffledChunks)
    setArrangedChunks([])
    setIsWordComplete(false)
    setShowCelebration(false)
  }

  const getDifficultyLabel = () => {
    switch (currentDifficulty) {
      case 'easy': return '🌱 Getting Started'
      case 'regular': return '🔥 Building Up'
      case 'challenge': return '🚀 Expert Level'
    }
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
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-sky to-autism-calm-mint p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-autism-primary mb-2">
            Let's Build: {getThemeLabel()}! 
          </h1>
          <p className="text-lg text-autism-primary/80">
            {getDifficultyLabel()} • Word {currentWordIndex + 1} of {currentWords.length}
          </p>
        </div>

        {/* Target Word Display */}
        <Card className="mb-6 bg-autism-neutral border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-autism-primary">
              Build this word:
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-autism-primary mb-4 font-mono">
              {currentWord.toUpperCase()}
            </div>
            <Button
              variant="outline"
              onClick={() => handleReadAloud(currentWord)}
              disabled={isReading}
              className="text-lg"
            >
              {isReading ? '🗣️ Saying...' : '🔊 Hear the word'}
            </Button>
          </CardContent>
        </Card>

        {/* Word Building Area */}
        <Card className="mb-6 bg-white border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              🔧 Your Word Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Arranged Chunks Display */}
            <div className="mb-6">
              <p className="text-center text-sm text-autism-primary/70 mb-3">
                Click chunks below to build your word:
              </p>
              <div className="min-h-[80px] border-2 border-dashed border-autism-primary/30 rounded-lg p-4 bg-autism-calm-mint/20">
                <div className="flex flex-wrap justify-center gap-2 items-center min-h-[48px]">
                  {arrangedChunks.length === 0 ? (
                    <span className="text-autism-primary/50 italic">Drop chunks here...</span>
                  ) : (
                    arrangedChunks.map((chunk, index) => (
                      <button
                        key={`arranged-${index}`}
                        onClick={() => handleChunkClick(chunk, true)}
                        className="bg-autism-secondary text-white px-4 py-3 rounded-lg text-xl font-bold hover:bg-autism-secondary/80 transition-colors min-w-[60px]"
                      >
                        {chunk}
                      </button>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Available Chunks */}
            <div>
              <p className="text-center text-sm text-autism-primary/70 mb-3">
                Available chunks:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {availableChunks.map((chunk, index) => (
                  <button
                    key={`available-${index}`}
                    onClick={() => handleChunkClick(chunk)}
                    className="bg-gray-200 text-autism-primary px-4 py-3 rounded-lg text-xl font-bold hover:bg-gray-300 transition-colors min-w-[60px] border-2 border-autism-primary/20"
                  >
                    {chunk}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Celebration */}
        {showCelebration && (
          <Card className="mb-6 bg-green-100 border-green-400 border-2 animate-bounce">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Amazing! You built "{currentWord.toUpperCase()}"!
              </h3>
              <p className="text-green-700 text-lg mb-4">
                You're becoming a word building champion!
              </p>
              
              {/* NEW: Show phonemic pattern recognition */}
              <div className="text-sm text-green-600 mt-2">
                <p>🎯 You just learned these sound patterns:</p>
                <div className="flex flex-wrap justify-center gap-2 mt-2">
                  {breakWordIntoChunks(currentWord).map((chunk, index) => (
                    <span key={index} className="bg-green-200 text-green-800 px-2 py-1 rounded text-sm font-bold">
                      {chunk}
                    </span>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Pattern Recognition */}
        {showPatternRecognition && wordsCompleted.length >= 3 && (
          <Card className="mb-6 bg-purple-100 border-purple-400 border-2">
            <CardHeader>
              <CardTitle className="text-center text-xl text-purple-800">
                🔍 Pattern Detective!
              </CardTitle>
            </CardHeader>
            <CardContent className="text-center">
              <p className="text-purple-700 text-lg mb-4">
                Look! You've built some amazing words:
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {wordsCompleted.slice(-3).map((word, index) => (
                  <span key={index} className="bg-purple-200 text-purple-800 px-3 py-2 rounded-full font-bold">
                    {word.toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-purple-700">
                Can you spot any patterns? Maybe they start the same way or end the same way?
              </p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isWordComplete && (
            <>
              <Button
                variant="outline"
                onClick={handleHint}
                disabled={availableChunks.length === 0}
                size="comfortable"
              >
                💡 Give me a hint
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                size="comfortable"
              >
                🔄 Start over
              </Button>
            </>
          )}
          
          {isWordComplete && (
            <Button
              variant="celebration"
              onClick={handleNextWord}
              size="comfortable"
              className="text-xl px-8 py-4"
            >
              {currentWordIndex < currentWords.length - 1 ? 
                "Next Word! →" : 
                currentDifficulty === 'challenge' ? 
                  "Time to Build Sentences! 🎯" :
                  "Level Up! →"
              }
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="bg-autism-neutral rounded-full p-4 inline-block">
            <p className="text-sm text-autism-primary/70 mb-2">
              Words completed: {wordsCompleted.length}
            </p>
            <div className="flex gap-1 justify-center">
              {Array.from({ length: 5 }).map((_, index) => (
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
          </div>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are building the word "{currentWord}" using phonemic word chunks. 
            Click on available chunks to add them to your word, or click arranged chunks to remove them.
            Use the hint button if you need help, or the reset button to start over.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WordBuildingGamePage