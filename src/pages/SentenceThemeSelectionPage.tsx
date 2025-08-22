// src/pages/SentenceThemeSelectionPage.tsx
import React from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent } from '@/components/ui/Card'
import { EmotionalCard } from '@/components/ui/Card'
import { PawPrint, Rocket, Pizza, Car } from 'lucide-react'

interface SentenceTheme {
  id: string
  label: string
  icon: React.ComponentType<{ className?: string }>
  description: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
}

const sentenceThemes: SentenceTheme[] = [
  {
    id: 'animals',
    label: 'Amazing Animals',
    icon: PawPrint,
    description: "Build sentences about cute and wild animals!",
    color: 'bg-green-100 border-green-400',
    mood: 'focused'
  },
  {
    id: 'space',
    label: 'Space Adventure',
    icon: Rocket,
    description: "Create sentences about rockets and planets!",
    color: 'bg-purple-100 border-purple-400',
    mood: 'energetic'
  },
  {
    id: 'food',
    label: 'Yummy Food',
    icon: Pizza,
    description: "Build sentences about delicious meals!",
    color: 'bg-orange-100 border-orange-400',
    mood: 'focused'
  },
  {
    id: 'vehicles',
    label: 'Cool Vehicles',
    icon: Car,
    description: "Create sentences about cars, planes, and more!",
    color: 'bg-blue-100 border-blue-400',
    mood: 'energetic'
  }
]

const SentenceThemeSelectionPage: React.FC = () => {
  const [, setLocation] = useLocation()

  const handleThemeClick = (theme: SentenceTheme) => {
    localStorage.setItem('selected-sentence-theme', theme.id)
    setLocation(`/sentence-building/${theme.id}`)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky">
      {/* Mobile-optimized container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="min-h-screen flex flex-col py-4 sm:py-6 lg:py-8">
          
          {/* Header - Mobile responsive */}
          <div className="text-center mb-6 sm:mb-8 px-2">
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-autism-primary mb-3 sm:mb-4 leading-tight">
              What Sentences Do You Want to Build?
            </h1>
            <p className="text-sm sm:text-base md:text-lg text-autism-primary/80 leading-relaxed max-w-2xl mx-auto px-2">
              Pick a theme that excites you! We'll build awesome sentences together using words you already know.
            </p>
          </div>

          {/* Theme Grid - Responsive layout */}
          <div className="flex-1 flex items-center justify-center">
            <div className="w-full max-w-3xl">
              {/* Mobile: Single column, Tablet+: 2x2 grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 lg:gap-8">
                {sentenceThemes.map((theme) => (
                  <EmotionalCard
                    key={theme.id}
                    mood={theme.mood}
                    interactive="full"
                    className={`
                      cursor-pointer transition-all duration-300 
                      hover:scale-105 active:scale-95 hover:shadow-xl
                      focus:ring-4 focus:ring-autism-secondary/50 focus:outline-none
                      ${theme.color}
                    `}
                    onClick={() => handleThemeClick(theme)}
                    role="button"
                    tabIndex={0}
                    aria-label={`Start sentence building with ${theme.label} - ${theme.description}`}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault()
                        handleThemeClick(theme)
                      }
                    }}
                  >
                    <CardContent className="
                      p-6 sm:p-8 md:p-6 lg:p-8 
                      min-h-[140px] sm:min-h-[160px] md:min-h-[180px] lg:min-h-[200px]
                      flex flex-col justify-center text-center
                    ">
                      
                      {/* Icon */}
                      <div className="mb-3 sm:mb-4">
                        <div className="bg-white/60 rounded-full p-3 sm:p-4 w-fit mx-auto shadow-sm">
                          <theme.icon className="
                            w-8 h-8 sm:w-10 sm:h-10 md:w-12 md:h-12 lg:w-14 lg:h-14 
                            text-autism-primary
                          " />
                        </div>
                      </div>

                      {/* Title */}
                      <h3 className="
                        text-base sm:text-lg md:text-xl lg:text-2xl 
                        font-bold text-autism-primary mb-2 sm:mb-3
                        leading-tight
                      ">
                        {theme.label}
                      </h3>

                      {/* Description - Hide on very small screens to keep touch targets large */}
                      <p className="
                        text-xs sm:text-sm md:text-base 
                        text-autism-primary/80 leading-relaxed
                        hidden xs:block
                      ">
                        {theme.description}
                      </p>

                    </CardContent>
                  </EmotionalCard>
                ))}
              </div>
            </div>
          </div>

          {/* Footer message - Responsive */}
          <div className="text-center mt-6 sm:mt-8 px-4">
            <p className="text-xs sm:text-sm md:text-base text-autism-primary/70 leading-relaxed max-w-lg mx-auto">
              Choose any theme - you can always come back and try different ones!
            </p>
          </div>

        </div>
      </div>

      {/* Screen reader accessibility information */}
      <div className="sr-only">
        <p>
          This page helps you choose what type of sentences you want to build.
          Choose one of the four theme options by tapping or pressing Enter. Each theme
          will provide words and sentence patterns related to that topic.
          Tap on any tile to start building sentences immediately.
        </p>
      </div>
    </div>
  )
}

export default SentenceThemeSelectionPage