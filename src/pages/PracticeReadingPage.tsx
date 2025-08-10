// src/pages/PracticeReadingPage.tsx
import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
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
  const [selectedActivity, setSelectedActivity] = useState<string | null>(null)
  const [, setLocation] = useLocation()

  // Get brain state for personalized recommendations
  const brainState = storage.get('current-brain-state', 'focused')

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
  }

  const handleContinue = () => {
    if (selectedActivity) {
      const activity = readingActivities.find(a => a.id === selectedActivity)
      if (activity) {
        console.log('🚀 Navigating to:', activity.route) // Debug line
        localStorage.setItem('selected-reading-activity', selectedActivity)
        setLocation(activity.route)
      }
    }
  }

  const selectedActivityData = readingActivities.find(activity => activity.id === selectedActivity)

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
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-autism-primary mb-4">
            Time to Practice Reading!
          </h1>
          <p className="text-xl text-autism-primary/80 leading-relaxed max-w-2xl mx-auto">
            You've got two awesome ways to level up your reading skills. 
            Both are fun and both make you a stronger reader!
          </p>
        </div>

        {/* Personalized Recommendation */}
        <Card className="mb-8 bg-autism-calm-lavender border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-autism-primary">
              💡 Based on how you're feeling today...
            </CardTitle>
          </CardHeader>
          <CardContent className="text-center">
            <p className="text-lg text-autism-primary/80 mb-2">
              <strong>{recommendation.reason}</strong>
            </p>
            <p className="text-autism-primary/70">
              But honestly? Both options are amazing - go with what excites you most!
            </p>
          </CardContent>
        </Card>

        {/* Activity Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
          {readingActivities.map((activity) => (
            <EmotionalCard
              key={activity.id}
              mood={activity.mood}
              interactive="full"
              className={`
                cursor-pointer transition-all duration-200 h-full
                ${selectedActivity === activity.id 
                  ? 'ring-4 ring-autism-primary ring-offset-2 scale-105' 
                  : 'hover:scale-102'
                }
                ${activity.color}
                ${recommendation.recommended === activity.id ? 'ring-2 ring-autism-secondary ring-offset-1' : ''}
              `}
              onClick={() => handleActivitySelect(activity.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedActivity === activity.id}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleActivitySelect(activity.id)
                }
              }}
            >
              <CardContent className="p-8 h-full flex flex-col">
                {/* Recommendation Badge */}
                {recommendation.recommended === activity.id && (
                  <div className="self-end mb-2">
                    <span className="bg-autism-secondary text-white text-xs px-2 py-1 rounded-full font-semibold">
                      Recommended for you!
                    </span>
                  </div>
                )}
                
                <div className="text-center flex-1 flex flex-col justify-center">
                  <div className="text-8xl mb-6" role="img" aria-label={activity.label}>
                    {activity.emoji}
                  </div>
                  <h3 className="text-3xl font-bold text-autism-primary mb-4">
                    {activity.label}
                  </h3>
                  <p className="text-xl text-autism-primary/80 leading-relaxed mb-6">
                    {activity.description}
                  </p>
                  
                  {/* Details */}
                  <div className="space-y-3 text-left">
                    <div className="bg-white/50 rounded-lg p-3">
                      <p className="text-sm text-autism-primary/70 mb-1">
                        <strong>What you'll do:</strong>
                      </p>
                      <p className="text-sm text-autism-primary">
                        {activity.detailedDescription}
                      </p>
                    </div>
                    
                    <div className="flex justify-between text-sm">
                      <div>
                        <span className="text-autism-primary/70">Duration: </span>
                        <span className="text-autism-primary font-semibold">{activity.duration}</span>
                      </div>
                    </div>
                    
                    <div>
                      <p className="text-sm text-autism-primary/70 mb-1">Skills you'll practice:</p>
                      <div className="flex flex-wrap gap-1">
                        {activity.skills.map((skill, index) => (
                          <span 
                            key={index}
                            className="bg-autism-primary/20 text-autism-primary text-xs px-2 py-1 rounded-full"
                          >
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </EmotionalCard>
          ))}
        </div>

        {/* Selected Activity Confirmation */}
        {selectedActivityData && (
          <Card className="mb-8 bg-autism-neutral border-autism-primary border-2 animate-calm-fade">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-autism-primary">
                Perfect choice! {selectedActivityData.emoji} {selectedActivityData.label} it is!
              </CardTitle>
              <CardDescription className="text-center text-lg text-autism-primary/80">
                Get ready for {selectedActivityData.duration} of awesome learning!
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedActivity}
            variant="celebration"
            size="comfortable"
            className="text-xl px-8 py-4"
          >
            {selectedActivity ? `Start ${selectedActivityData?.label}!` : "Pick Your Adventure First"}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-autism-primary/60 text-sm leading-relaxed">
            Remember: There's no wrong choice here. Both activities make you a stronger, more confident reader!
          </p>
        </div>

        {/* Fun Fact */}
        <Card className="mt-8 bg-white/90 border-autism-primary">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-autism-primary mb-3">
              🧠 Did you know?
            </h3>
            <p className="text-autism-primary/80 leading-relaxed">
              Whether you build words or read stories, you're strengthening the same reading muscles in your brain. 
              Every practice session makes you more powerful!
            </p>
          </CardContent>
        </Card>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            This page lets you choose between two reading practice activities: Word Building and Reading Stories.
            Word Building focuses on breaking apart and building words to understand patterns.
            Reading Stories focuses on comprehension and fluency through engaging narratives.
            Choose the one that appeals to you most right now.
          </p>
        </div>
      </div>
    </div>
  )
}

export default PracticeReadingPage