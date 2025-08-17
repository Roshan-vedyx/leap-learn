import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { audio, storage } from '@/lib/utils'
import type { ComplexityLevel } from '@/types'

interface StoryTemplate {
  id: string
  title: string
  theme: string
  stories: {
    simple: string
    regular: string
    challenge: string
  }
}

interface StoryPageProps {
  interest?: string
  storyName?: string
}

const StoryPage: React.FC<StoryPageProps> = ({ interest, storyName }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [readingMode, setReadingMode] = useState<'text' | 'audio' | 'both'>('text')
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('full')
  const [showSettings, setShowSettings] = useState(false)
  const [showComplexityHint, setShowComplexityHint] = useState(false)
  const [story, setStory] = useState<StoryTemplate | null>(null)
  const [, setLocation] = useLocation()

  // Load story template
  useEffect(() => {
    const loadStory = async () => {
      try {
        // Get interest and story from URL params or localStorage
        const selectedInterests = JSON.parse(localStorage.getItem('selected-interests') || '[]')
        const currentInterest = interest || selectedInterests[0] || 'animals'
        const currentStoryName = storyName || 'animal-rescue-forest'
        
        console.log('Loading story:', currentInterest, currentStoryName)
        
        // Load the JSON template with relative path
        const storyModule = await import(`../../data/story-templates/${currentInterest}/${currentStoryName}.json`)
        setStory(storyModule.default)
      } catch (error) {
        console.error('Failed to load story:', error)
        // Fallback story
        setStory({
          id: 'fallback-story',
          title: 'Adventure Story',
          theme: 'general',
          stories: {
            simple: 'There was an adventure. It was fun. The end.',
            regular: 'There was an exciting adventure that everyone enjoyed.',
            challenge: 'An extraordinary adventure unfolded, captivating everyone who experienced it.'
          }
        })
      }
    }

    loadStory()
  }, [interest, storyName])

  // Get saved complexity level
  useEffect(() => {
    const savedComplexity = storage.get('current-complexity-level', 'full') as ComplexityLevel
    setComplexityLevel(savedComplexity === 'regular' ? 'full' : savedComplexity)
  }, [])

  // Adapt presentation based on brain state
  useEffect(() => {
    const brainState = storage.get('current-brain-state', 'focused')
    if (brainState === 'overwhelmed') {
      setReadingMode('text')
      setComplexityLevel('simple')
    } else if (brainState === 'energetic') {
      setReadingMode('both')
    }
  }, [])

  // Show complexity hint for new users
  useEffect(() => {
    if (currentSection === 1 && !storage.get('complexity-hint-shown', false)) {
      setShowComplexityHint(true)
      storage.set('complexity-hint-shown', true)
    }
  }, [currentSection])

  if (!story) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
        <div className="max-w-3xl mx-auto py-8 text-center">
          <div className="text-2xl">📖 Loading your story...</div>
        </div>
      </div>
    )
  }

  // Convert complexity level for story access
  const getStoryComplexity = () => {
    if (complexityLevel === 'simple') return 'simple'
    if (complexityLevel === 'challenge') return 'challenge'
    return 'regular' // Map 'full' to 'regular'
  }

  // Split story into sections (sentences)
  const getCurrentStoryText = () => {
    return story.stories[getStoryComplexity()]
  }

  const getStorySections = () => {
    const text = getCurrentStoryText()
    return text.split('. ').filter(sentence => sentence.trim().length > 0)
  }

  const sections = getStorySections()
  const totalSections = sections.length

  const handleReadAloud = async (textToRead?: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    
    const currentAccent = storage.get('tts-accent', 'US') as 'US' | 'GB' | 'IN'
    const text = textToRead || sections[currentSection] || getCurrentStoryText()
    
    setIsReading(true)
    try {
      await audio.speak(text, {
        accent: currentAccent,
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
    if (currentSection < totalSections - 1) {
      setCurrentSection(currentSection + 1)
    } else {
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
    setCurrentSection(0) // Reset to beginning with new complexity
  }

  const dismissComplexityHint = () => {
    setShowComplexityHint(false)
  }

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
        </div>

        {/* Complexity Hint - Show once for new users */}
        {showComplexityHint && (
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
          
          {/* Story Content - Biggest, cleanest, HERO of the page */}
          <div className="text-xl leading-relaxed text-gray-800 mb-8 font-serif">
            {sections[currentSection] || getCurrentStoryText()}
          </div>

          {/* Subtle Audio Button - Top Right Corner */}
          <button
            onClick={() => handleReadAloud()}
            disabled={isReading}
            className="absolute top-4 right-4 w-10 h-10 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 rounded-full flex items-center justify-center text-lg transition-colors"
            aria-label="Read this section aloud"
          >
            {isReading ? '🗣️' : '🔊'}
          </button>

          {/* Navigation */}
          <div className="flex items-center justify-between mb-6">
            <button
              onClick={handlePreviousSection}
              disabled={currentSection === 0}
              className="px-6 py-3 bg-blue-100 hover:bg-blue-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium text-blue-800 transition-colors"
            >
              ← Previous
            </button>

            <div className="flex gap-2">
              {Array.from({ length: totalSections }, (_, i) => (
                <div
                  key={i}
                  className={`w-3 h-3 rounded-full ${
                    i === currentSection ? 'bg-blue-500' : 'bg-blue-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextSection}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              {currentSection === totalSections - 1 ? 'Finish' : 'Next'} →
            </button>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleReadAloud()}
              disabled={isReading}
              className="px-4 py-2 bg-green-100 hover:bg-green-200 disabled:opacity-50 rounded-lg text-sm text-green-700 transition-colors"
            >
              🎧 {isReading ? 'Reading...' : 'Read Aloud'}
            </button>

            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm text-purple-700 transition-colors"
            >
              ⚙️ Settings
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Reading Settings</h3>
            
            {/* Complexity Selector */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Reading Level
              </label>
              <div className="grid grid-cols-3 gap-2">
                {(Object.keys(complexityLabels) as ComplexityLevel[]).map((level) => (
                  <button
                    key={level}
                    onClick={() => handleComplexityChange(level)}
                    className={`p-3 rounded-lg text-sm transition-colors ${
                      complexityLevel === level
                        ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    <div className="text-lg mb-1">{complexityLabels[level].emoji}</div>
                    <div className="font-medium">{complexityLabels[level].label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Reading Mode */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-3">
                How would you like to read?
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  onClick={() => setReadingMode('text')}
                  className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                    readingMode === 'text'
                      ? 'bg-blue-100 text-blue-800 border-2 border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  📖 Read Only
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
                <span>📚 Adaptive Grade Level</span>
                <span>⏱️ {Math.ceil(sections.length * 0.5)} min read</span>
                <span>🎯 Skills: Reading & Comprehension</span>
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
            Currently reading at {complexityLabels[complexityLevel].label} level.
            Use the Previous and Next buttons to navigate, or use the audio controls to listen to the content.
            You can switch reading levels anytime using the settings.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoryPage