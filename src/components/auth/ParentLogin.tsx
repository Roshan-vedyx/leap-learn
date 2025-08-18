// src/components/auth/ParentLogin.tsx - Enhanced with Google Sign-In
import React, { useState } from 'react'
import { UserPlus, Mail, Lock, ArrowRight } from 'lucide-react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  getAdditionalUserInfo
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

  // Initialize Google Auth Provider
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
        // Create new account
        userCredential = await createUserWithEmailAndPassword(auth, email, password)
        
        // Create parent profile
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
        // Sign in existing user
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

      // Check if this is a new user
      if (additionalUserInfo?.isNewUser) {
        // Create parent profile for new Google user
        const parentProfile: ParentProfile = {
          parentId: user.uid,
          email: user.email!,
          displayName: user.displayName || user.email?.split('@')[0] || 'Parent',
          photoURL: user.photoURL || null,
          authProvider: 'google',
          createdAt: new Date(),
          subscription: {
            tier: 'free',
            status: 'active'
          },
          children: []
        }
        
        await setDoc(doc(db, 'parents', user.uid), parentProfile)
        console.log('New Google user profile created')
      } else {
        // Existing user - optionally update profile with latest Google info
        const parentDocRef = doc(db, 'parents', user.uid)
        const parentDoc = await getDoc(parentDocRef)
        
        if (parentDoc.exists()) {
          // Update with latest Google profile info
          await setDoc(parentDocRef, {
            displayName: user.displayName || parentDoc.data().displayName,
            photoURL: user.photoURL || parentDoc.data().photoURL,
            lastLoginAt: new Date()
          }, { merge: true })
        }
        console.log('Existing Google user signed in')
      }

    } catch (err: any) {
      console.error('Google sign-in error:', err)
      
      // Handle specific Google sign-in errors
      if (err.code === 'auth/popup-closed-by-user') {
        setError('Sign-in was cancelled. Please try again.')
      } else if (err.code === 'auth/popup-blocked') {
        setError('Pop-up was blocked. Please allow pop-ups and try again.')
      } else if (err.code === 'auth/account-exists-with-different-credential') {
        setError('An account already exists with the same email address but different sign-in credentials.')
      } else {
        setError(err.message || 'Google sign-in failed')
      }
    } finally {
      setGoogleLoading(false)
    }
  }

  return (
    <div className="page-container">
      <div className="container max-w-md mx-auto">
        <div className="content-area">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <UserPlus className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-header-primary mb-3">
              {isSignUp ? 'Create Parent Account' : 'Parent Sign In'}
            </h1>
            <p className="text-lg text-body-text">
              {isSignUp 
                ? 'Set up your account to manage your children\'s learning'
                : 'Welcome back! Sign in to your parent dashboard'
              }
            </p>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <p className="text-red-700 dark:text-red-300 text-sm">{error}</p>
            </div>
          )}

          {/* Google Sign-In Button */}
          <div className="mb-6">
            <Button
              onClick={handleGoogleSignIn}
              disabled={googleLoading || loading}
              className="w-full bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 
                         border border-gray-300 dark:border-gray-600 hover:bg-gray-50 
                         dark:hover:bg-gray-700 shadow-sm"
              variant="outline"
            >
              {googleLoading ? (
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  <span>Signing in with Google...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-3">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span>{isSignUp ? 'Sign up with Google' : 'Continue with Google'}</span>
                </div>
              )}
            </Button>
          </div>

          {/* Divider */}
          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300 dark:border-gray-600"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white dark:bg-gray-900 text-gray-500 dark:text-gray-400">
                Or continue with email
              </span>
            </div>
          </div>

          {/* Email/Password Form */}
          <form onSubmit={handleEmailSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder="parent@example.com"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="block w-full pl-10 pr-3 py-3 border border-gray-300 dark:border-gray-600 
                           rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 
                           bg-white dark:bg-gray-800 text-gray-900 dark:text-white
                           placeholder-gray-500 dark:placeholder-gray-400"
                  placeholder={isSignUp ? "Create a secure password" : "Enter your password"}
                  minLength={6}
                />
              </div>
              {isSignUp && (
                <p className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                  Password must be at least 6 characters long
                </p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading || googleLoading}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              {loading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <span>{isSignUp ? 'Creating Account...' : 'Signing In...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>{isSignUp ? 'Create Account' : 'Sign In'}</span>
                  <ArrowRight className="w-5 h-5" />
                </div>
              )}
            </Button>
          </form>

          {/* Toggle Sign Up/Sign In */}
          <div className="mt-8 text-center">
            <p className="text-body-text">
              {isSignUp ? 'Already have an account?' : "Don't have an account?"}
              <button
                onClick={() => {
                  setIsSignUp(!isSignUp)
                  setError('')
                }}
                disabled={loading || googleLoading}
                className="ml-2 text-indigo-600 dark:text-indigo-400 font-semibold hover:text-indigo-700 
                         dark:hover:text-indigo-300 transition-colors"
              >
                {isSignUp ? 'Sign In' : 'Sign Up'}
              </button>
            </p>
          </div>

          {/* Footer Note */}
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              By creating an account, you agree to our Terms of Service and Privacy Policy.
              Your children's data is always kept private and secure.
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}