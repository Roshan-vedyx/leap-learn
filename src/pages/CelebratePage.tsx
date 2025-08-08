import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { storage } from '@/lib/utils'

const CelebratePage: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [, setLocation] = useLocation()

  // Get session data for personalized celebration
  const brainState = storage.get('current-brain-state', 'focused')
  const creativeResponse = storage.get('creative-response', null)

  useEffect(() => {
    // Start celebration animation
    setShowConfetti(true)
    
    // Save session completion
    const sessionData = {
      completedAt: new Date().toISOString(),
      brainState,
      hasCreativeResponse: !!creativeResponse,
      sessionDuration: '8-12 minutes' // Estimated
    }
    
    // Store in session history
    const sessions = storage.get('completed-sessions', [])
    sessions.push(sessionData)
    storage.set('completed-sessions', sessions)
    
    // Clean up current session data
    setTimeout(() => {
      localStorage.removeItem('current-brain-state')
      localStorage.removeItem('creative-response')
    }, 30000) // Keep for 30 seconds for any needed access
  }, [brainState, creativeResponse])

  const celebrationMessages = {
    energetic: {
      title: "You channeled that energy perfectly! ⚡",
      message: "Your brain was full of energy today and you used it to power through an amazing reading session!"
    },
    focused: {
      title: "Your focus was incredible! 🎯",
      message: "You stayed concentrated and really connected with the story. That's some serious brain power!"
    },
    tired: {
      title: "You pushed through beautifully! 😴➡️😊",
      message: "Even when you were feeling low-energy, you still engaged with the story. That shows real determination!"
    },
    excited: {
      title: "Your excitement made this amazing! 🤩",
      message: "Your enthusiasm for learning really shined through. You brought such positive energy to reading!"
    },
    overwhelmed: {
      title: "You found your calm and succeeded! 🌊➡️🕊️",
      message: "Despite feeling overwhelmed, you took it step by step and completed a whole reading session. That's strength!"
    },
    curious: {
      title: "Your curiosity led to discovery! 🔍",
      message: "You asked great questions and really explored the story deeply. Your curiosity is a superpower!"
    }
  }

  const currentCelebration = celebrationMessages[brainState as keyof typeof celebrationMessages] || celebrationMessages.focused

  const achievements = [
    { icon: '📚', text: 'Completed a full story', achieved: true },
    { icon: '🧠', text: 'Practiced phonics skills', achieved: true },
    { icon: '🎨', text: 'Created original response', achieved: !!creativeResponse },
    { icon: '⭐', text: 'Stayed engaged throughout', achieved: true },
    { icon: '🎯', text: 'Made personal connections', achieved: !!creativeResponse }
  ]

  const handleContinue = () => {
    setLocation('/brain-check')
  }

  const handleFinish = () => {
    setLocation('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-sky via-autism-calm-mint to-autism-calm-sage p-4 relative overflow-hidden">
      {/* Confetti Animation */}
      {showConfetti && (
        <div className="absolute inset-0 pointer-events-none">
          <div className="confetti-animation">
            {[...Array(20)].map((_, i) => (
              <div
                key={i}
                className="confetti-piece"
                style={{
                  left: `${Math.random() * 100}%`,
                  animationDelay: `${Math.random() * 3}s`,
                  backgroundColor: [
                    'hsl(var(--autism-primary))',
                    'hsl(var(--autism-secondary))',
                    '#FFD700',
                    '#FF69B4',
                    '#00CED1'
                  ][i % 5]
                }}
              />
            ))}
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto py-8 relative z-10">
        {/* Main Celebration */}
        <div className="text-center mb-8">
          <div className="text-8xl mb-6 animate-gentle-bounce">🎉</div>
          <h1 className="text-4xl md:text-6xl font-bold text-autism-primary mb-4">
            Amazing Work!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-autism-primary/90 mb-6">
            {currentCelebration.title}
          </h2>
          <p className="text-xl text-autism-primary/80 leading-relaxed max-w-2xl mx-auto">
            {currentCelebration.message}
          </p>
        </div>

        {/* Achievements Grid */}
        <Card className="mb-8 bg-white/90 border-autism-primary border-2">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-autism-primary">
              🏆 What You Accomplished Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 ${
                    achievement.achieved
                      ? 'bg-autism-calm-mint border-2 border-autism-secondary'
                      : 'bg-gray-100 border-2 border-gray-300 opacity-50'
                  }`}
                >
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {achievement.achieved ? achievement.icon : '⭕'}
                  </span>
                  <span className={`font-medium ${
                    achievement.achieved ? 'text-autism-primary' : 'text-gray-500'
                  }`}>
                    {achievement.text}
                  </span>
                  {achievement.achieved && (
                    <span className="ml-auto text-autism-secondary font-bold">✓</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Personal Message */}
        <Card className="mb-8 bg-gradient-to-r from-autism-calm-mint to-autism-calm-sky border-autism-primary border-2">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-semibold text-autism-primary mb-4">
              🌟 You're Building Real Skills
            </h3>
            <p className="text-lg text-autism-primary/80 leading-relaxed mb-4">
              Every time you read, you're getting stronger at understanding words, 
              making connections, and expressing your ideas. That's not just reading - 
              that's becoming a more powerful thinker!
            </p>
            <p className="text-base text-autism-primary/70 italic">
              "Reading is not just about words on a page. It's about building worlds in your mind."
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            variant="celebration"
            size="comfortable"
            onClick={handleContinue}
            className="text-xl px-8 py-4"
          >
            🚀 Read Another Story!
          </Button>
          
          <Button
            variant="calm"
            size="comfortable"
            onClick={handleFinish}
            className="text-lg px-6 py-4"
          >
            ✨ I'm Done for Now
          </Button>
        </div>

        {/* Encouragement for Next Time */}
        <div className="text-center mt-8">
          <p className="text-autism-primary/60 text-sm leading-relaxed">
            Remember: Every time you read, you're growing your brain! 
            Come back whenever you're ready for your next adventure.
          </p>
        </div>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            Congratulations on completing your reading session! You've successfully read a story, 
            practiced important skills, and expressed your creativity. You can choose to read 
            another story or finish for now.
          </p>
        </div>
      </div>

      {/* CSS for Confetti Animation */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .confetti-animation {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            overflow: hidden;
          }
          
          .confetti-piece {
            position: absolute;
            width: 10px;
            height: 10px;
            top: -10px;
            animation: confetti-fall 3s linear infinite;
          }
          
          @keyframes confetti-fall {
            0% {
              transform: translateY(-100vh) rotate(0deg);
              opacity: 1;
            }
            100% {
              transform: translateY(100vh) rotate(360deg);
              opacity: 0;
            }
          }
          
          .confetti-piece:nth-child(odd) {
            animation-duration: 2.5s;
            animation-delay: 0.5s;
          }
          
          .confetti-piece:nth-child(even) {
            animation-duration: 3.5s;
            animation-delay: 1s;
          }
        `
      }} />
    </div>
  )
}

export default CelebratePage