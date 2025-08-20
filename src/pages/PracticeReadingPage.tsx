// src/pages/PracticeReadingPage.tsx - Viewport Optimized & Responsive
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
    <div className="page-container bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky">
      <div className="container">
        <div className="content-area">
          
          {/* Compact Header */}
          <div className="text-center pt-2 pb-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-autism-primary mb-3">
              Time to Practice Reading!
            </h1>
            <p className="text-base md:text-lg text-autism-primary/80 leading-relaxed max-w-3xl mx-auto">
              You've got three awesome ways to level up your reading skills. 
              They are all fun and make you a stronger reader!
            </p>
          </div>

          {/* Activity Selection Grid - Wider Cards */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 w-full max-w-5xl">
              {readingActivities.map((activity) => (
                <EmotionalCard
                  key={activity.id}
                  mood={activity.mood}
                  interactive="full"
                  className={`
                    cursor-pointer transition-all duration-300 h-full
                    hover:scale-102 hover:shadow-xl
                    ${activity.color}
                    ${recommendation.recommended === activity.id ? 'ring-2 ring-autism-secondary ring-offset-2' : ''}
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
                  <CardContent className="p-4 md:p-6 lg:p-8 h-full flex flex-col justify-center">
                    {/* Recommendation Badge 
                    {recommendation.recommended === activity.id && (
                      <div className="flex justify-end mb-2">
                        <span className="bg-autism-secondary text-grey text-xs px-2 py-1 rounded-full font-semibold">
                          Recommended for you!
                        </span>
                      </div>
                    )} */}

                    {/* Activity Icon and Title */}
                    <div className="text-center mb-4">
                      <div className="text-4xl md:text-5xl lg:text-6xl mb-3">
                        {activity.emoji}
                      </div>
                      <h2 className="text-xl md:text-2xl lg:text-3xl font-bold text-autism-primary mb-2">
                        {activity.label}
                      </h2>
                    </div>

                    {/* Activity Description */}
                    <div className="text-center space-y-3 flex-1 flex flex-col justify-center">
                      <p className="text-sm md:text-base lg:text-lg text-autism-primary/80 leading-relaxed">
                        {activity.description}
                      </p>
                      <p className="text-xs md:text-sm text-autism-primary/60 leading-relaxed">
                        {activity.detailedDescription}
                      </p>
                    </div>

                    {/* Activity Info */}
                    <div className="mt-4 pt-4 border-t border-autism-primary/20">
                      <div className="flex flex-col justify-center items-center gap-2 text-xs md:text-sm text-autism-primary/70">
                        <span className="flex items-center gap-1">
                          ⏱️ {activity.duration}
                        </span>
                        <span className="flex items-center gap-1 text-center">
                          🎯 {activity.skills.slice(0, 2).join(' • ')}
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </EmotionalCard>
              ))}
            </div>
          </div>

          {/* Compact Footer Message */}
          <div className="text-center pt-4 pb-2">
            <p className="text-sm md:text-base text-autism-primary/60 leading-relaxed">
              Remember: There's no wrong choice here. Every activity make you a stronger, more confident reader!
            </p>
          </div>

        </div>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          This page lets you choose between two reading practice activities: Word Building and Reading Stories.
          Word Building focuses on breaking apart and building words to understand patterns.
          Reading Stories focuses on comprehension and fluency through engaging narratives.
          Click on either tile to start that activity immediately.
        </p>
      </div>
    </div>
  )
}

export default PracticeReadingPage