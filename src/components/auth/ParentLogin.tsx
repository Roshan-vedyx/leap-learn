// src/components/auth/ParentLogin.tsx - Enhanced with forgot password
import React, { useState } from 'react'
import { UserPlus, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo,
  sendPasswordResetEmail
} from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { Button } from '@/components/ui/Button'
import type { ParentProfile } from '../../types/auth'

export const ParentLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  
  // Forgot password state
  const [showForgotPassword, setShowForgotPassword] = useState(false)
  const [forgotEmail, setForgotEmail] = useState('')
  const [resetEmailSent, setResetEmailSent] = useState(false)
  const [resetLoading, setResetLoading] = useState(false)

  const googleProvider = new GoogleAuthProvider()
  googleProvider.addScope('email')
  googleProvider.addScope('profile')

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      let userCredential
      
      if (isSignUp) {
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        const parentProfile: ParentProfile = {
          parentId: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName: userCredential.user.displayName || email.split('@')[0],
          photoURL: userCredential.user.photoURL || null,
          authProvider: 'email',
          createdAt: new Date(),
          subscription: {
            tier: 'free',
            status: 'active'
          },
          children: []
        }
        
        await setDoc(doc(db, 'parents', userCredential.user.uid), parentProfile)
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
      }
      
      console.log('Email authentication successful')
      
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true)
    setError('')

    try {
      const result = await signInWithPopup(auth, googleProvider)
      const user = result.user
      const additionalUserInfo = getAdditionalUserInfo(result)

      if (additionalUserInfo?.isNewUser) {
        const parentProfile: ParentProfile = {
          parentId: user.uid,
          email: user.email!,
          displayName: user.displayName,
          photoURL: user.photoURL,
          authProvider: 'google',
          createdAt: new Date(),
          subscription: {
            tier: 'free',
            status: 'active'
          },
          children: []
        }
        
        await setDoc(doc(db, 'parents', user.uid), parentProfile)
      }
      
      console.log('Google authentication successful')
      
    } catch (err: any) {
      setError(err.message || 'Google sign-in failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!forgotEmail.trim()) {
      setError('Please enter your email address')
      return
    }

    setResetLoading(true)
    setError('')

    try {
      await sendPasswordResetEmail(auth, forgotEmail.trim())
      setResetEmailSent(true)
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address')
      } else {
        setError('Failed to send reset email. Please try again.')
      }
    } finally {
      setResetLoading(false)
    }
  }

  const resetForgotPassword = () => {
    setShowForgotPassword(false)
    setForgotEmail('')
    setResetEmailSent(false)
    setError('')
  }

  // Forgot Password Modal
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                      dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                      flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
            
            {!resetEmailSent ? (
              <>
                <div className="text-center mb-6">
                  <div className="flex justify-center mb-4">
                    <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                      <Mail className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                    Reset Password
                  </h2>
                  <p className="text-gray-600 dark:text-gray-300">
                    Enter your email to receive a password reset link
                  </p>
                </div>

                <form onSubmit={handleForgotPassword} className="space-y-4">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 
                                     text-gray-400 w-5 h-5" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                                 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                                 transition-colors"
                        required
                      />
                    </div>
                  </div>

                  {error && (
                    <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                      <AlertCircle className="w-4 h-4" />
                      {error}
                    </div>
                  )}

                  <Button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-4 
                             rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {resetLoading ? (
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        Send Reset Email
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </Button>
                </form>

                <button
                  onClick={resetForgotPassword}
                  className="w-full mt-4 text-gray-600 dark:text-gray-400 hover:text-gray-800 
                           dark:hover:text-gray-200 transition-colors"
                >
                  Back to login
                </button>
              </>
            ) : (
              <div className="text-center">
                <div className="flex justify-center mb-4">
                  <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                    <CheckCircle className="w-8 h-8 text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  Email Sent!
                </h2>
                <p className="text-gray-600 dark:text-gray-300 mb-6">
                  Check your email for a password reset link. It may take a few minutes to arrive.
                </p>
                <Button
                  onClick={resetForgotPassword}
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 
                           rounded-lg transition-colors"
                >
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main Login Form
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                    dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <UserPlus className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {isSignUp ? 'Create Parent Account' : 'Welcome Back!'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              {isSignUp ? 'Set up your family account' : 'Sign in to manage your family\'s learning'}
            </p>
          </div>

          {/* Google Sign In */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            className="w-full mb-4 bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 
                     text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600 
                     font-medium py-3 px-4 rounded-lg transition-colors flex items-center justify-center gap-3"
          >
            {googleLoading ? (
              <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5" viewBox="0 0 24 24">
                  <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                Continue with Google
              </>
            )}
          </Button>

          <div className="relative flex items-center justify-center my-6">
            <hr className="w-full border-gray-300 dark:border-gray-600" />
            <span className="px-3 bg-white dark:bg-gray-800 text-gray-500 dark:text-gray-400 text-sm">
              or
            </span>
          </div>

          {/* Email Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 
                               text-gray-400 w-5 h-5" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                  required
                />
              </div>
            </div>

            <div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 
                               text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors"
                  required
                />
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
                <AlertCircle className="w-4 h-4" />
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 
                       rounded-lg transition-colors flex items-center justify-center gap-2"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </Button>
          </form>

          {/* Forgot Password Link */}
          {!isSignUp && (
            <div className="text-center mt-4">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 
                         dark:hover:text-indigo-300 text-sm transition-colors"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* Toggle Sign Up/Sign In */}
          <div className="text-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => setIsSignUp(!isSignUp)}
                className="ml-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 
                         dark:hover:text-indigo-300 font-medium transition-colors"
              >
                {isSignUp ? 'Sign in' : 'Sign up'}
              </button>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}