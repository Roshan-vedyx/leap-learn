// src/components/auth/ParentSignup.tsx - NEW SIGNUP FLOW
import React, { useState } from 'react'
import { Mail, Lock, User, ArrowRight, ArrowLeft, Plus, Check } from 'lucide-react'
import { 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo
} from 'firebase/auth'
import { doc, setDoc, collection, addDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { Button } from '@/components/ui/Button'
import bcrypt from 'bcryptjs'
import type { ParentProfile, ChildProfile } from '../../types/auth'

export const ParentSignup: React.FC = () => {
  const [step, setStep] = useState(1) // 1: Parent signup, 2: Create children, 3: Complete
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Parent data
  const [parentData, setParentData] = useState({
    email: '',
    password: '',
    displayName: ''
  })
  
  // Children data
  const [children, setChildren] = useState([{ username: '', pin: '', confirmPin: '' }])
  const [createdParentId, setCreatedParentId] = useState('')

  const googleProvider = new GoogleAuthProvider()

  // === STEP 1: PARENT REGISTRATION ===
  const handleEmailSignup = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const userCredential = await createUserWithEmailAndPassword(
        auth, 
        parentData.email, 
        parentData.password
      )
      
      await createParentProfile(userCredential.user, 'email')
      setCreatedParentId(userCredential.user.uid)
      setStep(2)
      
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
        setStep(2)
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

  // === STEP 2: CREATE CHILDREN ===
  const addChildSlot = () => {
    if (children.length < 5) {
      setChildren([...children, { username: '', pin: '', confirmPin: '' }])
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

  const validateChildren = () => {
    for (const child of children) {
      if (!child.username.trim()) return 'All children need usernames'
      if (child.pin.length !== 4) return 'All PINs must be 4 digits'
      if (child.pin !== child.confirmPin) return 'PINs must match'
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
          
          const childProfile: ChildProfile = {
            childId: '', // Will be set by Firestore
            parentId: createdParentId,
            username: child.username.trim(),
            pinHash: hashedPin,
            createdAt: new Date(),
            lastActive: new Date(),
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
      
      setStep(3)
      
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
            <div className="flex items-center gap-4">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             ${step >= 1 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 1 ? <Check className="w-4 h-4" /> : '1'}
              </div>
              <div className={`w-12 h-1 ${step >= 2 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             ${step >= 2 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 2 ? <Check className="w-4 h-4" /> : '2'}
              </div>
              <div className={`w-12 h-1 ${step >= 3 ? 'bg-indigo-600' : 'bg-gray-200'}`}></div>
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold
                             ${step >= 3 ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                {step > 3 ? <Check className="w-4 h-4" /> : '3'}
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
                  Create Parent Account
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  First, let's set up your parent account
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
                <div>
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
                </div>

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
                  {loading ? 'Creating Account...' : 'Create Account'}
                </Button>
              </form>
            </div>
          )}

          {/* STEP 2: Create Children */}
          {step === 2 && (
            <div>
              <div className="text-center mb-8">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Create Child Profiles
                </h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Set up profiles for your children
                </p>
              </div>

              <div className="space-y-6">
                {children.map((child, index) => (
                  <div key={index} className="p-6 border border-gray-200 dark:border-gray-600 rounded-lg">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Child {index + 1}
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

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Username
                        </label>
                        <input
                          type="text"
                          value={child.username}
                          onChange={(e) => updateChild(index, 'username', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                          placeholder="child1"
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          PIN
                        </label>
                        <input
                          type="password"
                          value={child.pin}
                          onChange={(e) => updateChild(index, 'pin', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                   text-center font-mono"
                          placeholder="0000"
                          maxLength={4}
                        />
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Confirm PIN
                        </label>
                        <input
                          type="password"
                          value={child.confirmPin}
                          onChange={(e) => updateChild(index, 'confirmPin', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded
                                   bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                   text-center font-mono"
                          placeholder="0000"
                          maxLength={4}
                        />
                      </div>
                    </div>
                  </div>
                ))}

                {children.length < 5 && (
                  <Button
                    type="button"
                    onClick={addChildSlot}
                    className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600
                             rounded-lg text-gray-600 dark:text-gray-400 hover:border-indigo-400
                             hover:text-indigo-600 dark:hover:text-indigo-400 transition-colors
                             flex items-center justify-center gap-2"
                  >
                    <Plus className="w-5 h-5" />
                    Add Another Child
                  </Button>
                )}
              </div>

              <div className="flex gap-4 mt-8">
                <Button
                  type="button"
                  onClick={() => setStep(1)}
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
                  className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 
                           rounded-lg font-medium transition-colors duration-200 
                           disabled:opacity-50 disabled:cursor-not-allowed
                           flex items-center justify-center gap-2"
                >
                  {loading ? 'Creating...' : 'Create Profiles'}
                  <ArrowRight className="w-5 h-5" />
                </Button>
              </div>
            </div>
          )}

          {/* STEP 3: Complete */}
          {step === 3 && (
            <div className="text-center">
              <div className="flex justify-center mb-6">
                <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <Check className="w-12 h-12 text-green-600 dark:text-green-400" />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">
                All Set! 🎉
              </h1>
              
              <p className="text-gray-600 dark:text-gray-300 mb-8">
                Your account and child profiles have been created successfully. 
                Your children can now log in using their usernames and PINs.
              </p>

              <Button
                type="button"
                onClick={goToApp}
                className="bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-6 
                         rounded-lg font-medium transition-colors duration-200
                         flex items-center justify-center gap-2 mx-auto"
              >
                Start Learning
                <ArrowRight className="w-5 h-5" />
              </Button>

              <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                <button
                  onClick={() => window.location.href = '/parent'}
                  className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 
                           dark:hover:text-gray-300 underline transition-colors duration-200"
                >
                  Go to Parent Dashboard
                </button>
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