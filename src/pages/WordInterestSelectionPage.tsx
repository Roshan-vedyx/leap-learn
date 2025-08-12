// src/pages/WordInterestSelectionPage.tsx - Viewport Optimized 2x2 Grid
import React from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent } from '@/components/ui/Card'
import { EmotionalCard } from '@/components/ui/Card'
import { PawPrint, Rocket, Pizza, Car } from 'lucide-react'

// Word theme options with Lucide icons
interface WordTheme {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
}

const wordThemes: WordTheme[] = [
  {
    id: 'animals',
    label: 'Amazing Animals',
    icon: PawPrint,
    description: "Build words about cute and wild animals!",
    color: 'bg-green-100 border-green-400',
    mood: 'focused'
  },
  {
    id: 'space',
    label: 'Space Adventure',
    icon: Rocket,
    description: "Explore the galaxy with space words!",
    color: 'bg-purple-100 border-purple-400',
    mood: 'energetic'
  },
  {
    id: 'food',
    label: 'Yummy Food',
    icon: Pizza,
    description: "Discover delicious food words!",
    color: 'bg-orange-100 border-orange-400',
    mood: 'focused'
  },
  {
    id: 'vehicles',
    label: 'Cool Vehicles',
    icon: Car,
    description: "Build words about cars, planes, and more!",
    color: 'bg-blue-100 border-blue-400',
    mood: 'energetic'
  }
]

const WordInterestSelectionPage: React.FC = () => {
  const [, setLocation] = useLocation()

  const handleThemeClick = (theme: WordTheme) => {
    // Store the selected theme for the game
    localStorage.setItem('selected-word-theme', theme.id)
    // Navigate to word building game
    setLocation(`/word-building/${theme.id}`)
  }

  return (
    <div className="page-container bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky">
      <div className="container">
        <div className="content-area">
          
          {/* Compact Header */}
          <div className="text-center pt-2 pb-4">
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-autism-primary mb-3">
              What Words Do You Want to Build?
            </h1>
            <p className="text-base md:text-lg text-autism-primary/80 leading-relaxed max-w-3xl mx-auto">
              Pick a theme that excites you! We'll build awesome words together and you'll discover 
              patterns that make reading even more fun.
            </p>
          </div>

          {/* Theme Selection Grid - 2x2 Layout */}
          <div className="flex-1 flex items-center justify-center">
            <div className="grid grid-cols-2 gap-3 md:gap-4 lg:gap-6 w-full max-w-4xl">
              {wordThemes.map((theme) => (
                <EmotionalCard
                  key={theme.id}
                  mood={theme.mood}
                  interactive="full"
                  className={`
                    cursor-pointer transition-all duration-300 h-full
                    hover:scale-102 hover:shadow-xl
                    ${theme.color}
                  `}
                  onClick={() => handleThemeClick(theme)}
                  role="button"
                  tabIndex={0}
                  aria-label={`Start word building with ${theme.label} - ${theme.description}`}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault()
                      handleThemeClick(theme)
                    }
                  }}
                >
                  <CardContent className="p-3 md:p-4 lg:p-6 h-full flex flex-col justify-center">
                    
                    {/* Icon and Title - Perfectly Aligned */}
                    <div className="text-center">
                      <div className="flex flex-col items-center justify-center space-y-2 md:space-y-3">
                        <div className="bg-white/50 rounded-full p-2 md:p-3">
                          <theme.icon className="w-6 h-6 md:w-8 md:h-8 lg:w-10 lg:h-10 text-autism-primary" />
                        </div>
                        <h3 className="text-sm md:text-base lg:text-xl font-semibold text-autism-primary leading-tight">
                          {theme.label}
                        </h3>
                      </div>
                    </div>

                    {/* Description */}
                    <div className="text-center mt-2 md:mt-3">
                      <p className="text-xs md:text-sm lg:text-base text-autism-primary/80 leading-relaxed">
                        {theme.description}
                      </p>
                    </div>

                  </CardContent>
                </EmotionalCard>
              ))}
            </div>
          </div>

          {/* Compact Footer Message */}
          <div className="text-center pt-3 pb-2">
            <p className="text-sm md:text-base text-autism-primary/60 leading-relaxed">
              Don't worry about picking the "right" one - you can always come back and try different themes!
            </p>
          </div>

        </div>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          This page helps you choose what type of words you want to practice building.
          Choose one of the four theme options by clicking or pressing Enter. Each theme
          contains words at different difficulty levels that you'll learn to build step by step.
          Click on any tile to start building words immediately.
        </p>
      </div>
    </div>
  )
}

export default WordInterestSelectionPage