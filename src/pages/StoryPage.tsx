import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'

interface StoryPageProps {
  storyId?: string
}

// Mock story data - in real app this would come from API/database
const mockStories = {
  'space-adventure': {
    id: 'space-adventure',
    title: 'The Secret Space Station',
    level: 'Grade 4',
    readingTime: '8 minutes',
    phonicsSkills: ['long vowels', 'consonant blends'],
    content: [
      {
        type: 'paragraph',
        text: "Maya pressed her nose against the spaceship window. The Earth looked like a bright blue marble floating in the darkness of space.",
        phonicsFocus: ['pressed', 'bright', 'floating']
      },
      {
        type: 'paragraph', 
        text: "\"Look!\" she whispered to her robot friend Bolt. \"I can see the secret space station!\"",
        phonicsFocus: ['whispered', 'secret']
      },
      {
        type: 'phonics-moment',
        skill: 'consonant blends',
        words: ['pressed', 'bright', 'whispered'],
        instruction: 'Notice how these words have two consonants that blend together at the beginning.'
      },
      {
        type: 'paragraph',
        text: "The space station gleamed silver in the starlight. Maya had been searching for it for months, following clues her grandmother had left in an old journal.",
        phonicsFocus: ['gleamed', 'starlight', 'searching', 'months']
      }
    ]
  }
}

const StoryPage: React.FC<StoryPageProps> = ({ storyId }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [readingMode, setReadingMode] = useState<'text' | 'audio' | 'both'>('text')
  const [, setLocation] = useLocation()

  // Get story data
  const story = storyId ? mockStories[storyId as keyof typeof mockStories] : mockStories['space-adventure']
  
  // Get brain state for adaptive presentation
  const brainState = storage.get('current-brain-state', 'focused')

  useEffect(() => {
    // Adapt presentation based on brain state
    if (brainState === 'overwhelmed') {
      setReadingMode('text') // Start with calm text-only mode
    } else if (brainState === 'energetic') {
      setReadingMode('both') // More stimulating multi-modal
    }
  }, [brainState])

  const handleReadAloud = async (text: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    
    setIsReading(true)
    try {
      const voices = audio.getChildVoices()
      const selectedVoice = voices[0] || audio.getVoices()[0]
      
      await audio.speak(text, {
        voice: selectedVoice,
        rate: 0.8, // Slower for comprehension
        pitch: 1.1 // Slightly higher for child-friendly
      })
    } catch (error) {
      console.error('Text-to-speech error:', error)
    } finally {
      setIsReading(false)
    }
  }

  const handleNextSection = () => {
    if (currentSection < story.content.length - 1) {
      setCurrentSection(currentSection + 1)
    } else {
      // Story complete, go to creation page
      setLocation('/create')
    }
  }

  const handlePreviousSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1)
    }
  }

  const currentContent = story.content[currentSection]
  const isPhonicsмомent = currentContent.type === 'phonics-moment'

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-sky to-autism-calm-mint p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Story Header */}
        <Card className="mb-6 bg-autism-neutral border-autism-primary border-2">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl text-autism-primary mb-2">
                  {story.title}
                </CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-autism-primary/80">
                  <span>📚 {story.level}</span>
                  <span>⏱️ {story.readingTime}</span>
                  <span>🎯 Skills: {story.phonicsSkills.join(', ')}</span>
                </div>
              </div>
              
              {/* Reading Mode Controls */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-autism-primary">Reading Mode:</label>
                <div className="flex gap-2">
                  <Button
                    variant={readingMode === 'text' ? 'celebration' : 'outline'}
                    size="sm"
                    onClick={() => setReadingMode('text')}
                  >
                    📖 Text
                  </Button>
                  <Button
                    variant={readingMode === 'audio' ? 'celebration' : 'outline'}
                    size="sm"
                    onClick={() => setReadingMode('audio')}
                  >
                    🎧 Audio
                  </Button>
                  <Button
                    variant={readingMode === 'both' ? 'celebration' : 'outline'}
                    size="sm"
                    onClick={() => setReadingMode('both')}
                  >
                    🎭 Both
                  </Button>
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Progress Indicator */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-sm text-autism-primary/80">Progress</span>
            <span className="text-sm text-autism-primary/80">
              {currentSection + 1} of {story.content.length}
            </span>
          </div>
          <div className="w-full bg-autism-calm-mint rounded-full h-3">
            <div 
              className="bg-autism-secondary h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentSection + 1) / story.content.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Story Content */}
        <Card className={`mb-6 ${isPhonicsموments ? 'bg-yellow-50 border-yellow-400 border-2' : 'bg-white border-gray-200'}`}>
          <CardContent className="p-8">
            {isPhonicsموments ? (
              // Phonics Learning Moment
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-semibold text-autism-primary mb-4">
                  Stealth Phonics Moment!
                </h3>
                <p className="text-lg text-autism-primary/80 mb-6 leading-relaxed">
                  {(currentContent as any).instruction}
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {(currentContent as any).words.map((word: string, index: number) => (
                    <Button
                      key={index}
                      variant="calm"
                      size="comfortable"
                      onClick={() => handleReadAloud(word)}
                      className="text-xl font-bold"
                    >
                      {word}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-autism-primary/60">
                  Click any word to hear how it sounds!
                </p>
              </div>
            ) : (
              // Regular Story Content
              <div>
                <div className="text-xl md:text-2xl leading-relaxed text-autism-primary mb-6 font-readable">
                  {(currentContent as any).text}
                </div>
                
                {/* Phonics-focused words highlighting */}
                {(currentContent as any).phonicsFocus && (
                  <div className="mt-6 p-4 bg-autism-calm-mint rounded-lg">
                    <h4 className="text-lg font-semibold text-autism-primary mb-3">
                      🔍 Word Detective: Can you find these special words?
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(currentContent as any).phonicsFocus.map((word: string, index: number) => (
                        <span
                          key={index}
                          className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-autism-secondary/80"
                          onClick={() => handleReadAloud(word)}
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Audio Controls */}
        {(readingMode === 'audio' || readingMode === 'both') && !isPhonicsموments && (
          <Card className="mb-6 bg-autism-calm-lavender border-autism-primary">
            <CardContent className="p-6 text-center">
              <Button
                variant="celebration"
                size="comfortable"
                onClick={() => handleReadAloud((currentContent as any).text)}
                disabled={isReading}
                className="text-lg"
              >
                {isReading ? '🗣️ Reading...' : '🎧 Listen to this part'}
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Navigation */}
        <div className="flex justify-between items-center">
          <Button
            variant="outline"
            onClick={handlePreviousSection}
            disabled={currentSection === 0}
            size="comfortable"
          >
            ← Previous
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-autism-primary/60 mb-2">
              Take your time - there's no rush!
            </p>
          </div>
          
          <Button
            variant="celebration"
            onClick={handleNextSection}
            size="comfortable"
          >
            {currentSection === story.content.length - 1 ? "Time to Create! →" : "Next →"}
          </Button>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are reading "{story.title}", section {currentSection + 1} of {story.content.length}.
            Use the Previous and Next buttons to navigate, or use the audio controls to listen to the content.
            This story includes embedded phonics learning opportunities.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoryPage