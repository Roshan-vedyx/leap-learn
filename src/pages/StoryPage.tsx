// src/pages/StoryPage.tsx - Simplified for MVP
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSessionStore } from '@/stores/sessionStore'
import { audio } from '@/lib/utils'

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
  },
  // Add more stories based on brain state
  'calm-garden': {
    id: 'calm-garden',
    title: 'The Whispering Garden',
    level: 'Grade 4',
    readingTime: '6 minutes',
    phonicsSkills: ['soft sounds', 'gentle rhythm'],
    content: [
      {
        type: 'paragraph',
        text: "Emma stepped softly into the quiet garden. The gentle breeze made the leaves whisper ancient secrets.",
        phonicsFocus: ['softly', 'gentle', 'whisper']
      },
      {
        type: 'paragraph',
        text: "She found a peaceful spot by the bubbling brook. The water sang a calming song as it flowed over smooth stones.",
        phonicsFocus: ['peaceful', 'bubbling', 'calming', 'smooth']
      },
      {
        type: 'phonics-moment',
        skill: 'soft sounds',
        words: ['softly', 'gentle', 'peaceful', 'smooth'],
        instruction: 'These words have soft, gentle sounds that match the peaceful garden.'
      }
    ]
  },
  'high-energy': {
    id: 'high-energy',
    title: 'The Lightning Fast Bike Race',
    level: 'Grade 4', 
    readingTime: '7 minutes',
    phonicsSkills: ['action words', 'quick sounds'],
    content: [
      {
        type: 'paragraph',
        text: "ZOOM! Alex's bike shot forward like a rocket! The crowd cheered as she raced around the sharp turn.",
        phonicsFocus: ['shot', 'rocket', 'cheered', 'sharp']
      },
      {
        type: 'paragraph',
        text: "Her heart pumped fast as she pedaled harder. The finish line was getting closer and closer!",
        phonicsFocus: ['pumped', 'pedaled', 'harder', 'closer']
      },
      {
        type: 'phonics-moment',
        skill: 'action words',
        words: ['shot', 'raced', 'pumped', 'pedaled'],
        instruction: 'These action words have sharp, energetic sounds that match the exciting race!'
      }
    ]
  }
}

