// src/pages/WordInterestSelectionPage.tsx
import React from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { EmotionalCard } from '@/components/ui/Card'

// Word theme options
interface WordTheme {
  id: string
  label: string
  emoji: string
  description: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
  sampleWords: string[]
}

const wordThemes: WordTheme[] = [
  {
    id: 'animals',
    label: 'Amazing Animals',
    emoji: '🐾',
    description: "Build words about cute and wild animals!",
    color: 'bg-green-100 border-green-400',
    mood: 'focused',
    sampleWords: ['CAT', 'ELEPHANT', 'TIGER']
  },
  {
    id: 'space',
    label: 'Space Adventure',
    emoji: '🚀',
    description: "Explore the galaxy with space words!",
    color: 'bg-purple-100 border-purple-400',
    mood: 'energetic',
    sampleWords: ['ROCKET', 'PLANET', 'GALAXY']
  },
  {
    id: 'food',
    label: 'Yummy Food',
    emoji: '🍕',
    description: "Discover delicious food words!",
    color: 'bg-orange-100 border-orange-400',
    mood: 'focused',
    sampleWords: ['PIZZA', 'COOKIE', 'BANANA']
  },
  {
    id: 'vehicles',
    label: 'Cool Vehicles',
    emoji: '🚗',
    description: "Build words about cars, planes, and more!",
    color: 'bg-blue-100 border-blue-400',
    mood: 'energetic',
    sampleWords: ['AIRPLANE', 'MOTORCYCLE', 'SUBMARINE']
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
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-autism-primary mb-4">
            What Words Do You Want to Build?
          </h1>
          <p className="text-xl text-autism-primary/80 leading-relaxed max-w-2xl mx-auto">
            Pick a theme that excites you! We'll build awesome words together and you'll discover 
            patterns that make reading even more fun. Just click on your choice to get started!
          </p>
        </div>

        {/* Theme Selection Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {wordThemes.map((theme) => (
            <EmotionalCard
              key={theme.id}
              mood={theme.mood}
              interactive="full"
              className={`
                cursor-pointer transition-all duration-200 h-full
                hover:scale-105 hover:shadow-lg
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
              <CardContent className="p-8 h-full flex flex-col">
                <div className="text-center flex-1 flex flex-col justify-center">
                  <div className="text-8xl mb-6" role="img" aria-label={theme.label}>
                    {theme.emoji}
                  </div>
                  <h3 className="text-2xl font-semibold text-autism-primary mb-4">
                    {theme.label}
                  </h3>
                  <p className="text-autism-primary/80 leading-relaxed text-lg mb-6">
                    {theme.description}
                  </p>

                  {/* Sample Words Preview */}
                  <div className="bg-white/50 rounded-lg p-4 mb-4">
                    <p className="text-sm text-autism-primary/70 mb-2">
                      <strong>Sample words you'll build:</strong>
                    </p>
                    <div className="flex flex-wrap justify-center gap-2">
                      {theme.sampleWords.map((word, index) => (
                        <span 
                          key={index}
                          className="bg-autism-secondary text-gray-800 px-3 py-1 rounded-full text-sm font-semibold"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Click indicator */}
                <div className="text-center pt-4 border-t border-autism-primary/20">
                  <p className="text-sm text-autism-primary/70 font-semibold">
                    Click to start building! 🔧
                  </p>
                </div>
              </CardContent>
            </EmotionalCard>
          ))}
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-autism-primary/60 text-sm leading-relaxed">
            Don't worry about picking the "right" one - you can always come back and try different themes!
          </p>
        </div>

        {/* Fun Fact */}
        <Card className="mt-8 bg-autism-calm-lavender border-autism-secondary">
          <CardHeader>
            <CardTitle className="text-center text-xl text-autism-primary">
              🧠 Word Building Magic
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-center">
              <p className="text-autism-primary/80 leading-relaxed">
                When you build words piece by piece, you're training your brain to see patterns that make 
                reading faster and easier. It's like learning the secret code of language!
              </p>
            </div>
          </CardContent>
        </Card>

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
    </div>
  )
}

export default WordInterestSelectionPage