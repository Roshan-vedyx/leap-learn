// src/pages/BrainCheckPage.tsx - Simplified for MVP
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSessionStore } from '@/stores/sessionStore'

// Brain state options for neurodivergent students
interface BrainState {
  id: string
  label: string
  emoji: string
  description: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
}

const brainStates: BrainState[] = [
  {
    id: 'energetic',
    label: 'Super Energetic',
    emoji: '⚡',
    description: "I have lots of energy and I'm ready to move around!",
    color: 'bg-yellow-100 border-yellow-400',
    mood: 'energetic'
  },
  {
    id: 'focused',
    label: 'Ready to Focus',
    emoji: '🎯',
    description: "I feel calm and ready to concentrate on reading.",
    color: 'bg-blue-100 border-blue-400',
    mood: 'focused'
  },
  {
    id: 'tired',
    label: 'A Little Tired',
    emoji: '😴',
    description: "I'm feeling sleepy or low energy today.",
    color: 'bg-purple-100 border-purple-400',
    mood: 'calm'
  },
  {
    id: 'excited',
    label: 'Excited to Learn',
    emoji: '🤩',
    description: "I'm pumped up and excited about stories!",
    color: 'bg-green-100 border-green-400',
    mood: 'energetic'
  },
  {
    id: 'overwhelmed',
    label: 'Feeling Overwhelmed',
    emoji: '🌊',
    description: "There's a lot going on and I need things to be calm.",
    color: 'bg-teal-100 border-teal-400',
    mood: 'calm'
  },
  {
    id: 'curious',
    label: 'Super Curious',
    emoji: '🔍',
    description: "I want to explore and discover new things!",
    color: 'bg-orange-100 border-orange-400',
    mood: 'focused'
  }
]

const BrainCheckPage: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [, setLocation] = useLocation()
  
  // Zustand store actions
  const { setBrainState, resetSession, currentBrainState } = useSessionStore()

  // Reset session when starting fresh
  useEffect(() => {
    resetSession()
  }, [resetSession])

  // Restore previous selection if available
  useEffect(() => {
    if (currentBrainState) {
      setSelectedState(currentBrainState.id)
    }
  }, [currentBrainState])

  const handleStateSelect = (stateId: string) => {
    setSelectedState(stateId)
    const brainState = brainStates.find(state => state.id === stateId)
    if (brainState) {
      setBrainState(brainState)
      
      // Announce selection for screen readers
      const announcement = `Selected ${brainState.label}. ${brainState.description}`
      const announcer = document.getElementById('accessibility-announcements')
      if (announcer) {
        announcer.textContent = announcement
      }
    }
  }

  const handleContinue = () => {
    if (selectedState) {
      // Navigate to story selection with state already stored
      setLocation('/interests')
    }
  }

  const selectedBrainState = brainStates.find(state => state.id === selectedState)

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-green-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            How's Your Brain Today?
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            Let's check in with how you're feeling so I can find the perfect story for your brain today! 
            There's no wrong answer - just pick what feels right.
          </p>
        </div>

        {/* Brain State Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {brainStates.map((state) => (
            <Card
              key={state.id}
              className={`
                cursor-pointer transition-all duration-200 h-full border-2
                ${selectedState === state.id 
                  ? 'ring-4 ring-primary ring-offset-2 scale-105 shadow-lg' 
                  : 'hover:scale-102 hover:shadow-md'
                }
                ${state.color}
              `}
              onClick={() => handleStateSelect(state.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedState === state.id}
              aria-label={`Select brain state: ${state.label}. ${state.description}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleStateSelect(state.id)
                }
              }}
            >
              <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                <div className="text-6xl mb-4" role="img" aria-label={state.label}>
                  {state.emoji}
                </div>
                <h3 className="text-xl font-semibold text-primary mb-3">
                  {state.label}
                </h3>
                <p className="text-muted-foreground leading-relaxed text-base">
                  {state.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Selected State Confirmation */}
        {selectedBrainState && (
          <Card className="mb-8 bg-card border-primary border-2 shadow-lg">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-primary">
                Perfect! Your brain is feeling {selectedBrainState.label.toLowerCase()} today
              </CardTitle>
              <CardDescription className="text-center text-lg text-muted-foreground">
                I'll find stories that match your energy level and help you have the best reading experience.
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedState}
            variant={selectedState ? "default" : "secondary"}
            size="lg"
            className="text-xl px-8 py-4 min-h-[56px]"
          >
            {selectedState ? "Let's Find Your Perfect Story! 📚" : "Pick How You're Feeling First"}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm leading-relaxed">
            Remember: You can change your mind anytime! This just helps me suggest the best stories for you right now.
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            This page helps you tell us how you're feeling today so we can recommend the right story for your mood and energy level.
            Choose one of the six options by clicking or pressing Enter. You can change your selection at any time.
          </p>
        </div>
      </div>
    </div>
  )
}

export default BrainCheckPage