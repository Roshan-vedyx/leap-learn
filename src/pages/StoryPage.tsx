import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { audio, storage } from '@/lib/utils'
import { ComplexityLevel, MultiVersionStory } from '@/types'

interface StoryPageProps {
  storyId?: string
}

// Mock story data for fallback - keeping your existing structure
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
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('full')
  const [showComplexityHint, setShowComplexityHint] = useState(false)
  const [, setLocation] = useLocation()

  // Get story data - prioritize generated story, fallback to mock
  const getStoryData = (): MultiVersionStory | any => {
    const generatedStory = storage.get('current-generated-story', null)
    if (generatedStory) {
      // Check if it's already an object or needs parsing
      if (typeof generatedStory === 'string') {
        try {
          return JSON.parse(generatedStory)
        } catch (error) {
          console.error('Error parsing generated story:', error)
          // Clear corrupted data and fall back to mock
          localStorage.removeItem('current-generated-story')
          return storyId ? mockStories[storyId as keyof typeof mockStories] : mockStories['space-adventure']
        }
      } else {
        // Already an object, return as-is
        return generatedStory
      }
    }
    // Fallback to existing mock story structure
    return storyId ? mockStories[storyId as keyof typeof mockStories] : mockStories['space-adventure']
  }

  const story = getStoryData()
  const isMultiVersion = story.versions && story.versions[complexityLevel]

  // Get brain state for adaptive presentation
  const brainState = storage.get('current-brain-state', 'focused')
  
  // Get saved complexity level or use default
  useEffect(() => {
    const savedComplexity = storage.get('current-complexity-level', 'full') as ComplexityLevel
    setComplexityLevel(savedComplexity)
  }, [])

  useEffect(() => {
    // Adapt presentation based on brain state
    if (brainState === 'overwhelmed') {
      setReadingMode('text') // Start with calm text-only mode
      setComplexityLevel('simple') // Start with simpler version
    } else if (brainState === 'energetic') {
      setReadingMode('both') // More stimulating multi-modal
    }
  }, [brainState])

  // Show complexity hint after first section for new users
  useEffect(() => {
    if (currentSection === 1 && isMultiVersion && !storage.get('complexity-hint-shown', false)) {
      setShowComplexityHint(true)
      storage.set('complexity-hint-shown', true)
    }
  }, [currentSection, isMultiVersion])

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
    const maxSections = isMultiVersion 
      ? story.versions[complexityLevel].content.length 
      : story.content.length

    if (currentSection < maxSections - 1) {
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

  const handleComplexityChange = (newLevel: ComplexityLevel) => {
    setComplexityLevel(newLevel)
    storage.set('current-complexity-level', newLevel)
    setShowComplexityHint(false)
  }

  const dismissComplexityHint = () => {
    setShowComplexityHint(false)
  }

  // Get current content based on story structure
  const getCurrentContent = () => {
    if (isMultiVersion) {
      return story.versions[complexityLevel].content[currentSection]
    }
    return story.content[currentSection]
  }

  const getTotalSections = () => {
    if (isMultiVersion) {
      return story.versions[complexityLevel].content.length
    }
    return story.content.length
  }

  const getReadingTime = () => {
    if (isMultiVersion) {
      return story.versions[complexityLevel].readingTime
    }
    return story.readingTime
  }

  const currentContent = getCurrentContent()
  const totalSections = getTotalSections()
  const isPhonicsМoment = currentContent.type === 'phonics-moment'

  const complexityLabels = {
    simple: { label: 'Simpler', emoji: '🌱', description: 'Shorter sentences, easier words' },
    full: { label: 'Just Right', emoji: '🎯', description: 'Standard complexity' },
    challenge: { label: 'Challenge Me', emoji: '🚀', description: 'Rich vocabulary, complex ideas' }
  }

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
                  <span>📚 {story.level || 'Adaptive Grade Level'}</span>
                  <span>⏱️ {getReadingTime()}</span>
                  <span>🎯 Skills: {story.phonicsSkills?.join(', ') || 'Reading & Comprehension'}</span>
                  {isMultiVersion && (
                    <span>✨ {story.concept}</span>
                  )}
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Complexity Switcher - Only show for multi-version stories */}
        {isMultiVersion && (
          <Card className="mb-6 bg-white border-autism-secondary border-2">
            <CardContent className="p-4">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h3 className="font-semibold text-autism-primary mb-1">Reading Level</h3>
                  <p className="text-sm text-autism-primary/70">Switch anytime to match how you're feeling</p>
                </div>
                <div className="flex gap-2">
                  {(Object.keys(complexityLabels) as ComplexityLevel[]).map((level) => {
                    const info = complexityLabels[level]
                    const isActive = complexityLevel === level
                    
                    return (
                      <Button
                        key={level}
                        variant={isActive ? 'celebration' : 'outline'}
                        size="comfortable"
                        onClick={() => handleComplexityChange(level)}
                        className={`flex flex-col items-center p-3 h-auto ${
                          isActive ? 'transform scale-105' : 'hover:scale-105'
                        }`}
                        aria-pressed={isActive}
                        aria-label={`Switch to ${info.label} level: ${info.description}`}
                      >
                        <span className="text-lg mb-1">{info.emoji}</span>
                        <span className="text-sm font-medium">{info.label}</span>
                      </Button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Complexity Hint - Show once for new users */}
        {showComplexityHint && (
          <Card className="mb-6 bg-autism-calm-lavender border-autism-secondary border-2 animate-pulse">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <span className="text-2xl">💡</span>
                <div className="flex-1">
                  <h3 className="font-semibold text-autism-primary mb-2">
                    You're in control! 
                  </h3>
                  <p className="text-autism-primary/80 mb-3">
                    If this feels too easy or too hard, try switching the reading level above. 
                    The story stays the same - just the way it's told changes!
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={dismissComplexityHint}
                  >
                    Got it! ✓
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Reading Mode Controls */}
        <Card className="mb-6 bg-autism-calm-mint border-autism-primary">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h3 className="font-semibold text-autism-primary mb-1">How do you want to read?</h3>
                <p className="text-sm text-autism-primary/70">Choose what works best for your brain today</p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant={readingMode === 'text' ? 'celebration' : 'outline'}
                  size="comfortable"
                  onClick={() => setReadingMode('text')}
                  aria-pressed={readingMode === 'text'}
                >
                  📖 Read
                </Button>
                <Button
                  variant={readingMode === 'audio' ? 'celebration' : 'outline'}
                  size="comfortable"
                  onClick={() => setReadingMode('audio')}
                  aria-pressed={readingMode === 'audio'}
                >
                  🎧 Listen
                </Button>
                <Button
                  variant={readingMode === 'both' ? 'celebration' : 'outline'}
                  size="comfortable"
                  onClick={() => setReadingMode('both')}
                  aria-pressed={readingMode === 'both'}
                >
                  👁️👂 Both
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Story Content */}
        <Card className="mb-6 bg-white border-autism-primary border-2">
          <CardContent className="p-8">
            {isPhonicsМoment ? (
              // Phonics Moment - Keep your existing structure
              <div>
                <div className="text-center mb-6">
                  <h3 className="text-2xl md:text-3xl font-bold text-autism-primary mb-4">
                    🎯 Reading Skill Moment
                  </h3>
                  <p className="text-lg text-autism-primary/80 leading-relaxed mb-6">
                    {(currentContent as any).instruction}
                  </p>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
                  {(currentContent as any).words.map((word: string, index: number) => (
                    <Card key={index} className="bg-autism-calm-mint border-autism-secondary cursor-pointer hover:bg-autism-secondary hover:text-white transition-colors">
                      <CardContent className="p-4 text-center" onClick={() => handleReadAloud(word)}>
                        <span className="text-xl font-bold">{word}</span>
                      </CardContent>
                    </Card>
                  ))}
                </div>
                
                <div className="text-center">
                  <p className="text-autism-primary/70 text-sm mb-4">
                    Click any word to hear it pronounced!
                  </p>
                </div>
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
        {(readingMode === 'audio' || readingMode === 'both') && !isPhonicsМoment && (
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
              Section {currentSection + 1} of {totalSections}
            </p>
            <p className="text-sm text-autism-primary/60">
              Take your time - there's no rush!
            </p>
          </div>
          
          <Button
            variant="celebration"
            onClick={handleNextSection}
            size="comfortable"
          >
            {currentSection === totalSections - 1 ? "Time to Create! →" : "Next →"}
          </Button>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are reading "{story.title}", section {currentSection + 1} of {totalSections}.
            {isMultiVersion && ` Currently reading at ${complexityLabels[complexityLevel].label} level.`}
            Use the Previous and Next buttons to navigate, or use the audio controls to listen to the content.
            {isMultiVersion && " You can switch reading levels anytime using the level buttons above."}
            This story includes embedded phonics learning opportunities.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoryPage