// src/pages/CreatePage.tsx - Enhanced with Story Reflections
import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'
import { useSessionStore } from '@/stores/sessionStore'
import { 
  Sparkles, 
  MessageCircle, 
  Users, 
  HelpCircle, 
  Palette, 
  ArrowLeft, 
  PartyPopper,
  ChevronLeft,
  Star,
  Heart,
  Lightbulb
} from 'lucide-react'

const CreatePage: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [, setLocation] = useLocation()

  // Zustand store - now includes story reflections
  const { currentBrainState, setCreativeResponse, storyReflections } = useSessionStore()

  const basePrompts = [
    {
      id: 'continue',
      title: 'What happens next?',
      icon: Sparkles,
      description: 'Continue the story in your own words',
      placeholder: 'The adventure continues when...'
    },
    {
      id: 'reminds',
      title: 'This reminds me of...',
      icon: MessageCircle,
      description: 'Connect the story to your own experiences',
      placeholder: 'This story reminds me of when I...'
    },
    {
      id: 'character',
      title: 'If I were the character...',
      icon: Users,
      description: 'Put yourself in the story',
      placeholder: 'If I were in this story, I would...'
    },
    {
      id: 'questions',
      title: 'I wonder...',
      icon: HelpCircle,
      description: 'Ask questions about the story',
      placeholder: 'I wonder why...'
    }
  ]

  // NEW: Add reflection prompts from the story
  const reflectionPrompts = storyReflections.map((reflection, idx) => ({
    id: `reflection-${idx}`,
    title: 'Think about this...',
    icon: Lightbulb,
    description: reflection,
    placeholder: 'I think...'
  }))

  // Combine base prompts with reflection prompts
  const allPrompts = [...basePrompts, ...reflectionPrompts]

  // Adapt prompts based on brain state
  const getAdaptedPrompts = () => {
    if (!currentBrainState) return allPrompts

    switch (currentBrainState.mood) {
      case 'energetic':
        return [
          allPrompts[0], // What happens next - good for high energy
          {
            ...allPrompts[2],
            title: 'Action time!',
            description: 'What exciting action would you take?',
            placeholder: 'If I were in this story, I would jump up and...'
          },
          ...reflectionPrompts,
          allPrompts[3]
        ]
      case 'calm':
        return [
          allPrompts[1], // This reminds me - reflective
          {
            ...allPrompts[0],
            title: 'What happens peacefully?',
            description: 'Continue the story with a calm moment',
            placeholder: 'The character sat quietly and...'
          },
          ...reflectionPrompts,
          allPrompts[3]
        ]
      case 'focused':
      default:
        return allPrompts
    }
  }

  const adaptedPrompts = getAdaptedPrompts()

  const handlePromptSelect = (promptId: string) => {
    setSelectedPrompt(promptId)
    const prompt = adaptedPrompts.find(p => p.id === promptId)
    if (prompt) {
      setResponse('')
    }

    // Announce selection for screen readers
    const announcement = `Selected creative prompt: ${prompt?.title}`
    const announcer = document.getElementById('accessibility-announcements')
    if (announcer) {
      announcer.textContent = announcement
    }
  }

  const handleContinue = () => {
    if (selectedPrompt && response.trim().length >= 10) {
      // Save the creative response to Zustand store
      const creativeResponse = {
        prompt: selectedPrompt,
        response: response.trim(),
        timestamp: new Date().toISOString()
      }
      
      setCreativeResponse(creativeResponse)
      
      // Go to celebration
      setLocation('/celebrate')
    }
  }

  const selectedPromptData = adaptedPrompts.find(p => p.id === selectedPrompt)

  return (
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12">
        {/* Header */}
        <div className="text-center mb-6 sm:mb-8">
          <h1 className="text-2xl sm:text-3xl lg:text-4xl xl:text-5xl font-bold text-primary mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span>Time to Create!</span>
            <Palette className="w-8 h-8 sm:w-10 sm:h-10 lg:w-12 lg:h-12 text-primary" />
          </h1>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-4">
            You've read an amazing story! Now it's your turn to add your own thoughts and ideas. 
            Pick what feels right to you - there are no wrong answers!
          </p>
        </div>

        {!selectedPrompt ? (
          /* PROMPT SELECTION SCREEN */
          <div className="space-y-6 sm:space-y-8">
            {/* Brain State Adaptation */}
            {currentBrainState && (
              <Card className="border-primary/20 bg-primary/5">
                <CardHeader className="pb-3">
                  <CardTitle className="text-base sm:text-lg flex items-center gap-2">
                    <Heart className="w-5 h-5 text-primary" />
                    Prompts Chosen Just For You
                  </CardTitle>
                  <CardDescription className="text-sm">
                    Based on how you're feeling today ({currentBrainState.mood}), 
                    these prompts are perfect for your current energy level.
                  </CardDescription>
                </CardHeader>
              </Card>
            )}

            {/* Story Reflections Section */}
            {reflectionPrompts.length > 0 && (
              <div>
                <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                  <Lightbulb className="w-5 h-5 text-yellow-500" />
                  Questions from Your Story
                </h2>
                <div className="grid gap-4 sm:gap-6">
                  {reflectionPrompts.map((prompt, idx) => (
                    <Card 
                      key={prompt.id}
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1 bg-gradient-to-br from-yellow-50 to-orange-50"
                      onClick={() => handlePromptSelect(prompt.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-yellow-100 rounded-lg">
                            <prompt.icon className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg text-gray-800">
                              {prompt.title}
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base text-gray-600 mt-1">
                              {prompt.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {/* General Creative Prompts */}
            <div>
              <h2 className="text-xl font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <Star className="w-5 h-5 text-purple-500" />
                Creative Prompts
              </h2>
              <div className="grid gap-4 sm:gap-6 md:grid-cols-2">
                {basePrompts.map((prompt) => {
                  const isAdapted = adaptedPrompts.find(p => p.id === prompt.id && p.title !== prompt.title)
                  const displayPrompt = isAdapted || prompt
                  
                  return (
                    <Card 
                      key={prompt.id}
                      className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/30 hover:-translate-y-1"
                      onClick={() => handlePromptSelect(prompt.id)}
                    >
                      <CardHeader className="pb-3">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <displayPrompt.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                          </div>
                          <div className="flex-1">
                            <CardTitle className="text-base sm:text-lg">
                              {displayPrompt.title}
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                              {displayPrompt.description}
                            </CardDescription>
                          </div>
                        </div>
                      </CardHeader>
                    </Card>
                  )
                })}
              </div>
            </div>

            {/* Encouragement */}
            <div className="text-center">
              <div className="inline-flex items-center gap-2 px-6 py-3 bg-white/60 rounded-full border border-primary/20">
                <PartyPopper className="w-5 h-5 text-primary" />
                <p className="text-sm sm:text-base text-muted-foreground font-medium">
                  Choose what feels good right now. 
                  There's no right or wrong way to be creative.
                </p>
              </div>
            </div>
          </div>
        ) : (
          /* WRITING SCREEN */
          <div className="space-y-6 sm:space-y-8">
            {/* Selected Prompt Info */}
            <Card className="border-primary/20 bg-primary/5">
              <CardHeader className="pb-4">
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    {selectedPromptData && <selectedPromptData.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />}
                  </div>
                  <div className="flex-1">
                    <CardTitle className="text-lg sm:text-xl text-primary mb-1">
                      {selectedPromptData?.title}
                    </CardTitle>
                    <CardDescription className="text-sm sm:text-base">
                      {selectedPromptData?.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Writing Area */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg sm:text-xl">Your Creative Response</CardTitle>
                <CardDescription className="text-sm sm:text-base">
                  Write as much or as little as you want. Take your time!
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={selectedPromptData?.placeholder || 'Start writing here...'}
                  className="min-h-[200px] sm:min-h-[250px] text-base sm:text-lg resize-none focus:ring-2 focus:ring-primary/20"
                  autoFocus
                />
                
                {/* Character Count & Encouragement */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                  <div className={`flex items-center gap-2 text-sm transition-colors ${
                    response.trim().length >= 10 
                      ? 'text-green-600' 
                      : 'text-muted-foreground'
                  }`}>
                    <Star className="w-4 h-4" />
                    <span>
                      {response.trim().length >= 10 
                        ? 'Great job! You can continue or finish when ready.' 
                        : 'Write at least 10 characters to continue'
                      }
                    </span>
                  </div>
                  
                  <div className="text-sm text-muted-foreground">
                    {response.length} characters
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <Button
                    onClick={() => setSelectedPrompt(null)}
                    variant="outline"
                    className="flex items-center gap-2"
                  >
                    <ChevronLeft className="w-4 h-4" />
                    Choose Different Prompt
                  </Button>
                  
                  <Button
                    onClick={handleContinue}
                    disabled={response.trim().length < 10}
                    className="flex items-center gap-2 flex-1"
                  >
                    <PartyPopper className="w-4 h-4" />
                    Celebrate My Creativity!
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Hidden announcements area for screen readers */}
        <div id="accessibility-announcements" className="sr-only" aria-live="polite"></div>
      </div>
    </div>
  )
}

export default CreatePage