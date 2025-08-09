import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

// Interest topic options for story generation
interface InterestTopic {
  id: string
  label: string
  emoji: string
  description: string
  color: string
  category: 'nature' | 'technology' | 'social' | 'adventure' | 'mystery' | 'creative'
}

const interestTopics: InterestTopic[] = [
  {
    id: 'ocean',
    label: 'Ocean Adventures',
    emoji: '🌊',
    description: 'Deep sea mysteries, marine life, underwater exploration',
    color: 'bg-blue-100 border-blue-400',
    category: 'nature'
  },
  {
    id: 'space',
    label: 'Space & Stars',
    emoji: '🚀',
    description: 'Galaxies, planets, space stations, alien encounters',
    color: 'bg-purple-100 border-purple-400',
    category: 'adventure'
  },
  {
    id: 'friendship',
    label: 'Friendship Stories',
    emoji: '👥',
    description: 'Best friends, making new friends, friendship challenges',
    color: 'bg-green-100 border-green-400',
    category: 'social'
  },
  {
    id: 'mystery',
    label: 'Mystery & Puzzles',
    emoji: '🔍',
    description: 'Secret codes, hidden treasures, solving puzzles',
    color: 'bg-yellow-100 border-yellow-400',
    category: 'mystery'
  },
  {
    id: 'animals',
    label: 'Amazing Animals',
    emoji: '🦁',
    description: 'Wild animals, pets, animal rescue, nature conservation',
    color: 'bg-orange-100 border-orange-400',
    category: 'nature'
  },
  {
    id: 'robots',
    label: 'Robots & AI',
    emoji: '🤖',
    description: 'Helpful robots, artificial intelligence, future technology',
    color: 'bg-gray-100 border-gray-400',
    category: 'technology'
  },
  {
    id: 'magic',
    label: 'Magic & Fantasy',
    emoji: '✨',
    description: 'Magical powers, fantasy worlds, mythical creatures',
    color: 'bg-pink-100 border-pink-400',
    category: 'creative'
  },
  {
    id: 'sports',
    label: 'Sports & Games',
    emoji: '⚽',
    description: 'Team sports, gaming tournaments, competition',
    color: 'bg-red-100 border-red-400',
    category: 'adventure'
  },
  {
    id: 'invention',
    label: 'Cool Inventions',
    emoji: '💡',
    description: 'Creating gadgets, problem-solving, building things',
    color: 'bg-yellow-100 border-yellow-300',
    category: 'technology'
  },
  {
    id: 'school',
    label: 'School Adventures',
    emoji: '🏫',
    description: 'Classroom mysteries, school projects, teacher stories',
    color: 'bg-indigo-100 border-indigo-400',
    category: 'social'
  },
  {
    id: 'family',
    label: 'Family Fun',
    emoji: '👨‍👩‍👧‍👦',
    description: 'Family adventures, siblings, grandparents, family traditions',
    color: 'bg-teal-100 border-teal-400',
    category: 'social'
  },
  {
    id: 'art',
    label: 'Art & Music',
    emoji: '🎨',
    description: 'Creating art, playing music, artistic expression',
    color: 'bg-purple-100 border-purple-300',
    category: 'creative'
  }
]

