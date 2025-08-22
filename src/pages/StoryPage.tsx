// src/pages/StoryPage.tsx - Complete implementation with complexity extracted from settings
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { audio, storage } from '@/lib/utils'
import { DynamicStoryLoader } from '@/utils/dynamicStoryLoader'
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
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setLocation] = useLocation()

  // Load story template dynamically
  useEffect(() => {
    const loadStory = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get interest and story from URL params or localStorage
        const selectedInterests = JSON.parse(localStorage.getItem('selected-interests') || '[]')
        const currentInterest = interest || selectedInterests[0] || 'animals'
        const currentStoryName = storyName || 'forest-rescue'
        
        console.log('Loading story:', currentInterest, currentStoryName)
        
        // Use the dynamic loader
        const loadedStory = await DynamicStoryLoader.loadStory(currentInterest, currentStoryName)
        
        if (loadedStory) {
          setStory(loadedStory)
          console.log('Successfully loaded story:', loadedStory.title)
        } else {
          // Fallback story if the requested one doesn't exist
          console.warn(`Story not found: ${currentInterest}/${currentStoryName}`)
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
      } catch (error) {
        console.error('Failed to load story:', error)
        setError('Failed to load the story. Please try again.')
        
        // Fallback story for errors
        setStory({
          id: 'error-fallback',
          title: 'Story Loading Error',
          theme: 'general',
          stories: {
            simple: 'Sorry, we had trouble loading your story. Please try again.',
            regular: 'We encountered an issue loading your story. Please refresh the page or try a different story.',
            challenge: 'Unfortunately, we experienced a technical difficulty while loading your requested story. Please refresh the page or navigate back to select another adventure.'
          }
        })
      } finally {
        setLoading(false)
      }
    }

    loadStory()
  }, [interest, storyName])

  // Get saved complexity level
  useEffect(() => {
    const savedComplexity = storage.get('current-complexity-level', 'full') as ComplexityLevel
    setComplexityLevel(savedComplexity === 'regular' ? 'full' : savedComplexity)
  }, [])

  
  // Save complexity level when changed
  useEffect(() => {
    storage.set('current-complexity-level', complexityLevel)
  }, [complexityLevel])

  // Show complexity hint for new users
  useEffect(() => {
    const hasSeenHint = storage.get('complexity-hint-seen', false)
    if (!hasSeenHint) {
      setShowComplexityHint(true)
      storage.set('complexity-hint-seen', true)
    }
  }, [])

  const getCurrentStoryText = (): string => {
    if (!story) return ''
    
    // Map complexity levels to story keys
    const storyKey = complexityLevel === 'simple' ? 'simple' : 
                    complexityLevel === 'challenge' ? 'challenge' : 'regular'
    
    return story.stories[storyKey] || story.stories.regular
  }

  // Break story into sections (sentences)
  const getStorySections = (): string[] => {
    const fullText = getCurrentStoryText()
    return fullText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0)
  }

  const sections = getStorySections()
  const totalSections = sections.length

  const handleReadAloud = async (textToRead?: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    
    // Small delay to ensure voices are loaded
    await new Promise(resolve => setTimeout(resolve, 100))
    
    const currentAccent = storage.get('tts-accent', 'GB') as 'US' | 'GB' | 'IN'
    const text = textToRead || sections[currentSection] || getCurrentStoryText()
    
    setIsReading(true)
    try {
      const selectedVoice = audio.getBestVoiceForAccent(currentAccent)
      console.log(`🎤 Using ${currentAccent} voice:`, selectedVoice?.name)
      
      await audio.speak(text, {
        voice: selectedVoice,
        accent: currentAccent,
        rate: 0.8,
        pitch: 0.9,
        volume: 0.8
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

  const handleBackToStories = () => {
    if (interest) {
      setLocation(`/stories/${interest}`)
    } else {
      setLocation('/interests')
    }
  }

  const complexityLabels = {
    simple: { label: 'Easier', emoji: '🌱', description: '' },
    full: { label: 'Just Right', emoji: '🎯', description: '' },
    challenge: { label: 'Challenge Me', emoji: '🚀', description: '' }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
        <div className="max-w-3xl mx-auto py-8">
          <div className="text-center">
            <div className="text-4xl mb-4">📖</div>
            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              Loading Your Story...
            </h1>
            <div className="animate-pulse text-blue-600">
              Getting everything ready for you...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error && !story) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
        <div className="max-w-3xl mx-auto py-8">
          <div className="text-center">
            <div className="text-4xl mb-4">😅</div>
            <h1 className="text-3xl font-bold text-blue-900 mb-4">
              Story Not Found
            </h1>
            <p className="text-lg text-blue-700 mb-6">{error}</p>
            <button 
              onClick={handleBackToStories}
              className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold"
            >
              ← Back to Stories
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6 sm:mb-8">
          <div>
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-800 mb-2">
              {story?.title || 'Loading Story...'}
            </h1>
            <p className="text-sm sm:text-base text-gray-600">
              Section {currentSection + 1} of {totalSections}
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-2 w-full sm:w-auto">
            <button
              onClick={() => setLocation('/practice-reading')}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 text-sm text-gray-600 hover:text-gray-800 transition-colors"
            >
              ← Back to Reading
            </button>
            
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg text-sm transition-colors"
            >
              {showSettings ? "Show less" : "⚙️ More Options"}
            </button>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="text-center py-8 sm:py-12">
            <div className="text-lg sm:text-xl text-gray-600">Loading your story...</div>
          </div>
        )}

        {/* Error State */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="text-red-800 font-medium mb-2">Oops! Something went wrong</div>
            <div className="text-red-600 text-sm sm:text-base">{error}</div>
            <button
              onClick={() => window.location.reload()}
              className="mt-3 min-h-[44px] px-4 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg transition-colors"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Settings Panel - Expandable */}
        {showSettings && story && (
          <div className="bg-blue-50 rounded-lg p-4 sm:p-6 mb-6">
            <h3 className="font-semibold text-gray-800 mb-4 text-base sm:text-lg">Reading Settings</h3>
            
            {/* Complexity Level Controls */}
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reading Level:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['simple', 'full', 'challenge'] as const).map((level) => (
                    <button
                      key={level}
                      onClick={() => setComplexityLevel(level)}
                      className={`min-h-[44px] px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        complexityLevel === level
                          ? 'bg-blue-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {level === 'simple' ? 'Simple' : level === 'full' ? 'Standard' : 'Challenge'}
                    </button>
                  ))}
                </div>
              </div>

              {/* Reading Mode Controls */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  How would you like to read?
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['text', 'audio', 'both'] as const).map((mode) => (
                    <button
                      key={mode}
                      onClick={() => setReadingMode(mode)}
                      className={`min-h-[44px] px-4 py-3 rounded-lg text-sm font-medium transition-colors ${
                        readingMode === mode
                          ? 'bg-green-500 text-white'
                          : 'bg-white text-gray-700 hover:bg-gray-50 border border-gray-200'
                      }`}
                    >
                      {mode === 'text' ? '📖 Read' : mode === 'audio' ? '🔊 Listen' : '👀👂 Both'}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Complexity Hint for New Users */}
        {showComplexityHint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 sm:p-6 mb-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
              <div className="text-2xl">💡</div>
              <div className="flex-1">
                <div className="font-medium text-yellow-800 mb-1">New Feature!</div>
                <p className="text-yellow-700 text-sm sm:text-base mb-2">
                  You can change the reading level anytime using the buttons above. 
                  Pick what feels right for you today!
                </p>
                <button
                  onClick={() => setShowComplexityHint(false)}
                  className="text-xs sm:text-sm text-yellow-700 hover:text-yellow-900 underline min-h-[44px] px-2 py-1"
                >
                  Got it! ✓
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MAIN STORY CARD - The Hero Element */}
        <div className="relative bg-white rounded-xl p-4 sm:p-6 lg:p-8 mb-6 shadow-sm border-2 border-blue-200">
          
          {/* Story Content - Biggest, cleanest, HERO of the page */}
          <div className="text-base sm:text-lg lg:text-xl leading-relaxed text-gray-800 mb-6 sm:mb-8 font-serif min-h-[120px] sm:min-h-[140px]">
            {sections[currentSection] || getCurrentStoryText()}
          </div>

          {/* Navigation */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-6">
            <button
              onClick={handlePreviousSection}
              disabled={currentSection === 0}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-blue-100 hover:bg-blue-200 disabled:opacity-40 disabled:cursor-not-allowed rounded-lg font-medium text-blue-800 transition-colors"
            >
              ← Previous
            </button>

            <div className="flex gap-2 order-first sm:order-none">
              {Array.from({ length: totalSections }, (_, i) => (
                <div
                  key={i}
                  className={`w-4 h-4 sm:w-3 sm:h-3 rounded-full ${
                    i === currentSection ? 'bg-blue-500' : 'bg-blue-200'
                  }`}
                />
              ))}
            </div>

            <button
              onClick={handleNextSection}
              className="w-full sm:w-auto min-h-[44px] px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
            >
              {currentSection === totalSections - 1 ? 'Finish' : 'Next'} →
            </button>
          </div>

          {/* Quick Controls */}
          <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center">
            <button
              onClick={() => handleReadAloud()}
              disabled={isReading}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-green-100 hover:bg-green-200 disabled:opacity-50 rounded-lg text-sm text-green-700 transition-colors"
            >
              🔊 {isReading ? 'Reading...' : 'Read Aloud'}
            </button>
            
            <button
              onClick={handleRestart}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-orange-100 hover:bg-orange-200 rounded-lg text-sm text-orange-700 transition-colors"
            >
              🔄 Start Over
            </button>
            
            <button
              onClick={() => setLocation('/story-selection')}
              className="w-full sm:w-auto min-h-[44px] px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm text-purple-700 transition-colors"
            >
              📚 New Story
            </button>
          </div>
        </div>

        {/* Encouragement - Calm and Supportive */}
        <div className="text-center mt-6 sm:mt-8 text-gray-500 text-sm sm:text-base">
          Take your time • No rush • You're doing great!
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are reading "{story?.title}", section {currentSection + 1} of {totalSections}.
            Currently reading at {complexityLabels[complexityLevel]?.label || complexityLevel} level.
            Use the Previous and Next buttons to navigate, or use the audio controls to listen to the content.
            You can switch reading levels anytime using the reading level buttons above the story.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoryPage