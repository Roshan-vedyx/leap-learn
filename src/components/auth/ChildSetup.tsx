// src/components/auth/ChildSetup.tsx - FULLY RESPONSIVE
import React, { useState } from 'react'
import { Star, Lock, ArrowRight, ArrowLeft, Shield, CheckCircle, Eye, EyeOff } from 'lucide-react'
import bcrypt from 'bcryptjs'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useParentAuth } from '../../contexts/ParentAuthContext'
import { Button } from '@/components/ui/Button'
import { SECURITY_QUESTIONS, type SecurityQuestion, type RecoveryAttempts } from '../../types/auth'
import type { ChildProfile } from '../../types/auth'
import { checkUsernameExists } from '../../utils/usernameValidation'

interface ChildSetupProps {
  onComplete: () => void
  onCancel: () => void
}

export const ChildSetup: React.FC<ChildSetupProps> = ({ onComplete, onCancel }) => {
  const { user } = useParentAuth()
  const [step, setStep] = useState(1) // 1: Username, 2: PIN + Security Questions, 3: Preferences
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
  
  // Security questions state
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [showSecurityQuestions, setShowSecurityQuestions] = useState(false)
  const [showPins, setShowPins] = useState({ pin: false, confirmPin: false })
  
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
      const usernameTaken = await checkUsernameExists(formData.username)
      if (usernameTaken) {
        setError('Oops, that username already exists. Choose another one')
        return
      }
      const childId = generateChildId()
      const hashedPin = await bcrypt.hash(formData.pin, 10)
      
      // Process security questions
      let securityQuestions: SecurityQuestion[] = []
      if (selectedQuestions.length >= 2) {
        securityQuestions = await Promise.all(
          selectedQuestions.map(async (questionId) => {
            const question = SECURITY_QUESTIONS.find(q => q.id === questionId)!
            const answerHash = await bcrypt.hash(answers[questionId].toLowerCase().trim(), 10)
            
            return {
              id: questionId,
              question: question.question,
              answerHash
            }
          })
        )
      }
      
      // Initialize recovery attempts
      const initialRecovery: RecoveryAttempts = {
        sessionAttempts: 0,
        lastSessionAttempt: new Date(),
        totalSessions: 0,
        isInCooldown: false,
        requiresParentReset: false
      }
      
      const childProfile: ChildProfile = {
        childId,
        parentId: user.uid,
        username: formData.username.trim().toLowerCase(),
        pinHash: hashedPin,
        createdAt: new Date(),
        lastActive: new Date(),
        
        // Security questions
        securityQuestions,
        recoveryAttempts: initialRecovery,
        
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
      
      // If security questions are shown but not properly filled
      if (showSecurityQuestions) {
        if (selectedQuestions.length < 2) {
          setError('Please choose at least 2 questions to help you remember your PIN')
          return
        }
        const missingAnswers = selectedQuestions.filter(id => !answers[id]?.trim())
        if (missingAnswers.length > 0) {
          setError('Please answer all selected questions')
          return
        }
      }
      
      setError('')
      setStep(3)
    }
  }

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1)
      setError('')
    }
  }

  const handleQuestionToggle = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      // Remove question
      setSelectedQuestions(prev => prev.filter(id => id !== questionId))
      setAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[questionId]
        return newAnswers
      })
    } else if (selectedQuestions.length < 3) {
      // Add question (max 3)
      setSelectedQuestions(prev => [...prev, questionId])
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: answer }))
  }

  const handleUsernameBlur = async (username: string) => {
    if (username.trim() && await checkUsernameExists(username)) {
      setError('Oops, that username already exists. Choose another one')
    } else {
      setError('')
    }
  }

  // Step 1: Username - RESPONSIVE
  if (step === 1) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        {/* Progress indicator - MOBILE OPTIMIZED */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex space-x-2 sm:space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-full"></div>
          </div>
          <span className="text-xs sm:text-sm text-gray-500">Step 1 of 3</span>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            What should we call you?
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Pick a fun username that's just for you
          </p>
        </div>

        <div className="space-y-4 sm:space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              onBlur={(e) => handleUsernameBlur(e.target.value)}
              placeholder="Your cool username"
              className="w-full p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-base sm:text-lg placeholder-gray-400 dark:placeholder-gray-500"
              style={{ minHeight: '48px' }} // Touch target minimum
              maxLength={20}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Button container - RESPONSIVE */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="w-full sm:flex-1 h-12 sm:h-auto text-base"
              style={{ minHeight: '48px' }}
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white h-12 sm:h-auto text-base"
              style={{ minHeight: '48px' }}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: PIN + Security Questions - RESPONSIVE
  if (step === 2) {
    return (
      <div className="w-full max-w-2xl mx-auto p-4 sm:p-6">
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex space-x-2 sm:space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-gray-300 rounded-full"></div>
          </div>
          <span className="text-xs sm:text-sm text-gray-500">Step 2 of 3</span>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Lock className="w-6 h-6 sm:w-8 sm:h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Secret PIN
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Choose 4 numbers that are easy for you to remember
          </p>
        </div>

        <div className="space-y-6 sm:space-y-8">
          {/* PIN Section - RESPONSIVE GRID */}
          <div className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-lg p-4 sm:p-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PIN (4 digits)
                </label>
                <div className="relative">
                  <input
                    type={showPins.pin ? "text" : "password"}
                    value={formData.pin}
                    onChange={(e) => {
                      if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                        setFormData(prev => ({ ...prev, pin: e.target.value }))
                        setError('')
                      }
                    }}
                    placeholder="••••"
                    className="w-full p-3 sm:p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-green-500 focus:border-transparent
                            text-xl sm:text-2xl text-center tracking-widest"
                    style={{ minHeight: '48px' }}
                    maxLength={4}
                    autoFocus
                  />
                  <button
                    type="button"
                    onClick={() => setShowPins(prev => ({ ...prev, pin: !prev.pin }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPins.pin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm PIN
                </label>
                <div className="relative">
                  <input
                    type={showPins.confirmPin ? "text" : "password"}
                    value={formData.confirmPin}
                    onChange={(e) => {
                      if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                        setFormData(prev => ({ ...prev, confirmPin: e.target.value }))
                        setError('')
                      }
                    }}
                    placeholder="••••"
                    className="w-full p-3 sm:p-4 pr-12 border border-gray-300 dark:border-gray-600 rounded-lg 
                            bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-green-500 focus:border-transparent
                            text-xl sm:text-2xl text-center tracking-widest"
                    style={{ minHeight: '48px' }}
                    maxLength={4}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPins(prev => ({ ...prev, confirmPin: !prev.confirmPin }))}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPins.confirmPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Security Questions Toggle - RESPONSIVE */}
          {formData.pin.length === 4 && formData.confirmPin.length === 4 && formData.pin === formData.confirmPin && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4 sm:p-6">
              <div className="flex items-start sm:items-center gap-3 mb-4">
                <Shield className="w-5 h-5 sm:w-6 sm:h-6 text-yellow-600 dark:text-yellow-400 mt-0.5 sm:mt-0 flex-shrink-0" />
                <div>
                  <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Help Me Remember My PIN
                  </h3>
                </div>
              </div>
              
              <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300 mb-4">
                Want to set up some questions to help you remember your PIN if you ever forget it? 
                This is optional but really helpful!
              </p>
              
              <div className="flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={() => setShowSecurityQuestions(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white h-12 sm:h-auto"
                  style={{ minHeight: '48px' }}
                  disabled={showSecurityQuestions}
                >
                  {showSecurityQuestions ? 'Questions Added!' : 'Yes, Add Questions'}
                </Button>
                <Button
                  onClick={() => setShowSecurityQuestions(false)}
                  variant="outline"
                  className="h-12 sm:h-auto"
                  style={{ minHeight: '48px' }}
                >
                  Skip for Now
                </Button>
              </div>
            </div>
          )}

          {/* Security Questions List - RESPONSIVE */}
          {showSecurityQuestions && (
            <div className="bg-gray-50 dark:bg-gray-800 rounded-lg p-4 sm:p-6">
              <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Choose Questions to Help You Remember
              </h3>
              
              <div className="space-y-3 sm:space-y-4">
                {SECURITY_QUESTIONS.map((question) => {
                  const isSelected = selectedQuestions.includes(question.id)
                  
                  return (
                    <div key={question.id}>
                      <div
                        onClick={() => handleQuestionToggle(question.id)}
                        className={`p-3 sm:p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : 'border-gray-300 dark:border-gray-600 hover:border-yellow-300'
                        }`}
                        style={{ minHeight: '48px' }}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 sm:w-6 sm:h-6 rounded-full border-2 flex items-center justify-center mt-0.5 flex-shrink-0 ${
                            isSelected
                              ? 'border-yellow-500 bg-yellow-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && (
                              <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2 text-sm sm:text-base">
                              {question.question}
                            </h4>
                            {isSelected && (
                              <input
                                type="text"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder={question.placeholder}
                                className="w-full p-2 sm:p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                                         placeholder-gray-400 dark:placeholder-gray-500 text-sm sm:text-base"
                                style={{ minHeight: '40px' }}
                                onClick={(e) => e.stopPropagation()}
                              />
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}
              </div>

              <div className="text-center text-xs sm:text-sm text-gray-600 dark:text-gray-400 mt-4">
                Selected: {selectedQuestions.length}/3 questions
                {selectedQuestions.length >= 2 && (
                  <span className="text-yellow-600 dark:text-yellow-400 ml-2">✓ Ready to continue</span>
                )}
              </div>
            </div>
          )}

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Navigation buttons - RESPONSIVE */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full sm:flex-1 h-12 sm:h-auto"
              style={{ minHeight: '48px' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={formData.pin.length !== 4 || formData.confirmPin.length !== 4}
              className="w-full sm:flex-1 bg-green-600 hover:bg-green-700 text-white h-12 sm:h-auto"
              style={{ minHeight: '48px' }}
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Preferences - RESPONSIVE
  if (step === 3) {
    return (
      <div className="w-full max-w-md mx-auto p-4 sm:p-6">
        {/* Progress indicator */}
        <div className="flex justify-between items-center mb-6 sm:mb-8">
          <div className="flex space-x-2 sm:space-x-3">
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-blue-600 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-600 rounded-full"></div>
            <div className="w-3 h-3 sm:w-4 sm:h-4 bg-purple-600 rounded-full"></div>
          </div>
          <span className="text-xs sm:text-sm text-gray-500">Step 3 of 3</span>
        </div>

        <div className="text-center mb-6 sm:mb-8">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Star className="w-6 h-6 sm:w-8 sm:h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Make It Yours
          </h2>
          <p className="text-sm sm:text-base text-gray-600 dark:text-gray-300">
            Choose settings that work best for you
          </p>
        </div>

        <div className="space-y-6">
          {/* Font Size - RESPONSIVE GRID */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Text Size
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 sm:gap-3">
              {[
                { value: 'default', label: 'Normal', size: 'text-sm sm:text-base' },
                { value: 'large', label: 'Large', size: 'text-base sm:text-lg' },
                { value: 'extra-large', label: 'Extra Large', size: 'text-lg sm:text-xl' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, fontSize: option.value as any }
                  }))}
                  className={`p-3 sm:p-4 border-2 rounded-lg transition-colors ${option.size} ${
                    formData.preferences.fontSize === option.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                  }`}
                  style={{ minHeight: '48px' }}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Options - RESPONSIVE CARDS */}
          <div className="space-y-3 sm:space-y-4">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Accessibility Options
            </label>
            
            {[
              {
                key: 'highContrast',
                label: 'High Contrast Colors',
                description: 'Makes text easier to read'
              },
              {
                key: 'reducedMotion',
                label: 'Reduce Animations',
                description: 'Less moving parts on screen'
              },
              {
                key: 'audioSupport',
                label: 'Audio Help',
                description: 'Read text out loud'
              }
            ].map((option) => (
              <div
                key={option.key}
                className="flex items-center justify-between p-3 sm:p-4 border border-gray-300 dark:border-gray-600 rounded-lg"
                style={{ minHeight: '64px' }}
              >
                <div className="flex-1 min-w-0 mr-3">
                  <div className="font-medium text-gray-900 dark:text-white text-sm sm:text-base">
                    {option.label}
                  </div>
                  <div className="text-xs sm:text-sm text-gray-600 dark:text-gray-400">
                    {option.description}
                  </div>
                </div>
                <button
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    preferences: {
                      ...prev.preferences,
                      [option.key]: !prev.preferences[option.key as keyof typeof prev.preferences]
                    }
                  }))}
                  className={`w-12 h-6 sm:w-14 sm:h-7 rounded-full transition-colors flex-shrink-0 ${
                    formData.preferences[option.key as keyof typeof formData.preferences]
                      ? 'bg-purple-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                  style={{ minWidth: '48px', minHeight: '24px' }}
                >
                  <div
                    className={`w-5 h-5 sm:w-6 sm:h-6 bg-white rounded-full transition-transform ${
                      formData.preferences[option.key as keyof typeof formData.preferences]
                        ? 'translate-x-6 sm:translate-x-7'
                        : 'translate-x-0.5'
                    }`}
                  />
                </button>
              </div>
            ))}
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          {/* Final navigation - RESPONSIVE */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="w-full sm:flex-1 h-12 sm:h-auto"
              style={{ minHeight: '48px' }}
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleCreateChild}
              disabled={loading}
              className="w-full sm:flex-1 bg-purple-600 hover:bg-purple-700 text-white h-12 sm:h-auto"
              style={{ minHeight: '48px' }}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Create Account'
              )}
            </Button>
          </div>
        </div>
      </div>
    )
  }

  return null
}