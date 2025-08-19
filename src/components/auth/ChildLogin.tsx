// src/components/auth/ChildLogin.tsx - UPDATED with PIN Recovery
import React, { useState } from 'react'
import { User, Lock, UserPlus, ArrowRight, HelpCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useChildAuth } from '../../contexts/ChildAuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { PinRecovery } from './PinRecovery'

export const ChildLogin: React.FC = () => {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showRecovery, setShowRecovery] = useState(false)
  const [recoveryChildId, setRecoveryChildId] = useState('')
  const { authenticateChild } = useChildAuth()

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

      setRecoveryChildId(childDoc.id)
      setShowRecovery(true)
      
    } catch (err: any) {
      console.error('Recovery error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  const handleRecoverySuccess = () => {
    // Reset PIN was successful through recovery
    setShowRecovery(false)
    setRecoveryChildId('')
    setPin('')
    setError('')
    // Show success message
    setError('') // Clear any errors
    alert('Great! You can now create a new PIN. Please try logging in again.')
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
    // Redirect to parent registration
    window.location.href = '/parent-signup'
  }

  // Show recovery screen if activated
  if (showRecovery && recoveryChildId) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                      dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                      flex items-center justify-center p-4">
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl overflow-hidden">
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

  // Main login screen
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 
                    dark:from-gray-900 dark:via-indigo-900/20 dark:to-purple-900/20 
                    flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          
          {/* Logo/Brand */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <div className="p-3 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <User className="w-8 h-8 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Welcome Back! 🌟
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your username and PIN to start learning
            </p>
          </div>

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 
                               text-gray-400 w-5 h-5" />
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Your username"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors text-lg"
                  required
                />
              </div>
            </div>

            <div>
              <label htmlFor="pin" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 
                               text-gray-400 w-5 h-5" />
                <input
                  id="pin"
                  type="password"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  placeholder="••••"
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           focus:ring-2 focus:ring-indigo-500 focus:border-transparent
                           transition-colors text-2xl text-center tracking-widest"
                  maxLength={4}
                  inputMode="numeric"
                  pattern="[0-9]*"
                />
              </div>
            </div>

            {error && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 
                            rounded-lg p-3 text-red-700 dark:text-red-400 text-sm">
                {error}
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !username.trim() || pin.length !== 4}
              className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-400 
                       text-white font-medium py-3 px-4 rounded-lg transition-colors 
                       flex items-center justify-center gap-2 text-lg"
            >
              {loading ? (
                <div className="w-6 h-6 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  Let's Go!
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Help Options */}
          <div className="mt-6 space-y-4">
            {/* Forgot PIN */}
            <div className="text-center">
              <button
                onClick={handleForgotPin}
                disabled={loading}
                className="inline-flex items-center gap-2 text-indigo-600 dark:text-indigo-400 
                         hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors
                         font-medium text-sm"
              >
                <HelpCircle className="w-4 h-4" />
                Need help remembering your PIN?
              </button>
            </div>

            {/* Divider */}
            <div className="relative flex items-center">
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
              <span className="flex-shrink-0 px-4 text-gray-500 dark:text-gray-400 text-sm">
                or
              </span>
              <div className="flex-grow border-t border-gray-300 dark:border-gray-600"></div>
            </div>

            {/* Sign Up */}
            <div className="text-center">
              <p className="text-gray-600 dark:text-gray-400 text-sm mb-3">
                Don't have an account yet?
              </p>
              <Button
                onClick={handleSignUp}
                variant="outline"
                className="w-full border-indigo-300 dark:border-indigo-600 text-indigo-600 
                         dark:text-indigo-400 hover:bg-indigo-50 dark:hover:bg-indigo-900/20
                         flex items-center justify-center gap-2"
              >
                <UserPlus className="w-4 h-4" />
                Ask a grown-up to create an account
              </Button>
            </div>
          </div>

          {/* Fun Footer */}
          <div className="mt-8 text-center">
            <p className="text-gray-500 dark:text-gray-400 text-xs">
              Ready to learn something awesome today? 🚀
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}