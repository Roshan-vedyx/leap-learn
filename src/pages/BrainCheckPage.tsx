// src/pages/BrainCheckPage.tsx - Updated to route to TodayIWantToPage
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Brain state options redesigned for warmth and relatability
interface BrainState {
  id: string
  label: string
  emoji: string
  description: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
  encouragement: string
}

const brainStates: BrainState[] = [
  {
    id: 'energetic',
    label: 'Bouncy & Ready',
    emoji: '⚡',
    description: "I've got energy to spare and I'm ready to move!",
    color: 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-300',
    mood: 'energetic',
    encouragement: "Let's find you an action-packed adventure!"
  },
  {
    id: 'focused',
    label: 'Calm & Ready',
    emoji: '🎯',
    description: "I'm feeling settled and ready to dive into a story.",
    color: 'bg-gradient-to-br from-blue-50 to-indigo-100 border-blue-300',
    mood: 'focused',
    encouragement: "Perfect! I have some great focused reading for you."
  },
  {
    id: 'tired',
    label: 'Sleepy Cozy',
    emoji: '🌙',
    description: "I'm feeling mellow and want something gentle.",
    color: 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-300',
    mood: 'calm',
    encouragement: "Let's find something soothing and easy to follow."
  },
  {
    id: 'excited',
    label: 'Super Excited',
    emoji: '🤩',
    description: "I'm pumped up and ready for anything awesome!",
    color: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300',
    mood: 'energetic',
    encouragement: "Your enthusiasm is contagious! Let's go on an epic journey."
  },
  {
    id: 'overwhelmed',
    label: 'Need Some Calm',
    emoji: '🌊',
    description: "Things feel a bit much right now, I need gentle vibes.",
    color: 'bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-300',
    mood: 'calm',
    encouragement: "I've got you covered with something peaceful and stress-free."
  },
  {
    id: 'curious',
    label: 'Mystery Detective',
    emoji: '🔍',
    description: "I want to explore and discover cool new things!",
    color: 'bg-gradient-to-br from-orange-50 to-amber-100 border-orange-300',
    mood: 'focused',
    encouragement: "Excellent! I know some stories with amazing discoveries."
  }
]

const BrainCheckPage: React.FC = () => {
  const [selectedState, setSelectedState] = useState<string | null>(null)
  const [showAllOptions, setShowAllOptions] = useState(false)
  const [, setLocation] = useLocation()

  // Reset any previous session data when starting fresh
  useEffect(() => {
    localStorage.removeItem('current-brain-state')
    localStorage.removeItem('today-choice')
  }, [])

  const handleStateSelect = (stateId: string) => {
    setSelectedState(stateId)
    const brainState = brainStates.find(state => state.id === stateId)
    if (brainState) {
      // Store brain state for use throughout the session
      localStorage.setItem('current-brain-state', JSON.stringify(brainState))
      
      // Announce selection for screen readers
      const announcement = `Selected ${brainState.label}. ${brainState.encouragement}`
      const announcer = document.getElementById('accessibility-announcements')
      if (announcer) {
        announcer.textContent = announcement
      }
    }
  }

  const handleContinue = () => {
    if (selectedState) {
      // Navigate to the "Today I Want To" page instead of directly to story
      setLocation('/today-i-want-to')
    }
  }

  const selectedBrainState = brainStates.find(state => state.id === selectedState)

  // Progressive disclosure - show 3 main categories first
  const primaryStates = brainStates.filter(state => 
    ['focused', 'energetic', 'overwhelmed'].includes(state.id)
  )
  const displayStates = showAllOptions ? brainStates : primaryStates

  return (
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Warm, Friendly Header */}
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">📚✨</div>
          <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">
            What's Your Vibe Today?
          </h1>
          <p className="text-xl text-indigo-700 leading-relaxed max-w-2xl mx-auto mb-6">
            Hey there, story explorer! Every day our brains feel different - sometimes bouncy, 
            sometimes chill, sometimes ready to focus. I just want to match you with a story 
            that feels right for YOUR brain today.
          </p>
          <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full text-indigo-800">
            <span className="text-sm font-medium">No wrong answers here!</span>
            <span className="text-lg">😊</span>
          </div>
        </div>

        {/* Brain State Selection - Progressive Disclosure */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {displayStates.map((state) => (
            <Card
              key={state.id}
              className={`
                cursor-pointer transition-all duration-300 h-full border-2 overflow-hidden
                ${selectedState === state.id 
                  ? 'border-indigo-400 shadow-lg transform scale-105 ring-2 ring-indigo-200' 
                  : 'hover:scale-102 hover:shadow-md border-gray-200'
                }
                ${state.color}
              `}
              onClick={() => handleStateSelect(state.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedState === state.id}
              aria-label={`Choose ${state.label}: ${state.description}`}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleStateSelect(state.id)
                }
              }}
            >
              <CardContent className="p-6 text-center h-full flex flex-col justify-center relative">
                {/* Selection Indicator */}
                {selectedState === state.id && (
                  <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    ✓
                  </div>
                )}
                
                <div className="text-5xl mb-4" role="img" aria-label={state.label}>
                  {state.emoji}
                </div>
                <h3 className="text-xl font-bold text-indigo-900 mb-3">
                  {state.label}
                </h3>
                <p className="text-indigo-700 leading-relaxed text-base">
                  {state.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Show More Options Button */}
        {!showAllOptions && (
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setShowAllOptions(true)}
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50"
            >
              🔍 See more options
            </Button>
          </div>
        )}

        {/* Selected State Encouragement */}
        {selectedBrainState && (
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 border-2 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="text-4xl mb-3">{selectedBrainState.emoji}</div>
              <h3 className="text-2xl font-bold text-indigo-900 mb-3">
                {selectedBrainState.encouragement}
              </h3>
              <p className="text-indigo-700 text-lg">
                I love that you're feeling <strong>{selectedBrainState.label.toLowerCase()}</strong> today. 
                Let's see what kind of activities sound interesting to you!
              </p>
            </CardContent>
          </Card>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedState}
            variant={selectedState ? "default" : "secondary"}
            size="lg"
            className={`text-xl px-8 py-4 min-h-[56px] font-semibold transition-all duration-300 ${
              selectedState 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            {selectedState ? "Next: What Do You Feel Like Doing? 🚀" : "Choose your vibe first 😊"}
          </Button>
        </div>

        {/* Reassuring Footer */}
        <div className="text-center mt-8 space-y-2">
          <p className="text-indigo-600 text-sm leading-relaxed">
            Your brain changes throughout the day, and that's totally normal! 
          </p>
          <p className="text-indigo-500 text-xs">
            You can always come back and pick a different vibe if you want.
          </p>
        </div>

        {/* Character Message */}
        <div className="mt-12 text-center">
          <div className="inline-block bg-white rounded-2xl p-6 shadow-sm border border-indigo-100 max-w-md">
            <div className="text-3xl mb-2">🤖</div>
            <p className="text-sm text-indigo-800 font-medium">
              "Hi! I'm your learning buddy. I'm here to help you find activities that feel just right 
              for however your amazing brain is working today!"
            </p>
          </div>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            This page helps you choose how you're feeling today so we can recommend activities 
            that match your mood and energy level. Pick one of the feeling options by clicking 
            or pressing Enter. This is just to help - there are no wrong choices and you can 
            change your mind anytime.
          </p>
        </div>

        {/* Hidden announcements area for screen readers */}
        <div id="accessibility-announcements" className="sr-only" aria-live="polite"></div>
      </div>
    </div>
  )
}

export default BrainCheckPage