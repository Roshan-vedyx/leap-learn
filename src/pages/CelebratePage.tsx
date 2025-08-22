// src/pages/CelebratePage.tsx - Simplified for MVP with Lucide icons
import React, { useState, useEffect } from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { useSessionStore } from '@/stores/sessionStore'
import {
  Zap,
  Target,
  Moon,
  ArrowRight,
  Smile,
  Sparkles,
  Waves,
  Search,
  PartyPopper,
  BookOpen,
  Brain,
  Palette,
  Star,
  Trophy,
  Rocket,
  Wand2,
  Check,
  Heart,
  X
} from 'lucide-react'

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
      title: "You channeled that energy perfectly!",
      titleIcon: Zap,
      message: "Your brain was full of energy today and you used it to power through an amazing reading session!"
    },
    focused: {
      title: "Your focus was incredible!",
      titleIcon: Target,
      message: "You stayed concentrated and really connected with the story. That's some serious brain power!"
    },
    tired: {
      title: "You pushed through beautifully!",
      titleIcon: Moon,
      message: "Even when you were feeling low-energy, you still engaged with the story. That shows real determination!"
    },
    excited: {
      title: "Your excitement made this amazing!",
      titleIcon: Sparkles,
      message: "Your enthusiasm for learning really shined through. You brought such positive energy to reading!"
    },
    overwhelmed: {
      title: "You found your calm and succeeded!",
      titleIcon: Waves,
      message: "Despite feeling overwhelmed, you took it step by step and completed a whole reading session. That's strength!"
    },
    curious: {
      title: "Your curiosity led to discovery!",
      titleIcon: Search,
      message: "You asked great questions and really explored the story deeply. Your curiosity is a superpower!"
    }
  }

  const currentCelebration = currentBrainState 
    ? celebrationMessages[currentBrainState.id as keyof typeof celebrationMessages] || celebrationMessages.focused
    : celebrationMessages.focused

  const achievements = [
    { icon: BookOpen, text: 'Completed a full story', achieved: true },
    { icon: Brain, text: 'Practiced phonics skills', achieved: true },
    { icon: Palette, text: 'Created original response', achieved: !!creativeResponse },
    { icon: Star, text: 'Stayed engaged throughout', achieved: true },
    { icon: Target, text: 'Made personal connections', achieved: !!creativeResponse },
    { icon: Rocket, text: `Adapted to ${currentBrainState?.label || 'your'} energy`, achieved: !!currentBrainState }
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
    <div className="min-h-screen bg-gradient-to-b from-yellow-50 via-orange-50 to-pink-50 relative overflow-hidden">
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

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-6 sm:py-8 lg:py-12 relative z-10">
        {/* Main Celebration */}
        <div className="text-center mb-6 sm:mb-8">
          <div className="mb-4 sm:mb-6 flex justify-center">
            <PartyPopper className="w-16 h-16 sm:w-20 sm:h-20 text-primary animate-bounce" />
          </div>
          <h1 className="text-3xl sm:text-4xl lg:text-5xl xl:text-6xl font-bold text-primary mb-4">
            Amazing Work!
          </h1>
          <h2 className="text-xl sm:text-2xl lg:text-3xl font-semibold text-primary mb-4 sm:mb-6 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
            <currentCelebration.titleIcon className="w-6 h-6 sm:w-8 sm:h-8" />
            <span className="text-center">{currentCelebration.title}</span>
          </h2>
          <p className="text-base sm:text-lg lg:text-xl text-muted-foreground leading-relaxed max-w-2xl mx-auto px-4">
            {currentCelebration.message}
          </p>
        </div>

        {/* Personal Achievement Summary */}
        {currentBrainState && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-blue-50 to-purple-50 border-primary border-2 shadow-lg">
            <CardContent className="p-4 sm:p-6 text-center">
              <div className="flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3 mb-4">
                <currentBrainState.icon className="w-6 h-6 sm:w-8 sm:h-8 text-primary" />
                <h3 className="text-lg sm:text-xl font-semibold text-primary">
                  Your Brain Journey Today
                </h3>
              </div>
              <p className="text-sm sm:text-base text-muted-foreground leading-relaxed flex flex-col sm:flex-row items-center justify-center flex-wrap gap-1 sm:gap-2">
                <span>Started feeling <strong>{currentBrainState.label.toLowerCase()}</strong></span>
                {creativeResponse && (
                  <>
                    <ArrowRight className="w-4 h-4 hidden sm:inline" />
                    <span>Created something amazing</span>
                  </>
                )}
                <ArrowRight className="w-4 h-4 hidden sm:inline" />
                <span>Celebrated your success!</span>
              </p>
            </CardContent>
          </Card>
        )}

        {/* Achievements Grid */}
        <Card className="mb-6 sm:mb-8 bg-card border-primary border-2 shadow-lg">
          <CardHeader className="pb-4">
            <CardTitle className="text-center text-lg sm:text-xl lg:text-2xl text-primary flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Trophy className="w-6 h-6 sm:w-8 sm:h-8" /> 
              <span>What You Accomplished Today</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {achievements.map((achievement, index) => (
                <div
                  key={index}
                  className={`flex items-center gap-3 p-3 sm:p-4 rounded-lg transition-all duration-300 border-2 ${
                    achievement.achieved
                      ? 'bg-green-50 border-green-200'
                      : 'bg-muted border-muted-foreground/20 opacity-50'
                  }`}
                >
                  <span className="flex-shrink-0">
                    {achievement.achieved ? (
                      <achievement.icon className="w-5 h-5 sm:w-6 sm:h-6 text-primary" />
                    ) : (
                      <X className="w-5 h-5 sm:w-6 sm:h-6 text-muted-foreground" />
                    )}
                  </span>
                  <span className={`font-medium text-sm sm:text-base ${
                    achievement.achieved ? 'text-primary' : 'text-muted-foreground'
                  }`}>
                    {achievement.text}
                  </span>
                  {achievement.achieved && (
                    <Check className="ml-auto w-4 h-4 sm:w-5 sm:h-5 text-green-600 font-bold flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Creative Response Highlight */}
        {creativeResponse && (
          <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-300 border-2 shadow-lg">
            <CardContent className="p-4 sm:p-6">
              <h3 className="text-lg sm:text-xl font-semibold text-primary mb-4 text-center flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
                <Palette className="w-5 h-5 sm:w-6 sm:h-6" /> 
                <span>Your Creative Masterpiece</span>
              </h3>
              <div className="bg-card rounded-lg p-3 sm:p-4 border border-border">
                <p className="text-xs sm:text-sm text-muted-foreground mb-2">
                  Your response to "{creativeResponse.prompt}":
                </p>
                <p className="text-sm sm:text-base text-foreground leading-relaxed italic">
                  "{creativeResponse.response}"
                </p>
              </div>
              <p className="text-center text-xs sm:text-sm text-muted-foreground mt-3 flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
                <span>Your creativity and thoughts make stories come alive!</span>
                <Star className="w-4 h-4" />
              </p>
            </CardContent>
          </Card>
        )}

        {/* Personal Message */}
        <Card className="mb-6 sm:mb-8 bg-gradient-to-r from-green-50 to-blue-50 border-primary border-2 shadow-lg">
          <CardContent className="p-6 sm:p-8 text-center">
            <h3 className="text-lg sm:text-xl lg:text-2xl font-semibold text-primary mb-4 flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-3">
              <Star className="w-6 h-6 sm:w-8 sm:h-8" /> 
              <span>You're Building Real Skills</span>
            </h3>
            <p className="text-base sm:text-lg text-muted-foreground leading-relaxed mb-4">
              Every time you read, you're getting stronger at understanding words, 
              making connections, and expressing your ideas. That's not just reading - 
              that's becoming a more powerful thinker!
            </p>
            <p className="text-sm sm:text-base text-muted-foreground italic flex flex-col sm:flex-row items-center justify-center gap-1 sm:gap-2">
              <Heart className="w-4 h-4" />
              <span>"Reading is not just about words on a page. It's about building worlds in your mind."</span>
            </p>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 justify-center items-center mb-6 sm:mb-8">
          <Button
            variant="default"
            size="lg"
            onClick={handleContinue}
            className="w-full sm:w-auto text-lg sm:text-xl px-6 sm:px-8 py-3 sm:py-4 min-h-[44px] sm:min-h-[56px] shadow-lg flex items-center justify-center gap-2 sm:gap-3"
          >
            <Rocket className="w-5 h-5 sm:w-6 sm:h-6" /> 
            <span>Read Another Story!</span>
          </Button>
          
          <Button
            variant="outline"
            size="lg"
            onClick={handleFinish}
            className="w-full sm:w-auto text-base sm:text-lg px-4 sm:px-6 py-3 sm:py-4 min-h-[44px] sm:min-h-[56px] flex items-center justify-center gap-2 sm:gap-3"
          >
            <Wand2 className="w-4 h-4 sm:w-5 sm:h-5" /> 
            <span>I'm Done for Now</span>
          </Button>
        </div>

        {/* Encouragement for Next Time */}
        <div className="text-center">
          <p className="text-sm sm:text-base text-muted-foreground leading-relaxed px-4">
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

        {/* Hidden announcements area for screen readers */}
        <div id="accessibility-announcements" className="sr-only" aria-live="polite"></div>
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