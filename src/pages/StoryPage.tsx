// src/pages/StoryPage.tsx - Updated for new JSON format
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { audio, storage } from '@/lib/utils'
import { DynamicStoryLoader } from '@/utils/dynamicStoryLoader'
import { useSessionStore } from '@/stores/sessionStore'
import type { ComplexityLevel } from '@/types'
import { useAnalytics } from '../hooks/useAnalytics'
import { useCurrentUserId } from '@/lib/auth-utils'
import { useSpeechHighlighting } from '@/hooks/useSpeechHighlighting'

// NEW: Updated interfaces for new JSON format
interface NewStoryFormat {
  id: string
  title: string
  theme: string
  stories: {
    simple: StoryLevel
    regular: StoryLevel
    challenge: StoryLevel
  }
}

interface StoryLevel {
  narrative: string[]
  choice_points: ChoicePoint[]
  consequences: Consequence[]
  continuation: string[]
  reflections: Reflection[]
}

interface ChoicePoint {
  id: number
  question: string
  options: {
    letter: string
    text: string
  }[]
}

interface Consequence {
  choice_id: number
  letter: string
  text: string
}

interface Reflection {
  type: 'personal' | 'action'
  question: string
}

// Existing StoryBlock interface (keep for compatibility)
type StoryBlock = {
  type: 'narration' | 'choice' | 'consequence' | 'reflection' | 'action' | 'continuation' | 'conclusion'
  text: string
  choiceLetter?: string
  choicePointId?: number
  options?: { letter: string; text: string }[]
}

interface StoryPageProps {
  interest?: string
  storyName?: string
}

