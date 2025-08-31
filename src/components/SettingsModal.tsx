// src/components/SettingsModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Settings, Volume2, RotateCcw, Accessibility, ChevronDown, Check } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { PinReset } from '@/components/auth/PinReset'
import type { TtsAccent } from '@/types'

interface SettingsModalProps {
  isOpen: boolean
  onClose: () => void
  ttsAccent: TtsAccent
  onTtsAccentChange: (accent: TtsAccent) => void
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  ttsAccent,
  onTtsAccentChange
}) => {
  const [showPinReset, setShowPinReset] = useState(false)
  const [siennaEnabled, setSiennaEnabled] = useState(false)
  const [isClosing, setIsClosing] = useState(false)
  const [hasChanges, setHasChanges] = useState(false)
  
  // Track initial values to detect changes
  const [initialTtsAccent, setInitialTtsAccent] = useState<TtsAccent>('')
  const [initialSiennaEnabled, setInitialSiennaEnabled] = useState(false)

  // Load Sienna preference on mount
  useEffect(() => {
    const saved = localStorage.getItem('sienna-enabled')
    const savedEnabled = saved === 'true'
    setSiennaEnabled(savedEnabled)
    setInitialSiennaEnabled(savedEnabled)
    setInitialTtsAccent(ttsAccent)
  }, [ttsAccent])

  // Track changes
  useEffect(() => {
    const changed = ttsAccent !== initialTtsAccent || siennaEnabled !== initialSiennaEnabled
    setHasChanges(changed)
  }, [ttsAccent, initialTtsAccent, siennaEnabled, initialSiennaEnabled])

  // Handle Sienna toggle
  const toggleSienna = (enabled: boolean) => {
    setSiennaEnabled(enabled)
    localStorage.setItem('sienna-enabled', enabled.toString())
    
    if (enabled) {
      // Load Sienna script dynamically if not already loaded
      if (!document.querySelector('script[src*="sienna"]')) {
        const script = document.createElement('script')
        script.src = 'https://website-widgets.pages.dev/dist/sienna.min.js'
        script.defer = true
        script.onload = () => {
          console.log('✅ Sienna loaded fresh with proper layout')
          document.body.classList.add('sienna-enabled')
        }
        document.head.appendChild(script)
      } else {
        document.body.classList.add('sienna-enabled')
      }
    } else {
      document.body.classList.remove('sienna-enabled')
      // Optionally remove the script entirely
      const existingScript = document.querySelector('script[src*="sienna"]')
      if (existingScript) {
        existingScript.remove()
      }
      console.log('❌ Sienna disabled and removed')
    }
  }

  // Handle PIN reset completion
  const handlePinResetComplete = () => {
    setShowPinReset(false)
  }

  // Handle save changes
  const handleSaveChanges = () => {
    // Sienna toggle is already handled in real-time
    // TTS accent is already handled in real-time via onTtsAccentChange
    setHasChanges(false)
    setInitialTtsAccent(ttsAccent)
    setInitialSiennaEnabled(siennaEnabled)
    handleClose()
  }

  // Smooth close animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
    }, 200)
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    if (isOpen) {
      document.addEventListener('keydown', handleEscape)
      document.body.style.overflow = 'hidden'
    }

    return () => {
      document.removeEventListener('keydown', handleEscape)
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop with smooth fade */}
      <div 
        className={`fixed inset-0 bg-black/60 backdrop-blur-sm z-40 transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal with slide-up animation */}
      <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4">
        <Card className={`
          w-full sm:w-full sm:max-w-lg lg:max-w-xl
          bg-white shadow-2xl border-0
          transform transition-all duration-300 ease-out
          ${isClosing 
            ? 'translate-y-full sm:translate-y-0 sm:scale-95 opacity-0' 
            : 'translate-y-0 scale-100 opacity-100'
          }
          rounded-t-2xl sm:rounded-2xl
          max-h-[90vh] sm:max-h-[85vh]
          overflow-hidden
        `}>
          <CardContent className="p-0 h-full flex flex-col">
            {/* Header - Gradient with better visual hierarchy */}
            <div className="bg-gradient-to-r from-deep-ocean-blue to-sage-green p-4 sm:p-6 text-white">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-white/20 rounded-lg backdrop-blur-sm">
                    <Settings className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg sm:text-xl font-bold">Settings</h2>
                    <p className="text-white/80 text-sm hidden sm:block">Customize your experience</p>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleClose}
                  className="min-h-[44px] min-w-[44px] hover:bg-white/20 text-white rounded-xl transition-all"
                  aria-label="Close settings"
                >
                  <X className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {showPinReset ? (
                <div className="p-6">
                  <PinReset 
                    childId="current-child-id"
                    childUsername="Current User"
                    age={12}
                    onSuccess={handlePinResetComplete}
                    onCancel={() => setShowPinReset(false)}
                  />
                </div>
              ) : (
                <div className="p-4 sm:p-6 space-y-6">
                  {/* Voice Settings */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-sage-green/10 rounded-lg">
                        <Volume2 className="w-4 h-4 text-sage-green" />
                      </div>
                      <h3 className="text-base font-bold text-header-primary">
                        Voice & Audio
                      </h3>
                    </div>
                    
                    <div className="relative">
                      <label htmlFor="settings-tts-accent" className="block text-sm font-medium text-warm-charcoal mb-2">
                        Reading Voice Accent
                      </label>
                      <div className="relative">
                        <select
                          id="settings-tts-accent"
                          value={ttsAccent}
                          onChange={(e) => onTtsAccentChange(e.target.value as TtsAccent)}
                          className="
                            w-full appearance-none rounded-lg border border-gray-300 bg-white 
                            px-3 py-2.5 pr-10 text-sm
                            min-h-[44px] cursor-pointer
                            hover:border-deep-ocean-blue/30 focus:border-deep-ocean-blue 
                            focus:ring-2 focus:ring-deep-ocean-blue/20 
                            transition-all duration-200
                          "
                          aria-describedby="tts-accent-help"
                        >
                          <option value="" disabled>Choose your preferred voice</option>
                          <option value="US">🇺🇸 American English</option>
                          <option value="GB">🇬🇧 British English</option>
                          <option value="IN">🇮🇳 Indian English</option>
                        </select>
                        <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                      </div>
                      <p id="tts-accent-help" className="text-xs text-gray-500 mt-1">
                        All voices are optimized for clear, calm reading
                      </p>
                    </div>
                  </div>

                  {/* Accessibility Tools */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-deep-ocean-blue/10 rounded-lg">
                        <Accessibility className="w-4 h-4 text-deep-ocean-blue" />
                      </div>
                      <h3 className="text-base font-bold text-header-primary">
                        Advanced Tools
                      </h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
                      <div className="flex items-start gap-3">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <h4 className="text-sm font-bold text-header-primary">Screen Reader Pro</h4>
                            {siennaEnabled && (
                              <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full">
                                <Check className="w-3 h-3" />
                                Active
                              </div>
                            )}
                          </div>
                          <p className="text-xs text-body-text leading-relaxed mb-2">
                            Extra accessibility features including advanced screen reader support, 
                            custom highlighting, and specialized navigation tools.
                          </p>
                          <div className="text-xs text-gray-600 bg-white/60 px-2 py-1 rounded">
                            💡 Recommended for users with screen readers
                          </div>
                        </div>
                        
                        <Button
                          variant={siennaEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSienna(!siennaEnabled)}
                          className={`
                            min-h-[40px] px-4 text-sm font-medium transition-all duration-200
                            ${siennaEnabled 
                              ? 'bg-green-600 hover:bg-green-700 text-white' 
                              : 'border border-deep-ocean-blue text-deep-ocean-blue hover:bg-deep-ocean-blue hover:text-white'
                            }
                          `}
                          aria-pressed={siennaEnabled}
                        >
                          {siennaEnabled ? 'Enabled' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Account & Security */}
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="p-1.5 bg-muted-coral/10 rounded-lg">
                        <RotateCcw className="w-4 h-4 text-muted-coral" />
                      </div>
                      <h3 className="text-base font-bold text-header-primary">
                        Account & Security
                      </h3>
                    </div>
                    
                    <div className="bg-gradient-to-br from-orange-50 to-red-50 p-4 rounded-lg border border-orange-100">
                      <div className="flex items-center justify-between">
                        <div className="flex-1">
                          <h4 className="text-sm font-bold text-header-primary mb-1">Reset Your PIN</h4>
                          <p className="text-xs text-body-text leading-relaxed mb-2">
                            Change your 4-digit PIN with parent supervision.
                          </p>
                          <div className="text-xs text-orange-700 bg-orange-100 px-2 py-1 rounded">
                            🔒 Requires parent permission
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPinReset(true)}
                          className="
                            min-h-[40px] px-4 ml-3 text-sm font-medium
                            border border-muted-coral text-muted-coral 
                            hover:bg-muted-coral hover:text-white
                            transition-all duration-200
                          "
                        >
                          Reset PIN
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* App Info */}
                  <div className="text-center pt-4 border-t border-gray-100">
                    <p className="text-xs text-gray-400 mb-2">Vedyx Leap v2.0</p>
                    <p className="text-xs text-gray-500">
                      Designed for brilliant neurodivergent minds 🧠✨
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Footer - Dynamic based on changes */}
            {!showPinReset && (
              <div className="border-t bg-gray-50/80 backdrop-blur-sm p-4">
                {hasChanges ? (
                  <div className="flex gap-3">
                    <Button
                      onClick={handleClose}
                      variant="outline"
                      className="flex-1 min-h-[48px] text-sm font-medium"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleSaveChanges}
                      className="
                        flex-1 min-h-[48px] bg-gradient-to-r from-deep-ocean-blue to-sage-green 
                        hover:from-deep-ocean-blue/90 hover:to-sage-green/90 
                        text-white font-bold text-sm
                        shadow-md hover:shadow-lg transition-all duration-200
                        rounded-lg
                      "
                    >
                      Save Changes
                    </Button>
                  </div>
                ) : (
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="w-full min-h-[48px] text-sm font-medium"
                  >
                    Close
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </>
  )
}