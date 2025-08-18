// src/components/auth/ChildLogin.tsx - NEW SIMPLIFIED LOGIN SCREEN
import React, { useState } from 'react'
import { User, Lock, UserPlus, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useChildAuth } from '../../contexts/ChildAuthContext'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'

export const ChildLogin: React.FC = () => {
  const [username, setUsername] = useState('')
  const [pin, setPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
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
              Welcome Back!
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Enter your username and PIN to continue
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 
                          dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm font-medium">
                {error}
              </p>
            </div>
          )}

          {/* Login Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Username Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Username
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 
                               text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-colors duration-200"
                  placeholder="Enter your username"
                  autoFocus
                />
              </div>
            </div>

            {/* PIN Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                PIN
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 
                               text-gray-400 w-5 h-5" />
                <input
                  type="password"
                  value={pin}
                  onChange={(e) => handlePinChange(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400
                           focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500
                           transition-colors duration-200 text-center font-mono tracking-widest"
                  placeholder="0000"
                  maxLength={4}
                />
              </div>
            </div>

            {/* Login Button */}
            <Button
              type="submit"
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white py-3 px-4 
                       rounded-lg font-medium transition-colors duration-200 
                       disabled:opacity-50 disabled:cursor-not-allowed
                       flex items-center justify-center gap-2"
              disabled={loading || !username.trim() || pin.length !== 4}
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue
                  <ArrowRight className="w-5 h-5" />
                </>
              )}
            </Button>
          </form>

          {/* Divider */}
          <div className="my-8 flex items-center">
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
            <span className="mx-4 text-sm text-gray-500 dark:text-gray-400">or</span>
            <div className="flex-1 border-t border-gray-300 dark:border-gray-600"></div>
          </div>

          {/* Sign Up Link */}
          <div className="text-center">
            <p className="text-gray-600 dark:text-gray-300 mb-4">
              New user? Need to create an account?
            </p>
            <Button
              type="button"
              onClick={handleSignUp}
              className="w-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 
                       dark:hover:bg-gray-600 text-gray-900 dark:text-white py-3 px-4 
                       rounded-lg font-medium transition-colors duration-200
                       flex items-center justify-center gap-2"
            >
              <UserPlus className="w-5 h-5" />
              Sign Up Here
            </Button>
          </div>

          {/* Parent Dashboard Link */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700 text-center">
            <button
              onClick={() => window.location.href = '/parent'}
              className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 
                       dark:hover:text-gray-300 underline transition-colors duration-200"
            >
              Parent Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}