// src/components/onboarding/OnboardingSystem.tsx
import React, { useState, useEffect } from 'react'
import { X, Heart, Settings, Volume2, ArrowRight, ArrowLeft, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

// Types
interface OnboardingProps {
  onTtsAccentChange: (accent: 'US' | 'GB' | 'IN') => void
  onShowSettings: () => void
  calmCornerActive: boolean
  onCalmCornerToggle: () => void
  speakText?: (text: string, accent: 'US' | 'GB' | 'IN') => Promise<void>
}

interface OnboardingState {
  showNotification: boolean
  currentFeature: number | null // null = not started, 0-2 = feature index
  dismissed: boolean
}

// Features to showcase
const FEATURES = [
  {
    id: 'tts-accent',
    title: 'Change My Voice',
    description: 'I can read to you in different accents! Try them out.',
    icon: Volume2
  },
  {
    id: 'calm-corner',
    title: 'Calm Corner',
    description: 'Need a break? This special place helps you feel better.',
    icon: Heart
  },
  {
    id: 'sienna',
    title: 'Reading Help',
    description: 'Extra tools to make reading easier if you need them.',
    icon: Settings
  }
]

export const OnboardingSystem: React.FC<OnboardingProps> = ({
  onTtsAccentChange,
  onShowSettings,
  calmCornerActive,
  onCalmCornerToggle,
  speakText
}) => {
  const [state, setState] = useState<OnboardingState>({
    showNotification: false,
    currentFeature: null,
    dismissed: false
  })

  const [selectedAccent, setSelectedAccent] = useState<'US' | 'GB' | 'IN'>('GB')

  // Check if user should see onboarding
  useEffect(() => {
    const checkOnboardingStatus = () => {
      const onboardingDismissed = localStorage.getItem('onboarding-dismissed')
      const onboardingCompleted = localStorage.getItem('onboarding-completed')
      const appOpenCount = parseInt(localStorage.getItem('app-open-count') || '0')
      
      // Increment open count
      const newOpenCount = appOpenCount + 1
      localStorage.setItem('app-open-count', newOpenCount.toString())
      
      // Show onboarding for first 2 app opens (unless dismissed/completed)
      if (newOpenCount <= 2 && !onboardingDismissed && !onboardingCompleted) {
        setTimeout(() => {
          setState(prev => ({ ...prev, showNotification: true }))
        }, 3000)
      }
    }

    checkOnboardingStatus()
  }, [])

  // Handle notification actions
  const handleStartOnboarding = () => {
    setState(prev => ({ 
      ...prev, 
      showNotification: false, 
      currentFeature: 0 
    }))
  }

  const handleDismissNotification = () => {
    localStorage.setItem('onboarding-dismissed', 'true')
    setState(prev => ({ 
      ...prev, 
      showNotification: false, 
      dismissed: true 
    }))
  }

  const handleSkipAll = () => {
    localStorage.setItem('onboarding-completed', 'true')
    setState(prev => ({ 
      ...prev, 
      currentFeature: null 
    }))
  }

  // Navigate through features
  const handleNextFeature = () => {
    setState(prev => {
      const nextFeature = prev.currentFeature !== null ? prev.currentFeature + 1 : 0
      
      if (nextFeature >= FEATURES.length) {
        // Completed onboarding
        localStorage.setItem('onboarding-completed', 'true')
        return { ...prev, currentFeature: null }
      }
      
      return { ...prev, currentFeature: nextFeature }
    })
  }

  const handlePrevFeature = () => {
    setState(prev => ({
      ...prev,
      currentFeature: prev.currentFeature !== null && prev.currentFeature > 0 
        ? prev.currentFeature - 1 
        : null
    }))
  }

  // Handle TTS accent change with preview using your existing TTS system
  const handleAccentChange = async (accent: 'US' | 'GB' | 'IN') => {
    setSelectedAccent(accent)
    onTtsAccentChange(accent)
    
    // Use your existing TTS function if provided, otherwise fallback
    if (speakText) {
      try {
        await speakText("Hello! This is how I sound.", accent)
      } catch (error) {
        console.warn('TTS preview failed:', error)
      }
    } else {
      // Fallback to basic speech synthesis
      if ('speechSynthesis' in window) {
        const utterance = new SpeechSynthesisUtterance("Hello! This is how I sound.")
        speechSynthesis.speak(utterance)
      }
    }
  }

  // Notification Bar Component
  const NotificationBar = () => (
    <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-r from-amber-50 to-yellow-50 border-b border-amber-200 shadow-md">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 sm:py-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 sm:gap-6">
          {/* Left section - Icon and message */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-amber-100 rounded-full flex items-center justify-center flex-shrink-0">
              <Heart className="w-5 h-5 sm:w-6 sm:h-6 text-amber-600" />
            </div>
            <div className="min-w-0">
              <div className="text-base sm:text-lg font-semibold text-gray-800 mb-1">
                👋 New here? 
              </div>
              <div className="text-sm sm:text-base text-gray-600 leading-relaxed">
                We have some comfort features that might help make this easier for you!
              </div>
            </div>
          </div>
          
          {/* Right section - Buttons */}
          <div className="flex items-center gap-3 w-full sm:w-auto flex-shrink-0">
            <Button
              onClick={handleStartOnboarding}
              className="bg-amber-500 hover:bg-amber-600 text-white px-6 py-2.5 font-medium rounded-lg shadow-sm min-h-[44px] whitespace-nowrap"
            >
              Show me around
            </Button>
            <Button
              onClick={handleDismissNotification}
              variant="outline"
              className="text-gray-600 hover:text-gray-700 border-gray-300 hover:border-gray-400 px-5 py-2.5 rounded-lg min-h-[44px] whitespace-nowrap min-w-[140px]"
            >
              I'll explore myself
            </Button>
            <Button
              onClick={handleDismissNotification}
              variant="ghost"
              size="icon"
              className="text-gray-400 hover:text-gray-600 hover:bg-gray-100 w-10 h-10 rounded-lg flex-shrink-0"
              aria-label="Dismiss notification"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  // TTS Feature Showcase
  const TtsFeatureShowcase = () => (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Volume2 className="w-6 h-6 text-blue-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Change My Voice</h3>
          <p className="text-gray-600">I can read to you in different accents! Try them out.</p>
        </div>

        <div className="space-y-3 mb-6">
          {['US', 'GB', 'IN'].map((accent) => (
            <button
              key={accent}
              onClick={() => handleAccentChange(accent as 'US' | 'GB' | 'IN')}
              className={`w-full p-3 rounded-lg border-2 text-left transition-all ${
                selectedAccent === accent
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 hover:border-blue-300'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">
                  {accent === 'US' ? '🇺🇸' : accent === 'GB' ? '🇬🇧' : '🇮🇳'}
                </span>
                <div>
                  <div className="font-medium">
                    {accent === 'US' ? 'American' : accent === 'GB' ? 'British' : 'Indian'} English
                  </div>
                  <div className="text-sm text-gray-500">Click to hear how I sound</div>
                </div>
                {selectedAccent === accent && (
                  <CheckCircle className="w-5 h-5 text-blue-600 ml-auto" />
                )}
              </div>
            </button>
          ))}
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handlePrevFeature}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNextFeature}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleSkipAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip remaining features
          </button>
        </div>
      </div>
    </div>
  )

  // Calm Corner Feature Showcase
  const CalmCornerShowcase = () => (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-pink-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6 text-pink-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Calm Corner</h3>
          <p className="text-gray-600">Need a break? This special place helps you feel better.</p>
        </div>

        <div className="bg-gradient-to-br from-pink-50 to-purple-50 rounded-lg p-4 mb-6 text-center">
          <div className="text-4xl mb-2">🌸</div>
          <p className="text-sm text-gray-600 mb-4">
            The Calm Corner has breathing exercises, gentle sounds, and activities to help when you feel overwhelmed.
          </p>
          
          <Button
            onClick={onCalmCornerToggle}
            className={`w-full ${
              calmCornerActive 
                ? 'bg-pink-200 text-pink-800 border-pink-300' 
                : 'bg-pink-100 hover:bg-pink-200 text-pink-700'
            }`}
            variant="outline"
          >
            <Heart className="w-4 h-4 mr-2" />
            {calmCornerActive ? 'Close Calm Corner' : 'Try Calm Corner'}
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handlePrevFeature}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={handleNextFeature}
            className="flex-1 bg-blue-600 hover:bg-blue-700"
          >
            Next
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        </div>

        <div className="mt-4 text-center">
          <button
            onClick={handleSkipAll}
            className="text-sm text-gray-500 hover:text-gray-700"
          >
            Skip remaining features
          </button>
        </div>
      </div>
    </div>
  )

  // Sienna Feature Showcase
  const SiennaShowcase = () => (
    <div className="fixed inset-0 z-50 bg-black/20 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl max-w-md w-full p-6 relative">
        <div className="text-center mb-6">
          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Settings className="w-6 h-6 text-green-600" />
          </div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">Reading Help Tools</h3>
          <p className="text-gray-600">Extra tools to make reading easier if you need them.</p>
        </div>

        <div className="bg-gradient-to-br from-green-50 to-blue-50 rounded-lg p-4 mb-6 text-center">
          <div className="text-4xl mb-2">🛠️</div>
          <p className="text-sm text-gray-600 mb-4">
            These tools can help with reading by changing colors, fonts, spacing, and more. 
            You can find them in Settings whenever you need them.
          </p>
          
          <Button
            onClick={onShowSettings}
            className="w-full bg-green-100 hover:bg-green-200 text-green-700"
            variant="outline"
          >
            <Settings className="w-4 h-4 mr-2" />
            Open Settings to See More
          </Button>
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handlePrevFeature}
            variant="outline"
            className="flex-1"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back
          </Button>
          <Button
            onClick={() => {
              localStorage.setItem('onboarding-completed', 'true')
              setState(prev => ({ ...prev, currentFeature: null }))
            }}
            className="flex-1 bg-green-600 hover:bg-green-700"
          >
            All Done! 🎉
          </Button>
        </div>
      </div>
    </div>
  )

  // Don't render anything if dismissed or completed
  if (state.dismissed) return null

  return (
    <>
      {/* Notification Bar */}
      {state.showNotification && <NotificationBar />}
      
      {/* Feature Showcases */}
      {state.currentFeature === 0 && <TtsFeatureShowcase />}
      {state.currentFeature === 1 && <CalmCornerShowcase />}
      {state.currentFeature === 2 && <SiennaShowcase />}
    </>
  )
}