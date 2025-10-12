// src/components/auth/TeacherLogin.tsx
import React, { useState } from 'react'
import { GraduationCap, Mail, Lock, ArrowRight, AlertCircle, CheckCircle } from 'lucide-react'
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signInWithPopup,
  GoogleAuthProvider,
  sendPasswordResetEmail,
  sendEmailVerification
} from 'firebase/auth'
import { doc, setDoc } from 'firebase/firestore'
import { auth, db } from '../../lib/firebase-config'
import { Button } from '../ui/Button'
import type { TeacherProfile } from '../../contexts/TeacherAuthContext'

export const TeacherLogin: React.FC = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)
  const [googleLoading, setGoogleLoading] = useState(false)
  const [error, setError] = useState('')
  const [needsVerification, setNeedsVerification] = useState(false)
  const [verificationEmail, setVerificationEmail] = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)
  
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
        
        // Send verification email
        await sendEmailVerification(userCredential.user)
        // Create teacher profile
        const teacherProfile: TeacherProfile = {
          teacherId: userCredential.user.uid,
          email: userCredential.user.email!,
          displayName: userCredential.user.displayName || email.split('@')[0],
          photoURL: userCredential.user.photoURL || null,
          authProvider: 'email',
          userType: 'teacher',
          createdAt: new Date(),
          subscription: {
            tier: 'free',
            status: 'active'
          }
        }
        
        await setDoc(doc(db, 'teachers', userCredential.user.uid), teacherProfile)
        // Show verification screen instead of redirecting
        setNeedsVerification(true)
        setVerificationEmail(email)
        return
      } else {
        userCredential = await signInWithEmailAndPassword(auth, email, password)
        // Check if email is verified
        if (!userCredential.user.emailVerified) {
          setNeedsVerification(true)
          setVerificationEmail(email)
          return
        }
      }
      
      console.log('Teacher authentication successful')
      const intendedRoute = sessionStorage.getItem('intendedRoute') || '/dashboard'
      sessionStorage.removeItem('intendedRoute')
      window.location.href = intendedRoute
      
    } catch (err: any) {
      console.error('Authentication error:', err)
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
      
      // Check if teacher profile exists, create if not
      const teacherDoc = doc(db, 'teachers', result.user.uid)
      
      const teacherProfile: TeacherProfile = {
        teacherId: result.user.uid,
        email: result.user.email!,
        displayName: result.user.displayName || result.user.email!.split('@')[0],
        photoURL: result.user.photoURL,
        authProvider: 'google',
        userType: 'teacher',
        createdAt: new Date(),
        subscription: {
          tier: 'free',
          status: 'active'
        }
      }
      
      await setDoc(teacherDoc, teacherProfile, { merge: true })
      
      console.log('Google teacher authentication successful')
      const intendedRoute = sessionStorage.getItem('intendedRoute') || '/dashboard'
      sessionStorage.removeItem('intendedRoute')
      window.location.href = intendedRoute
      
    } catch (err: any) {
      console.error('Google auth error:', err)
      setError(err.message || 'Google authentication failed')
    } finally {
      setGoogleLoading(false)
    }
  }

  const handleResendVerification = async () => {
    if (resendCooldown > 0 || !auth.currentUser) return
    
    try {
      await sendEmailVerification(auth.currentUser)
      setResendCooldown(60)
      
      const interval = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            clearInterval(interval)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } catch (err: any) {
      setError(err.message || 'Failed to resend email')
    }
  }
  
  const handleCheckVerification = async () => {
    if (!auth.currentUser) return
    
    setLoading(true)
    try {
      await auth.currentUser.reload()
      
      if (auth.currentUser.emailVerified) {
        const intendedRoute = sessionStorage.getItem('intendedRoute') || '/dashboard'
        sessionStorage.removeItem('intendedRoute')
        window.location.href = intendedRoute
      } else {
        setError('Email not verified yet. Please check your inbox.')
      }
    } catch (err: any) {
      setError('Failed to check verification')
    } finally {
      setLoading(false)
    }
  }
  
  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault()
    setResetLoading(true)
    
    try {
      await sendPasswordResetEmail(auth, forgotEmail)
      setResetEmailSent(true)
    } catch (err: any) {
      setError(err.message || 'Failed to send reset email')
    } finally {
      setResetLoading(false)
    }
  }

  // Email verification screen
  if (needsVerification) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <Mail className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Your Email</h2>
            <p className="text-gray-600">
              We sent a verification link to:<br />
              <span className="font-semibold">{verificationEmail}</span>
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm mb-4">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="space-y-3">
            <Button
              onClick={handleCheckVerification}
              disabled={loading}
              className="w-full"
            >
              {loading ? 'Checking...' : "I've Verified My Email"}
            </Button>

            <Button
              onClick={handleResendVerification}
              disabled={resendCooldown > 0}
              className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend Email'}
            </Button>

            <Button
              onClick={() => {
                setNeedsVerification(false)
                auth.signOut()
              }}
              className="w-full bg-white border border-gray-300 text-gray-700"
            >
              Back to Login
            </Button>
          </div>
        </div>
      </div>
    )
  }

  if (showForgotPassword) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
          <div className="text-center mb-6">
            <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Reset Password</h2>
            <p className="text-gray-600">Enter your email to receive a password reset link</p>
          </div>

          {resetEmailSent ? (
            <div className="text-center">
              <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
              <p className="text-gray-700 mb-4">Password reset email sent! Check your inbox.</p>
              <Button 
                onClick={() => setShowForgotPassword(false)}
                className="w-full"
              >
                Back to Login
              </Button>
            </div>
          ) : (
            <form onSubmit={handlePasswordReset} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    placeholder="teacher@school.edu"
                    required
                  />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button 
                type="submit" 
                disabled={resetLoading}
                className="w-full"
              >
                {resetLoading ? 'Sending...' : 'Send Reset Email'}
              </Button>
              
              <Button 
                type="button"
                onClick={() => setShowForgotPassword(false)}
                className="w-full bg-gray-100 text-gray-700 hover:bg-gray-200"
              >
                Back to Login
              </Button>
            </form>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white rounded-xl shadow-lg p-6 sm:p-8">
        {/* Header */}
        <div className="text-center mb-6">
          <GraduationCap className="w-12 h-12 text-indigo-600 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isSignUp ? 'Create Teacher Account' : 'Teacher Sign In'}
          </h1>
          <p className="text-gray-600">
            {isSignUp 
              ? 'Join thousands of educators using Vedyx Leap' 
              : 'Welcome back! Sign in to your teacher dashboard'
            }
          </p>
        </div>

        {/* Google Sign In */}
        <Button
          onClick={handleGoogleSignIn}
          disabled={googleLoading || loading}
          className="w-full mb-4 bg-white border border-gray-300 text-gray-700 hover:bg-gray-50"
        >
          {googleLoading ? (
            <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
          ) : (
            <>
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Continue with Google
            </>
          )}
        </Button>

        <div className="relative mb-4">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">or</span>
          </div>
        </div>

        {/* Email Form */}
        <form onSubmit={handleEmailSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="teacher@school.edu"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="Enter your password"
                required
                minLength={isSignUp ? 6 : 1}
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <Button 
            type="submit" 
            disabled={loading || googleLoading}
            className="w-full"
          >
            {loading ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <>
                {isSignUp ? 'Create Account' : 'Sign In'}
                <ArrowRight className="w-4 h-4 ml-2" />
              </>
            )}
          </Button>
        </form>

        {/* Toggle Sign Up/Sign In */}
        <div className="mt-6 text-center">
          <button
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-indigo-600 hover:text-indigo-500 font-medium"
          >
            {isSignUp 
              ? 'Already have an account? Sign in' 
              : 'New to Vedyx Leap? Create account'
            }
          </button>
        </div>

        {/* Forgot Password */}
        {!isSignUp && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowForgotPassword(true)}
              className="text-sm text-gray-600 hover:text-gray-500"
            >
              Forgot your password?
            </button>
          </div>
        )}
      </div>
    </div>
  )
}