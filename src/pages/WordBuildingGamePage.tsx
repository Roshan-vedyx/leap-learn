// src/pages/WordBuildingGamePage.tsx
// Enhanced with choice-driven sentence transition and motor planning accessibility
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
      setWordFeedback('') // Clear any previous feedback when starting new word
      
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
      setSelectedChunkIndex(null)
      
      // Only add to completed words if not already there
      if (!wordsCompleted.includes(currentWord)) {
        const newWordsCompleted = [...wordsCompleted, currentWord]
        setWordsCompleted(newWordsCompleted)
        
        // Speak the completed word
        handleReadAloud(currentWord)
        
        // Check for pattern recognition after 3rd word
        if (newWordsCompleted.length === 3) {
          setTimeout(() => setShowPatternRecognition(true), 2000)
        }
        
        // 🎯 NEW: Show sentence choice after 6-8 words (classroom-tested timing!)
        if (newWordsCompleted.length >= 6 && !sentenceChoiceDismissed) {
          setTimeout(() => setShowSentenceChoice(true), 3000)
        }
      }
    } else if (builtWord !== targetWord) {
      setIsWordComplete(false)
      setShowCelebration(false)
    }
    
    // 🎯 NEW: Check for incorrect completion (all chunks used but wrong word)
    if (availableChunks.length === 0 && arrangedChunks.length > 0 && builtWord !== targetWord) {
      setWordFeedback("🤗 Oops, let's try again! Tap any chunk to move it back.")
      setTimeout(() => setWordFeedback(''), 4000)
    }
  }, [arrangedChunks, currentWord, isWordComplete, wordsCompleted, sentenceChoiceDismissed, availableChunks.length])

  // Enhanced chunk click handler for better motor planning accessibility
  const handleChunkClick = async (chunk: string, fromArranged: boolean = false, chunkIndex?: number) => {
    if (fromArranged) {
      // Remove from arranged, add back to available
      setArrangedChunks(prev => prev.filter((c, i) => i !== prev.indexOf(chunk)))
      setAvailableChunks(prev => [...prev, chunk])
      setWordFeedback(`🔄 "${chunk}" moved back to word bank`)
      
      // Audio feedback
      if (audio.isSpeechSynthesisSupported()) {
        await handleReadAloud(`${chunk} removed`)
      }
    } else {
      // Add to arranged, remove from available
      setArrangedChunks(prev => [...prev, chunk])
      setAvailableChunks(prev => prev.filter((c, i) => i !== prev.indexOf(chunk)))
      setWordFeedback(`✨ "${chunk}" added! Keep building!`)
      
      // Audio feedback
      if (audio.isSpeechSynthesisSupported()) {
        await handleReadAloud(chunk)
      }
    }
    
    // Clear feedback after 2 seconds
    setTimeout(() => setWordFeedback(''), 2000)
    setSelectedChunkIndex(null)
  }

  // Enhanced chunk selection for keyboard/motor accessibility
  const handleChunkSelect = (chunkIndex: number) => {
    setSelectedChunkIndex(selectedChunkIndex === chunkIndex ? null : chunkIndex)
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

  // 🎯 NEW: Handle choice-driven sentence transition
  const handleSentenceChoice = (choice: 'continue' | 'sentences') => {
    setShowSentenceChoice(false)
    
    if (choice === 'sentences') {
      // Store completed words for sentence building
      storage.set('completed-words-for-sentences', {
        theme,
        words: wordsCompleted,
        completedAt: new Date().toISOString()
      })
      setLocation(`/sentence-building/${theme}`)
    } else {
      // Continue with more words
      setSentenceChoiceDismissed(true)
      setWordFeedback('🚀 Great choice! Let\'s build more words!')
      setTimeout(() => setWordFeedback(''), 3000)
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
        storage.set('completed-words-for-sentences', {
          theme,
          words: wordsCompleted,
          completedAt: new Date().toISOString()
        })
        setLocation(`/sentence-building/${theme}`)
      }
    }
    // Reset word completion state for next word
    setIsWordComplete(false)
    setShowCelebration(false)
    setShowPatternRecognition(false)
  }

  const handleHint = async () => {
    if (availableChunks.length > 0) {
      // Find the correct first chunk for this word
      const correctChunks = breakWordIntoChunks(currentWord)
      const nextCorrectChunk = correctChunks[arrangedChunks.length]
      
      if (nextCorrectChunk && availableChunks.includes(nextCorrectChunk)) {
        handleChunkClick(nextCorrectChunk)
        setWordFeedback(`💡 Hint: The next chunk is "${nextCorrectChunk}"!`)
        
        // Audio hint
        if (audio.isSpeechSynthesisSupported()) {
          await handleReadAloud(`Try ${nextCorrectChunk}`)
        }
      } else {
        // Fallback: just place first available chunk
        const firstChunk = availableChunks[0]
        handleChunkClick(firstChunk)
      }
    }
  }

  const handleReset = () => {
    const chunks = breakWordIntoChunks(currentWord)
    const shuffledChunks = [...chunks].sort(() => Math.random() - 0.5)
    setAvailableChunks(shuffledChunks)
    setArrangedChunks([])
    setIsWordComplete(false)
    setShowCelebration(false)
    setSelectedChunkIndex(null)
    setWordFeedback('')
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
          {wordsCompleted.length > 0 && (
            <p className="text-sm text-autism-primary/60 mt-2">
              🏆 Words mastered: {wordsCompleted.length}
            </p>
          )}
        </div>

        {/* 🎯 NEW: Choice-Driven Sentence Transition */}
        {showSentenceChoice && (
          <Card className="mb-6 bg-blue-100 border-blue-400 border-2 shadow-lg">
            <CardContent className="text-center p-6">
              <div className="text-4xl mb-4">🎯</div>
              <h3 className="text-2xl font-bold text-blue-800 mb-3">
                You're becoming a word expert!
              </h3>
              <p className="text-lg text-blue-700 mb-4">
                You've built <strong>{wordsCompleted.length} amazing words</strong>! 
                What sounds more fun right now?
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mt-6">
                <Button 
                  onClick={() => handleSentenceChoice('continue')}
                  variant="outline"
                  size="comfortable"
                  className="text-lg px-6 py-4 bg-white text-blue-800 border-blue-400 hover:bg-blue-50"
                >
                  📚 Build More Words!
                </Button>
                <Button 
                  onClick={() => handleSentenceChoice('sentences')}
                  variant="celebration"
                  size="comfortable"
                  className="text-lg px-6 py-4 bg-blue-600 text-white border-blue-600 hover:bg-blue-700"
                >
                  ✍️ Make Sentences with My Words!
                </Button>
              </div>
              <p className="text-sm text-blue-600 mt-4 italic">
                Either choice is perfect - follow what feels right for you!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Target Word Display */}
        <Card className="mb-6 bg-autism-neutral border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-autism-primary">
              🎯 Build this word:
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <div className="text-6xl font-bold text-autism-primary mb-4 font-mono">
              {currentWord.toUpperCase()}
            </div>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => handleReadAloud(currentWord)}
                disabled={isReading}
                className="text-lg bg-white text-autism-primary border-autism-primary hover:bg-gray-50"
              >
                {isReading ? '🗣️ Saying...' : '🔊 Hear the word'}
              </Button>
              <Button
                variant="outline"
                onClick={() => handleReadAloud(currentWord.split('').join(' '))}
                disabled={isReading}
                className="text-lg bg-white text-autism-primary border-autism-primary hover:bg-gray-50"
              >
                🔤 Hear it spelled out
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Word Building Area - Enhanced for Motor Planning */}
        <Card className="mb-6 bg-white border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              🔧 Your Word Builder
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Word Feedback */}
            {wordFeedback && (
              <div className={`text-center mb-4 p-3 rounded-lg border ${
                wordFeedback.includes('Oops') 
                  ? 'bg-orange-50 border-orange-300' 
                  : 'bg-yellow-50 border-yellow-300'
              }`}>
                <p className={`font-medium ${
                  wordFeedback.includes('Oops') 
                    ? 'text-orange-800' 
                    : 'text-yellow-800'
                }`}>
                  {wordFeedback}
                </p>
              </div>
            )}

            {/* Arranged Chunks Display - Enhanced Visual */}
            <div className="mb-6">
              <p className="text-center text-sm text-autism-primary/70 mb-3">
                Your word so far:
              </p>
              <div className="min-h-[100px] border-3 border-dashed border-autism-primary/30 rounded-xl p-6 bg-autism-calm-mint/20">
                <div className="flex flex-wrap justify-center gap-3 items-center min-h-[60px]">
                  {arrangedChunks.length === 0 ? (
                    <div className="text-center">
                      <span className="text-autism-primary/50 italic text-lg">Click chunks below to build here</span>
                      <div className="text-3xl mt-2">⬇️</div>
                    </div>
                  ) : (
                    arrangedChunks.map((chunk, index) => (
                      <button
                        key={`arranged-${index}`}
                        onClick={() => handleChunkClick(chunk, true)}
                        className="bg-autism-secondary text-gray-800 px-6 py-4 rounded-xl text-2xl font-bold 
                                 hover:bg-autism-secondary/80 transition-all duration-200 
                                 hover:scale-110 transform shadow-lg
                                 focus:outline-none focus:ring-4 focus:ring-autism-secondary/50
                                 min-w-[80px]"
                        aria-label={`Remove chunk ${chunk}`}
                      >
                        {chunk}
                        <span className="block text-xs mt-1 opacity-70">tap to remove</span>
                      </button>
                    ))
                  )}
                </div>
              </div>
              
              {/* Progress indicator */}
              {arrangedChunks.length > 0 && (
                <div className="text-center mt-2">
                  <p className="text-sm text-autism-primary/60">
                    {arrangedChunks.join('')} {arrangedChunks.join('') === currentWord.toUpperCase() ? '✅' : '...'}
                  </p>
                </div>
              )}
            </div>

            {/* Available Chunks - Enhanced for Accessibility */}
            <div>
              <p className="text-center text-sm text-autism-primary/70 mb-3">
                Available chunks (tap to use):
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                {availableChunks.map((chunk, index) => (
                  <button
                    key={`available-${index}`}
                    onClick={() => handleChunkClick(chunk)}
                    onFocus={() => setSelectedChunkIndex(index)}
                    className={`
                      px-6 py-4 rounded-xl text-2xl font-bold transition-all duration-200 
                      transform hover:scale-110 shadow-md min-w-[80px]
                      focus:outline-none focus:ring-4 focus:ring-blue-300
                      ${selectedChunkIndex === index 
                        ? 'bg-yellow-200 border-3 border-yellow-400 scale-105' 
                        : 'bg-gray-200 text-autism-primary border-2 border-autism-primary/20 hover:bg-gray-300'
                      }
                    `}
                    aria-label={`Use chunk ${chunk}`}
                  >
                    {chunk}
                  </button>
                ))}
              </div>
              
              {availableChunks.length === 0 && arrangedChunks.length > 0 && !isWordComplete && (
                <div className="text-center mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
                  <p className="text-orange-700">
                    🤔 Hmm, check your word above. You can tap any chunk to move it back and try again!
                  </p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Success Celebration - Enhanced */}
        {showCelebration && (
          <Card className="mb-6 bg-green-100 border-green-400 border-3 shadow-2xl">
            <CardContent className="p-8 text-center">
              <div className="text-8xl mb-4">🎉</div>
              <h3 className="text-3xl font-bold text-green-800 mb-4">
                AMAZING! You built "{currentWord.toUpperCase()}"!
              </h3>
              <p className="text-green-700 text-xl mb-6">
                You're becoming a word building champion!
              </p>
              
              {/* Show phonemic pattern recognition */}
              <div className="bg-white/60 rounded-lg p-4 mb-6">
                <p className="text-sm text-green-600 mb-2">🎯 You mastered these sound patterns:</p>
                <div className="flex flex-wrap justify-center gap-2">
                  {breakWordIntoChunks(currentWord).map((chunk, index) => (
                    <span key={index} className="bg-green-200 text-green-800 px-3 py-2 rounded-full text-lg font-bold">
                      {chunk}
                    </span>
                  ))}
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => handleReadAloud(currentWord)}
                disabled={isReading}
                className="text-lg px-6 py-3 bg-white text-green-800 border-green-400 hover:bg-green-50"
              >
                {isReading ? '🗣️ Saying...' : '🔊 Hear My Word Again!'}
              </Button>
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
                Wow! Look at these amazing words you've built:
              </p>
              <div className="flex flex-wrap justify-center gap-3 mb-4">
                {wordsCompleted.slice(-3).map((word, index) => (
                  <span key={index} className="bg-purple-200 text-purple-800 px-4 py-3 rounded-full font-bold text-lg">
                    {word.toUpperCase()}
                  </span>
                ))}
              </div>
              <p className="text-purple-700 mb-4">
                Can you spot any patterns? Maybe they start the same way or end the same way?
              </p>
              <Button
                variant="outline"
                onClick={() => setShowPatternRecognition(false)}
                className="text-purple-700 bg-white border-purple-400 hover:bg-purple-50"
              >
                Cool! Let's keep building 🚀
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Controls - Enhanced */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isWordComplete && (
            <>
              <Button
                variant="outline"
                onClick={handleHint}
                disabled={availableChunks.length === 0}
                size="comfortable"
                className="text-lg bg-white text-autism-primary border-autism-primary hover:bg-gray-50"
              >
                💡 Smart Hint
              </Button>
              <Button
                variant="outline"
                onClick={handleReset}
                size="comfortable"
                className="text-lg bg-white text-gray-800 border-autism-primary hover:bg-gray-50"
              >
                🔄 Start This Word Over
              </Button>
            </>
          )}
          
          {isWordComplete && (
            <Button
              variant="celebration"
              onClick={handleNextWord}
              size="comfortable"
              className="text-xl px-8 py-4 text-gray-800"
            >
              {currentWordIndex < currentWords.length - 1 ? 
                "Next Word! →" : 
                currentDifficulty === 'challenge' ? 
                  "Build Sentences with My Words! 🎯" :
                  "Level Up! →"
              }
            </Button>
          )}
        </div>

        {/* Enhanced Progress Indicator */}
        <div className="mt-8 text-center">
          <div className="bg-autism-neutral rounded-xl p-6 inline-block shadow-md">
            <p className="text-lg font-semibold text-autism-primary mb-3">
              🏆 Your Progress
            </p>
            <div className="flex flex-col gap-3">
              <div>
                <p className="text-sm text-autism-primary/70 mb-2">
                  Words mastered: <strong>{wordsCompleted.length}</strong>
                </p>
                <div className="flex gap-1 justify-center">
                  {Array.from({ length: 10 }).map((_, index) => (
                    <div
                      key={index}
                      className={`w-4 h-4 rounded-full ${
                        index < wordsCompleted.length 
                          ? 'bg-autism-secondary' 
                          : 'bg-gray-300'
                      }`}
                    />
                  ))}
                </div>
              </div>
              
              <div>
                <p className="text-sm text-autism-primary/70">
                  Current level: <strong>{getDifficultyLabel()}</strong>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are building the word "{currentWord}" using phonemic word chunks. 
            Click on available chunks to add them to your word, or click arranged chunks to remove them.
            Use the hint button for smart suggestions, or reset to start the current word over.
            After building 6-8 words, you'll get a choice to continue building or move to sentence creation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WordBuildingGamePage