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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
      <div className="max-w-3xl mx-auto py-8">
        
        {/* Simple Title - No overwhelming metadata */}
        <div className="text-center mb-8">
          <button
            onClick={handleBackToStories}
            className="mb-4 text-blue-600 hover:text-blue-800 font-medium"
          >
            ← Back to Stories
          </button>
          
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            {story?.title || 'Story Time'}
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
                  <strong>You're in control!</strong> If this feels too easy or too hard, try the reading level buttons below the story.
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
          {/*<button
            onClick={() => handleReadAloud()}
            disabled={isReading}
            className="absolute top-4 right-4 w-10 h-10 bg-blue-100 hover:bg-blue-200 disabled:opacity-50 rounded-full flex items-center justify-center text-lg transition-colors"
            aria-label="Read this section aloud"
          >
            {isReading ? '🗣️' : '🔊'}
          </button>*/}

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
              🔊 {isReading ? 'Reading...' : 'Read Aloud'}
            </button>

            
          </div>
        </div>

        {/* Settings Panel - WITHOUT COMPLEXITY SELECTOR */}
        {showSettings && (
          <div className="bg-white rounded-xl p-6 mb-6 shadow-sm border border-gray-200">
            <h3 className="font-semibold text-gray-800 mb-4">Reading Settings</h3>
            
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
                onClick={() => handleReadAloud(getCurrentStoryText())}
                disabled={isReading}
                className="p-3 bg-blue-50 hover:bg-blue-100 disabled:opacity-50 rounded-lg text-sm text-blue-700 transition-colors"
              >
                📖 {isReading ? 'Reading...' : 'Read Whole Story'}
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

        {/* COMPLEXITY SELECTOR - BELOW STORY */}
        <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
          <label className="block text-sm font-medium text-gray-700 mb-3">
            Reading Level
          </label>

          <div className="grid grid-cols-3 gap-2 mb-4">
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
                <div className="text-xs opacity-75 mt-1">
                  {complexityLabels[level].description}
                </div>
              </button>
            ))}
          </div>

          {/* Centered Settings Toggle Button */}
          <div className="flex justify-center">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="px-4 py-2 bg-purple-100 hover:bg-purple-200 rounded-lg text-sm text-purple-700 transition-colors"
            >
              {showSettings ? "Show less" : "⚙️ More Options"}
            </button>
          </div>
        </div>


        {/* Encouragement - Calm and Supportive */}
        <div className="text-center mt-8 text-gray-500 text-sm">
          Take your time • No rush • You're doing great!
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            You are reading "{story?.title}", section {currentSection + 1} of {totalSections}.
            Currently reading at {complexityLabels[complexityLevel].label} level.
            Use the Previous and Next buttons to navigate, or use the audio controls to listen to the content.
            You can switch reading levels anytime using the reading level buttons above the story.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoryPage