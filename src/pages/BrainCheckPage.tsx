// src/pages/BrainCheckPage.tsx - Viewport-First Design with Direct Navigation
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { 
  Zap, 
  Target, 
  Moon, 
  Sparkles, 
  Waves, 
  Search, 
  BookOpen, 
  Star,
  Bot,
  Eye
} from 'lucide-react'

// Brain state options redesigned for warmth and relatability
interface BrainState {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string; 'aria-label'?: string }>
  description: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
  encouragement: string
}

const brainStates: BrainState[] = [
  {
    id: 'energetic',
    label: 'High Energy',
    icon: Zap,
    description: "I've got energy to burn and need to move around.",
    color: 'mood-energetic',
    mood: 'energetic',
    encouragement: "Let's find you an action-packed adventure!"
  },
  {
    id: 'focused',
    label: 'Focused & Ready',
    icon: Target,
    description: "I'm feeling calm and ready to dig into something good.",
    color: 'mood-focused',
    mood: 'focused',
    encouragement: "Perfect! I have some great focused reading for you."
  },
  {
    id: 'tired',
    label: 'Low Energy',
    icon: Moon,
    description: "I'm tired or mellow and want something easy.",
    color: 'mood-calm',
    mood: 'calm',
    encouragement: "Let's find something soothing and easy to follow."
  },
  {
    id: 'excited',
    label: 'Really Excited',
    icon: Sparkles,
    description: "I'm pumped up and want something epic!",
    color: 'mood-energetic',
    mood: 'energetic',
    encouragement: "Your enthusiasm is contagious! Let's go on an epic journey."
  },
  {
    id: 'overwhelmed',
    label: 'Overwhelmed',
    icon: Waves,
    description: "Everything feels like too much right now.",
    color: 'calm',
    mood: 'calm',
    encouragement: "I've got you covered with something peaceful and stress-free."
  },
  {
    id: 'curious',
    label: 'Curious',
    icon: Search,
    description: "I want to figure things out and discover stuff.",
    color: 'mood-focused',
    mood: 'focused',
    encouragement: "Excellent! I know some stories with amazing discoveries."
  }
]

const BrainCheckPage: React.FC = () => {
  const [, setLocation] = useLocation()

  // Reset any previous session data when starting fresh
  useEffect(() => {
    localStorage.removeItem('current-brain-state')
    localStorage.removeItem('today-choice')
  }, [])

  // Handle direct navigation when mood card is clicked
  const handleStateSelect = (stateId: string) => {
    const brainState = brainStates.find(state => state.id === stateId)
    if (brainState) {
      // Store brain state for use throughout the session
      localStorage.setItem('current-brain-state', JSON.stringify(brainState))
      
      // Announce selection for screen readers
      const announcement = `Selected ${brainState.label}. ${brainState.encouragement} Navigating to activity selection.`
      const announcer = document.getElementById('accessibility-announcements')
      if (announcer) {
        announcer.textContent = announcement
      }

      // Navigate directly to the "Today I Want To" page
      setLocation('/today-i-want-to')
    }
  }

  // Show all 6 mood options in organized grid
  const displayStates = brainStates

  return (
    <div className="page-container">
      <div className="container">
        <div className="content-area">
          
          {/* Compact Header */}
          <div className="viewport-header">
            <div className="flex justify-center gap-3 mb-3">
              <BookOpen className="w-12 h-12 text-indigo-600" />
              <Star className="w-12 h-12 text-purple-500" />
            </div>
            <h1 className="text-3xl md:text-4xl font-bold text-header-primary mb-3">
              What's Your Vibe Today?
            </h1>
            <p className="text-lg text-body-text leading-relaxed max-w-2xl mx-auto mb-3">
            Your brain works differently every day - sometimes it's buzzing with energy, sometimes it wants to chill.
            I want to find you something that actually fits how you're feeling right now - there are NO wrong answers here!
            </p>
          </div>

          {/* Brain State Selection Grid - Optimized for Viewport */}
          <div className="flex-1 flex flex-col justify-center">
            <div className="viewport-grid gap-comfortable">
              {displayStates.map((state) => (
                <Card
                  key={state.id}
                  variant={state.color}
                  interactive="full"
                  className="viewport-card cursor-pointer transition-all duration-200 hover:scale-102 hover:shadow-lg focus-within:ring-4 focus-within:ring-deep-ocean-blue focus-within:ring-offset-2"
                  onClick={() => handleStateSelect(state.id)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Choose ${state.label}: ${state.description}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleStateSelect(state.id)
                    }
                  }}
                >
                  <CardContent className="p-3 md:p-4 text-center h-full flex flex-col justify-center">
                    <div className="mb-2 md:mb-3 flex justify-center">
                      <state.icon 
                        className="w-8 h-8 md:w-10 md:h-10 text-indigo-600" 
                        aria-label={state.label}
                      />
                    </div>
                    <h3 className="text-sm md:text-base lg:text-lg font-semibold text-header-primary mb-1 md:mb-2">
                      {state.label}
                    </h3>
                    <p className="text-xs md:text-sm text-body-text leading-relaxed hidden sm:block">
                      {state.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Compact Footer */}
          <div className="viewport-footer">
            <p className="viewport-text-sm text-indigo-600 leading-relaxed">
            Your brain changes all the time - that's completely normal. You can always come back and pick something different if your mood shifts. 
            </p>
            
            {/* Character Message - Compact */}
            <div className="mt-4 inline-block bg-white rounded-xl p-4 shadow-sm border border-indigo-100">
              <div className="flex items-center justify-center gap-3">
                <Bot className="w-6 h-6 text-indigo-600 flex-shrink-0" />
                <p className="viewport-text-sm text-indigo-800 font-medium">
                  "I'm here to help you find stuff that actually works for how your brain is today."
                </p>
              </div>
            </div>
          </div>

        </div>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          This page helps you choose how you're feeling today so we can recommend activities 
          that match your mood and energy level. Click or press Enter on any feeling option 
          to continue. This is just to help - there are no wrong choices and you can 
          change your mind anytime.
        </p>
      </div>

      {/* Hidden announcements area for screen readers */}
      <div id="accessibility-announcements" className="sr-only" aria-live="polite"></div>
    </div>
  )
}

export default BrainCheckPage