const StoryPage: React.FC<StoryPageProps> = ({ interest, storyName }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('full')
  const [story, setStory] = useState<NewStoryFormat | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [choices, setChoices] = useState<{ [choicePointId: number]: string }>({})
  const [showComplexityHint, setShowComplexityHint] = useState(false)
  const [, setLocation] = useLocation()

  const { setStoryReflections } = useSessionStore()
  const [collectedReflections, setCollectedReflections] = useState<string[]>([])
  const [blocks, setBlocks] = useState<StoryBlock[]>([])

  const userId = useCurrentUserId()
  const { trackAnyActivity } = useAnalytics(userId)
  const [storyStartTime] = useState(Date.now())
  const [isTTSActive, setIsTTSActive] = useState(false)

  const totalSections = blocks.length

  // Load story template
  useEffect(() => {
    const loadStory = async () => {
      try {
        setLoading(true)
        setError(null)

        const selectedInterests = JSON.parse(localStorage.getItem('selected-interests') || '[]')
        const currentInterest = interest || selectedInterests[0] || 'animals'
        const currentStoryName = storyName || 'beach-rescue'
        
        const loadedStory = await DynamicStoryLoader.loadStory(currentInterest, currentStoryName)
        
        if (loadedStory) {
          setStory(loadedStory as NewStoryFormat)
        } else {
          // Fallback story in new format
          setStory({
            id: 'fallback-story',
            title: 'Adventure Story',
            theme: 'general',
            stories: {
              simple: {
                narrative: ['There was an adventure.', 'It was fun.', 'The end.'],
                choice_points: [],
                consequences: [],
                continuation: [],
                reflections: []
              },
              regular: {
                narrative: ['There was an exciting adventure that everyone enjoyed.'],
                choice_points: [],
                consequences: [],
                continuation: [],
                reflections: []
              },
              challenge: {
                narrative: ['An extraordinary adventure unfolded, captivating everyone who experienced it.'],
                choice_points: [],
                consequences: [],
                continuation: [],
                reflections: []
              }
            }
          })
        }
      } catch (error) {
        console.error('Failed to load story:', error)
        setError('Failed to load the story. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadStory()
  }, [interest, storyName])

  // Load saved complexity
  useEffect(() => {
    const savedComplexity = storage.get('current-complexity-level', 'full') as ComplexityLevel
    setComplexityLevel(savedComplexity === 'regular' ? 'full' : savedComplexity)
  }, [])

  useEffect(() => {
    storage.set('current-complexity-level', complexityLevel)
  }, [complexityLevel])

  // Track reading progress through sections
  useEffect(() => {
    if (currentSection > 0 && userId && totalSections > 0) {
      const progressPercent = Math.round((currentSection / totalSections) * 100)
      if (progressPercent % 25 === 0) { // Track at 25%, 50%, 75%
        trackAnyActivity(
          'story_progress',
          `Reading ${story?.title || 'story'} - ${progressPercent}%`,
          0.5,
          { accuracy: progressPercent, completed: false }
        ).catch(error => console.log('Story progress analytics failed:', error))
      }
    }
  }, [currentSection, totalSections, userId, story?.title])

  // NEW: Parse new JSON format into StoryBlocks
  const parseNewFormatStory = (storyLevel: StoryLevel): { blocks: StoryBlock[], reflections: string[] } => {
    const blocks: StoryBlock[] = []
    const reflections: string[] = []

    // Add narrative blocks
    storyLevel.narrative.forEach(text => {
      if (text.trim()) {
        blocks.push({
          type: 'narration',
          text: text.trim()
        })
      }
    })

    // Add choice points and consequences
    storyLevel.choice_points.forEach(choicePoint => {
      // Add choice block
      blocks.push({
        type: 'choice',
        text: choicePoint.question,
        choicePointId: choicePoint.id,
        options: choicePoint.options
      })

      // Add corresponding consequences
      const choiceConsequences = storyLevel.consequences.filter(c => c.choice_id === choicePoint.id)
      choiceConsequences.forEach(consequence => {
        blocks.push({
          type: 'consequence',
          text: consequence.text,
          choicePointId: choicePoint.id,
          choiceLetter: consequence.letter
        })
      })
    })

    // Add continuation
    storyLevel.continuation.forEach(text => {
      if (text.trim()) {
        blocks.push({
          type: 'continuation',
          text: text.trim()
        })
      }
    })

    // Collect reflections for CreatePage
    storyLevel.reflections.forEach(reflection => {
      reflections.push(reflection.question)
      
      // Also add as action blocks for immediate display
      blocks.push({
        type: reflection.type === 'personal' ? 'reflection' : 'action',
        text: reflection.question
      })
    })

    return { blocks, reflections }
  }

  const getCurrentStoryLevel = (): StoryLevel | null => {
    if (!story) return null
    
    const storyKey = complexityLevel === 'simple' ? 'simple' : 
                     complexityLevel === 'challenge' ? 'challenge' : 'regular'
    
    return story.stories[storyKey] || story.stories.regular
  }

  // Parse story when it changes
  useEffect(() => {
    const storyLevel = getCurrentStoryLevel()
    if (storyLevel) {
      const result = parseNewFormatStory(storyLevel)
      
      if (result.blocks.length === 0) {
        console.warn('⚠️ Story parsing failed, creating fallback block')
        result.blocks = [{
          type: 'narration',
          text: 'Story content is being prepared. Please try refreshing the page.',
        }]
      }
      
      setBlocks(result.blocks)
      setCollectedReflections(result.reflections)
      setCurrentSection(prev => Math.min(prev, result.blocks.length - 1))
    }
  }, [story, complexityLevel])

  // Initialize the speech highlighting hook
  const speechHighlighting = useSpeechHighlighting({
    rate: 0.85,
    pitch: 0.95,
    volume: 0.9,
    highlightClass: 'bg-yellow-300 text-black px-2 py-1 rounded font-bold border-2 border-yellow-600',
    onSpeechStart: () => setIsTTSActive(true),
    onSpeechEnd: () => setIsTTSActive(false)
  })

  const handleReadAloud = async (textToRead?: string) => {
    if (!speechHighlighting.isSupported) return
    
    const currentBlock = blocks[currentSection]
    let text = textToRead
    
    if (!text && currentBlock) {
      // Extract readable text based on block type
      switch (currentBlock.type) {
        case 'choice':
          text = `${currentBlock.text} Your options are: ${currentBlock.options?.map(opt => `${opt.letter}, ${opt.text}`).join('; ')}`
          break
        default:
          text = currentBlock.text
      }
    }
    
    if (!text) {
      text = 'Story content not available'
    }
    
    const elementId = `story-text-${currentSection}`
    
    try {
      await speechHighlighting.speak(text, elementId)
    } catch (error) {
      console.error('Text-to-speech error:', error)
    }
  }

  const handleChoiceSelect = (choicePointId: number, letter: string) => {
    setChoices(prev => ({ ...prev, [choicePointId]: letter }))
  }

  const handleComplexityChange = (newLevel: ComplexityLevel) => {
    setComplexityLevel(newLevel)
    setShowComplexityHint(false)
  }

  const handleNextSection = () => {
    if (currentSection === totalSections - 1) {
      // Story completed - track it
      if (userId) {
        const readingTimeMinutes = Math.max(1, Math.round((Date.now() - storyStartTime) / 60000))
        trackAnyActivity(
          'story_reading',
          story?.title || 'Story Reading',
          readingTimeMinutes,
          {
            accuracy: 85, // Assume good comprehension if they finished
            skills: ['reading_fluency', 'comprehension'],
            completed: true
          }
        ).catch(error => console.log('Story completion analytics failed:', error))
      }
      
      // Existing logic
      setStoryReflections(collectedReflections)
      setLocation('/create')
    } else {
      setCurrentSection(s => Math.min(totalSections - 1, s + 1))
    }
  }

  const renderBlock = (block: StoryBlock, idx: number) => {
    switch (block.type) {
      case 'choice':
        return (
          <div key={idx} className="my-6">
            <p id={`story-text-${idx}`} className="font-semibold text-blue-700 mb-3">{block.text}</p>
            <div className="flex flex-col gap-3">
              {block.options?.map(opt => (
                <button
                  key={opt.letter}
                  onClick={() => handleChoiceSelect(block.choicePointId!, opt.letter)}
                  className={`w-full px-4 py-3 rounded-xl text-lg font-medium text-left transition-colors ${
                    choices[block.choicePointId!] === opt.letter
                      ? 'bg-blue-600 text-white'
                      : 'bg-white border border-blue-300 text-blue-700 hover:bg-blue-50'
                  }`}
                >
                  <span className="font-bold mr-2">{opt.letter})</span>
                  {opt.text}
                </button>
              ))}
            </div>
          </div>
        )

      case 'consequence':
        if (choices[block.choicePointId!] === block.choiceLetter) {
          return <p key={idx} id={`story-text-${idx}`} className="text-gray-700 italic my-4">{block.text}</p>
        }
        return null

      case 'reflection':
        return (
          <div key={idx} className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 my-4">
            <p id={`story-text-${idx}`} className="font-semibold text-yellow-800">🤔 Reflection: <span>{block.text}</span></p>
          </div>
        )

      case 'action':
        return (
          <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4 my-4">
            <p id={`story-text-${idx}`} className="font-semibold text-green-800">🌍 Action: <span>{block.text}</span></p>
          </div>
        )

      case 'continuation':
        return (
          <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">
            <p id={`story-text-${idx}`} className="text-blue-800">{block.text}</p>
          </div>
        )

      default:
        return <p key={idx} id={`story-text-${idx}`} className="mb-3 text-gray-800">{block.text}</p>
    }
  }

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
        <p>Loading story...</p>
      </div>
    </div>
  )

  if (error && !story) return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center text-red-600">
        <p>Error loading story</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-2 px-4 py-2 bg-blue-500 text-white rounded"
        >
          Try Again
        </button>
      </div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Header */}
        <h1 className="text-3xl font-bold text-gray-800 mb-4">{story?.title}</h1>
        <p className="text-gray-500 mb-6">Section {currentSection + 1} of {totalSections}</p>

        {/* Complexity Hint */}
        {showComplexityHint && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
            <p className="text-yellow-800 font-medium mb-2">💡 You can change the reading level anytime.</p>
            <button
              onClick={() => setShowComplexityHint(false)}
              className="underline text-sm text-yellow-700 hover:text-yellow-900"
            >
              Got it ✓
            </button>
          </div>
        )}

        {/* Story Block */}
        <div className="bg-white rounded-xl p-6 border shadow-sm min-h-[150px]">
          {blocks.length > 0 && currentSection < blocks.length ? (
            renderBlock(blocks[currentSection], currentSection)
          ) : (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Story loading...</p>
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentSection(s => Math.max(0, s - 1))}
            disabled={currentSection === 0}
            className="px-4 py-2 bg-blue-100 rounded-lg disabled:opacity-40 min-h-[44px]"
          >
            ← Back
          </button>
          <button
            onClick={handleNextSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg min-h-[44px]"
          >
            {currentSection === totalSections - 1 ? 'Create Your Response →' : 'Next →'}
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-6 flex-wrap">
          <button 
            onClick={() => handleReadAloud()} 
            disabled={speechHighlighting.isReading} 
            className="px-4 py-2 bg-green-100 rounded-lg min-h-[44px]"
          >
            🔊 {speechHighlighting.isReading ? 'Reading...' : 'Read Aloud'}
          </button>
          <button 
            onClick={() => setCurrentSection(0)} 
            className="px-4 py-2 bg-orange-100 rounded-lg min-h-[44px]"
          >
            🔄 Start Over
          </button>
          <button 
            onClick={() => setLocation('/interests')} 
            className="px-4 py-2 bg-purple-100 rounded-lg min-h-[44px]"
          >
            📚 New Story
          </button>
        </div>

        {/* Complexity Level Controls */}
        {story && (
          <div className="bg-white/50 rounded-lg p-4 mt-8 max-w-md mx-auto text-center">
            <p className="text-sm font-medium text-gray-700 mb-3">How do you feel like reading today?</p>
            <div className="flex gap-2 justify-center">
              {(['simple', 'full', 'challenge'] as const).map((level) => (
                <button
                  key={level}
                  onClick={() => handleComplexityChange(level)}
                  className={`min-h-[44px] px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                    complexityLevel === level
                      ? 'bg-blue-500 text-white'
                      : 'bg-blue-100 text-gray-700 hover:bg-gray-50 border border-gray-200'
                  }`}
                >
                  {level === 'simple' ? '🌱 Easy' : level === 'full' ? '🎯 Just Right' : '🚀 Challenge'}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default StoryPage