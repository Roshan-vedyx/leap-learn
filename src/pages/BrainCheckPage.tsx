// src/pages/BrainCheckPage.tsx - Updated to route to TodayIWantToPage with Lucide icons
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
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
  Rocket,
  Smile,
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
    label: 'Bouncy & Ready',
    icon: Zap,
    description: "I've got energy to spare and I'm ready to move!",
    color: 'mood-energetic', // Uses new card variant
    mood: 'energetic',
    encouragement: "Let's find you an action-packed adventure!"
  },
  {
    id: 'focused',
    label: 'Calm & Ready',
    icon: Target,
    description: "I'm feeling settled and ready to dive into a story.",
    color: 'mood-focused', // Uses new card variant
    mood: 'focused',
    encouragement: "Perfect! I have some great focused reading for you."
  },
  {
    id: 'tired',
    label: 'Sleepy Cozy',
    icon: Moon,
    description: "I'm feeling mellow and want something gentle.",
    color: 'mood-calm', // Uses new card variant
    mood: 'calm',
    encouragement: "Let's find something soothing and easy to follow."
  },
  {
    id: 'excited',
    label: 'Super Excited',
    icon: Sparkles,
    description: "I'm pumped up and ready for anything awesome!",
    color: 'mood-energetic', // Uses new card variant
    mood: 'energetic',
    encouragement: "Your enthusiasm is contagious! Let's go on an epic journey."
  },
  {
    id: 'overwhelmed',
    label: 'Need Some Calm',
    icon: Waves,
    description: "Things feel a bit much right now, I need gentle vibes.",
    color: 'calm', // Uses professional calm variant
    mood: 'calm',
    encouragement: "I've got you covered with something peaceful and stress-free."
  },
  {
    id: 'curious',
    label: 'Mystery Detective',
    icon: Search,
    description: "I want to explore and discover cool new things!",
    color: 'mood-focused', // Uses new card variant
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
    <div className="min-h-screen bg-white p-4">
      <div className="max-w-4xl mx-auto py-8">
        
        {/* Warm, Friendly Header */}
        <div className="text-center mb-8">
          <div className="flex justify-center gap-4 mb-4">
            <BookOpen className="w-16 h-16 text-indigo-600" />
            <Star className="w-16 h-16 text-purple-500" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-header-primary mb-4">
            What's Your Vibe Today?
          </h1>
          <p className="text-xl text-body-text leading-relaxed max-w-2xl mx-auto">
            Hey there, story explorer! Every day our brains feel different - sometimes bouncy, 
            sometimes chill, sometimes ready to focus. I just want to match you with a story 
            that feels right for YOUR brain today.
          </p>
          <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full text-indigo-800">
            <span className="text-sm font-medium">No wrong answers here!</span>
            <Smile className="w-5 h-5" />
          </div>
        </div>

        {/* Brain State Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {displayStates.map((state) => (
            <Card
              key={state.id}
              variant={state.color} // Now uses professional variants like 'mood-energetic'
              interactive="full"
              className={`
                cursor-pointer transition-all duration-200 h-full
                ${selectedState === state.id 
                  ? 'ring-4 ring-deep-ocean-blue ring-offset-2 scale-105' 
                  : 'hover:scale-102'
                }
              `}
              onClick={() => handleStateSelect(state.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedState === state.id}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleStateSelect(state.id)
                }
              }}
            >
              <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                <div className="mb-4 flex justify-center">
                  <state.icon 
                    className="w-16 h-16 text-indigo-600" 
                    aria-label={state.label}
                  />
                </div>
                <h3 className="text-xl font-semibold text-header-primary mb-3">
                  {state.label}
                </h3>
                <p className="text-body-text leading-relaxed text-base">
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
              className="text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 flex items-center gap-2"
            >
              <Eye className="w-4 h-4" /> See more options
            </Button>
          </div>
        )}

        {/* Selected State Encouragement */}
        {selectedBrainState && (
          <Card className="mb-8 bg-gradient-to-r from-indigo-50 to-purple-50 border-indigo-300 border-2 shadow-md">
            <CardContent className="p-6 text-center">
              <div className="flex justify-center mb-3">
                <selectedBrainState.icon className="w-12 h-12 text-indigo-600" />
              </div>
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
            className={`text-xl px-8 py-4 min-h-[56px] font-semibold transition-all duration-300 flex items-center gap-3 ${
              selectedState 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg hover:shadow-xl transform hover:-translate-y-1' 
                : 'bg-gray-300 text-gray-500'
            }`}
          >
            {selectedState ? (
              <>
                Next: What Do You Feel Like Doing? <Rocket className="w-5 h-5" />
              </>
            ) : (
              <>
                Choose your vibe first <Smile className="w-5 h-5" />
              </>
            )}
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
            <div className="flex justify-center mb-2">
              <Bot className="w-8 h-8 text-indigo-600" />
            </div>
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