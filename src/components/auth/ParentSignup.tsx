// src/components/auth/ParentSignup.tsx - CHILD-CENTERED SIGNUP FLOW
import React, { useState } from 'react'
import { Mail, Lock, User, ArrowRight, ArrowLeft, Plus, Check, Shield, Heart, Star, CheckCircle } from 'lucide-react'
import { 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, collection, addDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { Button } from '@/components/ui/Button'
import bcrypt from 'bcryptjs'
import type { ParentProfile, ChildProfile } from '../../types/auth'
import { SECURITY_QUESTIONS, type SecurityQuestion, type RecoveryAttempts } from '../../types/auth'

const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

export const ParentSignup: React.FC = () => {
  const [step, setStep] = useState(1) // 1: Parent signup, 2: Ownership transition, 3: Create children, 4: Complete
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Parent data
  const [parentData, setParentData] = useState({
    email: '',
    password: ''
  })
  
  // Children data with security questions
  const [children, setChildren] = useState([{ 
    username: '', 
    pin: '', 
    confirmPin: '',
    showSecurityQuestions: false,
    selectedQuestions: [] as string[],
    answers: {} as Record<string, string>
  }])
  const [createdParentId, setCreatedParentId] = useState('')

  const googleProvider = new GoogleAuthProvider()

  // === STEP 1: PARENT REGISTRATION ===
  const handleEmailSignup = async (e: React.FormEvent) => {
  e.preventDefault()
  setLoading(true)
  setError('')

  // Email validation
  if (!isValidEmail(parentData.email)) {
    setError('Please enter a valid email address')
    setLoading(false)
    return
  }

  try {
    const userCredential = await createUserWithEmailAndPassword(
      auth, 
      parentData.email, 
      parentData.password
    )
    
    await createParentProfile(userCredential.user, 'email')
    setCreatedParentId(userCredential.user.uid)
    setStep(2) // Go to ownership transition
    
  } catch (err: any) {
    setError(err.message || 'Failed to create account')
  } finally {
    setLoading(false)
  }
}

  const handleGoogleSignup = async () => {
    setLoading(true)
    setError('')

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const additionalUserInfo = getAdditionalUserInfo(result)

      if (additionalUserInfo?.isNewUser) {
        await createParentProfile(result.user, 'google')
        setCreatedParentId(result.user.uid)
        setStep(2) // Go to ownership transition
      } else {
        // Existing user - redirect to parent dashboard
        window.location.href = '/parent'
      }
      
    } catch (err: any) {
      setError(err.message || 'Google signup failed')
    } finally {
      setLoading(false)
    }
  }

  const createParentProfile = async (user: any, provider: 'email' | 'google') => {
    const parentProfile: ParentProfile = {
      parentId: user.uid,
      email: user.email!,
      displayName: user.displayName || parentData.displayName || user.email!.split('@')[0],
      photoURL: user.photoURL || null,
      authProvider: provider,
      createdAt: new Date(),
      lastLoginAt: new Date(),
      subscription: { tier: 'free', status: 'active' },
      children: []
    }
    
    await setDoc(doc(db, 'parents', user.uid), parentProfile)
  }

  const handleForgotPassword = async () => {
    if (!parentData.email) {
      setError('Please enter your email address first')
      return
    }
  
    if (!isValidEmail(parentData.email)) {
      setError('Please enter a valid email address')
      return
    }
  
    setLoading(true)
    setError('')
  
    try {
      await sendPasswordResetEmail(auth, parentData.email)
      setError('') // Clear any errors
      // You might want to show a success message instead of using error state
      alert('Password reset email sent! Check your inbox.')
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setLoading(false)
    }
  }

  // === STEP 3: CREATE CHILDREN ===
  const addChildSlot = () => {
    if (children.length < 5) {
      setChildren([...children, { 
        username: '', 
        pin: '', 
        confirmPin: '',
        showSecurityQuestions: false,
        selectedQuestions: [],
        answers: {}
      }])
    }
  }

  const removeChildSlot = (index: number) => {
    if (children.length > 1) {
      const newChildren = children.filter((_, i) => i !== index)
      setChildren(newChildren)
    }
  }

  const updateChild = (index: number, field: string, value: string) => {
    const newChildren = [...children]
    if (field === 'pin' || field === 'confirmPin') {
      // Only allow 4-digit numbers for PIN
      if (value.length <= 4 && /^\d*$/.test(value)) {
        newChildren[index] = { ...newChildren[index], [field]: value }
      }
    } else {
      newChildren[index] = { ...newChildren[index], [field]: value }
    }
    setChildren(newChildren)
  }

  const toggleSecurityQuestions = (index: number, show: boolean) => {
    const newChildren = [...children]
    newChildren[index] = { 
      ...newChildren[index], 
      showSecurityQuestions: show,
      selectedQuestions: show ? newChildren[index].selectedQuestions : [],
      answers: show ? newChildren[index].answers : {}
    }
    setChildren(newChildren)
  }

  const handleQuestionToggle = (childIndex: number, questionId: string) => {
    const newChildren = [...children]
    const child = newChildren[childIndex]
    
    if (child.selectedQuestions.includes(questionId)) {
      // Remove question
      child.selectedQuestions = child.selectedQuestions.filter(id => id !== questionId)
      delete child.answers[questionId]
    } else if (child.selectedQuestions.length < 3) {
      // Add question (max 3)
      child.selectedQuestions = [...child.selectedQuestions, questionId]
    }
    
    setChildren(newChildren)
  }

  const handleAnswerChange = (childIndex: number, questionId: string, answer: string) => {
    const newChildren = [...children]
    newChildren[childIndex].answers[questionId] = answer
    setChildren(newChildren)
  }

  const validateChildren = () => {
    for (const child of children) {
      if (!child.username.trim()) return 'All children need usernames'
      if (child.pin.length !== 4) return 'All PINs must be 4 digits'
      if (child.pin !== child.confirmPin) return 'PINs must match'
      
      // Validate security questions if they're shown
      if (child.showSecurityQuestions && child.selectedQuestions.length > 0) {
        const missingAnswers = child.selectedQuestions.filter(id => !child.answers[id]?.trim())
        if (missingAnswers.length > 0) {
          return 'Please answer all selected questions'
        }
      }
    }
    
    // Check for duplicate usernames
    const usernames = children.map(c => c.username.trim().toLowerCase())
    if (new Set(usernames).size !== usernames.length) {
      return 'Each child needs a unique username'
    }
    
    return null
  }

  const createChildren = async () => {
    const validationError = validateChildren()
    if (validationError) {
      setError(validationError)
      return
    }

    setLoading(true)
    setError('')

    try {
      const childIds = []
      
      for (const child of children) {
        if (child.username.trim()) {
          const hashedPin = await bcrypt.hash(child.pin, 10)
          
          // Process security questions
          let securityQuestions: SecurityQuestion[] = []
          if (child.selectedQuestions.length >= 0) {
            securityQuestions = await Promise.all(
              child.selectedQuestions.map(async (questionId) => {
                const question = SECURITY_QUESTIONS.find(q => q.id === questionId)!
                const answerHash = await bcrypt.hash(child.answers[questionId].toLowerCase().trim(), 10)
                
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
            childId: '', // Will be set by Firestore
            parentId: createdParentId,
            username: child.username.trim(),
            pinHash: hashedPin,
            createdAt: new Date(),
            lastActive: new Date(),
            
            // Security questions
            securityQuestions,
            recoveryAttempts: initialRecovery,
            
            preferences: {
              fontSize: 'default',
              highContrast: false,
              reducedMotion: false,
              audioSupport: true
            },
            metadata: {
              totalSessions: 0,
              lastActiveDate: null,
              currentLevel: 'New Explorer',
              allowWeeklyReport: true
            }
          }
          
          const docRef = await addDoc(collection(db, 'children'), childProfile)
          childIds.push(docRef.id)
        }
      }
      
      // Update parent with child IDs
      await setDoc(doc(db, 'parents', createdParentId), { children: childIds }, { merge: true })
      
      setStep(4)
      
    } catch (err: any) {
      setError(err.message || 'Failed to create child profiles')
    } finally {
      setLoading(false)
    }
  }

  const goToApp = () => {
    window.location.href = '/'
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                    dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                    flex items-center justify-center p-4">
      <div className="w-full max-w-2xl">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          
          {/* Progress Steps */}
          <div className="flex items-center justify-center mb-8">
            <div className="flex items-center gap-3">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className={`w-8 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className={`w-8 h-1 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 3 ? <Check className="w-4 h-4" /> : '3'}
              </div>
              <div className={`w-8 h-1 ${step >= 4 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             ${step >= 4 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 4 ? <Check className="w-4 h-4" /> : '4'}
              </div>
            </div>
          </div>

          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                          dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">{error}</p>
            </div>
          )}

          {/* STEP 1: Parent Registration */}
          {step === 1 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Help Create Your Child's Reading Space
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  We need a parent account first, then your child will create their own private space
                </p>
              </div>

              {/* Google Signup */}
              <Button
                type="button"
                onClick={handleGoogleSignup}
                disabled={loading}
                className="w-full mb-6 bg-white dark:bg-gray-700 border border-gray-300 
                         dark:border-gray-600 text-gray-900 dark:text-white hover:bg-gray-50 
                         dark:hover:bg-gray-600 py-3 px-4 rounded-lg font-medium 
                         transition-colors duration-200 flex items-center justify-center gap-3"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </Button>

              <div className="flex items-center mb-6">
                <div className="flex-1 border-t border-gray-300"></div>
                <span className="mx-4 text-sm text-gray-500">or</span>
                <div className="flex-1 border-t border-gray-300"></div>
              </div>

              {/* Email Signup Form */}
              <form onSubmit={handleEmailSignup} className="space-y-4">
          {/*<div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Name
                  </label>
                  <input
                    type="text"
                    value={parentData.displayName}
                    onChange={(e) => setParentData({ ...parentData, displayName: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Your name"
                  />
                </div>*/}

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email
                  </label>
                  <input
                    type="email"
                    value={parentData.email}
                    onChange={(e) => setParentData({ ...parentData, email: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="your.email@example.com"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Password
                  </label>
                  <input
                    type="password"
                    value={parentData.password}
                    onChange={(e) => setParentData({ ...parentData, password: e.target.value })}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg
                             bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                             focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="Create a secure password"
                    required
                    minLength={6}
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 
                           rounded-lg font-medium transition-colors duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {loading ? 'Creating Account...' : 'Help Set Up'}
                </Button>
                <div className="text-center mt-4">
                <button
                    type="button"
                    onClick={handleForgotPassword}
                    disabled={loading}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 
                            dark:hover:text-indigo-300 underline transition-colors duration-200
                            disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    Forgot your password?
                </button>
                </div>
              </form>
            </div>
          )}

          {/* STEP 2: Ownership Transition - THE MAGIC MOMENT */}
          {step === 2 && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gradient-to-r from-purple-100 to-blue-100 dark:from-purple-900/30 dark:to-blue-900/30 rounded-full">
                  <Star className="w-16 h-16 text-purple-600 dark:text-purple-400" />
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent mb-6">
                Now It's YOUR Turn! 🌟
              </h1>
              
              <div className="bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 p-6 rounded-xl mb-8">
                <div className="flex items-center justify-center gap-3 mb-4">
                  <Shield className="w-8 h-8 text-green-600" />
                  <Heart className="w-8 h-8 text-red-500" />
                  <Star className="w-8 h-8 text-yellow-500" />
                </div>
                
                <div className="space-y-4 text-left max-w-md mx-auto">
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-purple-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      This reading space belongs to <strong>YOU</strong>
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      Your reading practice is <strong>private</strong> - only you can see your progress
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      Parents can only see what <strong>YOU decide</strong> to share with them
                    </p>
                  </div>
                  
                  <div className="flex items-start gap-3">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full mt-2 flex-shrink-0"></div>
                    <p className="text-gray-800 dark:text-gray-200 font-medium">
                      <strong>You're in control</strong> of your learning adventure here
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-8">
                <p className="text-yellow-800 dark:text-yellow-200 font-medium">
                  🏆 Ready to create your own special reading username and secret PIN?
                </p>
              </div>

              <Button
                type="button"
                onClick={() => setStep(3)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                         text-white py-4 px-8 rounded-xl font-bold text-lg
                         transition-all duration-200 transform hover:scale-105
                         flex items-center justify-center gap-3 mx-auto shadow-lg"
              >
                Yes! Create MY Space
                <ArrowRight className="w-6 h-6" />
              </Button>
            </div>
          )}

          {/* STEP 3: Create Children */}
          {step === 3 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Your Secret Login 🔐
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Choose a username and PIN that only YOU will know
                </p>
              </div>

              <div className="space-y-6">
                {children.map((child, index) => (
                  <div key={index} className="p-6 border-2 border-purple-200 dark:border-purple-600 rounded-xl bg-gradient-to-r from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20">
                    <div className="flex items-center justify-between mb-6">
                      <h3 className="text-xl font-bold text-purple-800 dark:text-purple-200 flex items-center gap-2">
                        <Star className="w-6 h-6" />
                        {children.length === 1 ? "Your Reading Identity" : `Reader ${index + 1}`}
                      </h3>
                      {children.length > 1 && (
                        <Button
                          type="button"
                          onClick={() => removeChildSlot(index)}
                          className="text-red-600 hover:text-red-700 text-sm"
                        >
                          Remove
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                      <div>
                        <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">
                          🎯 Your Username
                        </label>
                        <input
                          type="text"
                          value={child.username}
                          onChange={(e) => updateChild(index, 'username', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                   focus:ring-2 focus:ring-purple-500 focus:border-purple-500
                                   font-medium text-center"
                          placeholder="coolreader123"
                        />
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 text-center">
                          Make it special - it's yours!
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">
                          🔒 Secret PIN
                        </label>
                        <input
                          type="password"
                          value={child.pin}
                          onChange={(e) => updateChild(index, 'pin', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                   text-center font-mono text-xl tracking-widest
                                   focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="••••"
                          maxLength={4}
                        />
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 text-center">
                          4 numbers only you know
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-bold text-purple-700 dark:text-purple-300 mb-3">
                          ✓ Confirm PIN
                        </label>
                        <input
                          type="password"
                          value={child.confirmPin}
                          onChange={(e) => updateChild(index, 'confirmPin', e.target.value)}
                          className="w-full px-4 py-3 border-2 border-purple-300 dark:border-purple-600 rounded-lg
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                   text-center font-mono text-xl tracking-widest
                                   focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                          placeholder="••••"
                          maxLength={4}
                        />
                        <p className="text-xs text-purple-600 dark:text-purple-400 mt-1 text-center">
                          Type it again to be sure
                        </p>
                      </div>
                    </div>

                    {/* Security Questions Toggle */}
                    {child.pin.length === 4 && child.confirmPin.length === 4 && child.pin === child.confirmPin && (
                      <div className="mt-6 bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                        <div className="flex items-center gap-3 mb-4">
                          <Shield className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Help Me Remember My PIN
                          </h4>
                        </div>
                        
                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          Want to set up some questions to help you remember your PIN if you ever forget it? 
                          This is optional but really helpful!
                        </p>
                        
                        <div className="flex gap-3">
                          <Button
                            type="button"
                            onClick={() => toggleSecurityQuestions(index, true)}
                            className="bg-yellow-600 hover:bg-yellow-700 text-white"
                            disabled={child.showSecurityQuestions}
                          >
                            {child.showSecurityQuestions ? '✓ Questions Added' : 'Yes, Add Questions'}
                          </Button>
                          {!child.showSecurityQuestions && (
                            <Button
                              type="button"
                              onClick={() => toggleSecurityQuestions(index, false)}
                              className="bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-900 dark:text-white"
                            >
                              Skip for Now
                            </Button>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Security Questions Section */}
                    {child.showSecurityQuestions && (
                      <div className="mt-6 bg-white dark:bg-gray-800 border-2 border-yellow-200 dark:border-yellow-800 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-6">
                          <Shield className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                          <h4 className="text-lg font-semibold text-gray-900 dark:text-white">
                            Choose 2-3 Questions
                          </h4>
                        </div>

                        <div className="space-y-4">
                          {SECURITY_QUESTIONS.map((question) => {
                            const isSelected = child.selectedQuestions.includes(question.id)
                            const canSelect = child.selectedQuestions.length < 3 || isSelected

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
                                  onClick={() => canSelect && handleQuestionToggle(index, question.id)}
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
                                      <h5 className="font-medium text-gray-900 dark:text-white mb-2">
                                        {question.question}
                                      </h5>
                                      {isSelected && (
                                        <input
                                          type="text"
                                          value={child.answers[question.id] || ''}
                                          onChange={(e) => handleAnswerChange(index, question.id, e.target.value)}
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
                            Selected: {child.selectedQuestions.length}/3 questions
                            <span className="text-yellow-600 dark:text-yellow-400 ml-2">
                                {child.selectedQuestions.length === 0 ? "Optional - you can skip this" : "✓ Ready to continue"}
                            </span>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {children.length < 5 && (
                  <Button
                    type="button"
                    onClick={addChildSlot}
                    className="w-full py-4 border-2 border-dashed border-purple-300 dark:border-purple-600
                             rounded-xl text-purple-600 dark:text-purple-400 hover:border-purple-400
                             hover:text-purple-700 dark:hover:text-purple-300 transition-colors
                             flex items-center justify-center gap-2 bg-purple-50 dark:bg-purple-900/10
                             hover:bg-purple-100 dark:hover:bg-purple-900/20"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Reader
                  </Button>
                )}
              </div>

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mt-6">
                <div className="flex items-center gap-2 mb-2">
                  <Shield className="w-5 h-5 text-blue-600" />
                  <p className="text-blue-800 dark:text-blue-200 font-medium text-sm">
                    Privacy Promise
                  </p>
                </div>
                <p className="text-blue-700 dark:text-blue-300 text-sm">
                  This username and PIN are just for you. Your reading progress stays private unless you choose to share it!
                </p>
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  type="button"
                  onClick={() => setStep(2)}
                  className="flex-1 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 
                           dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 
                           rounded-lg font-medium transition-colors duration-200
                           flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Back
                </Button>
                <Button
                  type="button"
                  onClick={createChildren}
                  disabled={loading}
                  className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 
                           text-white py-3 px-4 rounded-lg font-bold transition-all duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2 transform hover:scale-105"
                >
                  {loading ? 'Creating Your Space...' : 'Create MY Reading Space!'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 4: Complete */}
          {step === 4 && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-6 bg-gradient-to-r from-green-100 to-blue-100 dark:from-green-900/30 dark:to-blue-900/30 rounded-full">
                  <div className="flex items-center gap-2">
                    <Star className="w-8 h-8 text-yellow-500" />
                    <Check className="w-8 h-8 text-green-600" />
                    <Heart className="w-8 h-8 text-red-500" />
                  </div>
                </div>
              </div>
              
              <h1 className="text-3xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent mb-4">
                Your Reading Space is Ready! 🎉
              </h1>
              
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 p-6 rounded-xl mb-8">
                <p className="text-lg text-gray-800 dark:text-gray-200 font-medium mb-4">
                  🌟 Welcome to YOUR special reading adventure!
                </p>
                <div className="space-y-2 text-sm text-gray-700 dark:text-gray-300">
                  <p>✨ Your reading space is completely private</p>
                  <p>🔒 Only you have your username and PIN</p>
                  <p>🎯 You control what to share with parents</p>
                  <p>🚀 Ready to start your reading journey?</p>
                </div>
              </div>

              <Button
                type="button"
                onClick={goToApp}
                className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 
                         text-white py-4 px-8 rounded-xl font-bold text-lg
                         transition-all duration-200 transform hover:scale-105
                         flex items-center justify-center gap-3 mx-auto shadow-lg mb-6"
              >
                Start My Reading Adventure!
                <ArrowRight className="w-6 h-6" />
              </Button>

              <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
                <div className="text-center">
                  <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">
                    Parents: Need to manage settings or view shared progress?
                  </p>
                  <button
                    onClick={() => window.location.href = '/parent'}
                    className="text-sm text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 
                             dark:hover:text-indigo-300 underline transition-colors duration-200"
                  >
                    Go to Parent Dashboard
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Back to Login Link */}
          {step === 1 && (
            <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-2">
                Already have an account?
              </p>
              <button
                onClick={() => window.location.href = '/'}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 
                         dark:hover:text-indigo-300 underline transition-colors duration-200"
              >
                Back to Login
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}