const StoryPage: React.FC<StoryPageProps> = ({ storyId }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [readingMode, setReadingMode] = useState<'text' | 'audio' | 'both'>('text')
  const [, setLocation] = useLocation()

  // Zustand store
  const { currentBrainState, setStoryId } = useSessionStore()

  // Select story based on brain state or provided storyId
  const getAdaptiveStory = () => {
    if (storyId && mockStories[storyId as keyof typeof mockStories]) {
      return mockStories[storyId as keyof typeof mockStories]
    }

    // Adaptive story selection based on brain state
    if (currentBrainState) {
      switch (currentBrainState.mood) {
        case 'calm':
          return mockStories['calm-garden']
        case 'energetic':
          return mockStories['high-energy']
        case 'focused':
        case 'neutral':
        default:
          return mockStories['space-adventure']
      }
    }
    
    return mockStories['space-adventure']
  }

  const story = getAdaptiveStory()

  useEffect(() => {
    // Set the story ID in global state
    setStoryId(story.id)

    // Adapt presentation based on brain state
    if (currentBrainState) {
      switch (currentBrainState.id) {
        case 'overwhelmed':
          setReadingMode('text') // Start with calm text-only mode
          break
        case 'energetic':
        case 'excited':
          setReadingMode('both') // More stimulating multi-modal
          break
        case 'tired':
          setReadingMode('audio') // Less visual strain
          break
        default:
          setReadingMode('text')
      }
    }
  }, [currentBrainState, story.id, setStoryId])

  const handleReadAloud = async (text: string) => {
    if (!audio?.isSpeechSynthesisSupported()) return
    
    setIsReading(true)
    try {
      const voices = audio.getChildVoices?.() || audio.getVoices()
      const selectedVoice = voices[0] || null
      
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
      
      // Announce progress for screen readers
      const announcement = `Moving to section ${currentSection + 2} of ${story.content.length}`
      const announcer = document.getElementById('accessibility-announcements')
      if (announcer) {
        announcer.textContent = announcement
      }
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
  const isPhonicsmoment = currentContent.type === 'phonics-moment'

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-purple-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Story Header */}
        <Card className="mb-6 bg-card border-primary border-2 shadow-lg">
          <CardHeader>
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <CardTitle className="text-3xl text-primary mb-2">
                  {story.title}
                </CardTitle>
                <div className="flex flex-wrap gap-4 text-sm text-muted-foreground">
                  <span>📚 {story.level}</span>
                  <span>⏱️ {story.readingTime}</span>
                  <span>🎯 Skills: {story.phonicsSkills.join(', ')}</span>
                  {currentBrainState && (
                    <span>🧠 Adapted for: {currentBrainState.label}</span>
                  )}
                </div>
              </div>
              
              {/* Reading Mode Controls */}
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-primary">Reading Mode:</label>
                <div className="flex gap-2">
                  <Button
                    variant={readingMode === 'text' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReadingMode('text')}
                  >
                    📖 Text
                  </Button>
                  <Button
                    variant={readingMode === 'audio' ? 'default' : 'outline'}
                    size="sm"
                    onClick={() => setReadingMode('audio')}
                  >
                    🎧 Audio
                  </Button>
                  <Button
                    variant={readingMode === 'both' ? 'default' : 'outline'}
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
            <span className="text-sm text-muted-foreground">Story Progress</span>
            <span className="text-sm text-muted-foreground">
              {currentSection + 1} of {story.content.length}
            </span>
          </div>
          <div className="w-full bg-muted rounded-full h-3">
            <div 
              className="bg-primary h-3 rounded-full transition-all duration-500"
              style={{ width: `${((currentSection + 1) / story.content.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Story Content */}
        <Card className={`mb-6 ${isPhonicsmoment ? 'bg-yellow-50 border-yellow-400 border-2' : 'bg-card border-border'} shadow-lg`}>
          <CardContent className="p-8">
            {isPhonicsmoment ? (
              // Phonics Learning Moment
              <div className="text-center">
                <div className="text-4xl mb-4">🎯</div>
                <h3 className="text-2xl font-semibold text-primary mb-4">
                  Stealth Phonics Moment!
                </h3>
                <p className="text-lg text-muted-foreground mb-6 leading-relaxed">
                  {(currentContent as any).instruction}
                </p>
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {(currentContent as any).words.map((word: string, index: number) => (
                    <Button
                      key={index}
                      variant="outline"
                      size="lg"
                      onClick={() => handleReadAloud(word)}
                      className="text-xl font-bold min-h-[56px] hover:bg-primary hover:text-primary-foreground"
                    >
                      {word}
                    </Button>
                  ))}
                </div>
                <p className="text-sm text-muted-foreground">
                  Click any word to hear how it sounds!
                </p>
              </div>
            ) : (
              // Regular Story Content
              <div>
                <div className="text-xl md:text-2xl leading-relaxed text-foreground mb-6 font-readable">
                  {(currentContent as any).text}
                </div>
                
                {/* Phonics-focused words highlighting */}
                {(currentContent as any).phonicsFocus && (
                  <div className="mt-6 p-4 bg-muted rounded-lg">
                    <h4 className="text-lg font-semibold text-primary mb-3">
                      🔍 Word Detective: Can you find these special words?
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {(currentContent as any).phonicsFocus.map((word: string, index: number) => (
                        <span
                          key={index}
                          className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium cursor-pointer hover:bg-primary/80 transition-colors"
                          onClick={() => handleReadAloud(word)}
                          role="button"
                          tabIndex={0}
                          onKeyDown={(e) => {
                            if (e.key === 'Enter' || e.key === ' ') {
                              e.preventDefault()
                              handleReadAloud(word)
                            }
                          }}
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
        {(readingMode === 'audio' || readingMode === 'both') && !isPhonicsmoment && (
          <Card className="mb-6 bg-purple-50 border-purple-200 shadow-lg">
            <CardContent className="p-6 text-center">
              <Button
                variant="default"
                size="lg"
                onClick={() => handleReadAloud((currentContent as any).text)}
                disabled={isReading}
                className="text-lg min-h-[56px]"
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
            size="lg"
            className="min-h-[56px]"
          >
            ← Previous
          </Button>
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-2">
              Take your time - there's no rush!
            </p>
          </div>
          
          <Button
            variant="default"
            onClick={handleNextSection}
            size="lg"
            className="min-h-[56px]"
          >
            {currentSection === story.content.length - 1 ? "Time to Create! →" : "Next →"}
          </Button>
        </div>

        {/* Back to Brain Check */}
        <div className="text-center mt-6">
          <Button
            variant="ghost"
            onClick={() => setLocation('/brain-check')}
            className="text-muted-foreground hover:text-foreground"
          >
            ← Change how I'm feeling today
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