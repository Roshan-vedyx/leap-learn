// src/components/auth/ParentLogin.tsx - CREATE THIS NEW FILE
import React, { useState } from 'react'
import { UserPlus, Mail, Lock, ArrowRight } from 'lucide-react'
import { signInWithEmailAndPassword, createUserWithEmailAndPassword } from 'firebase/auth'
import { doc, setDoc, getDoc } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { Button } from '@/components/ui/Button'
import type { ParentProfile } from '../../types/auth'

export const ParentLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleSubmit = async (e: React.FormEvent) => {
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
      
      // Success - context will handle the rest
      console.log('Parent authentication successful')
      
    } catch (err: any) {
      setError(err.message || 'Authentication failed')
    } finally {
      setLoading(false)
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
                ? 'Set up your account to manage your child\'s learning journey'
                : 'Access your family dashboard and child management'
              }
            </p>
          </div>

          {/* Auth Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-body-text mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-input-border rounded-xl
                           bg-input-background text-input-text
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           transition-colors duration-200"
                  placeholder="parent@example.com"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-body-text mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border-2 border-input-border rounded-xl
                           bg-input-background text-input-text
                           focus:border-primary focus:ring-2 focus:ring-primary/20
                           transition-colors duration-200"
                  placeholder={isSignUp ? 'Create a strong password' : 'Enter your password'}
                  required
                  minLength={6}
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
                            text-red-700 dark:text-red-400 px-4 py-3 rounded-lg">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full py-4 text-lg font-semibold
                       bg-indigo-600 hover:bg-indigo-700 text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  {isSignUp ? 'Creating Account...' : 'Signing In...'}
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  {isSignUp ? 'Create Account' : 'Sign In'}
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            {/* Toggle Sign Up/Sign In */}
            <div className="text-center">
              <button
                type="button"
                onClick={() => setIsSignUp(!isSignUp)}
                className="text-indigo-600 hover:text-indigo-700 font-medium underline"
              >
                {isSignUp 
                  ? 'Already have an account? Sign in' 
                  : 'Need an account? Sign up'
                }
              </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}