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
      // Save interests for potential future use
      localStorage.setItem('selected-interests', JSON.stringify(selectedInterests))
      
      // Get the first selected interest and navigate to story selection page
      const primaryInterest = selectedInterests[0]
      localStorage.setItem('selected-interest', primaryInterest)
      
      // Navigate to story selection page for this interest
      setLocation(`/stories/${primaryInterest}`)
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
            
            {/* Selection counter - Responsive design */}
            {selectedInterests.length > 0 && (
              <div className="inline-flex items-center gap-2 bg-indigo-100 px-3 sm:px-4 py-2 rounded-full mt-2">
                <span className="text-sm sm:text-base font-medium text-indigo-800">
                  {selectedInterests.length} picked ✓
                </span>
              </div>
            )}
          </div>

          {/* Topic Cards - Responsive grid: 1 col mobile, 2 col tablet, 2 col landscape tablet, 3 col desktop */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-6 sm:mb-8">
            {topics.slice(0, 8).map((topic) => {
              const isSelected = selectedInterests.includes(topic.id)
              
              return (
                <Card
                  key={topic.id}
                  className={`
                    cursor-pointer transition-all duration-300 border-2 h-full
                    min-h-[140px] sm:min-h-[160px] md:min-h-[180px]
                    ${isSelected 
                      ? 'border-indigo-400 bg-indigo-50 transform scale-105 shadow-lg' 
                      : 'border-gray-200 hover:scale-102 hover:shadow-md active:scale-98'
                    }
                    ${topic.color}
                  `}
                  onClick={() => handleInterestToggle(topic.id)}
                >
                  <CardContent className="p-4 sm:p-6 text-center h-full flex flex-col justify-center relative">
                    {/* Selection indicator - Responsive sizing */}
                    {isSelected && (
                      <div className="absolute top-2 sm:top-3 right-2 sm:right-3 w-5 h-5 sm:w-6 sm:h-6 bg-indigo-500 text-white rounded-full flex items-center justify-center text-xs sm:text-sm font-bold">
                        ✓
                      </div>
                    )}
                    
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

          {/* Selected Preview - Responsive layout */}
          {selectedInterests.length > 0 && (
            <Card className="mb-6 bg-indigo-50 border-indigo-200 border-2">
              <CardContent className="p-4 text-center">
                <h3 className="font-semibold text-indigo-900 mb-3 text-base sm:text-lg">
                  You'll see stories about:
                </h3>
                {/* Tags - Responsive wrapping and sizing */}
                <div className="flex flex-wrap justify-center gap-2">
                  {getSelectedTopics().map((topic) => (
                    <span
                      key={topic.id}
                      className="bg-indigo-500 text-white px-3 py-1 rounded-full text-sm font-medium min-h-[32px] flex items-center"
                    >
                      {topic.emoji} {topic.label}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Continue button - Responsive sizing */}
          <div className="text-center">
            <Button
              onClick={handleContinue}
              disabled={selectedInterests.length === 0}
              variant="default"
              size="lg"
              className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] bg-indigo-600 hover:bg-indigo-700"
            >
              {selectedInterests.length === 0 
                ? "Pick one topic to see available stories!" 
                : "See all stories! 📚"
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