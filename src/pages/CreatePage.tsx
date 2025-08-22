// src/pages/CreatePage.tsx - Simplified for MVP with Lucide icons
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
  Star
} from 'lucide-react'

const CreatePage: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [, setLocation] = useLocation()

  // Zustand store
  const { currentBrainState, setCreativeResponse } = useSessionStore()

  const prompts = [
    {
      id: 'continue',
      title: 'What happens next?',
      icon: Sparkles,
      description: 'Continue the story in your own words',
      placeholder: 'Maya and Bolt decided to...'
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
      placeholder: 'If I were Maya, I would...'
    },
    {
      id: 'questions',
      title: 'I wonder...',
      icon: HelpCircle,
      description: 'Ask questions about the story',
      placeholder: 'I wonder why...'
    }
  ]

  // Adapt prompts based on brain state
  const getAdaptedPrompts = () => {
    if (!currentBrainState) return prompts

    switch (currentBrainState.mood) {
      case 'energetic':
        return [
          prompts[0], // What happens next - good for high energy
          {
            ...prompts[2],
            title: 'Action time!',
            description: 'What exciting action would you take?',
            placeholder: 'If I were in this story, I would jump up and...'
          },
          prompts[3]
        ]
      case 'calm':
        return [
          prompts[1], // This reminds me - reflective
          {
            ...prompts[0],
            title: 'What happens peacefully?',
            description: 'Continue the story with a calm moment',
            placeholder: 'Maya sat quietly and...'
          },
          prompts[3]
        ]
      case 'focused':
      default:
        return prompts
    }
  }

  const adaptedPrompts = getAdaptedPrompts()

  const handlePromptSelect = (promptId: string) => {
    setSelectedPrompt(promptId)
    const prompt = adaptedPrompts.find(p => p.id === promptId)
    if (prompt) {
      setResponse(prompt.placeholder)
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
          
          {/* Brain state adaptation message */}
          {currentBrainState && (
            <div className="mt-4 inline-flex items-center gap-2 bg-card rounded-full px-4 py-2 text-sm border shadow-sm">
              <currentBrainState.icon className="w-4 h-4" />
              <span className="text-muted-foreground">
                Prompts adapted for your {currentBrainState.label.toLowerCase()} energy
              </span>
            </div>
          )}
        </div>

        {!selectedPrompt ? (
          /* PROMPT SELECTION SCREEN */
          <div className="space-y-6 sm:space-y-8">
            <div className="text-center">
              <h2 className="text-xl sm:text-2xl font-semibold text-foreground mb-2">
                Choose Your Creative Path
              </h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Pick the type of creative response that appeals to you most right now
              </p>
            </div>

            {/* Prompt Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4 sm:gap-6">
              {adaptedPrompts.map((prompt) => {
                const IconComponent = prompt.icon
                return (
                  <Card 
                    key={prompt.id}
                    className="cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-2 hover:border-primary/30"
                    onClick={() => handlePromptSelect(prompt.id)}
                  >
                    <CardHeader className="text-center pb-3">
                      <div className="flex justify-center mb-3">
                        <div className="p-3 sm:p-4 bg-primary/10 rounded-full">
                          <IconComponent className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                        </div>
                      </div>
                      <CardTitle className="text-lg sm:text-xl">{prompt.title}</CardTitle>
                      <CardDescription className="text-sm sm:text-base">{prompt.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="bg-muted/50 rounded-lg p-3 sm:p-4 text-center">
                        <p className="text-xs sm:text-sm text-muted-foreground italic">
                          "{prompt.placeholder}"
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            {/* Encouragement */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Remember: Your ideas are valuable! There's no right or wrong way to be creative.
              </p>
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
                      ? 'text-primary font-medium' 
                      : 'text-muted-foreground'
                  }`}>
                    <span>{response.trim().length} characters</span>
                    {response.trim().length >= 10 && (
                      <>
                        <Star className="w-4 h-4" />
                        <span>Great work!</span>
                      </>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedPrompt(null)
                  setResponse('')
                }}
                className="w-full sm:w-auto min-h-[44px] sm:min-h-[56px] flex items-center justify-center gap-2"
              >
                <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" /> 
                Choose Different Prompt
              </Button>
              
              <Button
                variant="default"
                size="lg"
                onClick={handleContinue}
                disabled={response.trim().length < 10}
                className="w-full sm:w-auto text-base sm:text-lg px-6 sm:px-8 min-h-[44px] sm:min-h-[56px] flex items-center justify-center gap-2"
              >
                {response.trim().length < 10 
                  ? 'Keep Writing...' 
                  : (
                    <>
                      I'm Done Creating! <PartyPopper className="w-4 h-4 sm:w-5 sm:h-5" />
                    </>
                  )
                }
              </Button>
            </div>

            {/* Encouragement */}
            <div className="text-center">
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
                Take your time! Your ideas are valuable and there's no rush.
              </p>
            </div>
          </div>
        )}

        {/* Back to Story */}
        <div className="text-center mt-6 sm:mt-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/story')}
            className="min-h-[44px] text-muted-foreground hover:text-foreground flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Story
          </Button>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            This page lets you respond creatively to the story you just read. 
            Choose from different prompts that have been adapted to your current energy level.
            Your response will be celebrated, not graded.
          </p>
        </div>

        {/* Hidden announcements area for screen readers */}
        <div id="accessibility-announcements" className="sr-only" aria-live="polite"></div>
      </div>
    </div>
  )
}

export default CreatePage