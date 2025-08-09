import React from 'react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { ComplexityLevel } from '@/types'

interface ComplexitySwitchProps {
  currentLevel: ComplexityLevel
  onLevelChange: (level: ComplexityLevel) => void
  disabled?: boolean
  showDescription?: boolean
}

const complexityConfig = {
  simple: { 
    label: 'Simpler', 
    emoji: '🌱', 
    description: 'Shorter sentences, easier words',
    color: 'bg-green-50 border-green-200',
    buttonVariant: 'outline' as const
  },
  full: { 
    label: 'Just Right', 
    emoji: '🎯', 
    description: 'Standard complexity, perfect balance',
    color: 'bg-blue-50 border-blue-200',
    buttonVariant: 'outline' as const
  },
  challenge: { 
    label: 'Challenge Me', 
    emoji: '🚀', 
    description: 'Rich vocabulary, complex ideas',
    color: 'bg-purple-50 border-purple-200',
    buttonVariant: 'outline' as const
  }
}

const ComplexitySwitch: React.FC<ComplexitySwitchProps> = ({
  currentLevel,
  onLevelChange,
  disabled = false,
  showDescription = true
}) => {
  
  const handleLevelChange = (level: ComplexityLevel) => {
    if (!disabled) {
      onLevelChange(level)
    }
  }

  return (
    <Card className="bg-white border-autism-secondary border-2">
      <CardContent className="p-4">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          {showDescription && (
            <div>
              <h3 className="font-semibold text-autism-primary mb-1">
                Reading Level
              </h3>
              <p className="text-sm text-autism-primary/70">
                Switch anytime to match how you're feeling
              </p>
            </div>
          )}
          
          <div className="flex gap-2">
            {(Object.keys(complexityConfig) as ComplexityLevel[]).map((level) => {
              const config = complexityConfig[level]
              const isActive = currentLevel === level
              
              return (
                <Button
                  key={level}
                  variant={isActive ? 'celebration' : 'outline'}
                  size="comfortable"
                  onClick={() => handleLevelChange(level)}
                  disabled={disabled}
                  className={`
                    flex flex-col items-center p-3 h-auto min-w-[80px]
                    ${isActive ? 'transform scale-105 shadow-lg' : 'hover:scale-105'}
                    ${disabled ? 'opacity-50 cursor-not-allowed' : ''}
                    transition-all duration-200
                  `}
                  aria-pressed={isActive}
                  aria-label={`Switch to ${config.label} level: ${config.description}`}
                >
                  <span className="text-lg mb-1">{config.emoji}</span>
                  <span className="text-sm font-medium">{config.label}</span>
                </Button>
              )
            })}
          </div>
        </div>
        
        {/* Current Level Description */}
        {showDescription && (
          <div className="mt-4 text-center">
            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-full ${complexityConfig[currentLevel].color}`}>
              <span>{complexityConfig[currentLevel].emoji}</span>
              <span className="text-sm font-medium text-autism-primary">
                {complexityConfig[currentLevel].description}
              </span>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default ComplexitySwitch