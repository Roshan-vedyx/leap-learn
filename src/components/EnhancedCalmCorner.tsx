import React, { useState, useEffect, useRef } from 'react'
import { useSessionStore } from '@/stores/sessionStore'

// Calm Corner Preferences type
interface CalmCornerPreferences {
  mostUsed: 'heavy' | 'rock' | 'quiet'
  sessionCount: number
  averageDuration: number
  lastUsed?: string
}

// Enhanced Calm Corner Component - Fully Responsive
const EnhancedCalmCorner: React.FC = () => {
  const { isInCalmCorner, toggleCalmCorner } = useSessionStore()
  const [currentExperience, setCurrentExperience] = useState<'heavy' | 'rock' | 'quiet' | null>(null)
  const [showExitButton, setShowExitButton] = useState(false)
  const [sessionStartTime, setSessionStartTime] = useState<number>(0)
  const [isHapticSupported, setIsHapticSupported] = useState(false)
  const exitTimeoutRef = useRef<NodeJS.Timeout>()

  // Check for haptic feedback support
  useEffect(() => {
    setIsHapticSupported('vibrate' in navigator)
  }, [])

  // Load preferences from localStorage
  const loadPreferences = (): CalmCornerPreferences => {
    const stored = localStorage.getItem('calmCornerPreferences')
    return stored ? JSON.parse(stored) : {
      mostUsed: 'heavy',
      sessionCount: 0,
      averageDuration: 0
    }
  }

  // Save preferences to localStorage
  const savePreferences = (prefs: CalmCornerPreferences) => {
    localStorage.setItem('calmCornerPreferences', JSON.stringify(prefs))
  }

  // Track usage analytics
  const trackUsage = (experience: 'heavy' | 'rock' | 'quiet', duration: number) => {
    const prefs = loadPreferences()
    const newPrefs: CalmCornerPreferences = {
      mostUsed: experience,
      sessionCount: prefs.sessionCount + 1,
      averageDuration: Math.round((prefs.averageDuration * prefs.sessionCount + duration) / (prefs.sessionCount + 1)),
      lastUsed: new Date().toISOString()
    }
    savePreferences(newPrefs)
  }

  // Start experience
  const startExperience = (experience: 'heavy' | 'rock' | 'quiet') => {
    setCurrentExperience(experience)
    setSessionStartTime(Date.now())
    setShowExitButton(false)
    
    // Show exit button after 15 seconds minimum
    exitTimeoutRef.current = setTimeout(() => {
      setShowExitButton(true)
    }, 15000)

    // Trigger haptic feedback for heavy experience
    if (experience === 'heavy' && isHapticSupported) {
      navigator.vibrate?.([200, 100, 200])
    }
  }

  // Exit experience
  const exitExperience = () => {
    if (currentExperience && sessionStartTime) {
      const duration = Math.round((Date.now() - sessionStartTime) / 1000)
      trackUsage(currentExperience, duration)
    }
    
    setCurrentExperience(null)
    setShowExitButton(false)
    setSessionStartTime(0)
    
    if (exitTimeoutRef.current) {
      clearTimeout(exitTimeoutRef.current)
    }
    
    toggleCalmCorner()
  }

  // Handle ESC key to exit
  useEffect(() => {
    const handleEscKey = (event: KeyboardEvent) => {
      // Only allow ESC to exit if we're in an experience AND the exit button is showing
      // This respects the 15-second minimum requirement
      if (event.key === 'Escape' && currentExperience && showExitButton) {
        exitExperience()
      }
    }

    // Add event listener when in calm corner
    if (isInCalmCorner) {
      document.addEventListener('keydown', handleEscKey)
    }

    return () => {
      document.removeEventListener('keydown', handleEscKey)
    }
  }, [isInCalmCorner, currentExperience, showExitButton])

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (exitTimeoutRef.current) {
        clearTimeout(exitTimeoutRef.current)
      }
    }
  }, [])

  // Floating button when not active - RESPONSIVE
  if (!isInCalmCorner) {
    {/*return (
      <button
        onClick={toggleCalmCorner}
        className="fixed top-4 right-4 z-50 
          w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16
          bg-[#8BA888] hover:bg-[#7A9F77] 
          rounded-full shadow-lg border-2 border-white 
          transition-all duration-200 
          flex items-center justify-center 
          text-lg sm:text-xl md:text-2xl"
        aria-label="Open calm corner for sensory regulation"
        style={{ 
          minWidth: '48px',
          minHeight: '48px',
          touchAction: 'manipulation'
        }}
      >
        🕊️
      </button>
    )*/}
    return null
  }

  // Option selection screen - RESPONSIVE
  if (!currentExperience) {
    return (
      <div 
        className="fixed inset-0 z-50 flex items-center justify-center"
        style={{ 
          backgroundColor: '#8BA888',
          transition: 'all 0.1s ease-out',
          touchAction: 'manipulation'
        }}
      >
        <div className="w-full h-full flex items-center justify-center 
          p-4 sm:p-6 md:p-8 lg:p-12">
          
          {/* Option buttons container - RESPONSIVE LAYOUT */}
          <div className="flex flex-col items-center justify-center 
            gap-4 sm:gap-6 md:gap-8 lg:gap-12
            md:flex-row
            w-full max-w-4xl">
            
            {/* HEAVY Option - RESPONSIVE SIZING */}
            <button
              onClick={() => startExperience('heavy')}
              className="flex flex-col items-center justify-center 
                bg-white bg-opacity-90 hover:bg-opacity-100 
                rounded-2xl sm:rounded-3xl 
                shadow-lg transition-all duration-200 active:scale-95 
                border-2 sm:border-4 border-white
                w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48"
              style={{ 
                minWidth: '128px',
                minHeight: '128px',
                touchAction: 'manipulation'
              }}
              aria-label="Heavy pressure experience for deep sensory input"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 sm:mb-2 md:mb-3">🤗</div>
              <div className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl 
                font-bold tracking-wide px-2 text-center">HEAVY</div>
            </button>

            {/* ROCK Option - RESPONSIVE SIZING */}
            <button
              onClick={() => startExperience('rock')}
              className="flex flex-col items-center justify-center 
                bg-white bg-opacity-90 hover:bg-opacity-100 
                rounded-2xl sm:rounded-3xl 
                shadow-lg transition-all duration-200 active:scale-95 
                border-2 sm:border-4 border-white
                w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48"
              style={{ 
                minWidth: '128px',
                minHeight: '128px',
                touchAction: 'manipulation'
              }}
              aria-label="Rocking movement experience for vestibular input"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 sm:mb-2 md:mb-3">🌊</div>
              <div className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl 
                font-bold tracking-wide px-2 text-center">ROCK</div>
            </button>

            {/* QUIET Option - RESPONSIVE SIZING */}
            <button
              onClick={() => startExperience('quiet')}
              className="flex flex-col items-center justify-center 
                bg-white bg-opacity-90 hover:bg-opacity-100 
                rounded-2xl sm:rounded-3xl 
                shadow-lg transition-all duration-200 active:scale-95 
                border-2 sm:border-4 border-white
                w-32 h-32 sm:w-40 sm:h-40 md:w-44 md:h-44 lg:w-48 lg:h-48"
              style={{ 
                minWidth: '128px',
                minHeight: '128px',
                touchAction: 'manipulation'
              }}
              aria-label="Quiet sensory reduction for calming"
            >
              <div className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl mb-1 sm:mb-2 md:mb-3">🤫</div>
              <div className="text-gray-800 text-sm sm:text-base md:text-lg lg:text-xl 
                font-bold tracking-wide px-2 text-center">QUIET</div>
            </button>
          </div>
        </div>
      </div>
    )
  }

  // HEAVY Experience - RESPONSIVE
  if (currentExperience === 'heavy') {
    return (
      <div 
        className="fixed inset-0 z-50 bg-[#8BA888] flex items-center justify-center"
        style={{
          animation: 'breathingSqueeze 3s ease-in-out infinite',
          touchAction: 'manipulation'
        }}
      >
        <style>{`
          @keyframes breathingSqueeze {
            0%, 100% { 
              transform: scale(1);
              filter: brightness(1);
            }
            50% { 
              transform: scale(0.95);
              filter: brightness(0.9);
              box-shadow: inset 0 0 100px rgba(0,0,0,0.1);
            }
          }
          
          @keyframes pulseFromEdges {
            0%, 100% { 
              box-shadow: inset 0 0 0 rgba(255,255,255,0.2);
            }
            50% { 
              box-shadow: inset 0 0 200px rgba(255,255,255,0.3);
            }
          }
        `}</style>
        
        <div 
          className="w-full h-full flex items-center justify-center"
          style={{
            animation: 'pulseFromEdges 3s ease-in-out infinite'
          }}
        >
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl opacity-50">🤗</div>
        </div>

        {showExitButton && (
          <button
            onClick={exitExperience}
            className="fixed 
              bottom-4 sm:bottom-6 md:bottom-8 
              left-1/2 transform -translate-x-1/2 
              w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
              bg-green-500 hover:bg-green-600 
              rounded-full shadow-lg 
              flex items-center justify-center 
              transition-all duration-200 active:scale-95"
            style={{ 
              minWidth: '64px',
              minHeight: '64px',
              touchAction: 'manipulation'
            }}
            aria-label="I'm ready to continue"
          >
            <div className="text-white text-2xl sm:text-3xl md:text-4xl">✓</div>
          </button>
        )}
      </div>
    )
  }

  // ROCK Experience - RESPONSIVE
  if (currentExperience === 'rock') {
    return (
      <div 
        className="fixed inset-0 z-50 bg-[#8BA888] flex items-center justify-center overflow-hidden"
        style={{
          animation: 'gentleRock 4s ease-in-out infinite',
          touchAction: 'manipulation'
        }}
      >
        <style>{`
          @keyframes gentleRock {
            0%, 100% { 
              transform: translateX(0px);
            }
            25% { 
              transform: translateX(-10px);
            }
            75% { 
              transform: translateX(10px);
            }
          }
          
          @keyframes waveMotion {
            0%, 100% { 
              transform: translateY(0px) scaleX(1);
            }
            50% { 
              transform: translateY(-5px) scaleX(1.05);
            }
          }
        `}</style>
        
        <div 
          className="w-full h-full flex items-center justify-center relative"
          style={{
            background: 'linear-gradient(45deg, #8BA888 0%, #A8C4A8 50%, #8BA888 100%)',
            animation: 'waveMotion 4s ease-in-out infinite'
          }}
        >
          <div className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl xl:text-8xl opacity-50">🌊</div>
          
          {/* Subtle wave pattern */}
          <div 
            className="absolute inset-0 opacity-20"
            style={{
              background: 'repeating-linear-gradient(90deg, transparent 0px, rgba(255,255,255,0.1) 20px, transparent 40px)',
              animation: 'waveMotion 6s ease-in-out infinite reverse'
            }}
          />
        </div>

        {showExitButton && (
          <button
            onClick={exitExperience}
            className="fixed 
              bottom-4 sm:bottom-6 md:bottom-8 
              left-1/2 transform -translate-x-1/2 
              w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
              bg-green-500 hover:bg-green-600 
              rounded-full shadow-lg 
              flex items-center justify-center 
              transition-all duration-200 active:scale-95"
            style={{ 
              minWidth: '64px',
              minHeight: '64px',
              touchAction: 'manipulation'
            }}
            aria-label="I'm ready to continue"
          >
            <div className="text-white text-2xl sm:text-3xl md:text-4xl">✓</div>
          </button>
        )}
      </div>
    )
  }

  // QUIET Experience - RESPONSIVE
  if (currentExperience === 'quiet') {
    return (
      <div 
        className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center"
        style={{ touchAction: 'manipulation' }}
      >
        <style>{`
          @keyframes breathingCircle {
            0%, 100% { 
              transform: scale(1);
              opacity: 0.3;
            }
            50% { 
              transform: scale(1.2);
              opacity: 0.6;
            }
          }
        `}</style>
        
        <div 
          className="w-24 h-24 sm:w-28 sm:h-28 md:w-32 md:h-32 lg:w-36 lg:h-36
            rounded-full bg-white/20 flex items-center justify-center"
          style={{
            animation: 'breathingCircle 4s ease-in-out infinite'
          }}
        >
          <div className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl opacity-60">🤫</div>
        </div>

        {showExitButton && (
          <button
            onClick={exitExperience}
            className="fixed 
              bottom-4 sm:bottom-6 md:bottom-8 
              left-1/2 transform -translate-x-1/2 
              w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 
              bg-green-500 hover:bg-green-600 
              rounded-full shadow-lg 
              flex items-center justify-center 
              transition-all duration-200 active:scale-95"
            style={{ 
              minWidth: '64px',
              minHeight: '64px',
              touchAction: 'manipulation'
            }}
            aria-label="I'm ready to continue"
          >
            <div className="text-white text-2xl sm:text-3xl md:text-4xl">✓</div>
          </button>
        )}
      </div>
    )
  }

  return null
}

export default EnhancedCalmCorner