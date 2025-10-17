// src/pages/payment/PaymentSuccessPage.tsx
import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useTeacherAuth } from '@/contexts/TeacherAuthContext'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'

export const PaymentSuccessPage: React.FC = () => {
  const [, setLocation] = useLocation()
  const { profile } = useTeacherAuth()
  const [searchParams] = useState(() => new URLSearchParams(window.location.search))
  
  const paymentType = searchParams.get('type') // 'subscription' or 'boost'
  const subscriptionId = searchParams.get('sid')
  const paymentId = searchParams.get('payment_id')
  
  const [status, setStatus] = useState<'loading' | 'success' | 'timeout'>('loading')
  const [timeoutSeconds, setTimeoutSeconds] = useState(30)

  useEffect(() => {
    // Timeout countdown
    const countdownInterval = setInterval(() => {
      setTimeoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(countdownInterval)
          setStatus('timeout')
          return 0
        }
        return prev - 1
      })
    }, 1000)

    return () => clearInterval(countdownInterval)
  }, [])

  useEffect(() => {
    if (!profile) return

    // Check if payment/subscription is activated based on type
    if (paymentType === 'subscription') {
      // Check if subscription is active
      const isActive = 
        (profile.subscription?.tier === 'monthly' || profile.subscription?.tier === 'annual') &&
        profile.subscription?.status === 'active' &&
        profile.subscription?.subscriptionId === subscriptionId

      if (isActive) {
        setStatus('success')
      }
    } else if (paymentType === 'boost') {
      // For emergency boost, we just check if credits exist
      // (webhook should have already added them)
      const hasCredits = (profile.worksheetCredits || 0) > 0
      
      if (hasCredits) {
        setStatus('success')
      }
    }
  }, [profile, paymentType, subscriptionId])

  const handleContinue = () => {
    if (paymentType === 'subscription') {
      setLocation('/dashboard')
    } else {
      setLocation('/worksheet-generator')
    }
  }

  // Loading state
  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <Loader2 className="w-8 h-8 text-blue-600 animate-spin" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Processing Payment...
          </h1>
          
          <p className="text-gray-600 mb-6">
            {paymentType === 'subscription' 
              ? 'Activating your premium subscription'
              : 'Adding worksheet credits to your account'}
          </p>

          <div className="bg-blue-50 rounded-lg p-4 mb-4">
            <p className="text-sm text-gray-700">
              This usually takes just a few seconds. Don't close this page.
            </p>
          </div>

          <p className="text-xs text-gray-500">
            Timing out in {timeoutSeconds}s...
          </p>
        </div>
      </div>
    )
  }

  // Success state
  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="w-8 h-8 text-green-600" />
          </div>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Payment Successful!
          </h1>
          
          {paymentType === 'subscription' ? (
            <>
              <p className="text-gray-600 mb-6">
                Your premium subscription is now active. Enjoy unlimited worksheet generation!
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm font-medium text-gray-900 mb-1">
                  What's included:
                </p>
                <ul className="text-sm text-gray-700 space-y-1 text-left">
                  <li>✓ Unlimited worksheet generation</li>
                  <li>✓ All premium templates</li>
                  <li>✓ Priority support</li>
                  <li>✓ Advanced customization</li>
                </ul>
              </div>
            </>
          ) : (
            <>
              <p className="text-gray-600 mb-6">
                2 worksheet credits have been added to your account!
              </p>
              
              <div className="bg-green-50 rounded-lg p-4 mb-6">
                <p className="text-sm text-gray-700">
                  Current balance: <span className="font-bold">{profile?.worksheetCredits || 0} credits</span>
                </p>
              </div>
            </>
          )}
          
          <Button 
            onClick={handleContinue}
            className="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            Continue to {paymentType === 'subscription' ? 'Dashboard' : 'Worksheet Generator'}
          </Button>
        </div>
      </div>
    )
  }

  // Timeout state
  return (
    <div className="min-h-screen bg-gradient-to-br from-yellow-50 to-orange-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md w-full text-center">
        <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <AlertCircle className="w-8 h-8 text-yellow-600" />
        </div>
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          Payment Processing
        </h1>
        
        <p className="text-gray-600 mb-6">
          Your payment is being processed. This can take up to a minute.
        </p>

        <div className="bg-yellow-50 rounded-lg p-4 mb-6">
          <p className="text-sm text-gray-700 mb-3">
            If your {paymentType === 'subscription' ? 'subscription' : 'credits'} 
            {' '}don't appear shortly:
          </p>
          <ul className="text-sm text-gray-700 space-y-2 text-left">
            <li>• Refresh this page in 30 seconds</li>
            <li>• Check your email for confirmation</li>
            <li>• Contact support with payment ID: 
              <br />
              <code className="text-xs bg-gray-100 px-2 py-1 rounded mt-1 inline-block">
                {subscriptionId || paymentId}
              </code>
            </li>
          </ul>
        </div>
        
        <div className="space-y-2">
          <Button 
            onClick={() => window.location.reload()}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            Refresh Page
          </Button>
          
          <Button 
            onClick={handleContinue}
            variant="outline"
            className="w-full"
          >
            Continue Anyway
          </Button>
        </div>
      </div>
    </div>
  )
}