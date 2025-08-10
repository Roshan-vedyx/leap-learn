// src/pages/InterestSelectionPage.tsx - Calm, progressive version
import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

interface InterestTopic {
  id: string
  label: string
  emoji: string
  description: string
  color: string
  category: 'nature' | 'technology' | 'social' | 'adventure' | 'mystery' | 'creative'
}

// Organized by categories for progressive disclosure
const interestCategories = {
  nature: [
    {
      id: 'ocean',
      label: 'Ocean Adventures',
      emoji: '🌊',
      description: 'Deep sea mysteries and marine life',
      color: 'bg-gradient-to-br from-blue-50 to-cyan-100 border-blue-300',
      category: 'nature' as const
    },
    {
      id: 'animals',
      label: 'Amazing Animals',
      emoji: '🦁',
      description: 'Wild animals and animal rescue',
      color: 'bg-gradient-to-br from-orange-50 to-amber-100 border-orange-300',
      category: 'nature' as const
    }
  ],
  adventure: [
    {
      id: 'space',
      label: 'Space & Stars',
      emoji: '🚀',
      description: 'Galaxies, planets, and space stations',
      color: 'bg-gradient-to-br from-purple-50 to-indigo-100 border-purple-300',
      category: 'adventure' as const
    },
    {
      id: 'mystery',
      label: 'Mystery & Puzzles',
      emoji: '🔍',
      description: 'Secret codes and hidden treasures',
      color: 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-300',
      category: 'mystery' as const
    }
  ],
  social: [
    {
      id: 'friendship',
      label: 'Friendship Stories',
      emoji: '👥',
      description: 'Best friends and making new friends',
      color: 'bg-gradient-to-br from-green-50 to-emerald-100 border-green-300',
      category: 'social' as const
    },
    {
      id: 'family',
      label: 'Family Fun',
      emoji: '👨‍👩‍👧‍👦',
      description: 'Family adventures and traditions',
      color: 'bg-gradient-to-br from-teal-50 to-cyan-100 border-teal-300',
      category: 'social' as const
    }
  ],
  creative: [
    {
      id: 'magic',
      label: 'Magic & Fantasy',
      emoji: '✨',
      description: 'Magical powers and fantasy worlds',
      color: 'bg-gradient-to-br from-pink-50 to-purple-100 border-pink-300',
      category: 'creative' as const
    },
    {
      id: 'art',
      label: 'Art & Music',
      emoji: '🎨',
      description: 'Creating art and playing music',
      color: 'bg-gradient-to-br from-purple-50 to-pink-100 border-purple-300',
      category: 'creative' as const
    }
  ],
  technology: [
    {
      id: 'robots',
      label: 'Robots & AI',
      emoji: '🤖',
      description: 'Helpful robots and future technology',
      color: 'bg-gradient-to-br from-gray-50 to-slate-100 border-gray-300',
      category: 'technology' as const
    },
    {
      id: 'invention',
      label: 'Cool Inventions',
      emoji: '💡',
      description: 'Creating gadgets and problem-solving',
      color: 'bg-gradient-to-br from-yellow-50 to-orange-100 border-yellow-300',
      category: 'technology' as const
    }
  ]
}

