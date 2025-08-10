// src/pages/SentenceBuildingPage.tsx
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'
import { sentenceTemplates, getWordsByThemeAndDifficulty } from '@/data/wordBank'

interface SentenceBuildingPageProps {
  theme: string
}

const SentenceBuildingPage: React.FC<SentenceBuildingPageProps> = ({ theme }) => {
  const [currentTemplateIndex, setCurrentTemplateIndex] = useState(0)
  const [builtSentence, setBuiltSentence] = useState<string[]>([])
  const [availableWords, setAvailableWords] = useState<string[]>([])
  const [isSentenceComplete, setIsSentenceComplete] = useState(false)
  const [showCelebration, setShowCelebration] = useState(false)
  const [isReading, setIsReading] = useState(false)
  const [, setLocation] = useLocation()

  // Get theme-specific templates
  const templates = sentenceTemplates[theme as keyof typeof sentenceTemplates] || sentenceTemplates.animals
  const currentTemplate = templates[currentTemplateIndex]
  
  // Get words built in previous session
  const themeWords = [
    ...getWordsByThemeAndDifficulty(theme, 'easy'),
    ...getWordsByThemeAndDifficulty(theme, 'regular')
  ].map(word => word.toUpperCase())

  useEffect(() => {
    if (currentTemplate) {
      // Parse template and create word bank
      const templateWords = currentTemplate.template.split(' ')
      const wordBank = []
      
      // Add template structure words
      templateWords.forEach(word => {
        if (!word.includes('[')) {
          wordBank.push(word)
        }
      })
      
      // Add theme-specific words
      wordBank.push(...themeWords.slice(0, 4)) // First 4 theme words
      
      // Add any additional template words
      if (currentTemplate.adjectives) wordBank.push(...currentTemplate.adjectives)
      if (currentTemplate.actions) wordBank.push(...currentTemplate.actions)
      if (currentTemplate.colors) wordBank.push(...currentTemplate.colors)
      if (currentTemplate.numbers) wordBank.push(...currentTemplate.numbers)
      if (currentTemplate.objects) wordBank.push(...currentTemplate.objects)
      if (currentTemplate.tastes) wordBank.push(...currentTemplate.tastes)
      if (currentTemplate.meals) wordBank.push(...currentTemplate.meals)
      if (currentTemplate.temperatures) wordBank.push(...currentTemplate.temperatures)
      if (currentTemplate.speeds) wordBank.push(...currentTemplate.speeds)
      if (currentTemplate.places) wordBank.push(...currentTemplate.places)
      if (currentTemplate.parts) wordBank.push(...currentTemplate.parts)
      
      // Shuffle and limit to 8-10 words
      const shuffled = [...new Set(wordBank)].sort(() => Math.random() - 0.5).slice(0, 10)
      setAvailableWords(shuffled)
      setBuiltSentence([])
      setIsSentenceComplete(false)
      setShowCelebration(false)
    }
  }, [currentTemplate, theme])

  // Check if sentence makes sense (simple validation)
  useEffect(() => {
    if (builtSentence.length >= 3) {
      // Simple check - has at least 3 words
      setIsSentenceComplete(true)
      setShowCelebration(true)
      
      // Read the sentence aloud
      const sentence = builtSentence.join(' ')
      handleReadAloud(sentence)
    } else {
      setIsSentenceComplete(false)
      setShowCelebration(false)
    }
  }, [builtSentence])

  const handleWordClick = (word: string, fromSentence: boolean = false) => {
    if (fromSentence) {
      // Remove from sentence, add back to available
      setBuiltSentence(prev => prev.filter((w, i) => i !== prev.indexOf(word)))
      setAvailableWords(prev => [...prev, word])
    } else {
      // Add to sentence, remove from available
      setBuiltSentence(prev => [...prev, word])
      setAvailableWords(prev => prev.filter((w, i) => i !== prev.indexOf(word)))
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
        rate: 0.8,
        pitch: 1.1
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
    setBuiltSentence([])
    // Add all used words back to available
    const allWords = [...availableWords, ...builtSentence]
    setAvailableWords([...new Set(allWords)])
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
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-sage to-autism-calm-mint p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-autism-primary mb-2">
            Time to Build Sentences! 
          </h1>
          <p className="text-lg text-autism-primary/80">
            Use your {getThemeLabel().toLowerCase()} words to create awesome sentences!
          </p>
        </div>

        {/* Template Helper */}
        <Card className="mb-6 bg-autism-neutral border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              💡 Sentence Idea:
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-autism-primary/80 mb-4">
              Try making a sentence like: <strong>"{currentTemplate.template}"</strong>
            </p>
            <p className="text-sm text-autism-primary/60">
              Use the words below to fill in the blanks and make it your own!
            </p>
          </CardContent>
        </Card>

        {/* Sentence Building Area */}
        <Card className="mb-6 bg-white border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              ✍️ Your Sentence
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Built Sentence Display */}
            <div className="mb-6">
              <div className="min-h-[100px] border-2 border-dashed border-autism-primary/30 rounded-lg p-6 bg-autism-calm-mint/20">
                <div className="flex flex-wrap gap-2 items-center justify-center min-h-[48px]">
                  {builtSentence.length === 0 ? (
                    <span className="text-autism-primary/50 italic text-lg">
                      Click words below to build your sentence...
                    </span>
                  ) : (
                    <>
                      {builtSentence.map((word, index) => (
                        <button
                          key={`sentence-${index}`}
                          onClick={() => handleWordClick(word, true)}
                          className="bg-autism-secondary text-white px-4 py-2 rounded-lg text-lg font-semibold hover:bg-autism-secondary/80 transition-colors"
                        >
                          {word}
                        </button>
                      ))}
                      <span className="text-2xl text-autism-primary ml-2">.</span>
                    </>
                  )}
                </div>
              </div>
              
              {/* Read Sentence Button */}
              {builtSentence.length > 0 && (
                <div className="text-center mt-4">
                  <Button
                    variant="outline"
                    onClick={() => handleReadAloud(builtSentence.join(' '))}
                    disabled={isReading}
                    className="text-lg"
                  >
                    {isReading ? '🗣️ Reading...' : '🔊 Hear my sentence'}
                  </Button>
                </div>
              )}
            </div>

            {/* Available Words */}
            <div>
              <p className="text-center text-sm text-autism-primary/70 mb-3">
                Available words:
              </p>
              <div className="flex flex-wrap justify-center gap-3">
                {availableWords.map((word, index) => (
                  <button
                    key={`available-${index}`}
                    onClick={() => handleWordClick(word)}
                    className="bg-gray-200 text-autism-primary px-3 py-2 rounded-lg text-lg font-semibold hover:bg-gray-300 transition-colors border-2 border-autism-primary/20"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Success Celebration */}
        {showCelebration && (
          <Card className="mb-6 bg-green-100 border-green-400 border-2 animate-pulse">
            <CardContent className="p-6 text-center">
              <div className="text-6xl mb-4">🎉</div>
              <h3 className="text-2xl font-bold text-green-800 mb-2">
                Fantastic sentence!
              </h3>
              <p className="text-green-700 text-lg mb-4">
                "{builtSentence.join(' ')}."
              </p>
              <p className="text-green-600">
                You're officially a sentence building superstar!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Controls */}
        <div className="flex flex-col sm:flex-row justify-center gap-4">
          {!isSentenceComplete && (
            <Button
              variant="outline"
              onClick={handleReset}
              size="comfortable"
            >
              🔄 Start over
            </Button>
          )}
          
          {isSentenceComplete && (
            <Button
              variant="celebration"
              onClick={handleNextTemplate}
              size="comfortable"
              className="text-xl px-8 py-4"
            >
              {currentTemplateIndex < templates.length - 1 ? 
                "Build Another Sentence! →" : 
                "Celebrate My Success! 🎉"
              }
            </Button>
          )}
        </div>

        {/* Progress Indicator */}
        <div className="mt-8 text-center">
          <p className="text-sm text-autism-primary/70">
            Sentence {currentTemplateIndex + 1} of {templates.length}
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are building sentences using words from the {theme} theme. 
            Click on available words to add them to your sentence, or click words in your sentence to remove them.
            Try to follow the suggested sentence pattern, but feel free to be creative!
          </p>
        </div>
      </div>
    </div>
  )
}

export default SentenceBuildingPage