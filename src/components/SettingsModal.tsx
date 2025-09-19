// src/components/SettingsModal.tsx
import React, { useState, useEffect } from 'react'
import { X, Settings, Volume2, RotateCcw, Accessibility, ChevronDown, Check, TrendingUp } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { PinReset } from '@/components/auth/PinReset'
import type { TtsAccent } from '@/types'
import { useLocation } from 'wouter'

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
  const [, setLocation] = useLocation()
  
  // LOCAL state for pending changes (not applied until save)
  const [pendingTtsAccent, setPendingTtsAccent] = useState<TtsAccent>(ttsAccent)
  const [pendingSiennaEnabled, setPendingSiennaEnabled] = useState(false)
  
  // Track initial values
  const [initialTtsAccent, setInitialTtsAccent] = useState<TtsAccent>(ttsAccent)
  const [initialSiennaEnabled, setInitialSiennaEnabled] = useState(false)

  const handleProgressClick = () => {
    onClose() // Close the modal first
    setLocation('/progress') // Navigate to progress page
  }

  // Load preferences when modal opens
  useEffect(() => {
    if (isOpen) {
      console.log('🔧 SettingsModal opened, loading preferences...')
      
      // Load Sienna preference
      const saved = localStorage.getItem('sienna-enabled')
      const savedEnabled = saved === 'true'
      setSiennaEnabled(savedEnabled)
      setPendingSiennaEnabled(savedEnabled)
      setInitialSiennaEnabled(savedEnabled)
      
      // Set TTS values
      setPendingTtsAccent(ttsAccent)
      setInitialTtsAccent(ttsAccent)
      
      console.log('📋 Initial values:', { 
        ttsAccent, 
        siennaEnabled: savedEnabled 
      })
    }
  }, [isOpen, ttsAccent])

  // Track changes - compare pending vs initial
  useEffect(() => {
    const ttsChanged = pendingTtsAccent !== initialTtsAccent
    const siennaChanged = pendingSiennaEnabled !== initialSiennaEnabled
    const changed = ttsChanged || siennaChanged
    
    console.log('🔍 Change detection:', {
      ttsChanged: `${initialTtsAccent} → ${pendingTtsAccent}`,
      siennaChanged: `${initialSiennaEnabled} → ${pendingSiennaEnabled}`,
      hasChanges: changed
    })
    
    setHasChanges(changed)
  }, [pendingTtsAccent, initialTtsAccent, pendingSiennaEnabled, initialSiennaEnabled])

  // Handle TTS accent change (pending only)
  const handleTtsAccentChange = (accent: TtsAccent) => {
    console.log('🎤 TTS accent changed to:', accent)
    setPendingTtsAccent(accent)
  }

  // Handle Sienna toggle (pending only)
  const handleSiennaToggle = (enabled: boolean) => {
    console.log('♿ Sienna toggled to:', enabled)
    setPendingSiennaEnabled(enabled)
  }

  // Apply Sienna changes to DOM
  const applySiennaChanges = (enabled: boolean) => {
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
      const existingScript = document.querySelector('script[src*="sienna"]')
      if (existingScript) {
        existingScript.remove()
      }
      console.log('❌ Sienna disabled and removed')
    }
  }

  // Handle save changes
  const handleSaveChanges = () => {
    console.log('💾 Saving changes...')
    
    // Apply TTS accent change
    if (pendingTtsAccent !== initialTtsAccent) {
      onTtsAccentChange(pendingTtsAccent)
      console.log('✅ TTS accent saved:', pendingTtsAccent)
    }
    
    // Apply Sienna changes
    if (pendingSiennaEnabled !== initialSiennaEnabled) {
      localStorage.setItem('sienna-enabled', pendingSiennaEnabled.toString())
      setSiennaEnabled(pendingSiennaEnabled)
      applySiennaChanges(pendingSiennaEnabled)
      console.log('✅ Sienna preference saved:', pendingSiennaEnabled)
    }
    
    // Reset change tracking
    setHasChanges(false)
    setInitialTtsAccent(pendingTtsAccent)
    setInitialSiennaEnabled(pendingSiennaEnabled)
    
    console.log('✅ All settings saved successfully')
    handleClose()
  }

  // Handle discard changes
  const handleDiscardChanges = () => {
    console.log('🚫 Discarding changes...')
    
    // Revert to initial values
    setPendingTtsAccent(initialTtsAccent)
    setPendingSiennaEnabled(initialSiennaEnabled)
    
    setHasChanges(false)
    handleClose()
  }

  // Handle PIN reset completion
  const handlePinResetComplete = () => {
    setShowPinReset(false)
  }

  // Smooth close animation
  const handleClose = () => {
    setIsClosing(true)
    setTimeout(() => {
      onClose()
      setIsClosing(false)
      setShowPinReset(false)
    }, 200)
  }

  // Close modal on escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        if (hasChanges) {
          handleDiscardChanges()
        } else {
          handleClose()
        }
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
  }, [isOpen, hasChanges])

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop */}
      <div 
        className={`fixed inset-0 bg-black/40 backdrop-blur-sm z-40 transition-all duration-300 ${
          isClosing ? 'opacity-0' : 'opacity-100'
        }`}
        onClick={hasChanges ? handleDiscardChanges : handleClose}
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
          max-h-[90vh]
          overflow-hidden
          flex flex-col
        `}
        onClick={e => e.stopPropagation()}
        >
          
          {/* Header */}
          <div className="bg-slate-50 border-b border-gray-200 px-6 py-4 flex-shrink-0">
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
                onClick={hasChanges ? handleDiscardChanges : handleClose}
                className="h-9 w-9 hover:bg-gray-100 text-gray-500 rounded-lg"
                aria-label="Close settings"
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
            
            {/* Debug info - remove in production */}
            {hasChanges && (
              <div className="mt-2 text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded">
                Unsaved changes detected
              </div>
            )}
          </div>

          {/* Content */}
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
              <div className="p-6 space-y-6">
                
                {/* Audio & Voice */}
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-50 rounded-lg">
                      <Volume2 className="w-4 h-4 text-blue-600" />
                    </div>
                    <h3 className="text-base font-semibold text-gray-900">
                      Audio & Voice
                    </h3>
                  </div>
                  
                  <div className="bg-sky-50 border border-soft-lavender/30 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Text-to-Speech Voice</h4>
                        <p className="text-sm text-gray-600 mb-3">
                          Choose your preferred accent for read-aloud features.
                        </p>
                        
                        <div className="relative">
                          <label htmlFor="settings-tts-accent" className="sr-only">
                            Choose voice accent for text-to-speech reading
                          </label>
                          <select
                            id="settings-tts-accent"
                            value={pendingTtsAccent}
                            onChange={(e) => handleTtsAccentChange(e.target.value as TtsAccent)}
                            className="
                              w-full appearance-none rounded-lg border border-gray-300 bg-white 
                              px-3 py-2.5 pr-10 text-sm
                              min-h-[44px] cursor-pointer
                              hover:border-blue-400 focus:border-blue-500 
                              focus:ring-2 focus:ring-blue-100 
                              transition-all duration-200
                            "
                          >
                            <option value="" disabled>Choose your preferred voice</option>
                            <option value="US">🇺🇸 American English</option>
                            <option value="GB">🇬🇧 British English</option>
                            <option value="IN">🇮🇳 Indian English</option>
                          </select>
                          <ChevronDown className="w-4 h-4 absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Progress Option - NEW SECTION */}
                <div className="space-y-3">
                  <h3 className="font-medium text-gray-900 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-green-600" />
                    My Learning Journey
                  </h3>
                  <Button
                    onClick={handleProgressClick}
                    variant="outline"
                    className="w-full flex items-center justify-between p-4 h-auto bg-amber-50 border-amber-200 hover:bg-amber-100 hover:border-amber-300"
                  >
                    <div className="flex items-center gap-3">
                      <TrendingUp className="w-5 h-5 text-green-600" />
                      <div className="text-left">
                        <div className="font-medium">See your achievements</div>
                        <div className="text-sm text-gray-500"></div>
                      </div>
                    </div>
                    <ChevronDown className="w-4 h-4 rotate-[-90deg]" />
                  </Button>
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
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">More Reading Support?</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          Advanced reading tools including line tracking, font adjustments, and focus modes to help with dyslexia and reading difficulties.
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleSiennaToggle(!pendingSiennaEnabled)}
                        className={`
                          min-h-[36px] px-4 text-sm font-medium rounded-lg
                          transition-all duration-200
                          ${pendingSiennaEnabled 
                            ? 'bg-red-600 hover:bg-red-700 text-white border-red-600' 
                            : 'border border-gray-300 text-gray-700 hover:bg-gray-50'
                          }
                        `}
                        aria-pressed={pendingSiennaEnabled}
                      >
                        {pendingSiennaEnabled ? 'Disable' : 'Enable'}
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
                  
                  <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-start gap-4">
                      <div className="flex-1">
                        <h4 className="text-sm font-medium text-gray-900 mb-2">Reset Your PIN</h4>
                        <p className="text-sm text-gray-600 leading-relaxed mb-3">
                          Change your 4-digit PIN for account security.
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

          {/* Footer - Save/Cancel buttons when changes exist */}
          {!showPinReset && (
            <div className="border-t border-gray-100 bg-gray-50 p-4 flex-shrink-0">
              {hasChanges ? (
                <div className="flex gap-3">
                  <Button
                    onClick={handleDiscardChanges}
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
                      focus:ring-2 focus:ring-blue-500 focus:ring-offset-2
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