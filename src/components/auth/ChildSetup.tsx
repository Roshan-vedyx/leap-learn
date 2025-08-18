// src/components/auth/ChildSetup.tsx - CREATE THIS NEW FILE
import React, { useState } from 'react'
import { Star, Lock, ArrowRight, ArrowLeft } from 'lucide-react'
import bcrypt from 'bcryptjs'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useParentAuth } from '../../contexts/ParentAuthContext'
import { Button } from '@/components/ui/Button'
import type { ChildProfile } from '../../types/auth'

interface ChildSetupProps {
  onComplete: () => void
  onCancel: () => void
}

export const ChildSetup: React.FC<ChildSetupProps> = ({ onComplete, onCancel }) => {
  const { user } = useParentAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    username: '',
    pin: '',
    confirmPin: '',
    preferences: {
      fontSize: 'default' as 'default' | 'large' | 'extra-large',
      highContrast: false,
      reducedMotion: false,
      audioSupport: true
    }
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const generateChildId = () => {
    return 'child_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9)
  }

  const handleCreateChild = async () => {
    if (!user) return
    
    setLoading(true)
    setError('')
    
    try {
      const childId = generateChildId()
      const hashedPin = await bcrypt.hash(formData.pin, 10)
      
      const childProfile: ChildProfile = {
        childId,
        parentId: user.uid,
        username: formData.username,
        pinHash: hashedPin,
        createdAt: new Date(),
        lastActive: new Date(),
        preferences: formData.preferences,
        metadata: {
          totalSessions: 0,
          lastActiveDate: null,
          currentLevel: 'New Explorer',
          allowWeeklyReport: true
        }
      }
      
      await setDoc(doc(db, 'children', childId), childProfile)
      onComplete()
      
    } catch (err: any) {
      setError(err.message || 'Failed to create child profile')
    } finally {
      setLoading(false)
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (!formData.username.trim()) {
        setError('Please enter a username')
        return
      }
      setError('')
      setStep(2)
    } else if (step === 2) {
      if (formData.pin.length !== 4) {
        setError('PIN must be 4 digits')
        return
      }
      if (formData.pin !== formData.confirmPin) {
        setError('PINs do not match')
        return
      }
      setError('')
      setStep(3)
    } else if (step === 3) {
      handleCreateChild()
    }
  }

  return (
    <div className="page-container">
      <div className="container max-w-md mx-auto">
        <div className="content-area">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                <Star className="w-12 h-12 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-header-primary mb-3">
              Set Up Child Profile
            </h1>
            <p className="text-lg text-body-text">
              Step {step} of 3: Let's create a special learning space
            </p>
          </div>

          {/* Progress Indicators */}
          <div className="flex justify-center gap-2 mb-8">
            {[1, 2, 3].map((num) => (
              <div
                key={num}
                className={`w-3 h-3 rounded-full transition-colors ${
                  num <= step 
                    ? 'bg-purple-600 dark:bg-purple-400' 
                    : 'bg-gray-300 dark:bg-gray-600'
                }`}
              />
            ))}
          </div>

          {/* Step Content */}
          <div className="space-y-6">
            
            {/* Step 1: Username */}
            {step === 1 && (
              <div className="space-y-6">
                <div>
                  <label htmlFor="username" className="block text-lg font-medium text-body-text mb-3">
                    Choose a special username
                  </label>
                  <input
                    id="username"
                    type="text"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    className="w-full py-4 px-6 text-lg border-2 border-input-border rounded-xl
                             bg-input-background text-input-text
                             focus:border-primary focus:ring-2 focus:ring-primary/20
                             transition-colors duration-200"
                    placeholder="Dragon Explorer, Space Captain..."
                    maxLength={30}
                    autoFocus
                  />
                  <p className="text-sm text-body-text mt-2">
                    This is what you'll be called in your learning space!
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: PIN Setup */}
            {step === 2 && (
              <div className="space-y-6">
                <div>
                  <label className="block text-lg font-medium text-body-text mb-3">
                    Create your secret 4-digit PIN
                  </label>
                  <input
                    type="password"
                    value={formData.pin}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                      setFormData({ ...formData, pin: value })
                    }}
                    className="w-full text-center text-3xl font-mono tracking-widest
                             py-4 px-6 border-2 border-input-border rounded-xl
                             bg-input-background text-input-text
                             focus:border-primary focus:ring-2 focus:ring-primary/20
                             transition-colors duration-200"
                    placeholder="0000"
                    maxLength={4}
                    autoFocus
                  />
                  
                  <div className="flex justify-center gap-3 mt-4 mb-6">
                    {[0, 1, 2, 3].map((index) => (
                      <div
                        key={index}
                        className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                          index < formData.pin.length 
                            ? 'bg-purple-600 dark:bg-purple-400' 
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}
                      />
                    ))}
                  </div>
                </div>

                {formData.pin.length === 4 && (
                  <div>
                    <label className="block text-lg font-medium text-body-text mb-3">
                      Type your PIN again to confirm
                    </label>
                    <input
                      type="password"
                      value={formData.confirmPin}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 4)
                        setFormData({ ...formData, confirmPin: value })
                      }}
                      className="w-full text-center text-3xl font-mono tracking-widest
                               py-4 px-6 border-2 border-input-border rounded-xl
                               bg-input-background text-input-text
                               focus:border-primary focus:ring-2 focus:ring-primary/20
                               transition-colors duration-200"
                      placeholder="0000"
                      maxLength={4}
                    />
                  </div>
                )}
              </div>
            )}

            {/* Step 3: Preferences */}
            {step === 3 && (
              <div className="space-y-6">
                <h3 className="text-lg font-medium text-body-text mb-4">
                  How do you like to learn?
                </h3>
                
                <div className="space-y-4">
                  {/* Font Size */}
                  <div>
                    <label className="block text-sm font-medium text-body-text mb-2">
                      Text Size
                    </label>
                    <select
                      value={formData.preferences.fontSize}
                      onChange={(e) => setFormData({
                        ...formData,
                        preferences: {
                          ...formData.preferences,
                          fontSize: e.target.value as any
                        }
                      })}
                      className="w-full py-3 px-4 border-2 border-input-border rounded-xl
                               bg-input-background text-input-text
                               focus:border-primary focus:ring-2 focus:ring-primary/20"
                    >
                      <option value="default">Regular Size</option>
                      <option value="large">Large Size</option>
                      <option value="extra-large">Extra Large Size</option>
                    </select>
                  </div>

                  {/* Checkboxes */}
                  {[
                    { key: 'highContrast', label: 'High Contrast Colors', desc: 'Makes text easier to read' },
                    { key: 'reducedMotion', label: 'Less Animations', desc: 'Calmer, less moving parts' },
                    { key: 'audioSupport', label: 'Audio Support', desc: 'Text-to-speech and sounds' }
                  ].map(({ key, label, desc }) => (
                    <label key={key} className="flex items-start gap-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.preferences[key as keyof typeof formData.preferences] as boolean}
                        onChange={(e) => setFormData({
                          ...formData,
                          preferences: {
                            ...formData.preferences,
                            [key]: e.target.checked
                          }
                        })}
                        className="mt-1 w-5 h-5 text-purple-600 rounded border-2 border-gray-300
                                 focus:ring-2 focus:ring-purple-500"
                      />
                      <div>
                        <div className="font-medium text-body-text">{label}</div>
                        <div className="text-sm text-gray-500">{desc}</div>
                      </div>
                    </label>
                  ))}
                </div>
              </div>
            )}

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
                            text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex gap-3">
              {step > 1 ? (
                <Button
                  variant="outline"
                  onClick={() => setStep(step - 1)}
                  className="flex items-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4" />
                  Back
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={onCancel}
                  className="flex items-center gap-2"
                >
                  Cancel
                </Button>
              )}
              
              <Button
                onClick={handleNext}
                disabled={loading}
                className="flex-1 py-4 text-lg font-semibold
                         bg-purple-600 hover:bg-purple-700 text-white
                         disabled:opacity-50 disabled:cursor-not-allowed
                         transition-all duration-200"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    {step === 3 ? 'Create Profile' : 'Continue'}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                )}
              </Button>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}