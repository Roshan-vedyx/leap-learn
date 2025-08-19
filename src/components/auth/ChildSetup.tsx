// src/components/auth/ChildSetup.tsx - FIXED UX FLOW
import React, { useState } from 'react'
import { Star, Lock, ArrowRight, ArrowLeft, Shield, CheckCircle } from 'lucide-react'
import bcrypt from 'bcryptjs'
import { doc, setDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { useParentAuth } from '../../contexts/ParentAuthContext'
import { Button } from '@/components/ui/Button'
import { SECURITY_QUESTIONS, type SecurityQuestion, type RecoveryAttempts } from '../../types/auth'
import type { ChildProfile } from '../../types/auth'

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
        username: formData.username,
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
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer
    }))
  }

  // Step 1: Username
  if (step === 1) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
              <Star className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Choose Your Username
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Pick a fun name that you'll remember easily!
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Username
            </label>
            <input
              type="text"
              value={formData.username}
              onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
              placeholder="Your cool username"
              className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:ring-2 focus:ring-blue-500 focus:border-transparent
                       text-lg placeholder-gray-400 dark:placeholder-gray-500"
              maxLength={20}
              autoFocus
            />
          </div>

          {error && (
            <div className="text-red-600 dark:text-red-400 text-sm">
              {error}
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 2: PIN + Security Questions (COMBINED)
  if (step === 2) {
    return (
      <div className="max-w-2xl mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
              <Lock className="w-8 h-8 text-green-600 dark:text-green-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Create Your Secret PIN
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Choose 4 numbers that are easy for you to remember
          </p>
        </div>

        <div className="space-y-8">
          {/* PIN Section */}
          <div className="bg-white dark:bg-gray-800 border-2 border-green-200 dark:border-green-800 rounded-lg p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  PIN (4 digits)
                </label>
                <input
                  type="password"
                  value={formData.pin}
                  onChange={(e) => {
                    if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                      setFormData(prev => ({ ...prev, pin: e.target.value }))
                      setError('')
                    }
                  }}
                  placeholder="••••"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           text-2xl text-center tracking-widest"
                  maxLength={4}
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Confirm PIN
                </label>
                <input
                  type="password"
                  value={formData.confirmPin}
                  onChange={(e) => {
                    if (e.target.value.length <= 4 && /^\d*$/.test(e.target.value)) {
                      setFormData(prev => ({ ...prev, confirmPin: e.target.value }))
                      setError('')
                    }
                  }}
                  placeholder="••••"
                  className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-green-500 focus:border-transparent
                           text-2xl text-center tracking-widest"
                  maxLength={4}
                />
              </div>
            </div>
          </div>

          {/* Security Questions Toggle */}
          {formData.pin.length === 4 && formData.confirmPin.length === 4 && formData.pin === formData.confirmPin && (
            <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="flex items-center gap-3 mb-4">
                <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Help Me Remember My PIN
                </h3>
              </div>
              
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Want to set up some questions to help you remember your PIN if you ever forget it? 
                This is optional but really helpful!
              </p>
              
              <div className="flex gap-3">
                <Button
                  onClick={() => setShowSecurityQuestions(true)}
                  className="bg-yellow-600 hover:bg-yellow-700 text-white"
                  disabled={showSecurityQuestions}
                >
                  {showSecurityQuestions ? '✓ Questions Added' : 'Yes, Add Questions'}
                </Button>
                {!showSecurityQuestions && (
                  <Button
                    onClick={() => setShowSecurityQuestions(false)}
                    variant="outline"
                  >
                    Skip for Now
                  </Button>
                )}
              </div>
            </div>
          )}

          {/* Security Questions Section */}
          {showSecurityQuestions && (
            <div className="bg-white dark:bg-gray-800 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
              <div className="flex items-center gap-2 mb-6">
                <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Choose 2-3 Questions
                </h3>
              </div>

              <div className="space-y-4">
                {SECURITY_QUESTIONS.map((question) => {
                  const isSelected = selectedQuestions.includes(question.id)
                  const canSelect = selectedQuestions.length < 3 || isSelected

                  return (
                    <div key={question.id} className="relative">
                      <div
                        className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                          isSelected
                            ? 'border-yellow-500 bg-yellow-50 dark:bg-yellow-900/20'
                            : canSelect
                            ? 'border-gray-300 dark:border-gray-600 hover:border-yellow-300 dark:hover:border-yellow-600 bg-white dark:bg-gray-800'
                            : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                        }`}
                        onClick={() => canSelect && handleQuestionToggle(question.id)}
                      >
                        <div className="flex items-start gap-3">
                          <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                            isSelected
                              ? 'border-yellow-500 bg-yellow-500'
                              : 'border-gray-300 dark:border-gray-600'
                          }`}>
                            {isSelected && (
                              <CheckCircle className="w-3 h-3 text-white" />
                            )}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-medium text-gray-900 dark:text-white mb-2">
                              {question.question}
                            </h4>
                            {isSelected && (
                              <input
                                type="text"
                                value={answers[question.id] || ''}
                                onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                                placeholder={question.placeholder}
                                className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                                         bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                         focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                                         placeholder-gray-400 dark:placeholder-gray-500"
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

              <div className="text-center text-sm text-gray-600 dark:text-gray-400 mt-4">
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

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleNext}
              disabled={formData.pin.length !== 4 || formData.confirmPin.length !== 4}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Next
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </div>
    )
  }

  // Step 3: Preferences
  if (step === 3) {
    return (
      <div className="max-w-md mx-auto p-6">
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
              <Star className="w-8 h-8 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
            Make It Yours
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            Choose settings that work best for you
          </p>
        </div>

        <div className="space-y-6">
          {/* Font Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
              Text Size
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { value: 'default', label: 'Normal', size: 'text-base' },
                { value: 'large', label: 'Large', size: 'text-lg' },
                { value: 'extra-large', label: 'Extra Large', size: 'text-xl' }
              ].map((option) => (
                <button
                  key={option.value}
                  onClick={() => setFormData(prev => ({
                    ...prev,
                    preferences: { ...prev.preferences, fontSize: option.value as any }
                  }))}
                  className={`p-3 border-2 rounded-lg transition-colors ${option.size} ${
                    formData.preferences.fontSize === option.value
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                      : 'border-gray-300 dark:border-gray-600 hover:border-purple-300'
                  }`}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Accessibility Options */}
          <div className="space-y-4">
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
                className="flex items-center justify-between p-4 border border-gray-300 dark:border-gray-600 rounded-lg"
              >
                <div>
                  <div className="font-medium text-gray-900 dark:text-white">
                    {option.label}
                  </div>
                  <div className="text-sm text-gray-600 dark:text-gray-400">
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
                  className={`w-12 h-6 rounded-full transition-colors ${
                    formData.preferences[option.key as keyof typeof formData.preferences]
                      ? 'bg-purple-600'
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                >
                  <div
                    className={`w-5 h-5 bg-white rounded-full transition-transform ${
                      formData.preferences[option.key as keyof typeof formData.preferences]
                        ? 'translate-x-6'
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

          <div className="flex gap-3 pt-4">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleCreateChild}
              disabled={loading}
              className="flex-1 bg-purple-600 hover:bg-purple-700 text-white"
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