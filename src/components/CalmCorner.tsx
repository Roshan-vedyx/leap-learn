// src/components/CalmCorner.tsx
import React, { useState } from 'react'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSessionStore } from '@/stores/sessionStore'

interface CalmCornerProps {
  className?: string
}

const CalmCorner: React.FC<CalmCornerProps> = ({ className = '' }) => {
  const { isInCalmCorner, toggleCalmCorner } = useSessionStore()
  const [breathingStep, setBreathingStep] = useState<'inhale' | 'hold' | 'exhale'>('inhale')
  const [isBreathing, setIsBreathing] = useState(false)

  const startBreathingExercise = () => {
    setIsBreathing(true)
    // Simple 4-4-4 breathing pattern
    const breathingCycle = () => {
      setBreathingStep('inhale')
      setTimeout(() => setBreathingStep('hold'), 4000)
      setTimeout(() => setBreathingStep('exhale'), 8000)
      setTimeout(() => {
        if (isBreathing) breathingCycle()
      }, 12000)
    }
    breathingCycle()
  }

  const stopBreathing = () => {
    setIsBreathing(false)
    setBreathingStep('inhale')
  }

  if (!isInCalmCorner) {
    return (
      <Button
        variant="calm"
        size="sm"
        onClick={toggleCalmCorner}
        className={`fixed top-4 right-4 z-50 bg-autism-calm-mint hover:bg-autism-calm-sky border-2 border-autism-primary shadow-lg ${className}`}
        aria-label="Open calm corner for break"
      >
        🕊️ Calm Corner
      </Button>
    )
  }

  return (
    <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-autism-calm-mint border-2 border-autism-primary animate-calm-fade">
        <CardContent className="p-8 text-center">
          <h2 className="text-2xl font-bold text-autism-primary mb-6">
            🕊️ Your Calm Corner
          </h2>
          
          <div className="space-y-6">
            <p className="text-autism-primary/80 leading-relaxed">
              Take a moment to breathe and reset. You're doing great!
            </p>

            {/* Breathing Exercise */}
            <div className="bg-white rounded-lg p-6 border border-autism-primary/20">
              <h3 className="text-lg font-semibold text-autism-primary mb-4">
                Breathing Exercise
              </h3>
              
              {!isBreathing ? (
                <Button
                  variant="celebration"
                  onClick={startBreathingExercise}
                  className="mb-4"
                >
                  🫁 Start Breathing
                </Button>
              ) : (
                <div className="space-y-4">
                  <div className="text-3xl font-bold text-autism-primary">
                    {breathingStep === 'inhale' && '💨 Breathe In...'}
                    {breathingStep === 'hold' && '⏸️ Hold...'}
                    {breathingStep === 'exhale' && '💨 Breathe Out...'}
                  </div>
                  
                  <div className={`w-20 h-20 mx-auto rounded-full bg-autism-secondary transition-all duration-4000 ${
                    breathingStep === 'inhale' ? 'scale-125' :
                    breathingStep === 'hold' ? 'scale-125' : 'scale-100'
                  }`} />
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={stopBreathing}
                  >
                    Stop
                  </Button>
                </div>
              )}
            </div>

            {/* Quick Options */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                variant="calm"
                size="comfortable"
                className="text-sm"
                onClick={() => {
                  // Could integrate with audio utils for calming sounds
                  console.log('Playing calming sounds...')
                }}
              >
                🎵 Calm Sounds
              </Button>
              
              <Button
                variant="calm"
                size="comfortable"
                className="text-sm"
                onClick={() => {
                  // Could show accessibility options
                  console.log('Adjusting settings...')
                }}
              >
                ⚙️ Adjust Settings
              </Button>
            </div>

            {/* Return Button */}
            <Button
              variant="celebration"
              size="comfortable"
              onClick={toggleCalmCorner}
              className="w-full text-lg"
            >
              ✨ I'm Ready to Continue
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default CalmCorner