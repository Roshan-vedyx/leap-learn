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
    <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4 flex items-center justify-center gap-4">
            Time to Create! <Palette className="w-12 h-12 text-primary" />
          </h1>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
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
          /* Prompt Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {adaptedPrompts.map((prompt) => (
              <Card
                key={prompt.id}
                className="cursor-pointer transition-all duration-200 hover:scale-105 hover:shadow-lg bg-card border-2 border-border"
                onClick={() => handlePromptSelect(prompt.id)}
                role="button"
                tabIndex={0}
                aria-label={`Select creative prompt: ${prompt.title}`}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handlePromptSelect(prompt.id)
                  }
                }}
              >
                <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                  <div className="mb-4 flex justify-center">
                    <prompt.icon 
                      className="w-12 h-12 text-primary" 
                      aria-label={prompt.title}
                    />
                  </div>
                  <h3 className="text-2xl font-semibold text-primary mb-3">
                    {prompt.title}
                  </h3>
                  <p className="text-muted-foreground leading-relaxed">
                    {prompt.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Response Writing */
          <div className="space-y-6">
            <Card className="bg-card border-primary border-2 shadow-lg">
              <CardHeader>
                <CardTitle className="text-2xl text-primary flex items-center gap-3">
                  {selectedPromptData?.icon && (
                    <selectedPromptData.icon className="w-8 h-8" />
                  )}
                  {selectedPromptData?.title}
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground">
                  {selectedPromptData?.description}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-card border-2 border-border shadow-lg">
              <CardContent className="p-6">
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={selectedPromptData?.placeholder}
                  className="min-h-[200px] text-lg leading-relaxed resize-none border-2 focus:ring-2 focus:ring-primary"
                  aria-label="Write your creative response here"
                />
                
                {/* Character counter for encouragement */}
                <div className="mt-3 text-right">
                  <div className={`text-sm flex items-center justify-end gap-1 ${
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
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="lg"
                onClick={() => {
                  setSelectedPrompt(null)
                  setResponse('')
                }}
                className="min-h-[56px] flex items-center gap-2"
              >
                <ChevronLeft className="w-5 h-5" /> Choose Different Prompt
              </Button>
              
              <Button
                variant="default"
                size="lg"
                onClick={handleContinue}
                disabled={response.trim().length < 10}
                className="text-lg px-8 min-h-[56px] flex items-center gap-2"
              >
                {response.trim().length < 10 
                  ? 'Keep Writing...' 
                  : (
                    <>
                      I'm Done Creating! <PartyPopper className="w-5 h-5" />
                    </>
                  )
                }
              </Button>
            </div>

            {/* Encouragement */}
            <div className="text-center">
              <p className="text-muted-foreground text-sm leading-relaxed">
                Take your time! Your ideas are valuable and there's no rush.
              </p>
            </div>
          </div>
        )}

        {/* Back to Story */}
        <div className="text-center mt-8">
          <Button
            variant="ghost"
            onClick={() => setLocation('/story')}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2"
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