// src/components/auth/ParentLogin.tsx - FULLY RESPONSIVE VERSION
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
        // Check email verification
        if (!userCredential.user.emailVerified) {
          setError('Please verify your email before logging in. Check your inbox for the verification link.')
          await auth.signOut()
          return
        }
      }
      
      console.log('Email authentication successful')
      window.location.href = '/parent'
      
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

  // Forgot Password Modal - RESPONSIVE
  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                      dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                      flex items-center justify-center 
                      p-3 sm:p-4 md:p-6 lg:p-8">
        
        {/* Responsive Container */}
        <div className="w-full 
                        max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md
                        mx-auto">
          
          {/* Modal Card - Responsive */}
          <div className="bg-white dark:bg-gray-800 
                          rounded-xl sm:rounded-2xl 
                          shadow-xl 
                          p-4 sm:p-6 md:p-8">
            
            {!resetEmailSent ? (
              <>
                {/* Header - Responsive */}
                <div className="text-center 
                                mb-6 sm:mb-8">
                  <div className="flex justify-center 
                                  mb-3 sm:mb-4">
                    <div className="p-2 sm:p-3 
                                    bg-blue-100 dark:bg-blue-900/30 
                                    rounded-full">
                      <Mail className="w-6 h-6 sm:w-8 sm:h-8 
                                      text-blue-600 dark:text-blue-400" />
                    </div>
                  </div>
                  <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-2xl 
                                 font-bold text-gray-900 dark:text-white 
                                 mb-2 sm:mb-3">
                    Reset Password
                  </h2>
                  <p className="text-sm sm:text-base md:text-lg lg:text-base 
                                text-gray-600 dark:text-gray-300 
                                leading-relaxed px-2 sm:px-0">
                    Enter your email to receive a password reset link
                  </p>
                </div>

                {/* Form - Responsive */}
                <form onSubmit={handleForgotPassword} 
                      className="space-y-4 sm:space-y-6">
                  <div>
                    <div className="relative">
                      <Mail className="absolute left-3 sm:left-4 
                                      top-1/2 transform -translate-y-1/2 
                                      text-gray-400 
                                      w-4 h-4 sm:w-5 sm:h-5
                                      pointer-events-none" />
                      <input
                        type="email"
                        value={forgotEmail}
                        onChange={(e) => setForgotEmail(e.target.value)}
                        placeholder="Enter your email"
                        className="w-full 
                                  pl-10 sm:pl-12 
                                  pr-3 sm:pr-4 
                                  py-3 sm:py-4
                                  border-2 border-gray-300 dark:border-gray-600 
                                  rounded-lg sm:rounded-xl 
                                  bg-white dark:bg-gray-700 
                                  text-gray-900 dark:text-white
                                  focus:ring-2 focus:ring-blue-500 focus:border-blue-500
                                  transition-all duration-200
                                  text-base sm:text-lg
                                  min-h-[44px] sm:min-h-[48px]"
                        required
                        autoComplete="email"
                      />
                    </div>
                  </div>

                  {/* Error Message - Responsive */}
                  {error && (
                    <div className="flex items-center gap-2 sm:gap-3 
                                    text-red-600 dark:text-red-400 
                                    text-sm sm:text-base
                                    bg-red-50 dark:bg-red-900/20 
                                    border border-red-200 dark:border-red-800 
                                    rounded-lg p-3 sm:p-4">
                      <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                      <span>{error}</span>
                    </div>
                  )}

                  {/* Submit Button - Touch Optimized */}
                  <Button
                    type="submit"
                    disabled={resetLoading}
                    className="w-full 
                              bg-blue-600 hover:bg-blue-700 
                              disabled:bg-gray-400 disabled:cursor-not-allowed
                              text-white font-semibold 
                              py-3 sm:py-4 
                              px-4 sm:px-6 
                              rounded-lg sm:rounded-xl 
                              transition-all duration-200
                              flex items-center justify-center gap-2 sm:gap-3
                              text-base sm:text-lg
                              min-h-[44px] sm:min-h-[48px]
                              focus:ring-4 focus:ring-blue-200 dark:focus:ring-blue-800
                              active:scale-95 sm:active:scale-98
                              shadow-lg hover:shadow-xl">
                    {resetLoading ? (
                      <div className="w-5 h-5 sm:w-6 sm:h-6 
                                    border-2 border-white border-t-transparent 
                                    rounded-full animate-spin" />
                    ) : (
                      <>
                        <span>Send Reset Email</span>
                        <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                      </>
                    )}
                  </Button>
                </form>

                {/* Back Button - Touch Friendly */}
                <button
                  onClick={resetForgotPassword}
                  className="w-full mt-4 sm:mt-6 
                            text-gray-600 dark:text-gray-400 
                            hover:text-gray-800 dark:hover:text-gray-200 
                            transition-colors duration-200
                            p-3 -m-3 rounded-lg
                            min-h-[44px]
                            text-sm sm:text-base
                            focus:ring-2 focus:ring-gray-200 dark:focus:ring-gray-800
                            active:scale-95">
                  Back to login
                </button>
              </>
            ) : (
              /* Success State - Responsive */
              <div className="text-center">
                <div className="flex justify-center 
                                mb-4 sm:mb-6">
                  <div className="p-3 sm:p-4 
                                  bg-green-100 dark:bg-green-900/30 
                                  rounded-full">
                    <CheckCircle className="w-6 h-6 sm:w-8 sm:h-8 
                                          text-green-600 dark:text-green-400" />
                  </div>
                </div>
                <h2 className="text-xl sm:text-2xl md:text-3xl lg:text-2xl 
                               font-bold text-gray-900 dark:text-white 
                               mb-2 sm:mb-3">
                  Email Sent!
                </h2>
                <p className="text-sm sm:text-base md:text-lg lg:text-base 
                              text-gray-600 dark:text-gray-300 
                              mb-6 sm:mb-8 
                              leading-relaxed px-2 sm:px-0">
                  Check your email for a password reset link. It may take a few minutes to arrive.
                </p>
                <Button
                  onClick={resetForgotPassword}
                  className="w-full 
                            bg-indigo-600 hover:bg-indigo-700 
                            text-white font-semibold 
                            py-3 sm:py-4 
                            px-4 sm:px-6 
                            rounded-lg sm:rounded-xl 
                            transition-all duration-200
                            text-base sm:text-lg
                            min-h-[44px] sm:min-h-[48px]
                            focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800
                            active:scale-95 sm:active:scale-98
                            shadow-lg hover:shadow-xl">
                  Back to Login
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    )
  }

  // Main Login Form - FULLY RESPONSIVE
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                    dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                    flex items-center justify-center 
                    p-3 sm:p-4 md:p-6 lg:p-8">
      
      {/* Responsive Container */}
      <div className="w-full 
                      max-w-sm sm:max-w-md md:max-w-lg lg:max-w-md xl:max-w-lg
                      mx-auto">
        
        {/* Main Card - Responsive Padding & Radius */}
        <div className="bg-white dark:bg-gray-800 
                        rounded-xl sm:rounded-2xl 
                        shadow-xl 
                        p-4 sm:p-6 md:p-8 lg:p-8">
          
          {/* Header - Responsive Sizing */}
          <div className="text-center 
                          mb-6 sm:mb-8 md:mb-10">
            <div className="flex justify-center 
                            mb-3 sm:mb-4 md:mb-6">
              <div className="p-2 sm:p-3 md:p-4 
                              bg-indigo-100 dark:bg-indigo-900/30 
                              rounded-full">
                <UserPlus className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 
                                   text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            
            {/* Responsive Typography */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-2xl 
                           font-bold text-gray-900 dark:text-white 
                           mb-2 sm:mb-3 md:mb-4
                           leading-tight">
              {isSignUp ? 'Create Parent Account' : 'Welcome Back!'}
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-base 
                          text-gray-600 dark:text-gray-300 
                          leading-relaxed
                          px-2 sm:px-0">
              {isSignUp 
                ? 'Set up your account to manage your child\'s learning journey'
                : 'Access your parent dashboard and manage settings'
              }
            </p>
          </div>

          {/* Google Sign-In Button - Touch Optimized */}
          <Button
            onClick={handleGoogleSignIn}
            disabled={googleLoading}
            variant="outline"
            className="w-full 
                      border-2 border-gray-300 dark:border-gray-600 
                      text-gray-700 dark:text-gray-300 
                      hover:bg-gray-50 dark:hover:bg-gray-700/50
                      bg-white dark:bg-gray-800
                      font-medium 
                      py-3 sm:py-4 md:py-5 
                      px-4 sm:px-6 
                      rounded-lg sm:rounded-xl 
                      transition-all duration-200
                      flex items-center justify-center gap-2 sm:gap-3
                      text-base sm:text-lg md:text-xl
                      min-h-[44px] sm:min-h-[48px] md:min-h-[52px]
                      focus:ring-4 focus:ring-gray-200 dark:focus:ring-gray-800
                      active:scale-95 sm:active:scale-98
                      shadow-lg hover:shadow-xl
                      disabled:opacity-50 disabled:cursor-not-allowed
                      mb-4 sm:mb-6">
            {googleLoading ? (
              <div className="w-5 h-5 sm:w-6 sm:h-6 
                            border-2 border-gray-400 border-t-transparent 
                            rounded-full animate-spin" />
            ) : (
              <>
                <svg className="w-5 h-5 sm:w-6 sm:h-6" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                </svg>
                <span>Continue with Google</span>
              </>
            )}
          </Button>

          {/* Divider - Responsive */}
          <div className="relative flex items-center 
                          mb-4 sm:mb-6">
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            <span className="flex-shrink-0 px-3 sm:px-4 
                            bg-white dark:bg-gray-800 
                            text-gray-500 dark:text-gray-400 
                            text-xs sm:text-sm">
              or
            </span>
            <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Email Form - Responsive Spacing */}
          <form onSubmit={handleEmailSubmit} 
                className="space-y-4 sm:space-y-5 md:space-y-6">
            
            {/* Email Field */}
            <div>
              <div className="relative">
                <Mail className="absolute left-3 sm:left-4 
                                top-1/2 transform -translate-y-1/2 
                                text-gray-400 
                                w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6
                                pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="w-full 
                            pl-10 sm:pl-12 md:pl-14 
                            pr-3 sm:pr-4 
                            py-3 sm:py-4 md:py-4
                            border-2 border-gray-300 dark:border-gray-600 
                            rounded-lg sm:rounded-xl 
                            bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                            transition-all duration-200
                            text-base sm:text-lg md:text-xl
                            min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 
                                top-1/2 transform -translate-y-1/2 
                                text-gray-400 
                                w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6
                                pointer-events-none" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full 
                            pl-10 sm:pl-12 md:pl-14 
                            pr-3 sm:pr-4 
                            py-3 sm:py-4 md:py-4
                            border-2 border-gray-300 dark:border-gray-600 
                            rounded-lg sm:rounded-xl 
                            bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                            transition-all duration-200
                            text-base sm:text-lg md:text-xl
                            min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                  required
                  autoComplete={isSignUp ? "new-password" : "current-password"}
                />
              </div>
            </div>

            {/* New User Section */}
            {/*<div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                Don't have an account yet?
              </p>
              <Button
                onClick={() => window.location.href = '/parent-signup'}
                variant="outline"
                className="w-full border-2 border-indigo-300 text-indigo-600 hover:bg-indigo-50"
              >
                Create New Parent Account
              </Button>
            </div>*/}
            
            {/* Error Message - Responsive */}
            {error && (
              <div className="flex items-center gap-2 sm:gap-3 
                              text-red-600 dark:text-red-400 
                              text-sm sm:text-base
                              bg-red-50 dark:bg-red-900/20 
                              border-2 border-red-200 dark:border-red-800 
                              rounded-lg sm:rounded-xl 
                              p-3 sm:p-4">
                <AlertCircle className="w-4 h-4 sm:w-5 sm:h-5 flex-shrink-0" />
                <span className="font-medium">{error}</span>
              </div>
            )}

            {/* Submit Button - Touch Optimized */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full 
                        bg-indigo-600 hover:bg-indigo-700 
                        disabled:bg-gray-400 disabled:cursor-not-allowed
                        text-white font-semibold 
                        py-3 sm:py-4 md:py-5 
                        px-4 sm:px-6 
                        rounded-lg sm:rounded-xl 
                        transition-all duration-200
                        flex items-center justify-center gap-2 sm:gap-3
                        text-base sm:text-lg md:text-xl
                        min-h-[44px] sm:min-h-[48px] md:min-h-[52px]
                        focus:ring-4 focus:ring-indigo-200 dark:focus:ring-indigo-800
                        active:scale-95 sm:active:scale-98
                        shadow-lg hover:shadow-xl">
              {loading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 
                              border-2 border-white border-t-transparent 
                              rounded-full animate-spin" />
              ) : (
                <>
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Forgot Password Link - Touch Friendly */}
          {!isSignUp && (
            <div className="text-center 
                            mt-4 sm:mt-6">
              <button
                onClick={() => setShowForgotPassword(true)}
                className="text-indigo-600 dark:text-indigo-400 
                          hover:text-indigo-800 dark:hover:text-indigo-300 
                          text-sm sm:text-base 
                          transition-colors duration-200
                          p-2 sm:p-3 -m-2 sm:-m-3 
                          rounded-lg
                          min-h-[44px]
                          focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800
                          active:scale-95">
                Forgot your password?
              </button>
            </div>
          )}

          {/* Toggle Sign Up/Sign In - Responsive Layout */}
          <div className="text-center 
                          mt-6 sm:mt-8 md:mt-10 
                          pt-6 sm:pt-8 
                          border-t border-gray-200 dark:border-gray-700">
            <p className="text-gray-600 dark:text-gray-400 
                          text-sm sm:text-base 
                          mb-2 sm:mb-3 
                          leading-relaxed">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
            </p>
            <button
              onClick={() => setIsSignUp(!isSignUp)}
              className="text-indigo-600 dark:text-indigo-400 
                        hover:text-indigo-800 dark:hover:text-indigo-300 
                        font-semibold 
                        text-sm sm:text-base 
                        transition-colors duration-200
                        p-2 sm:p-3 -m-2 sm:-m-3 
                        rounded-lg
                        min-h-[44px]
                        focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800
                        active:scale-95">
              {isSignUp ? 'Sign in' : 'Sign up'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}