// src/pages/WordInterestSelectionPage.tsx
import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { EmotionalCard } from '@/components/ui/Card'

// Word theme options
interface WordTheme {
  id: string
  label: string
  emoji: string
  description: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
}

const wordThemes: WordTheme[] = [
  {
    id: 'animals',
    label: 'Amazing Animals',
    emoji: '🐾',
    description: "Build words about cute and wild animals!",
    color: 'bg-green-100 border-green-400',
    mood: 'focused'
  },
  {
    id: 'space',
    label: 'Space Adventure',
    emoji: '🚀',
    description: "Explore the galaxy with space words!",
    color: 'bg-purple-100 border-purple-400',
    mood: 'energetic'
  },
  {
    id: 'food',
    label: 'Yummy Food',
    emoji: '🍕',
    description: "Discover delicious food words!",
    color: 'bg-orange-100 border-orange-400',
    mood: 'focused'
  },
  {
    id: 'vehicles',
    label: 'Cool Vehicles',
    emoji: '🚗',
    description: "Build words about cars, planes, and more!",
    color: 'bg-blue-100 border-blue-400',
    mood: 'energetic'
  }
]

const WordInterestSelectionPage: React.FC = () => {
  const [selectedTheme, setSelectedTheme] = useState<string | null>(null)
  const [, setLocation] = useLocation()

  const handleThemeSelect = (themeId: string) => {
    setSelectedTheme(themeId)
  }

  const handleContinue = () => {
    if (selectedTheme) {
      // Store the selected theme for the game
      localStorage.setItem('selected-word-theme', selectedTheme)
      // Navigate to word building game
      setLocation(`/word-building/${selectedTheme}`)
    }
  }

  const selectedThemeData = wordThemes.find(theme => theme.id === selectedTheme)

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
            patterns that make reading even more fun.
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
                ${selectedTheme === theme.id 
                  ? 'ring-4 ring-autism-primary ring-offset-2 scale-105' 
                  : 'hover:scale-102'
                }
                ${theme.color}
              `}
              onClick={() => handleThemeSelect(theme.id)}
              role="button"
              tabIndex={0}
              aria-pressed={selectedTheme === theme.id}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault()
                  handleThemeSelect(theme.id)
                }
              }}
            >
              <CardContent className="p-8 text-center h-full flex flex-col justify-center">
                <div className="text-8xl mb-6" role="img" aria-label={theme.label}>
                  {theme.emoji}
                </div>
                <h3 className="text-2xl font-semibold text-autism-primary mb-4">
                  {theme.label}
                </h3>
                <p className="text-autism-primary/80 leading-relaxed text-lg">
                  {theme.description}
                </p>
              </CardContent>
            </EmotionalCard>
          ))}
        </div>

        {/* Selected Theme Confirmation */}
        {selectedThemeData && (
          <Card className="mb-8 bg-autism-neutral border-autism-primary border-2 animate-calm-fade">
            <CardHeader>
              <CardTitle className="text-center text-2xl text-autism-primary">
                Perfect! Let's build {selectedThemeData.label.toLowerCase()} words! {selectedThemeData.emoji}
              </CardTitle>
              <CardDescription className="text-center text-lg text-autism-primary/80">
                Get ready to discover amazing patterns and become a word building champion!
              </CardDescription>
            </CardHeader>
          </Card>
        )}

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!selectedTheme}
            variant="celebration"
            size="comfortable"
            className="text-xl px-8 py-4"
          >
            {selectedTheme ? "Let's Start Building Words!" : "Pick Your Favorite Theme First"}
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-autism-primary/60 text-sm leading-relaxed">
            Don't worry about picking the "right" one - you can always come back and try different themes!
          </p>
        </div>

        {/* Preview of what they'll build */}
        {selectedThemeData && (
          <Card className="mt-8 bg-autism-calm-lavender border-autism-secondary">
            <CardHeader>
              <CardTitle className="text-center text-xl text-autism-primary">
                🔮 Sneak Peek: Words You'll Build
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-autism-primary/80 mb-4">Here are some of the cool words waiting for you:</p>
                <div className="flex flex-wrap justify-center gap-3">
                  {/* Show sample words based on theme */}
                  {selectedTheme === 'animals' && (
                    <>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">CAT</span>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">ELEPHANT</span>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">TIGER</span>
                    </>
                  )}
                  {selectedTheme === 'space' && (
                    <>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">ROCKET</span>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">PLANET</span>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">GALAXY</span>
                    </>
                  )}
                  {selectedTheme === 'food' && (
                    <>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">PIZZA</span>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">COOKIE</span>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">BANANA</span>
                    </>
                  )}
                  {selectedTheme === 'vehicles' && (
                    <>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">AIRPLANE</span>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">MOTORCYCLE</span>
                      <span className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm">SUBMARINE</span>
                    </>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            This page helps you choose what type of words you want to practice building.
            Choose one of the four theme options by clicking or pressing Enter. Each theme
            contains words at different difficulty levels that you'll learn to build step by step.
          </p>
        </div>
      </div>
    </div>
  )
}

export default WordInterestSelectionPage