const InterestSelectionPage: React.FC = () => {
  const [selectedInterests, setSelectedInterests] = useState<string[]>([])
  const [, setLocation] = useLocation()

  // Get brain state for context
  const brainState = localStorage.getItem('current-brain-state') || 'focused'

  const handleInterestToggle = (interestId: string) => {
    setSelectedInterests(prev => {
      if (prev.includes(interestId)) {
        // Remove if already selected
        return prev.filter(id => id !== interestId)
      } else if (prev.length < 5) {
        // Add if under limit
        return [...prev, interestId]
      } else {
        // Replace oldest selection if at limit
        return [...prev.slice(1), interestId]
      }
    })
  }

  const handleContinue = () => {
    if (selectedInterests.length >= 2) {
      // Store selected interests for story generation
      localStorage.setItem('selected-interests', JSON.stringify(selectedInterests))
      // Navigate to story generation
      setLocation('/story-generate')
    }
  }

  const selectedTopics = interestTopics.filter(topic => selectedInterests.includes(topic.id))
  const canContinue = selectedInterests.length >= 2

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky p-4">
      <div className="max-w-6xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-autism-primary mb-4">
            What Sounds Cool Today? 🎯
          </h1>
          <p className="text-xl text-autism-primary/80 leading-relaxed max-w-3xl mx-auto mb-4">
            Pick 2-3 things that sound interesting to you right now. 
            I'll mix them together to create your perfect story!
          </p>
          <div className="inline-flex items-center gap-2 bg-autism-calm-lavender px-4 py-2 rounded-full">
            <span className="text-sm font-medium text-autism-primary">
              Selected: {selectedInterests.length}/5
            </span>
            {selectedInterests.length >= 2 && (
              <span className="text-sm text-autism-secondary">✓ Ready to go!</span>
            )}
          </div>
        </div>

        {/* Selected Interests Preview */}
        {selectedInterests.length > 0 && (
          <Card className="mb-8 bg-autism-neutral border-autism-secondary border-2">
            <CardHeader>
              <CardTitle className="text-2xl text-autism-primary text-center">
                🎨 Your Story Mix
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap justify-center gap-3">
                {selectedTopics.map((topic) => (
                  <div
                    key={topic.id}
                    className="flex items-center gap-2 bg-autism-secondary text-white px-4 py-2 rounded-full"
                  >
                    <span className="text-lg">{topic.emoji}</span>
                    <span className="font-medium">{topic.label}</span>
                    <button
                      onClick={() => handleInterestToggle(topic.id)}
                      className="ml-2 text-white/80 hover:text-white text-lg leading-none"
                      aria-label={`Remove ${topic.label} from selection`}
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
              {selectedInterests.length >= 2 && (
                <p className="text-center mt-4 text-autism-primary/80">
                  Imagine a story with {selectedTopics.map(t => t.label.toLowerCase()).join(' + ')}! 
                  {selectedInterests.length < 5 && " You can pick more if you want."}
                </p>
              )}
            </CardContent>
          </Card>
        )}

        {/* Interest Topic Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mb-8">
          {interestTopics.map((topic) => {
            const isSelected = selectedInterests.includes(topic.id)
            const isDisabled = !isSelected && selectedInterests.length >= 5
            
            return (
              <Card
                key={topic.id}
                className={`
                  cursor-pointer transition-all duration-200 hover:scale-105 
                  ${isSelected 
                    ? 'bg-autism-secondary border-autism-secondary text-white transform scale-105' 
                    : `${topic.color} hover:shadow-lg border-2`
                  }
                  ${isDisabled ? 'opacity-50 cursor-not-allowed' : ''}
                `}
                onClick={() => !isDisabled && handleInterestToggle(topic.id)}
                role="button"
                tabIndex={isDisabled ? -1 : 0}
                onKeyDown={(e) => {
                  if ((e.key === 'Enter' || e.key === ' ') && !isDisabled) {
                    e.preventDefault()
                    handleInterestToggle(topic.id)
                  }
                }}
                aria-pressed={isSelected}
                aria-label={`${topic.label}: ${topic.description}. ${isSelected ? 'Selected' : 'Not selected'}`}
              >
                <CardContent className="p-4 text-center">
                  <div className="text-4xl mb-3">{topic.emoji}</div>
                  <h3 className={`font-bold text-lg mb-2 ${isSelected ? 'text-white' : 'text-autism-primary'}`}>
                    {topic.label}
                  </h3>
                  <p className={`text-sm leading-relaxed ${isSelected ? 'text-white/90' : 'text-autism-primary/80'}`}>
                    {topic.description}
                  </p>
                  {isSelected && (
                    <div className="mt-3">
                      <span className="inline-block bg-white/20 text-white px-2 py-1 rounded text-xs font-medium">
                        ✓ Selected
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Continue Button */}
        <div className="text-center">
          <Button
            onClick={handleContinue}
            disabled={!canContinue}
            variant="celebration"
            size="comfortable"
            className="text-xl px-8 py-4"
          >
            {canContinue 
              ? `Create My Story! (${selectedInterests.length} topics)` 
              : "Pick at least 2 topics to continue"
            }
          </Button>
        </div>

        {/* Help Text */}
        <div className="text-center mt-8">
          <p className="text-autism-primary/60 text-sm leading-relaxed max-w-2xl mx-auto">
            Don't worry about choosing "perfectly" - you can always come back and try different combinations! 
            The AI will blend your interests into one awesome adventure.
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            This page helps you choose topics for your personalized story. 
            Select 2-5 topic cards that interest you by clicking or pressing Enter. 
            You can remove selections by clicking the × button or clicking the card again.
            Once you've selected at least 2 topics, you can continue to story generation.
          </p>
        </div>
      </div>
    </div>
  )
}

export default InterestSelectionPage