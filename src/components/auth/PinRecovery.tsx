// src/components/auth/PinRecovery.tsx - NEW FILE
import React, { useState, useEffect } from 'react'
import { HelpCircle, Clock, Mail, CheckCircle, AlertCircle, Heart } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import bcrypt from 'bcryptjs'
import type { ChildProfile, RecoveryAttempts } from '../../types/auth'

interface PinRecoveryProps {
  childId: string
  onSuccess: () => void
  onCancel: () => void
}

export const PinRecovery: React.FC<PinRecoveryProps> = ({ 
  childId, 
  onSuccess, 
  onCancel 
}) => {
  const [child, setChild] = useState<ChildProfile | null>(null)
  const [loading, setLoading] = useState(true)
  const [step, setStep] = useState<'questions' | 'cooldown' | 'parent-help'>('questions')
  
  // Recovery state
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState<string[]>([])
  const [error, setError] = useState('')
  const [submitting, setSubmitting] = useState(false)
  
  // Cooldown state
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [parentNotified, setParentNotified] = useState(false)

  const COOLDOWN_MINUTES = 5

  useEffect(() => {
    loadChildData()
  }, [childId])

  useEffect(() => {
    let interval: NodeJS.Timeout
    if (cooldownRemaining > 0) {
      interval = setInterval(() => {
        setCooldownRemaining(prev => {
          if (prev <= 1) {
            setStep('questions')
            return 0
          }
          return prev - 1
        })
      }, 1000)
    }
    return () => clearInterval(interval)
  }, [cooldownRemaining])

  const loadChildData = async () => {
    try {
      const childDoc = await getDoc(doc(db, 'children', childId))
      if (childDoc.exists()) {
        const childData = childDoc.data() as ChildProfile
        setChild(childData)
        
        // Check recovery state
        const recovery = childData.recoveryAttempts
        
        if (recovery.requiresParentReset) {
          setStep('parent-help')
        } else if (recovery.isInCooldown && recovery.lastCooldownStart) {
          const timeSinceCooldown = Date.now() - recovery.lastCooldownStart.getTime()
          const cooldownMs = COOLDOWN_MINUTES * 60 * 1000
          
          if (timeSinceCooldown < cooldownMs) {
            const remainingMs = cooldownMs - timeSinceCooldown
            setCooldownRemaining(Math.ceil(remainingMs / 1000))
            setStep('cooldown')
          } else {
            // Cooldown expired, reset state
            await resetCooldown()
          }
        }
      }
    } catch (err) {
      console.error('Failed to load child data:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const resetCooldown = async () => {
    if (!child) return
    
    const updatedRecovery: RecoveryAttempts = {
      ...child.recoveryAttempts,
      sessionAttempts: 0,
      isInCooldown: false,
      lastCooldownStart: undefined
    }
    
    await updateDoc(doc(db, 'children', childId), {
      recoveryAttempts: updatedRecovery
    })
    
    setChild(prev => prev ? { ...prev, recoveryAttempts: updatedRecovery } : null)
  }

  const handleAnswerSubmit = async () => {
    if (!child || !answers[currentQuestionIndex]?.trim()) {
      setError('Please enter an answer')
      return
    }

    setSubmitting(true)
    setError('')

    try {
      const currentQuestion = child.securityQuestions[currentQuestionIndex]
      const userAnswer = answers[currentQuestionIndex].toLowerCase().trim()
      const isCorrect = await bcrypt.compare(userAnswer, currentQuestion.answerHash)

      if (isCorrect) {
        // Correct answer - move to next question or complete
        if (currentQuestionIndex < child.securityQuestions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1)
        } else {
          // All questions answered correctly - reset PIN
          await handleSuccessfulRecovery()
        }
      } else {
        // Wrong answer - increment attempts
        await handleFailedAttempt()
      }
    } catch (err) {
      setError('Something went wrong. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const handleSuccessfulRecovery = async () => {
    if (!child) return

    // Reset recovery attempts
    const resetRecovery: RecoveryAttempts = {
      sessionAttempts: 0,
      lastSessionAttempt: new Date(),
      totalSessions: 0,
      isInCooldown: false,
      requiresParentReset: false
    }

    await updateDoc(doc(db, 'children', childId), {
      recoveryAttempts: resetRecovery
    })

    onSuccess()
  }

  const handleFailedAttempt = async () => {
    if (!child) return

    const recovery = child.recoveryAttempts
    const newSessionAttempts = recovery.sessionAttempts + 1
    const newTotalSessions = recovery.totalSessions + (newSessionAttempts >= 3 ? 1 : 0)

    let updatedRecovery: RecoveryAttempts = {
      ...recovery,
      sessionAttempts: newSessionAttempts,
      lastSessionAttempt: new Date()
    }

    if (newSessionAttempts >= 3) {
      // Session limit reached - start cooldown
      updatedRecovery.sessionAttempts = 0
      updatedRecovery.totalSessions = newTotalSessions
      updatedRecovery.isInCooldown = true
      updatedRecovery.lastCooldownStart = new Date()

      if (newTotalSessions >= 3) {
        // Multiple failed sessions - require parent reset
        updatedRecovery.requiresParentReset = true
        await notifyParent()
      }

      setCooldownRemaining(COOLDOWN_MINUTES * 60)
      setStep(newTotalSessions >= 3 ? 'parent-help' : 'cooldown')
    } else {
      setError('That\'s not quite right. Try again!')
      setAnswers(prev => {
        const newAnswers = [...prev]
        newAnswers[currentQuestionIndex] = ''
        return newAnswers
      })
    }

    await updateDoc(doc(db, 'children', childId), {
      recoveryAttempts: updatedRecovery
    })

    setChild(prev => prev ? { ...prev, recoveryAttempts: updatedRecovery } : null)
  }

  const notifyParent = async () => {
    if (!child) return
    
    // Here you would typically send an email or notification to the parent
    // For now, we'll just set a flag
    setParentNotified(true)
    
    // You could implement email notification here using Firebase Functions
    console.log('Parent notification sent for child:', child.username)
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!child) {
    return (
      <div className="text-center p-8">
        <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
        <p className="text-red-600">Something went wrong. Please try again.</p>
      </div>
    )
  }

  // Cooldown Screen
  if (step === 'cooldown') {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-blue-100 dark:bg-blue-900/30 rounded-full">
            <Clock className="w-12 h-12 text-blue-600 dark:text-blue-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Take a Little Break
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          Please wait a little while and then try again. You're doing fine! ✨
        </p>
        
        <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-6 mb-6">
          <div className="text-3xl font-bold text-blue-600 dark:text-blue-400 mb-2">
            {formatTime(cooldownRemaining)}
          </div>
          <p className="text-sm text-blue-600 dark:text-blue-400">
            Time remaining
          </p>
        </div>
        
        <Button
          onClick={onCancel}
          variant="outline"
          className="w-full"
        >
          Go Back
        </Button>
      </div>
    )
  }

  // Parent Help Required Screen
  if (step === 'parent-help') {
    return (
      <div className="max-w-md mx-auto p-6 text-center">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full">
            <Heart className="w-12 h-12 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
          Ask a Grown-Up for Help
        </h2>
        
        <p className="text-gray-600 dark:text-gray-300 mb-6">
          No worries! Sometimes we all need help remembering things. 
          Ask a parent or guardian to help you reset your PIN.
        </p>
        
        {parentNotified && (
          <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 mb-6">
            <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
              <CheckCircle className="w-5 h-5" />
              <span className="text-sm font-medium">We've let your grown-up know!</span>
            </div>
          </div>
        )}
        
        <div className="space-y-3">
          <Button
            onClick={() => notifyParent()}
            disabled={parentNotified}
            className="w-full bg-purple-600 hover:bg-purple-700 text-white"
          >
            {parentNotified ? 'Grown-up Notified ✓' : 'Let My Grown-up Know'}
          </Button>
          
          <Button
            onClick={onCancel}
            variant="outline"
            className="w-full"
          >
            Go Back
          </Button>
        </div>
      </div>
    )
  }

  // Security Questions Screen
  const currentQuestion = child.securityQuestions[currentQuestionIndex]
  const progress = ((currentQuestionIndex + 1) / child.securityQuestions.length) * 100

  return (
    <div className="max-w-md mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-yellow-100 dark:bg-yellow-900/30 rounded-full">
            <HelpCircle className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Help Me Remember
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Answer these questions to get back into your account
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
          <span>Question {currentQuestionIndex + 1} of {child.securityQuestions.length}</span>
          <span>{Math.round(progress)}%</span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
          <div 
            className="bg-yellow-500 h-2 rounded-full transition-all duration-300"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Current Question */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border-2 border-yellow-200 dark:border-yellow-800 p-6 mb-6">
        <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
          {currentQuestion.question}
        </h3>
        
        <input
          type="text"
          value={answers[currentQuestionIndex] || ''}
          onChange={(e) => {
            const newAnswers = [...answers]
            newAnswers[currentQuestionIndex] = e.target.value
            setAnswers(newAnswers)
            setError('')
          }}
          placeholder="Type your answer here..."
          className="w-full p-4 border border-gray-300 dark:border-gray-600 rounded-lg 
                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                   focus:ring-2 focus:ring-yellow-500 focus:border-transparent
                   text-lg placeholder-gray-400 dark:placeholder-gray-500"
          onKeyPress={(e) => e.key === 'Enter' && handleAnswerSubmit()}
          autoFocus
        />
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      {/* Attempt Counter */}
      <div className="text-center text-sm text-gray-500 dark:text-gray-400 mb-6">
        Attempts: {child.recoveryAttempts.sessionAttempts}/3 this session
      </div>

      <div className="flex gap-3">
        <Button
          onClick={onCancel}
          variant="outline"
          className="flex-1"
        >
          Cancel
        </Button>
        <Button
          onClick={handleAnswerSubmit}
          disabled={submitting || !answers[currentQuestionIndex]?.trim()}
          className="flex-1 bg-yellow-600 hover:bg-yellow-700 text-white"
        >
          {submitting ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            currentQuestionIndex < child.securityQuestions.length - 1 ? 'Next' : 'Finish'
          )}
        </Button>
      </div>
    </div>
  )
}