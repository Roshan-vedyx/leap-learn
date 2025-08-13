import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { audio, storage } from '@/lib/utils'
import type { ComplexityLevel, MultiVersionStory } from '@/types'

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
  const [showSettings, setShowSettings] = useState(false)
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

  const handleReadAloud = async (textToRead?: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    
    // Get current accent preference
    const currentAccent = storage.get('tts-accent', 'US') as 'US' | 'GB' | 'IN'
    
    // Use provided text or current section text
    const text = textToRead || getCurrentDisplayText()
    
    setIsReading(true)
    try {
      // FIXED: Actually pass the accent to the speak function
      await audio.speak(text, {
        accent: currentAccent,  // This is the key fix!
        rate: 0.8,
        pitch: 1.1
      })
    } catch (error) {
      console.error('Text-to-speech error:', error)
    } finally {
      setIsReading(false)
    }
  }

  const handleNextSection = () => {
    const maxSections = getTotalSections()

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

  // Get the text content to display
  const getCurrentDisplayText = () => {
    const currentContent = getCurrentContent()
    if (currentContent.type === 'phonics-moment') {
      return currentContent.instruction
    }
    return currentContent.text
  }

  // Generate complexity hint
  const getComplexityHint = () => {
    if (complexityLevel === 'simple') return '🌱 Easier'
    if (complexityLevel === 'challenge') return '🚀 Challenge'
    return null
  }

  const currentContent = getCurrentContent()
  const totalSections = getTotalSections()
  const isPhonicsМoment = currentContent.type === 'phonics-moment'

  const complexityLabels = {
    simple: { label: 'Easier', emoji: '🌱', description: 'Shorter sentences, easier words' },
    full: { label: 'Just Right', emoji: '🎯', description: 'Standard complexity' },
    challenge: { label: 'Challenge Me', emoji: '🚀', description: 'Rich vocabulary, complex ideas' }
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        
        {/* Simple Title - No overwhelming metadata */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            {story.title}
          </h1>
          <div className="text-sm text-blue-700 opacity-75">
            Part {currentSection + 1} of {totalSections}
          </div>
          {/* Subtle story info - only if multi-version */}
          {isMultiVersion && (
            <div className="text-xs text-blue-600 opacity-60 mt-1">
              ✨ {story.concept}
            </div>
          )}
        </div>

        {/* Complexity Hint - Show once for new users with multi-version stories */}
        {showComplexityHint && isMultiVersion && (
          <div className="mb-6 bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-lg">
            <div className="flex items-start gap-3">
              <span className="text-xl">💡</span>
              <div className="flex-1">
                <p className="text-yellow-800 text-sm mb-3">
                  <strong>You're in control!</strong> If this feels too easy or too hard, try the settings below to switch reading levels.
                </p>
                <button
                  onClick={dismissComplexityHint}
                  className="text-xs text-yellow-700 hover:text-yellow-900 underline"
                >
                  Got it! ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN STORY CARD - The Hero Element */}
        <div className="relative bg-white rounded-xl p-8 mb-6 shadow-sm border-2 border-blue-200">
          
          {/* Phonics Moment Visual Indicator - Subtle */}
          {isPhonicsМoment && (
            <div className="absolute top-4 left-4 w-3 h-3 bg-yellow-400 rounded-full opacity-60" 
                 title="Learning moment embedded"></div>
          )}
          
          {/* Story Content - Biggest, cleanest, HERO of the page */}
          <div className={`text-xl leading-relaxed text-gray-800 mb-8 font-serif ${
            isPhonicsМoment ? 'text-lg font-sans bg-yellow-50 p-4 rounded-lg border-l-4 border-yellow-400' : ''
          }`}>
            {getCurrentDisplayText()}
          </div>

          {/* Phonics words highlight - only when relevant */}
          {isPhonicsМoment && currentContent.words && (
            <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-700 mb-2">Practice words:</p>
              <div className="flex flex-wrap gap-2">
                {currentContent.words.map((word: string, idx: number) => (
                  <button
                    key={idx} 
                    onClick={() => handleReadAloud(word)}
                    className="px-3 py-1 bg-blue-100 hover:bg-blue-200 text-blue-800 rounded-full text-sm font-medium transition-colors cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
              <p className="text-xs text-blue-600 mt-2">Click any word to hear it!</p>
            </div>
          )}

          {/* Phonics-focused words highlighting - for regular content */}
          {!isPhonicsМoment && currentContent.phonicsFocus && (
            <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
              <p className="text-sm text-green-700 mb-2">🔍 Word Detective: Can you find these special words?</p>
              <div className="flex flex-wrap gap-2">
                {currentContent.phonicsFocus.map((word: string, idx: number) => (
                  <button
                    key={idx}
                    onClick={() => handleReadAloud(word)}
                    className="px-3 py-1 bg-green-100 hover:bg-green-200 text-green-800 rounded-full text-sm font-medium transition-colors cursor-pointer"
                  >
                    {word}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Subtle Audio Button - Top Right Corner */}
          <button
            onClick={() => handleReadAloud()}
            disabled={isReading}
            className="absolute top-4 right-4 w-10 h-10 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 rounded-full flex items-center justify-center text-lg transition-colors"
            aria-label="Read this section aloud"
          >
            {isReading ? '🗣️' : '🔊'}
          </button>

          {/* Complexity Hints - Subtle, Bottom Right */}
          {getComplexityHint() && (
            <div className="absolute bottom-4 right-4 text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded">
              {getComplexityHint()}
            </div>
          )}
        </div>

        {/* Story Difficulty - Now Outside Settings */}
        {isMultiVersion && (
          <div className="mb-6 bg-white rounded-lg p-4 border border-gray-200 shadow-sm">
            <label className="block text-sm text-gray-600 mb-3">Story Difficulty</label>
            <div className="flex gap-2 flex-wrap">
              {(Object.keys(complexityLabels) as ComplexityLevel[]).map((level) => {
                const info = complexityLabels[level]
                const isActive = complexityLevel === level
                
                return (
                  <button
                    key={level}
                    onClick={() => handleComplexityChange(level)}
                    className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                      isActive 
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                    aria-pressed={isActive}
                    title={info.description}
                  >
                    {info.emoji} {info.label}
                  </button>
                )
              })}
            </div>
            <p className="text-xs text-gray-500 mt-2">Switch anytime to match how you're feeling</p>
          </div>
        )}

        {/* Navigation - Clean and Simple */}
        <div className="flex justify-between items-center mb-6">
          <button
            onClick={handlePreviousSection}
            disabled={currentSection === 0}
            className="px-6 py-3 bg-gray-100 hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg text-gray-700 font-medium transition-colors"
          >
            ← Back
          </button>

          {/* Progress Dots - Visual but not overwhelming */}
          <div className="flex gap-2">
            {Array.from({ length: totalSections }, (_, i) => (
              <div
                key={i}
                className={`w-3 h-3 rounded-full transition-colors ${
                  i === currentSection ? 'bg-blue-500' : 
                  i < currentSection ? 'bg-green-400' : 'bg-gray-200'
                }`}
              />
            ))}
          </div>

          <button
            onClick={handleNextSection}
            className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
          >
            {currentSection === totalSections - 1 ? 'Create! →' : 'Next →'}
          </button>
        </div>

        {/* More Reading Choices Toggle - Updated Name */}
        <div className="text-center">
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="text-sm text-gray-500 hover:text-gray-700 px-3 py-2 rounded-lg hover:bg-gray-100 transition-colors"
          >
            ⚙️ {showSettings ? 'Hide' : 'More reading choices'}
          </button>
        </div>

        {/* Settings Panel - Only When Requested - Progressive Disclosure */}
        {showSettings && (
          <div className="mt-4 bg-white rounded-lg p-6 border border-gray-200 shadow-sm">
            <h3 className="font-semibold text-gray-800 mb-4">More Reading Options</h3>
            
            {/* Reading Mode */}
            <div className="mb-4">
              <label className="block text-sm text-gray-600 mb-2">How would you like to experience this?</label>
              <div className="flex gap-2 flex-wrap">
                <button
                  onClick={() => setReadingMode('text')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    readingMode === 'text' 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📖 Read Quietly
                </button>
                <button
                  onClick={() => setReadingMode('audio')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    readingMode === 'audio' 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎧 Listen Only
                </button>
                <button
                  onClick={() => setReadingMode('both')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    readingMode === 'both' 
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300' 
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  🎯 Read & Listen
                </button>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-3">
              <button 
                onClick={() => handleReadAloud()}
                disabled={isReading}
                className="p-3 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 rounded-lg text-sm text-blue-700 transition-colors"
              >
                🎧 {isReading ? 'Reading...' : 'Read This Section'}
              </button>
              <button 
                onClick={() => setShowSettings(false)}
                className="p-3 bg-green-50 hover:bg-green-100 rounded-lg text-sm text-green-700 transition-colors"
              >
                🧘 Back to Story
              </button>
            </div>

            {/* Story metadata - only in settings */}
            <div className="mt-4 pt-4 border-t border-gray-200">
              <div className="flex flex-wrap gap-4 text-xs text-gray-500">
                <span>📚 {story.level || 'Adaptive Grade Level'}</span>
                <span>⏱️ {getReadingTime()}</span>
                <span>🎯 Skills: {story.phonicsSkills?.join(', ') || 'Reading & Comprehension'}</span>
              </div>
            </div>
          </div>
        )}

        {/* Encouragement - Calm and Supportive */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Take your time • No rush • You're doing great! 
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are reading "{story.title}", section {currentSection + 1} of {totalSections}.
            {isMultiVersion && ` Currently reading at ${complexityLabels[complexityLevel].label} level.`}
            Use the Previous and Next buttons to navigate, or use the audio controls to listen to the content.
            {isMultiVersion && " You can switch reading levels anytime using the settings."}
            {isPhonicsМoment && " This section includes embedded phonics learning opportunities."}
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoryPage