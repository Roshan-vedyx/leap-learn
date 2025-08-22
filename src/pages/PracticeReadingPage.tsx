// src/pages/PracticeReadingPage.tsx - Fully Responsive Mobile & Tablet Optimized
import React from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent } from '@/components/ui/Card'
import { EmotionalCard } from '@/components/ui/Card'
import { storage } from '@/lib/utils'

// Reading activity options
interface ReadingActivity {
  id: string
  label: string
  emoji: string
  description: string
  detailedDescription: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
  route: string
  duration: string
  skills: string[]
}

const readingActivities: ReadingActivity[] = [
  {
    id: 'word-building',
    label: 'Word Building',
    emoji: '🔧',
    description: "Build words piece by piece and discover patterns!",
    detailedDescription: "Break apart words like puzzles, put them back together, and spot cool patterns. You'll become a word detective!",
    color: 'bg-blue-100 border-blue-400',
    mood: 'focused',
    route: '/word-building',
    duration: '8-12 minutes',
    skills: ['Word chunks', 'Spelling patterns', 'Sound blending']
  },
  {
    id: 'sentence-building',
    label: 'Build Sentences',
    emoji: '🏗️',
    description: "Create amazing sentences with words you know!",
    detailedDescription: "Put words together to build sentences that tell cool stories. Practice sentence patterns while having fun!",
    color: 'bg-purple-100 border-purple-400',
    mood: 'focused',
    route: '/sentence-building',
    duration: '6-10 minutes',
    skills: ['Sentence structure', 'Grammar patterns', 'Word relationships']
  },
  {
    id: 'stories',
    label: 'Read Stories',
    emoji: '📚',
    description: "Dive into exciting adventures and cool characters!",
    detailedDescription: "Explore amazing stories that match your mood, with characters you'll love and adventures that keep you turning pages.",
    color: 'bg-green-100 border-green-400',
    mood: 'calm',
    route: '/interests',
    duration: '10-15 minutes',
    skills: ['Reading fluency', 'Comprehension', 'Vocabulary']
  }
]

const PracticeReadingPage: React.FC = () => {
  const [, setLocation] = useLocation()

  // Get brain state for personalized recommendations
  const brainState = storage.get('current-brain-state', 'focused')

  const handleActivityClick = (activity: ReadingActivity) => {
    console.log('🚀 Navigating to:', activity.route)
    localStorage.setItem('selected-reading-activity', activity.id)
    setLocation(activity.route)
  }

  // Get personalized recommendation based on brain state
  const getRecommendation = () => {
    switch (brainState) {
      case 'energetic':
      case 'excited':
        return {
          recommended: 'word-building',
          reason: "Your energy is perfect for hands-on word building!"
        }
      case 'focused':
      case 'curious':
        return {
          recommended: 'stories',
          reason: "Your focus is great for diving deep into stories!"
        }
      case 'overwhelmed':
      case 'tired':
        return {
          recommended: 'stories',
          reason: "Stories might be more relaxing for you right now."
        }
      default:
        return {
          recommended: 'word-building',
          reason: "Both options are great - pick what feels right!"
        }
    }
  }

  const recommendation = getRecommendation()

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky flex flex-col">
      {/* Responsive Container with proper padding for all screen sizes */}
      <div className="flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 max-w-7xl mx-auto w-full">
        
        {/* Header Section - Fully Responsive */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-autism-primary mb-3 sm:mb-4 px-2">
            Time to Practice Reading!
          </h1>
          <p className="text-base sm:text-lg md:text-xl text-autism-primary/80 leading-relaxed max-w-3xl mx-auto px-4 sm:px-6">
            You've got three awesome ways to level up your reading skills. 
            They are all fun and make you a stronger reader!
          </p>
        </div>

        {/* Activity Selection Grid - Mobile-First Responsive Design */}
        <div className="flex-1 flex items-center justify-center mb-6 sm:mb-8">
          
          {/* Single column on mobile, 2 cols on medium, 3 cols on large screens */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5 md:gap-6 w-full max-w-6xl">
            {readingActivities.map((activity) => (
              <EmotionalCard
                key={activity.id}
                mood={activity.mood}
                interactive="full"
                className={`
                  cursor-pointer transition-all duration-300 h-full
                  hover:scale-[1.02] hover:shadow-xl active:scale-[0.98]
                  ${activity.color}
                  ${recommendation.recommended === activity.id ? 'ring-2 ring-autism-secondary ring-offset-2' : ''}
                  min-h-[280px] sm:min-h-[320px] md:min-h-[360px] lg:min-h-[400px]
                  touch-manipulation
                `}
                onClick={() => handleActivityClick(activity)}
                role="button"
                tabIndex={0}
                aria-label={`Start ${activity.label} - ${activity.description}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handleActivityClick(activity)
                  }
                }}
              >
                <CardContent className="p-4 sm:p-5 md:p-6 lg:p-8 h-full flex flex-col justify-between">
                  
                  {/* Recommendation Badge - Responsive 
                  {recommendation.recommended === activity.id && (
                    <div className="flex justify-center mb-3 sm:mb-4">
                      <span className="bg-autism-secondary text-white text-xs sm:text-sm px-2 sm:px-3 py-1 rounded-full font-semibold">
                        ⭐ Recommended for you!
                      </span>
                    </div>
                  )} */}

                  {/* Activity Icon and Title - Responsive sizing */}
                  <div className="text-center mb-3 sm:mb-4">
                    <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-2 sm:mb-3">
                      {activity.emoji}
                    </div>
                    <h2 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-autism-primary mb-2">
                      {activity.label}
                    </h2>
                  </div>

                  {/* Activity Description - Responsive text and spacing */}
                  <div className="text-center space-y-2 sm:space-y-3 flex-1 flex flex-col justify-center">
                    <p className="text-sm sm:text-base md:text-lg text-autism-primary/80 leading-relaxed">
                      {activity.description}
                    </p>
                    {/*<p className="text-xs sm:text-sm md:text-base text-autism-primary/60 leading-relaxed">
                      {activity.detailedDescription}
                    </p>*/}
                  </div>

                  {/* Activity Info - Responsive layout */}
                  <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-autism-primary/20">
                    <div className="flex flex-col justify-center items-center gap-1 sm:gap-2 text-xs sm:text-sm text-autism-primary/70">
                      <span className="flex items-center gap-1">
                        ⏱️ {activity.duration}
                      </span>
                      <span className="flex items-center gap-1 text-center">
                        🎯 {activity.skills.slice(0, 2).join(' • ')}
                      </span>
                      {/* Show third skill on larger screens */}
                      {activity.skills[2] && (
                        <span className="hidden sm:flex items-center gap-1 text-center">
                          ✨ {activity.skills[2]}
                        </span>
                      )}
                    </div>
                  </div>
                </CardContent>
              </EmotionalCard>
            ))}
          </div>
        </div>

        {/* Footer Message - Responsive text sizing */}
        <div className="text-center">
          <p className="text-sm sm:text-base md:text-lg text-autism-primary/60 leading-relaxed px-4 max-w-2xl mx-auto">
            Remember: There's no wrong choice here. Every activity makes you a stronger, more confident reader!
          </p>
        </div>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          This page lets you choose between three reading practice activities: Word Building, Build Sentences, and Read Stories.
          Word Building focuses on breaking apart and building words to understand patterns.
          Build Sentences focuses on grammar patterns and sentence structure.
          Read Stories focuses on comprehension and fluency through engaging narratives.
          Click on any tile to start that activity immediately.
        </p>
      </div>
    </div>
  )
}

export default PracticeReadingPage