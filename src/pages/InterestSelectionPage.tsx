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
  
  const [currentStep, setCurrentStep] = useState<'categories' | 'topics' | 'confirmation'>('categories')
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null)
  const [showAllTopics, setShowAllTopics] = useState(false)
  const [, setLocation] = useLocation()

  const brainState = localStorage.getItem('current-brain-state') || 'focused'

  const handleCategorySelect = (category: string) => {
    setSelectedCategory(category)
    setCurrentStep('topics')
  }

  const handleTopicSelect = (topicId: string) => {
    localStorage.setItem('selected-interest', topicId)
    setLocation(`/stories/${topicId}`)
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

  // Step 1: Category Selection
  if (currentStep === 'categories') {
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto py-4 sm:py-8">
          
          {/* Header - Responsive text sizes and spacing */}
          <div className="text-center mb-6 sm:mb-8">
            <div className="text-3xl sm:text-4xl mb-3 sm:mb-4">🎨</div>
            <h1 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold text-indigo-900 mb-3 sm:mb-4 px-2">
              What Kind of Story Sounds Fun?
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-indigo-700 leading-relaxed max-w-2xl mx-auto mb-4 sm:mb-6 px-4">
              Let's start with what type of adventure you're in the mood for today.
            </p>
          </div>

          {/* Category Grid - Responsive layout: 1 col mobile, 2 col tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {Object.entries(interestCategories).map(([categoryKey, topics]) => {
              const categoryInfo = {
                nature: { emoji: '🌿', label: 'Nature & Animals', color: 'from-green-100 to-emerald-200 border-green-300' },
                adventure: { emoji: '🚀', label: 'Adventure & Mystery', color: 'from-purple-100 to-blue-200 border-purple-300' },
                social: { emoji: '👥', label: 'Friends & Family', color: 'from-teal-100 to-cyan-200 border-teal-300' },
                creative: { emoji: '🎨', label: 'Magic & Creativity', color: 'from-pink-100 to-purple-200 border-pink-300' },
                technology: { emoji: '🤖', label: 'Tech & Inventions', color: 'from-gray-100 to-slate-200 border-gray-300' }
              }

              const category = categoryInfo[categoryKey as keyof typeof categoryInfo]
              if (!category) return null

              return (
                <Card
                  key={categoryKey}
                  className={`
                    cursor-pointer transition-all duration-300 border-2 
                    hover:scale-102 hover:shadow-md active:scale-98
                    bg-gradient-to-br ${category.color}
                    min-h-[140px] sm:min-h-[160px] md:min-h-[180px]
                  `}
                  onClick={() => handleCategorySelect(categoryKey)}
                >
                  <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col justify-center">
                    {/* Emoji - Responsive sizing */}
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-3 sm:mb-4">{category.emoji}</div>
                    
                    {/* Label - Responsive text */}
                    <h3 className="text-lg sm:text-xl md:text-2xl font-bold text-indigo-900 mb-2 sm:mb-3 leading-tight">
                      {category.label}
                    </h3>
                    
                    {/* Topic count - Responsive text */}
                    <p className="text-sm sm:text-base text-indigo-700">
                      {topics.length} topic{topics.length === 1 ? '' : 's'}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Action Buttons - Responsive layout and sizing */}
          <div className="text-center space-y-3 sm:space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center items-center">
              {/*<Button
                onClick={handleSurpriseMe}
                variant="outline"
                size="lg"
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] border-indigo-300 text-indigo-700 hover:bg-indigo-50"
              >
                🎲 Surprise me!
              </Button>
              
              <Button
                onClick={() => setShowAllTopics(true)}
                variant="ghost" 
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] text-indigo-600 hover:bg-indigo-50"
              >
                See all topics →
              </Button>*/}
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: Topic Selection within Category
  if (currentStep === 'topics') {
    const topics = getCurrentTopics()
    
    return (
      <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-3 sm:p-4">
        <div className="max-w-4xl mx-auto py-4 sm:py-8">
          
          {/* Header with back button - Responsive spacing */}
          <div className="text-center mb-6 sm:mb-8">
            <Button
              variant="ghost"
              onClick={() => setCurrentStep('categories')}
              className="mb-4 text-indigo-600 min-h-[44px] px-4 py-2"
            >
              ← Back to categories
            </Button>
            
            <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-indigo-900 mb-3 sm:mb-4 px-2">
              Pick What Sounds Interesting
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-indigo-700 max-w-xl mx-auto mb-4 px-4">
              Choose a topic to see all available stories!
            </p>
            
          </div>

          {/* Topic Cards - Responsive grid: 1 col mobile, 2 col tablet, 2 col landscape tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {topics.slice(0, 8).map((topic) => {
              return (
                <Card
                  key={topic.id}
                  className={`
                    cursor-pointer transition-all duration-300 border-2 h-full
                    min-h-[140px] sm:min-h-[160px] md:min-h-[180px]
                    border-gray-200 hover:scale-102 hover:shadow-md active:scale-98
                    ${topic.color}
                  `}
                  onClick={() => handleTopicSelect(topic.id)}
                >
                  <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col justify-center">
                    {/* Emoji - Responsive sizing */}
                    <div className="text-3xl sm:text-4xl md:text-5xl mb-3 sm:mb-4">{topic.emoji}</div>
                    
                    {/* Title - Responsive text with line height */}
                    <h3 className="text-base sm:text-lg md:text-xl font-bold text-indigo-900 mb-2 sm:mb-3 leading-tight">
                      {topic.label}
                    </h3>
                    
                    {/* Description - Responsive text */}
                    <p className="text-indigo-700 text-sm sm:text-base leading-relaxed">
                      {topic.description}
                    </p>
                  </CardContent>
                </Card>
              )
            })}
          </div>

        </div>
      </div>
    )
  }

  return null
}

export default InterestSelectionPage