// src/pages/StorySelectionPage.tsx
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { DynamicStoryLoader } from '@/utils/dynamicStoryLoader'

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

interface StorySelectionPageProps {
  interest?: string
}

// Map interest names to their display info
const interestDisplayInfo: Record<string, { emoji: string; label: string; description: string }> = {
  animals: { emoji: '🦁', label: 'Amazing Animals', description: 'Wild animals and animal rescue adventures' },
  ocean: { emoji: '🌊', label: 'Ocean Adventures', description: 'Deep sea mysteries and marine life' },
  space: { emoji: '🚀', label: 'Space & Stars', description: 'Galaxies, planets, and space stations' },
  friendship: { emoji: '👥', label: 'Friendship Stories', description: 'Best friends and making new friends' },
  mystery: { emoji: '🔍', label: 'Mystery & Puzzles', description: 'Secret codes and hidden treasures' },
  magic: { emoji: '✨', label: 'Magic & Fantasy', description: 'Magical powers and fantasy worlds' },
  technology: { emoji: '🤖', label: 'Technology & Robots', description: 'Helpful robots and future technology' },
  creative: { emoji: '🎨', label: 'Creative & Art', description: 'Creating art and playing music' },
  family: { emoji: '👨‍👩‍👧‍👦', label: 'Family Fun', description: 'Family adventures and traditions' }
}

const StorySelectionPage: React.FC<StorySelectionPageProps> = ({ interest }) => {
  const [stories, setStories] = useState<StoryTemplate[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setLocation] = useLocation()

  const currentInterest = interest || localStorage.getItem('selected-interest') || 'animals'
  const interestInfo = interestDisplayInfo[currentInterest] || interestDisplayInfo.animals

  useEffect(() => {
    const loadStories = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get all available story IDs for this interest
        const storyIds = DynamicStoryLoader.getAvailableStories(currentInterest)
        
        if (storyIds.length === 0) {
          console.log(`No stories found for interest: ${currentInterest}`)
          setStories([])
          setLoading(false)
          return
        }

        // Load all stories for this interest
        const loadedStories: StoryTemplate[] = []
        
        for (const storyId of storyIds) {
          const story = await DynamicStoryLoader.loadStory(currentInterest, storyId)
          if (story) {
            loadedStories.push(story)
          }
        }

        console.log(`Loaded ${loadedStories.length} stories for ${currentInterest}:`, loadedStories.map(s => s.title))
        setStories(loadedStories)

      } catch (err) {
        console.error('Error loading stories:', err)
        setError('Failed to load stories. Please try again.')
      } finally {
        setLoading(false)
      }
    }

    loadStories()
  }, [currentInterest])

  const handleStorySelect = (storyId: string) => {
    // Navigate to story page with interest and story ID
    setLocation(`/story/${currentInterest}/${storyId}`)
  }

  const handleBackToInterests = () => {
    setLocation('/interests')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto py-4 sm:py-8">
          <div className="text-center">
            {/* Responsive emoji sizing */}
            <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{interestInfo.emoji}</div>
            
            {/* Responsive heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-900 mb-3 sm:mb-4 px-2">
              Loading {interestInfo.label} Stories...
            </h1>
            
            {/* Loading animation with responsive text */}
            <div className="animate-pulse text-indigo-600 text-base sm:text-lg">
              Discovering available adventures...
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto py-4 sm:py-8">
          <div className="text-center">
            {/* Responsive emoji sizing */}
            <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">😅</div>
            
            {/* Responsive heading */}
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-900 mb-3 sm:mb-4 px-2">
              Oops! Something went wrong
            </h1>
            
            {/* Responsive error message */}
            <p className="text-base sm:text-lg md:text-xl text-indigo-700 mb-4 sm:mb-6 px-4">{error}</p>
            
            {/* Responsive button */}
            <Button 
              onClick={handleBackToInterests} 
              className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px] px-6 py-3 text-base sm:text-lg"
            >
              ← Back to Topics
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-3 sm:p-4">
      <div className="max-w-4xl mx-auto py-4 sm:py-8">
        
        {/* Header - Responsive layout and sizing */}
        <div className="text-center mb-6 sm:mb-8">
          {/* Back button with proper touch target */}
          <Button
            variant="ghost"
            onClick={handleBackToInterests}
            className="mb-4 text-indigo-600 min-h-[44px] px-4 py-2"
          >
            ← Back to all topics
          </Button>
          
          {/* Responsive emoji */}
          <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{interestInfo.emoji}</div>
          
          {/* Responsive heading */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-900 mb-3 sm:mb-4 px-2">
            {interestInfo.label} Stories
          </h1>
          
          {/* Responsive description */}
          <p className="text-base sm:text-lg md:text-xl text-indigo-700 leading-relaxed max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
            Pick a story that sounds exciting to you!
          </p>
        </div>

        {/* Story Cards - Responsive grid layout */}
        {stories.length > 0 ? (
          <>
            {/* Grid: 1 col mobile, 2 col tablet, 3 col desktop */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
              {stories.map((story, index) => (
                <Card
                  key={story.id}
                  className="cursor-pointer transition-all duration-300 border-2 border-gray-200 hover:scale-102 hover:shadow-lg hover:border-indigo-300 active:scale-98 h-full min-h-[160px] sm:min-h-[180px] md:min-h-[200px]"
                  onClick={() => handleStorySelect(story.id)}
                >
                  <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col justify-center">
                    {/* Responsive emoji sizing */}
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{interestInfo.emoji}</div>
                    
                    {/* Responsive title */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-indigo-900 mb-2 sm:mb-3 leading-tight">
                      {story.title}
                    </h3>
                    
                    {/* Responsive description */}
                    <p className="text-indigo-700 text-sm sm:text-base mb-3 sm:mb-4 leading-relaxed">
                      A {currentInterest} adventure waiting for you!
                    </p>
                    
                    {/* Story number badge - responsive sizing */}
                    <div className="mt-auto">
                      <div className="text-xs sm:text-sm text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">
                        Story #{index + 1}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Encouragement text - responsive sizing */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-indigo-600 px-4">
                Each story has three reading levels • Pick what feels right for you!
              </p>
            </div>
          </>
        ) : (
          /* No stories available - responsive layout */
          <div className="text-center py-8 sm:py-16">
            {/* Large emoji - responsive sizing */}
            <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">📚</div>
            
            {/* Responsive heading */}
            <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-indigo-900 mb-3 sm:mb-4 px-2">
              More stories coming soon!
            </h2>
            
            {/* Responsive description */}
            <p className="text-base sm:text-lg md:text-xl text-indigo-700 mb-4 sm:mb-6 px-4">
              We're working on adding more {interestInfo.label.toLowerCase()} adventures.
            </p>
            
            {/* Responsive button */}
            <Button 
              onClick={handleBackToInterests} 
              className="bg-indigo-600 hover:bg-indigo-700 min-h-[44px] px-6 py-3 text-base sm:text-lg w-full sm:w-auto"
            >
              ← Choose a different topic
            </Button>
          </div>
        )}

        {/* Accessibility Information - Screen reader only */}
        <div className="sr-only">
          <p>
            You are browsing {interestInfo.label} stories. There are {stories.length} stories available.
            Click on any story card to start reading. You can go back to all topics using the back button.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StorySelectionPage