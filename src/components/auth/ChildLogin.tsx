// src/components/auth/ChildLogin.tsx - FULLY RESPONSIVE VERSION
import React, { useState } from 'react'
import { User, Lock, UserPlus, ArrowRight, HelpCircle, Eye, EyeOff } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useChildAuth } from '../../contexts/ChildAuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { PinRecovery } from './PinRecovery'
import { PinReset } from './PinReset'

export const ChildLogin: React.FC = () => {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryChildId, setRecoveryChildId] = useState('')
  const [showPinReset, setShowPinReset] = useState(false)
  const { authenticateChild } = useChildAuth()
  const [showPin, setShowPin] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!username.trim()) {
      setError('Please enter your username')
      return
    }
    
    if (pin.length !== 4) {
      setError('Please enter your 4-digit PIN')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Find child by username
      const childrenQuery = query(
        collection(db, 'children'),
        where('username', '==', username.trim())
      )
      const childrenSnapshot = await getDocs(childrenQuery)
      
      if (childrenSnapshot.empty) {
        setError('Username not found. Please check your spelling or sign up.')
        setLoading(false)
        return
      }

      const childDoc = childrenSnapshot.docs[0]
      const childId = childDoc.id
      
      // Authenticate with PIN
      const success = await authenticateChild(childId, pin)
      
      if (!success) {
        setError('Wrong PIN! Please try again.')
        setPin('')
      }
      
    } catch (err: any) {
      console.error('Login error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleForgotPin = async () => {
    if (!username.trim()) {
      setError('Please enter your username first')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Find child by username
      const childrenQuery = query(
        collection(db, 'children'),
        where('username', '==', username.trim())
      )
      const childrenSnapshot = await getDocs(childrenQuery)
      
      if (childrenSnapshot.empty) {
        setError('Username not found. Please check your spelling.')
        setLoading(false)
        return
      }

      const childDoc = childrenSnapshot.docs[0]
      const childData = childDoc.data()
      
      // Check if child has security questions set up
      if (!childData.securityQuestions || childData.securityQuestions.length === 0) {
        setError('No recovery questions set up. Please ask a grown-up for help.')
        setLoading(false)
        return
      }

      // Show recovery screen
      setRecoveryChildId(childDoc.id)
      setShowRecovery(true)
      
    } catch (err: any) {
      console.error('Recovery error:', err)
      setError('Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecoverySuccess = () => {
    // Reset PIN was successful through recovery
    setShowRecovery(false)
    setShowPinReset(true) // Show PIN reset instead of alert
    setPin('')
    setError('')
  }

  const handlePinResetSuccess = () => {
    setShowPinReset(false)
    setRecoveryChildId('')
    setError('')
    // Show success message
    alert('🎉 Your new PIN is ready! You can now log in with your new PIN.')
  }
  
  const handlePinResetCancel = () => {
    setShowPinReset(false)
    setRecoveryChildId('')
    setError('')
  }

  const handleRecoveryCancel = () => {
    setShowRecovery(false)
    setRecoveryChildId('')
    setError('')
  }

  const handlePinChange = (value: string) => {
    // Only allow numbers, max 4 digits
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value)
      setError('')
    }
  }

  const handleSignUp = () => {
    // Always redirect to parent-signup for new account creation
    console.log('🚀 Redirecting to parent signup from child login')
    window.location.href = '/parent-signup'
  }

  // Show recovery screen if activated
  if (showRecovery && recoveryChildId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                      dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                      flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-sm sm:max-w-md md:max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
            <PinRecovery
              childId={recoveryChildId}
              onSuccess={handleRecoverySuccess}
              onCancel={handleRecoveryCancel}
            />
          </div>
        </div>
      </div>
    )
  }

  // Show PIN reset screen if activated
  if (showPinReset && recoveryChildId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                      dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                      flex items-center justify-center p-3 sm:p-4 md:p-6">
        <div className="w-full max-w-sm sm:max-w-md">
          <div className="bg-white dark:bg-gray-800 rounded-xl sm:rounded-2xl shadow-xl overflow-hidden">
            <PinReset
              childId={recoveryChildId}
              childUsername={username}
              onSuccess={handlePinResetSuccess}
              onCancel={handlePinResetCancel}
            />
          </div>
        </div>
      </div>
    )
  } 

  // Main login screen - FULLY RESPONSIVE
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
                        p-4 sm:p-6 md:p-8 lg:p-8
                        mx-auto">
          
          {/* Logo/Brand - Responsive Sizing */}
          <div className="text-center 
                          mb-6 sm:mb-8 md:mb-10">
            <div className="flex justify-center 
                            mb-3 sm:mb-4 md:mb-6">
              <div className="p-2 sm:p-3 md:p-4 
                              bg-indigo-100 dark:bg-indigo-900/30 
                              rounded-full">
                <User className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 
                                text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            
            {/* Responsive Typography */}
            <h1 className="text-xl sm:text-2xl md:text-3xl lg:text-2xl 
                           font-bold text-gray-900 dark:text-white 
                           mb-2 sm:mb-3 md:mb-4
                           leading-tight">
              Welcome Back! 🌟
            </h1>
            <p className="text-sm sm:text-base md:text-lg lg:text-base 
                          text-gray-600 dark:text-gray-300 
                          leading-relaxed
                          px-2 sm:px-0">
              Enter your username and PIN to start learning
            </p>
          </div>

          {/* Login Form - Responsive Spacing */}
          <form onSubmit={handleSubmit} 
                className="space-y-4 sm:space-y-5 md:space-y-6">
            
            {/* Username Field */}
            <div>
              <label htmlFor="username" 
                     className="block text-sm sm:text-base 
                                font-medium text-gray-700 dark:text-gray-300 
                                mb-2 sm:mb-3
                                px-1">
                Username
              </label>
              <div className="relative">
                {/* Icon - Responsive Size */}
                <User className="absolute left-3 sm:left-4 
                                top-1/2 transform -translate-y-1/2 
                                text-gray-400 
                                w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6
                                pointer-events-none" />
                
                {/* Input - Mobile Optimized */}
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
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
                            min-h-[44px] sm:min-h-[48px] md:min-h-[52px]
                            font-medium"
                  required
                  autoComplete="username"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label htmlFor="pin" 
                     className="block text-sm sm:text-base 
                                font-medium text-gray-700 dark:text-gray-300 
                                mb-2 sm:mb-3
                                px-1">
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 sm:left-4 md:left-5 top-1/2 transform -translate-y-1/2 
                                text-gray-400 dark:text-gray-500 
                                w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6" />
                <input
                  type={showPin ? "text" : "password"}
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full 
                            pl-10 sm:pl-12 md:pl-14 
                            pr-12 sm:pr-14
                            py-3 sm:py-4 md:py-4
                            border-2 border-gray-300 dark:border-gray-600 
                            rounded-lg sm:rounded-xl 
                            bg-white dark:bg-gray-700 
                            text-gray-900 dark:text-white
                            focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                            transition-all duration-200
                            text-xl sm:text-2xl md:text-3xl
                            text-center tracking-widest font-mono
                            min-h-[44px] sm:min-h-[48px] md:min-h-[52px]"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  autoComplete="off"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
                <button
                  type="button"
                  onClick={() => setShowPin(!showPin)}
                  className="absolute right-3 sm:right-4 top-1/2 transform -translate-y-1/2 
                            text-gray-400 dark:text-gray-500 hover:text-gray-600 dark:hover:text-gray-300"
                >
                  {showPin ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
              
              {/* PIN Visual Dots - Responsive */}
              <div className="flex justify-center gap-2 sm:gap-3 md:gap-4 
                              mt-3 sm:mt-4">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-3 h-3 sm:w-4 sm:h-4 md:w-5 md:h-5 
                                rounded-full transition-all duration-200 ${
                      index < pin.length 
                        ? 'bg-indigo-600 dark:bg-indigo-400 scale-110' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Error Message - Responsive */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 
                            border-2 border-red-200 dark:border-red-800 
                            rounded-lg sm:rounded-xl 
                            p-3 sm:p-4 
                            text-red-700 dark:text-red-400 
                            text-sm sm:text-base
                            text-center
                            font-medium">
                {error}
              </div>
            )}

            {/* Submit Button - Touch Optimized */}
            <Button
              type="submit"
              disabled={loading || !username.trim() || pin.length !== 4}
              className="w-full 
                        bg-sky-500 hover:bg-sky-600 
                        disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed
                        !text-white font-bold 
                        py-3 sm:py-4 md:py-5 
                        px-4 sm:px-6 
                        rounded-lg sm:rounded-xl 
                        transition-all duration-200 
                        flex items-center justify-center gap-2 sm:gap-3
                        text-base sm:text-lg md:text-xl
                        min-h-[44px] sm:min-h-[48px] md:min-h-[52px]
                        focus:ring-4 focus:ring-sky-300 focus:ring-offset-2
                        active:scale-95 sm:active:scale-98
                        shadow-lg hover:shadow-xl
                        border-2 border-sky-600">
              {loading ? (
                <div className="w-5 h-5 sm:w-6 sm:h-6 
                              border-2 border-white border-t-transparent 
                              rounded-full animate-spin" />
              ) : (
                <>
                  <span className="!text-white">Let's Go!</span>
                  <ArrowRight className="w-4 h-4 sm:w-5 sm:h-5 !text-white" />
                </>
              )}
            </Button>
          </form>

          {/* Help Options - Responsive Layout */}
          <div className="mt-6 sm:mt-8 md:mt-10 
                          space-y-4 sm:space-y-5">
            
            {/* Forgot PIN - Touch Friendly */}
            <div className="text-center">
              <button
                onClick={handleForgotPin}
                disabled={loading}
                className="inline-flex items-center gap-2 
                          text-indigo-600 dark:text-indigo-400 
                          hover:text-indigo-800 dark:hover:text-indigo-300 
                          transition-colors duration-200
                          font-medium 
                          text-sm sm:text-base
                          p-2 sm:p-3 -m-2 sm:-m-3
                          rounded-lg
                          min-h-[44px] 
                          disabled:opacity-50 disabled:cursor-not-allowed
                          focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800
                          active:scale-95">
                <HelpCircle className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Need help remembering your PIN?</span>
              </button>
            </div>

            {/* Divider - Responsive */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink-0 px-3 sm:px-4 
                              text-gray-500 dark:text-gray-400 
                              text-xs sm:text-sm
                              bg-white dark:bg-gray-800">
                or
              </span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Sign Up Section - Touch Optimized */}
            <div className="text-center 
                            space-y-3 sm:space-y-4">
              <p className="text-gray-600 dark:text-gray-400 
                           text-sm sm:text-base 
                           leading-relaxed
                           px-2 sm:px-0">
                Don't have an account yet?
              </p>
              
              {/* Sign Up Button - Mobile Friendly */}
              <Button
                onClick={handleSignUp}
                variant="outline"
                className="w-full sm:w-auto
                          border-2 border-indigo-300 dark:border-indigo-600 
                          text-indigo-600 dark:text-indigo-400 
                          hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                          hover:border-indigo-400 dark:hover:border-indigo-500
                          bg-white dark:bg-gray-800
                          flex items-center justify-center gap-2 sm:gap-3
                          py-3 sm:py-4 
                          px-4 sm:px-6
                          rounded-lg sm:rounded-xl
                          text-sm sm:text-base
                          font-medium
                          min-h-[44px] sm:min-h-[48px]
                          transition-all duration-200
                          focus:ring-2 focus:ring-indigo-200 dark:focus:ring-indigo-800
                          active:scale-95 sm:active:scale-98">
                <UserPlus className="w-4 h-4 sm:w-5 sm:h-5" />
                <span>Ask a grown-up to create an account</span>
              </Button>
            </div>
          </div>

          {/* Fun Footer - Responsive */}
          <div className="mt-6 sm:mt-8 md:mt-10 
                          text-center">
            <p className="text-gray-500 dark:text-gray-400 
                          text-xs sm:text-sm 
                          leading-relaxed">
              Ready to learn something awesome today? 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}