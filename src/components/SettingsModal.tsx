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
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={handleClose}
        aria-hidden="true"
      />

      {/* Modal */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <Card className={`
          w-full max-w-lg mx-auto
          bg-white shadow-xl border border-gray-200
          transform transition-all duration-300 ease-out
          ${isClosing 
            ? 'scale-95 opacity-0' 
            : 'scale-100 opacity-100'
          }
          rounded-xl
          max-h-[85vh]
          overflow-hidden
        `}>
          
          {/* Header - Clean and minimal */}
          <div className="bg-slate-50 border-b border-gray-200 px-6 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-slate-100 rounded-lg">
                  <Settings className="w-5 h-5 text-slate-600" />
                </div>
                <div>
                  <h2 className="text-lg font-semibold text-gray-900">Settings</h2>
                  <p className="text-sm text-gray-600">Customize your preferences</p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClose}
                className="h-9 w-9 hover:bg-gray-100 text-gray-500 rounded-lg"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Scrollable Content */}
          <div className="flex flex-col h-full max-h-[calc(85vh-140px)]">
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
                <div className="p-6 space-y-8">
                  {/* Voice Settings */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-50 rounded-lg">
                        <Volume2 className="w-4 h-4 text-blue-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Voice & Audio
                      </h3>
                    </div>
                    
                    <div className="bg-blue-25 border border-blue-100 rounded-lg p-4">
                      <label htmlFor="settings-tts-accent" className="block text-sm font-medium text-gray-700 mb-2">
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
                            hover:border-blue-400 focus:border-blue-500 
                            focus:ring-2 focus:ring-blue-100 
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
                      <p id="tts-accent-help" className="text-xs text-gray-600 mt-2">
                        All voices are optimized for clear, calm reading
                      </p>
                    </div>
                  </div>

                  {/* Accessibility Tools */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-green-50 rounded-lg">
                        <Accessibility className="w-4 h-4 text-green-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Accessibility Tools
                      </h3>
                    </div>
                    
                    <div className="bg-green-25 border border-green-100 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="text-sm font-medium text-gray-900">Screen Reader Pro</h4>
                            {siennaEnabled && (
                              <div className="flex items-center gap-1 bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-md font-medium">
                                <Check className="w-3 h-3" />
                                Enabled
                              </div>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            Change the way your screen looks. 
                            Customize highlighting, layout, font and specialized navigation tools.
                          </p>
                          <div className="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded-md">
                            Recommended for users with screen readers
                          </div>
                        </div>
                        
                        <Button
                          variant={siennaEnabled ? "default" : "outline"}
                          size="sm"
                          onClick={() => toggleSienna(!siennaEnabled)}
                          className={`
                            min-h-[36px] px-4 text-sm font-medium transition-all duration-200 rounded-lg
                            ${siennaEnabled 
                              ? 'bg-red-600 hover:bg-red-700 text-white' 
                              : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                            }
                          `}
                          aria-pressed={siennaEnabled}
                        >
                          {siennaEnabled ? 'Disable' : 'Enable'}
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Account & Security */}
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-50 rounded-lg">
                        <RotateCcw className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="text-base font-semibold text-gray-900">
                        Account & Security
                      </h3>
                    </div>
                    
                    <div className="bg-amber-25 border border-amber-100 rounded-lg p-4">
                      <div className="flex items-start gap-4">
                        <div className="flex-1">
                          <h4 className="text-sm font-medium text-gray-900 mb-2">Reset Your PIN</h4>
                          <p className="text-sm text-gray-600 leading-relaxed mb-3">
                            Change your 4-digit PIN.
                          </p>
                          
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => setShowPinReset(true)}
                          className="
                            min-h-[36px] px-4 text-sm font-medium rounded-lg
                            border border-gray-300 text-gray-700 
                            hover:bg-gray-50
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
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-sm font-medium text-gray-700 mb-1">Vedyx Leap</p>
                      <p className="text-sm text-gray-500">
                        Designed for brilliant neurodivergent minds
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer - Always shows Save/Cancel when there are changes */}
          {!showPinReset && (
            <div className="border-t border-gray-100 bg-gray-50 p-4">
              {hasChanges ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleClose}
                    variant="outline"
                    className="
                      flex-1 min-h-[44px] text-sm font-medium rounded-lg
                      border border-gray-300 hover:bg-gray-50
                      transition-all duration-200
                    "
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleSaveChanges}
                    className="
                      flex-1 min-h-[44px] bg-blue-600 hover:bg-blue-700 
                      text-white font-medium text-sm
                      transition-all duration-200 rounded-lg
                    "
                  >
                    Save Changes
                  </Button>
                </div>
              ) : (
                <Button
                  onClick={handleClose}
                  variant="outline"
                  className="
                    w-full min-h-[44px] text-sm font-medium rounded-lg
                    border border-gray-300 hover:bg-gray-50
                    transition-all duration-200
                  "
                >
                  Close
                </Button>
              )}
            </div>
          )}
        </Card>
      </div>
    </>
  )
}