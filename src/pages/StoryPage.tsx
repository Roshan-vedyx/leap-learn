// src/pages/StoryPage.tsx - Fixed version
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { audio, storage } from '@/lib/utils'
import { DynamicStoryLoader } from '@/utils/dynamicStoryLoader'
import { useSessionStore } from '@/stores/sessionStore'
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

type StoryBlock = {
  type: 'narration' | 'choice' | 'consequence' | 'reflection' | 'action' | 'continuation' | 'conclusion'
  text: string
  choiceLetter?: string
  choicePointId?: number
  options?: { letter: string; text: string }[]
}

const StoryPage: React.FC<StoryPageProps> = ({ interest, storyName }) => {
  const [currentSection, setCurrentSection] = useState(0)
  const [isReading, setIsReading] = useState(false)
  const [readingMode, setReadingMode] = useState<'text' | 'audio' | 'both'>('text')
  const [complexityLevel, setComplexityLevel] = useState<ComplexityLevel>('full')
  const [story, setStory] = useState<StoryTemplate | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [choices, setChoices] = useState<{ [choicePointId: number]: string }>({})
  const [showComplexityHint, setShowComplexityHint] = useState(false)
  const [, setLocation] = useLocation()

  // NEW: Store reflections for CreatePage
  const { setStoryReflections } = useSessionStore()
  const [collectedReflections, setCollectedReflections] = useState<string[]>([])

  // Load story template dynamically
  useEffect(() => {
    const loadStory = async () => {
      try {
        setLoading(true)
        setError(null)

        const selectedInterests = JSON.parse(localStorage.getItem('selected-interests') || '[]')
        const currentInterest = interest || selectedInterests[0] || 'animals'
        const currentStoryName = storyName || 'forest-rescue'
        
        const loadedStory = await DynamicStoryLoader.loadStory(currentInterest, currentStoryName)
        
        if (loadedStory) {
          setStory(loadedStory)
        } else {
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

  useEffect(() => {
    const hasSeenHint = storage.get('complexity-hint-seen', false)
    if (!hasSeenHint) {
      setShowComplexityHint(true)
      storage.set('complexity-hint-seen', true)
    }
  }, [])

  const getCurrentStoryText = (): string => {
    if (!story) return ''
    const storyKey = complexityLevel === 'simple' ? 'simple' : 
                     complexityLevel === 'challenge' ? 'challenge' : 'regular'
    return story.stories[storyKey] || story.stories.regular
  }

  // FIXED: Parse blocks and collect reflections (moved to useEffect to prevent infinite loop)
  const parseStoryBlocks = (storyText: string): { blocks: StoryBlock[], reflections: string[] } => {
    let choicePointCounter = 0
    const rawBlocks = storyText.split(/\n+/)
    const parsedBlocks: StoryBlock[] = []
    const reflections: string[] = []

    for (let i = 0; i < rawBlocks.length; i++) {
      let block = rawBlocks[i].trim()

      // Skip empty blocks
      if (block.length === 0) continue

      if (block.startsWith('[CHOICE POINT')) {
        choicePointCounter++
        const question = block.replace(/\[CHOICE POINT \d+\]/, '').trim()
        const options: { letter: string; text: string }[] = []
        let j = i + 1

        while (j < rawBlocks.length && /^[A-C]\)/.test(rawBlocks[j].trim())) {
          const line = rawBlocks[j].trim()
          const match = line.match(/^([A-C])\)\s*(.+)$/)
          if (match) {
            options.push({ letter: match[1], text: match[2] })
          }
          j++
        }

        parsedBlocks.push({
          type: 'choice',
          text: question,
          choicePointId: choicePointCounter,
          options
        })

        i = j - 1
      }
      else if (block.startsWith('[CONSEQUENCE')) {
        const letter = block.match(/\[CONSEQUENCE (.)\]/)?.[1]
        parsedBlocks.push({
          type: 'consequence',
          text: block,
          choiceLetter: letter,
          choicePointId: choicePointCounter
        })
      }
      // COLLECT reflections instead of creating blocks
      else if (block.startsWith('[PERSONAL REFLECTION]')) {
        const reflectionText = block.replace('[PERSONAL REFLECTION]', '').trim()
        reflections.push(reflectionText)
        // Don't add to parsedBlocks - we'll show these in CreatePage
      }
      else if (block.startsWith('[ACTION REFLECTION]')) {
        parsedBlocks.push({ type: 'action', text: block })
      }
      else if (block.startsWith('[STORY CONTINUATION]')) {
        parsedBlocks.push({ type: 'continuation', text: block })
      }
      else if (block.startsWith('[FINAL CONCLUSION]')) {
        parsedBlocks.push({ type: 'conclusion', text: block })
      }
      // FIXED: Only add substantial content as narration
      else if (block.trim().length > 0 && !block.match(/^\[.*\]$/)) {
        parsedBlocks.push({ type: 'narration', text: block.trim() })
      }
    }

    return { blocks: parsedBlocks, reflections }
  }

  // FIXED: Parse story and set reflections in useEffect to prevent infinite loop
  const [blocks, setBlocks] = useState<StoryBlock[]>([])
  const totalSections = blocks.length

  useEffect(() => {
    if (story) {
      const storyText = getCurrentStoryText()
      const result = parseStoryBlocks(storyText)
      
      // CRITICAL FIX: Ensure we always have at least one block
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

  // FIXED: Clean text for TTS
  const handleReadAloud = async (textToRead?: string) => {
    if (!audio.isSpeechSynthesisSupported()) return
    await new Promise(resolve => setTimeout(resolve, 100))
    const currentAccent = storage.get('tts-accent', 'GB') as 'US' | 'GB' | 'IN'
    
    let text = textToRead || (blocks[currentSection]?.text) || 'Story content not available'
    
    // FIXED: Remove prefixes for TTS
    text = text.replace(/\[CONSEQUENCE .\]\s*/g, '')
    text = text.replace(/\[PERSONAL REFLECTION\]\s*/g, '')
    text = text.replace(/\[ACTION REFLECTION\]\s*/g, '')
    text = text.replace(/\[STORY CONTINUATION\]\s*/g, '')
    text = text.replace(/\[FINAL CONCLUSION\]\s*/g, '')
    
    setIsReading(true)
    try {
      const selectedVoice = audio.getBestVoiceForAccent(currentAccent)
      await audio.speak(text, {
        voice: selectedVoice,
        accent: currentAccent,
        rate: 0.85,
        pitch: 0.95,
        volume: 0.9
      })
    } catch (error) {
      console.error('Text-to-speech error:', error)
    } finally {
      setIsReading(false)
    }
  }

  const handleChoiceSelect = (choicePointId: number, letter: string) => {
    setChoices(prev => ({ ...prev, [choicePointId]: letter }))
  }

  const handleComplexityChange = (newLevel: ComplexityLevel) => {
    setComplexityLevel(newLevel)
    setShowComplexityHint(false)
    // The useEffect will handle re-parsing when complexityLevel changes
  }

  // FIXED: Navigate to CreatePage at story end
  const handleNextSection = () => {
    if (currentSection === totalSections - 1) {
      // Story finished - save reflections and go to CreatePage
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
            <p className="font-semibold text-blue-700 mb-3">{block.text}</p>
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
          return <p key={idx} className="text-gray-700 italic">{block.text.replace(/\[CONSEQUENCE .\]/, '')}</p>
        }
        return null

      case 'action':
        return <div key={idx} className="bg-green-50 border border-green-200 rounded-lg p-4 my-4 font-semibold">🌍 {block.text.replace('[ACTION REFLECTION]', '').trim()}</div>
      case 'continuation':
        return <div key={idx} className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-4">{block.text.replace('[STORY CONTINUATION]', '').trim()}</div>
      case 'conclusion':
        return <div key={idx} className="bg-purple-50 border border-purple-200 rounded-lg p-4 my-4 font-bold">⭐ {block.text.replace('[FINAL CONCLUSION]', '').trim()}</div>
      default:
        let cleanText = block.text
        cleanText = cleanText.replace(/\[CONSEQUENCE .\]\s*/g, '')
        cleanText = cleanText.replace(/\[PERSONAL REFLECTION\]\s*/g, '')
        cleanText = cleanText.replace(/\[ACTION REFLECTION\]\s*/g, '')
        cleanText = cleanText.replace(/\[STORY CONTINUATION\]\s*/g, '')
        cleanText = cleanText.replace(/\[FINAL CONCLUSION\]\s*/g, '')
        return <p key={idx} className="mb-3">{cleanText}</p>
    }
  }

  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading story...</div>
  if (error && !story) return <div className="min-h-screen flex items-center justify-center">Error loading story</div>

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
          ) : story ? (
            <div className="text-center py-8">
              <p className="text-gray-600 mb-4">Story parsing in progress...</p>
              <div className="animate-spin w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full mx-auto"></div>
            </div>
          ) : (
            <p className="text-gray-500">Loading story section...</p>
          )}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6">
          <button
            onClick={() => setCurrentSection(s => Math.max(0, s - 1))}
            disabled={currentSection === 0}
            className="px-4 py-2 bg-blue-100 rounded-lg disabled:opacity-40"
          >
            ← Back
          </button>
          <button
            onClick={handleNextSection}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            {currentSection === totalSections - 1 ? 'Create Your Response →' : 'Next →'}
          </button>
        </div>

        {/* Controls */}
        <div className="flex gap-3 mt-6 flex-wrap">
          <button onClick={() => handleReadAloud()} disabled={isReading} className="px-4 py-2 bg-green-100 rounded-lg">
            🔊 {isReading ? 'Reading...' : 'Read Aloud'}
          </button>
          <button onClick={() => setCurrentSection(0)} className="px-4 py-2 bg-orange-100 rounded-lg">
            🔄 Start Over
          </button>
          <button onClick={() => setLocation('/interests')} className="px-4 py-2 bg-purple-100 rounded-lg">
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