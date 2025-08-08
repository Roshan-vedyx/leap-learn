// src/pages/CelebratePage.tsx - Simplified for MVP
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSessionStore } from '@/stores/sessionStore'

const CelebratePage: React.FC = () => {
  const [showConfetti, setShowConfetti] = useState(false)
  const [, setLocation] = useLocation()

  // Zustand store
  const { 
    currentBrainState, 
    creativeResponse, 
    completeSession, 
    resetSession 
  } = useSessionStore()

  useEffect(() => {
    // Start celebration animation
    setShowConfetti(true)
    
    // Complete the session in global state
    completeSession()
    
    // Announce completion for screen readers
    const announcement = 'Congratulations! You have completed your reading session successfully.'
    const announcer = document.getElementById('accessibility-announcements')
    if (announcer) {
      announcer.textContent = announcement
    }
  }, [completeSession])

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

  const currentCelebration = currentBrainState 
    ? celebrationMessages[currentBrainState.id as keyof typeof celebrationMessages] || celebrationMessages.focused
    : celebrationMessages.focused

  const achievements = [
    { icon: '📚', text: 'Completed a full story', achieved: true },
    { icon: '🧠', text: 'Practiced phonics skills', achieved: true },
    { icon: '🎨', text: 'Created original response', achieved: !!creativeResponse },
    { icon: '⭐', text: 'Stayed engaged throughout', achieved: true },
    { icon: '🎯', text: 'Made personal connections', achieved: !!creativeResponse },
    { icon: '🚀', text: `Adapted to ${currentBrainState?.label || 'your'} energy`, achieved: !!currentBrainState }
  ]

  const handleContinue = () => {
    // Reset session and start fresh
    resetSession()
    setLocation('/brain-check')
  }

  const handleFinish = () => {
    // Reset session and go home
    resetSession()
    setLocation('/')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50 p-4 relative overflow-hidden">
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
                    'hsl(var(--primary))',
                    'hsl(var(--secondary))',
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
          <div className="text-8xl mb-6 animate-bounce">🎉</div>
          <h1 className="text-4xl md:text-6xl font-bold text-primary mb-4">
            Amazing Work!
          </h1>
          <h2 className="text-2xl md:text-3xl font-semibold text-primary mb-6">
            {currentCelebration.title}
          </h2>
          <p className="text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto">
            {currentCelebration.message}
          </p>
        </div>

        {/* Personal Achievement Summary */}
        {currentBrainState && (
          <Card className="mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-primary border-2 shadow-lg">
            <CardContent className="p-6 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <span className="text-3xl">{currentBrainState.emoji}</span>
                <h3 className="text-xl font-semibold text-primary">
                  Your Brain Journey Today
                </h3>
              </div>
              <p className="text-muted-foreground leading-relaxed">
                Started feeling <strong>{currentBrainState.label.toLowerCase()}</strong> 
                {creativeResponse && <span> → Created something amazing</span>}
                <span> → Celebrated your success!</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Achievements Grid */}
        <Card className="mb-8 bg-card border-primary border-2 shadow-lg">
          <CardHeader>
            <CardTitle className="text-center text-2xl text-primary">
              🏆 What You Accomplished Today
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-4 rounded-lg transition-all duration-300 border-2 ${
                    achievement.achieved
                      ? 'bg-green-50 border-green-200'
                      : 'bg-muted border-muted-foreground/20 opacity-50'
                  }`}
                >
                  <span className="text-2xl" role="img" aria-hidden="true">
                    {achievement.achieved ? achievement.icon : '⭕'}
                  </span>
                  <span className={`font-medium ${
                    achievement.achieved ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {achievement.text}
                  </span>
                  {achievement.achieved && (
                    <span className="ml-auto text-green-600 font-bold">✓</span>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Creative Response Highlight */}
        {creativeResponse && (
          <Card className="mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 border-2 shadow-lg">
            <CardContent className="p-6">
              <h3 className="text-xl font-semibold text-primary mb-4 text-center">
                🎨 Your Creative Masterpiece
              </h3>
              <div className="bg-card rounded-lg p-4 border border-border">
                <p className="text-sm text-muted-foreground mb-2">
                  Your response to "{creativeResponse.prompt}":
                </p>
                <p className="text-foreground leading-relaxed italic">
                  "{creativeResponse.response}"
                </p>
              </div>
              <p className="text-center text-sm text-muted-foreground mt-3">
                Your creativity and thoughts make stories come alive! 🌟
              </p>
            </CardContent>
          </Card>
        )}

        {/* Personal Message */}
        <Card className="mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-primary border-2 shadow-lg">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-semibold text-primary mb-4">
              🌟 You're Building Real Skills
            </h3>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Every time you read, you're getting stronger at understanding words, 
              making connections, and expressing your ideas. That's not just reading - 
              that's becoming a more powerful thinker!
            </p>
            <p className="text-base text-muted-foreground italic">
              "Reading is not just about words on a page. It's about building worlds in your mind."
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
          <Button
            variant="default"
            size="lg"
            onClick={handleContinue}
            className="text-xl px-8 py-4 min-h-[56px] shadow-lg"
          >
            🚀 Read Another Story!
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleFinish}
            className="text-lg px-6 py-4 min-h-[56px]"
          >
            ✨ I'm Done for Now
          </Button>
        </div>

        {/* Encouragement for Next Time */}
        <div className="text-center mt-8">
          <p className="text-muted-foreground text-sm leading-relaxed">
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