const InterestSelectionPage: React.FC = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [currentStep, setCurrentStep] = useState<'categories' | 'topics' | 'confirmation'>('categories')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [, setLocation] = useLocation()

  const brainState = localStorage.getItem('current-brain-state') || 'focused'

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setCurrentStep('topics')
  }

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        return prev.filter(id => id !== interestId)
      } else {
        return [...prev, interestId]
      }
    })
  }

  const handleContinue = () => {
    if (selectedInterests.length >= 1) {
      localStorage.setItem('selected-interests', JSON.stringify(selectedInterests))
      setLocation('/story-generate')
    }
  }

  const handleSurpriseMe = () => {
    // Auto-select 2-3 random interests
    const allTopics = Object.values(interestCategories).flat()
    const randomTopics = allTopics
      .sort(() => Math.random() - 0.5)
      .slice(0, 2 + Math.floor(Math.random() * 2))
      .map(topic => topic.id)
    
    setSelectedInterests(randomTopics)
    setCurrentStep('confirmation')
  }

  const getCurrentTopics = () => {
    if (showAllTopics) {
      return Object.values(interestCategories).flat()
    }
    if (selectedCategory) {
      return interestCategories[selectedCategory as keyof typeof interestCategories]
    }
    return []
  }

  const getSelectedTopics = () => {
    const allTopics = Object.values(interestCategories).flat()
    return allTopics.filter(topic => selectedInterests.includes(topic.id))
  }

  // Step 1: Category Selection
  if (currentStep === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          
          <div className="text-center mb-8">
            <div className="text-4xl mb-4">🎨</div>
            <h1 className="text-4xl md:text-5xl font-bold text-indigo-900 mb-4">
              What Kind of Story Sounds Fun?
            </h1>
            <p className="text-xl text-indigo-700 leading-relaxed max-w-2xl mx-auto mb-6">
              Let's start with what type of adventure you're in the mood for today.
            </p>
          </div>

          {/* Category Cards - Only 5 at once */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {Object.entries(interestCategories).map(([categoryKey, topics]) => {
              const categoryInfo = {
                nature: { emoji: '🌍', label: 'Nature & Animals', description: 'Ocean adventures, amazing animals' },
                adventure: { emoji: '🚀', label: 'Adventure & Mystery', description: 'Space exploration, puzzles to solve' },
                social: { emoji: '👥', label: 'Friends & Family', description: 'Friendship stories, family fun' },
                creative: { emoji: '✨', label: 'Magic & Arts', description: 'Fantasy worlds, creative expression' },
                technology: { emoji: '🤖', label: 'Tech & Innovation', description: 'Robots, cool inventions' }
              }
              
              const info = categoryInfo[categoryKey as keyof typeof categoryInfo]
              
              return (
                <Card
                  key={categoryKey}
                  className="cursor-pointer transition-all duration-300 hover:scale-105 hover:shadow-lg border-2 border-gray-200 bg-gradient-to-br from-white to-gray-50"
                  onClick={() => handleCategorySelect(categoryKey)}
                >
                  <CardContent className="p-6 text-center">
                    <div className="text-5xl mb-4">{info.emoji}</div>
                    <h3 className="text-xl font-bold text-indigo-900 mb-3">{info.label}</h3>
                    <p className="text-indigo-700 text-sm">{info.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Quick Options */}
          <div className="text-center space-y-4">
            <Button
              onClick={() => setShowAllTopics(true) || setCurrentStep('topics')}
              variant="outline"
              size="lg"
              className="text-lg px-6 py-3"
            >
              🔍 Show me all options
            </Button>
            
            <div className="text-indigo-600">or</div>
            
            <Button
              onClick={handleSurpriseMe}
              variant="default"
              size="lg"
              className="text-lg px-6 py-3 bg-indigo-600 hover:bg-indigo-700"
            >
              ✨ Surprise me with a story!
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Topic Selection within Category
  if (currentStep === 'topics') {
    const topics = getCurrentTopics()
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-4">
        <div className="max-w-4xl mx-auto py-8">
          
          <div className="text-center mb-8">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep('categories')}
              className="mb-4 text-indigo-600"
            >
              ← Back to categories
            </Button>
            
            <h1 className="text-3xl font-bold text-indigo-900 mb-4">
              Pick What Sounds Interesting
            </h1>
            <p className="text-lg text-indigo-700 max-w-xl mx-auto mb-4">
              Choose one or more topics. I'll blend them into an awesome story!
            </p>
            
            {selectedInterests.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-indigo-100 px-4 py-2 rounded-full">
                <span className="text-sm font-medium text-indigo-800">
                  {selectedInterests.length} picked ✓
                </span>
              </div>
            )}
          </div>

          {/* Topic Cards - Max 8 at once */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {topics.slice(0, 8).map((topic) => {
              const isSelected = selectedInterests.includes(topic.id)
              
              return (
                <Card
                  key={topic.id}
                  className={`
                    cursor-pointer transition-all duration-300 border-2 h-full
                    ${isSelected 
                      ? 'border-indigo-400 bg-indigo-50 transform scale-105 shadow-lg' 
                      : 'border-gray-200 hover:scale-102 hover:shadow-md'
                    }
                    ${topic.color}
                  `}
                  onClick={() => handleInterestToggle(topic.id)}
                >
                  <CardContent className="p-6 text-center h-full flex flex-col justify-center relative">
                    {isSelected && (
                      <div className="absolute top-3 right-3 w-6 h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                        ✓
                      </div>
                    )}
                    
                    <div className="text-4xl mb-4">{topic.emoji}</div>
                    <h3 className="text-lg font-bold text-indigo-900 mb-3">{topic.label}</h3>
                    <p className="text-indigo-700 text-sm">{topic.description}</p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Selected Preview */}
          {selectedInterests.length > 0 && (
            <Card className="mb-6 bg-indigo-50 border-indigo-200 border-2">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-indigo-900 mb-3">Your Story Will Include:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {getSelectedTopics().map((topic) => (
                    <span
                      key={topic.id}
                      className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {topic.emoji} {topic.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={selectedInterests.length === 0}
              variant="default"
              size="lg"
              className="text-lg px-8 py-3 bg-indigo-600 hover:bg-indigo-700"
            >
              {selectedInterests.length === 0 
                ? "Pick at least one topic" 
                : "Create my story! ✨"
              }
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}

export default InterestSelectionPage