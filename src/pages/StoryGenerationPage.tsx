import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { StoryGenerationService } from '@/services/StoryGenerationService'

const StoryGenerationPage: React.FC = () => {
  const [generationStep, setGenerationStep] = useState(0)
  const [isGenerating, setIsGenerating] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [, setLocation] = useLocation()

  // Get user selections from localStorage
  const brainState = localStorage.getItem('current-brain-state') || 'focused'
  const selectedInterests = JSON.parse(localStorage.getItem('selected-interests') || '[]')

  // Generation steps for user feedback
  const generationSteps = [
    {
      step: 0,
      title: "Reading your mood and interests...",
      emoji: "🧠",
      description: `You're feeling ${brainState} and interested in ${selectedInterests.slice(0, 2).join(' + ')}!`
    },
    {
      step: 1,
      title: "Mixing your topics together...",
      emoji: "🎨",
      description: "Creating the perfect story concept just for you"
    },
    {
      step: 2,
      title: "Writing three versions...",
      emoji: "✍️",
      description: "Simple, Standard, and Challenge levels - you'll pick what feels right"
    },
    {
      step: 3,
      title: "Adding stealth phonics...",
      emoji: "🔤",
      description: "Hiding reading skills inside the adventure"
    },
    {
      step: 4,
      title: "Your story is ready!",
      emoji: "🎉",
      description: "Get ready for an awesome reading experience!"
    }
  ]

  useEffect(() => {
    const generateStory = async () => {
      try {
        // Validate we have the required data
        if (!selectedInterests.length) {
          setError("No interests selected. Let's go back and pick some topics!")
          return
        }

        // Step through generation process with delays for user experience
        for (let i = 0; i <= 4; i++) {
          setGenerationStep(i)
          await new Promise(resolve => setTimeout(resolve, i === 0 ? 1000 : 1500))
        }

        // Generate the actual story
        const story = await StoryGenerationService.generateStory(
          selectedInterests,
          brainState
        )

        // Store the generated story
        localStorage.setItem('current-generated-story', JSON.stringify(story))
        localStorage.setItem('current-complexity-level', 'full') // Default to full version

        // Wait a moment for the success message, then navigate
        setTimeout(() => {
          setIsGenerating(false)
          setLocation('/story')
        }, 1500)

      } catch (err) {
        console.error('Story generation failed:', err)
        setError("Oops! Something went wrong creating your story. Let's try again!")
        setIsGenerating(false)
      }
    }

    generateStory()
  }, [selectedInterests, brainState, setLocation])

  const handleRetry = () => {
    setError(null)
    setIsGenerating(true)
    setGenerationStep(0)
    // This will trigger the useEffect again
  }

  const handleGoBack = () => {
    setLocation('/interests')
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky p-4">
        <div className="max-w-2xl mx-auto py-16">
          <Card className="mb-8 bg-autism-neutral border-red-400 border-2 text-center">
            <CardHeader>
              <div className="text-8xl mb-4">😅</div>
              <CardTitle className="text-3xl md:text-4xl text-autism-primary mb-4">
                Story Generator Hiccup!
              </CardTitle>
            </CardHeader>
            <CardContent className="pb-8">
              <p className="text-xl text-autism-primary/80 leading-relaxed mb-6">
                {error}
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="celebration"
                  size="comfortable"
                  onClick={handleRetry}
                  className="text-lg"
                >
                  🔄 Try Again
                </Button>
                <Button
                  variant="outline"
                  size="comfortable"
                  onClick={handleGoBack}
                  className="text-lg"
                >
                  ← Pick Different Topics
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  const currentStep = generationSteps[generationStep]

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-mint to-autism-calm-sky p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-autism-primary mb-4">
            Creating Your Perfect Story ✨
          </h1>
          <p className="text-xl text-autism-primary/80 leading-relaxed max-w-2xl mx-auto">
            Hang tight! I'm mixing your interests together and creating something awesome just for you.
          </p>
        </div>

        {/* Your Selections Reminder */}
        <Card className="mb-8 bg-autism-neutral border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-autism-primary text-center">
              🎯 Your Story Recipe
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="text-center">
                <h3 className="font-semibold text-autism-primary mb-2">Today's Brain State:</h3>
                <div className="inline-flex items-center gap-2 bg-autism-calm-lavender px-4 py-2 rounded-full">
                  <span className="text-2xl">
                    {brainState === 'energetic' ? '⚡' : 
                     brainState === 'focused' ? '🎯' : 
                     brainState === 'tired' ? '😴' : 
                     brainState === 'excited' ? '🤩' : 
                     brainState === 'overwhelmed' ? '🌊' : '🔍'}
                  </span>
                  <span className="font-medium text-autism-primary capitalize">{brainState}</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="font-semibold text-autism-primary mb-2">Your Interests:</h3>
                <div className="flex flex-wrap justify-center gap-2">
                  {selectedInterests.slice(0, 4).map((interest: string, index: number) => (
                    <span
                      key={index}
                      className="bg-autism-secondary text-white px-3 py-1 rounded-full text-sm font-medium"
                    >
                      {interest.charAt(0).toUpperCase() + interest.slice(1)}
                    </span>
                  ))}
                  {selectedInterests.length > 4 && (
                    <span className="bg-autism-primary/20 text-autism-primary px-3 py-1 rounded-full text-sm font-medium">
                      +{selectedInterests.length - 4} more
                    </span>
                  )}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Generation Progress */}
        <Card className="mb-8 bg-white border-autism-primary border-2">
          <CardContent className="p-8">
            {/* Progress Bar */}
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <span className="text-sm font-medium text-autism-primary">Progress</span>
                <span className="text-sm font-medium text-autism-primary">
                  {Math.round((generationStep / 4) * 100)}%
                </span>
              </div>
              <div className="w-full bg-autism-calm-mint rounded-full h-3">
                <div
                  className="bg-autism-secondary h-3 rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${(generationStep / 4) * 100}%` }}
                ></div>
              </div>
            </div>

            {/* Current Step */}
            <div className="text-center">
              <div className="text-6xl mb-4 animate-pulse">{currentStep.emoji}</div>
              <h2 className="text-2xl md:text-3xl font-bold text-autism-primary mb-4">
                {currentStep.title}
              </h2>
              <p className="text-lg text-autism-primary/80 leading-relaxed max-w-md mx-auto">
                {currentStep.description}
              </p>
            </div>

            {/* Step Indicators */}
            <div className="flex justify-center mt-8">
              <div className="flex gap-3">
                {generationSteps.slice(0, 4).map((step, index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 rounded-full transition-all duration-500 ${
                      index <= generationStep
                        ? 'bg-autism-secondary'
                        : 'bg-autism-calm-mint'
                    }`}
                  />
                ))}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Encouraging Message */}
        <Card className="bg-autism-calm-lavender border-autism-primary">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-autism-primary mb-3">
              💡 Did you know?
            </h3>
            <p className="text-autism-primary/80 leading-relaxed">
              {generationStep <= 1 && "Every story is unique! The AI considers your mood, interests, and reading preferences to create something perfect for you."}
              {generationStep === 2 && "Having three versions means you're always in control. Start with what feels comfortable and switch anytime!"}
              {generationStep === 3 && "Stealth phonics means you'll improve your reading skills without even noticing - it's just part of the adventure!"}
              {generationStep >= 4 && "Your personalized story adventure is about to begin. Remember, you can switch complexity levels anytime!"}
            </p>
          </CardContent>
        </Card>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            Story generation is in progress. Currently {currentStep.title.toLowerCase()}. 
            This process will complete automatically and take you to your personalized story.
            Progress is at {Math.round((generationStep / 4) * 100)} percent.
          </p>
        </div>
      </div>
    </div>
  )
}

export default StoryGenerationPage