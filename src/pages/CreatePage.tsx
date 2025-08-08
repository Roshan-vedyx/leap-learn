import React, { useState } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Textarea } from '@/components/ui/Input'

const CreatePage: React.FC = () => {
  const [selectedPrompt, setSelectedPrompt] = useState<string | null>(null)
  const [response, setResponse] = useState('')
  const [, setLocation] = useLocation()

  const prompts = [
    {
      id: 'continue',
      title: 'What happens next?',
      emoji: '✨',
      description: 'Continue the story in your own words',
      placeholder: 'Maya and Bolt decided to...'
    },
    {
      id: 'reminds',
      title: 'This reminds me of...',
      emoji: '💭',
      description: 'Connect the story to your own experiences',
      placeholder: 'This story reminds me of when I...'
    },
    {
      id: 'character',
      title: 'If I were the character...',
      emoji: '🎭',
      description: 'Put yourself in the story',
      placeholder: 'If I were Maya, I would...'
    },
    {
      id: 'questions',
      title: 'I wonder...',
      emoji: '🤔',
      description: 'Ask questions about the story',
      placeholder: 'I wonder why...'
    }
  ]

  const handlePromptSelect = (promptId: string) => {
    setSelectedPrompt(promptId)
    const prompt = prompts.find(p => p.id === promptId)
    if (prompt) {
      setResponse(prompt.placeholder)
    }
  }

  const handleContinue = () => {
    // Save the creative response
    localStorage.setItem('creative-response', JSON.stringify({
      prompt: selectedPrompt,
      response: response,
      timestamp: new Date().toISOString()
    }))
    
    // Go to celebration
    setLocation('/celebrate')
  }

  const selectedPromptData = prompts.find(p => p.id === selectedPrompt)

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-sky to-autism-calm-sage p-4">
      <div className="max-w-4xl mx-auto py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl md:text-5xl font-bold text-autism-primary mb-4">
            Time to Create! 🎨
          </h1>
          <p className="text-xl text-autism-primary/80 leading-relaxed max-w-2xl mx-auto">
            You've read an amazing story! Now it's your turn to add your own thoughts and ideas. 
            Pick what feels right to you - there are no wrong answers!
          </p>
        </div>

        {!selectedPrompt ? (
          /* Prompt Selection */
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {prompts.map((prompt) => (
              <Card
                key={prompt.id}
                interactive="full"
                className="cursor-pointer transition-all duration-200 hover:scale-105 bg-autism-neutral border-autism-primary border-2"
                onClick={() => handlePromptSelect(prompt.id)}
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    handlePromptSelect(prompt.id)
                  }
                }}
              >
                <CardContent className="p-6 text-center h-full flex flex-col justify-center">
                  <div className="text-5xl mb-4" role="img" aria-label={prompt.title}>
                    {prompt.emoji}
                  </div>
                  <h3 className="text-2xl font-semibold text-autism-primary mb-3">
                    {prompt.title}
                  </h3>
                  <p className="text-autism-primary/80 leading-relaxed">
                    {prompt.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          /* Response Writing */
          <div className="space-y-6">
            <Card className="bg-autism-neutral border-autism-primary border-2">
              <CardHeader>
                <CardTitle className="text-2xl text-autism-primary flex items-center gap-3">
                  {selectedPromptData?.emoji} {selectedPromptData?.title}
                </CardTitle>
                <CardDescription className="text-lg text-autism-primary/80">
                  {selectedPromptData?.description}
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="bg-white border-autism-secondary border-2">
              <CardContent className="p-6">
                <Textarea
                  value={response}
                  onChange={(e) => setResponse(e.target.value)}
                  placeholder={selectedPromptData?.placeholder}
                  className="min-h-[200px] text-lg leading-relaxed resize-none"
                  variant="calm"
                  size="comfortable"
                  aria-label="Write your creative response here"
                />
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                variant="outline"
                size="comfortable"
                onClick={() => {
                  setSelectedPrompt(null)
                  setResponse('')
                }}
              >
                ← Choose Different Prompt
              </Button>
              
              <Button
                variant="celebration"
                size="comfortable"
                onClick={handleContinue}
                disabled={response.trim().length < 10}
                className="text-lg px-8"
              >
                {response.trim().length < 10 
                  ? 'Keep Writing...' 
                  : 'I\'m Done Creating! 🎉'
                }
              </Button>
            </div>

            {/* Encouragement */}
            <div className="text-center">
              <p className="text-autism-primary/60 text-sm leading-relaxed">
                Take your time! Your ideas are valuable and there's no rush.
              </p>
            </div>
          </div>
        )}

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            This page lets you respond creatively to the story you just read. 
            Choose from four different prompts or write freely. 
            Your response will be celebrated, not graded.
          </p>
        </div>
      </div>
    </div>
  )
}

export default CreatePage