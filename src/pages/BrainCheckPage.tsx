// src/pages/BrainCheckPage.tsx - Fully Responsive Mobile & Tablet Optimized
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
  Bot
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

  // MVP: Mock user age setup
  useEffect(() => {
    // Clear any previous session data when starting fresh
    localStorage.removeItem('current-brain-state')
    localStorage.removeItem('today-choice')
    
    // STEP 4: Mock user age (for MVP)
    // Set to 10 years old (9-11 age group for MVP)
    localStorage.setItem('user-age', '10')
    
    // Optional: Set additional mock user data for development
    if (process.env.NODE_ENV === 'development') {
      console.log('MVP: Setting mock user age to 10 (9-11 age group)')
    }
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
      setLocation('/practice-reading')
    }
  }

  // Show all 6 mood options in organized grid
  const displayStates = brainStates

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex flex-col">
      {/* Responsive Container with proper padding for all screen sizes */}
      <div className="flex-1 px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8 lg:px-8 max-w-7xl mx-auto w-full">
        
        {/* Header Section - Fully Responsive */}
        <div className="text-center mb-6 sm:mb-8 md:mb-10">
          
          {/* Logo Icons - Responsive sizing */}
          <div className="flex justify-center gap-2 sm:gap-3 mb-3 sm:mb-4">
            <BookOpen className="w-10 h-10 sm:w-12 sm:h-12 text-indigo-600" />
            <Star className="w-10 h-10 sm:w-12 sm:h-12 text-purple-500" />
          </div>
          
          {/* Main Heading - Responsive text sizing */}
          <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-header-primary mb-3 sm:mb-4 px-2">
            What's Your Vibe Today?
          </h1>
          
          {/* Description - Responsive sizing and line height */}
          <p className="text-base sm:text-lg md:text-xl text-body-text leading-relaxed max-w-2xl mx-auto mb-3 px-4 sm:px-6 block sm:hidden">
            {/* Empty for mobile - just shows the heading */}
          </p>

          {/* Tablet and Desktop: Full description */}
          <p className="text-base sm:text-lg md:text-xl text-body-text leading-relaxed max-w-2xl mx-auto mb-3 px-4 sm:px-6 hidden sm:block">
            Your brain works differently every day - sometimes it's buzzing with energy, sometimes it wants to chill.
            I want to find you something that actually fits how you're feeling right now - there are NO wrong answers here!
          </p>
        </div>

        {/* Brain State Grid - Mobile-First Responsive Design */}
        <div className="w-full max-w-6xl mx-auto mb-6 sm:mb-8">
          
          {/* Single column on mobile, 2 cols on small screens, 3 cols on larger screens */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4 md:gap-5 lg:gap-6">
            {displayStates.map((state) => {
              const IconComponent = state.icon
              return (
                <Card 
                  key={state.id}
                  className="brain-state-card cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 hover:border-indigo-300 active:scale-95 
                            min-h-[120px] sm:min-h-[140px] md:min-h-[160px] 
                            touch-manipulation"
                  onClick={() => handleStateSelect(state.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleStateSelect(state.id)
                    }
                  }}
                  aria-label={`Select ${state.label}: ${state.description}`}
                >
                  <CardContent className="p-3 sm:p-4 md:p-5 lg:p-6 text-center h-full flex flex-col justify-between">
                    
                    {/* Icon and Text Content */}
                    <div className="space-y-2 sm:space-y-3">
                      
                      {/* Icon - Responsive sizing */}
                      <div className="flex justify-center">
                        <IconComponent 
                          className={`w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 ${
                            state.color === 'mood-energetic' ? 'text-orange-500' : 
                            state.color === 'mood-focused' ? 'text-blue-500' : 
                            'text-green-500'
                          }`}
                          aria-hidden="true"
                        />
                      </div>
                      
                      {/* Title - Responsive sizing */}
                      <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-header-primary leading-tight">
                        {state.label}
                      </h3>
                      
                      {/* Description - Responsive sizing and adaptive visibility */}
                      <p className="text-sm sm:text-base md:text-lg text-body-text leading-relaxed 
                                   block sm:block md:block">
                        {state.description}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        </div>

        {/* Character Message - Responsive and Touch-Friendly */}
        <div className="text-center">
          <div className="inline-block bg-white rounded-xl p-3 sm:p-4 shadow-sm border border-indigo-100 max-w-md mx-auto">
            <div className="flex items-center justify-center gap-2 sm:gap-3">
              <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-indigo-600 flex-shrink-0" />
              <p className="text-sm sm:text-base text-indigo-800 font-medium leading-relaxed">
                "You can always come back and pick something different if your mood shifts."
              </p>
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