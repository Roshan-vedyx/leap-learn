// src/pages/payment/PaymentSuccessPage.tsx
import React, { useEffect, useState } from 'react'
import { useLocation } from 'wouter'
import { useTeacherAuth } from '@/contexts/TeacherAuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { CheckCircle, Loader2, AlertCircle } from 'lucide-react'

export const PaymentSuccessPage: React.FC = () => {
  const [, setLocation] = useLocation()
  const { profile } = useTeacherAuth()
  const [status, setStatus] = useState<'loading' | 'success' | 'timeout'>('loading')
  const [pollCount, setPollCount] = useState(0)

  // Get query params
  const params = new URLSearchParams(window.location.search)
  const subscriptionId = params.get('sid')
  const type = params.get('type')

  useEffect(() => {
    if (!subscriptionId || !type) {
      setLocation('/dashboard')
      return
    }

    // Poll profile subscription every 2 seconds for up to 30 seconds (15 attempts)
    const pollInterval = setInterval(() => {
      setPollCount((prev) => {
        const newCount = prev + 1

        // Check if subscription is active
        if (type === 'subscription' && profile?.subscription?.status === 'active') {
          setStatus('success')
          clearInterval(pollInterval)
          
          // Redirect to dashboard after 2 seconds
          setTimeout(() => {
            setLocation('/dashboard')
          }, 2000)
        }

        // Timeout after 15 attempts (30 seconds)
        if (newCount >= 15) {
          setStatus('timeout')
          clearInterval(pollInterval)
        }

        return newCount
      })
    }, 2000)

    return () => clearInterval(pollInterval)
  }, [subscriptionId, type, profile, setLocation])

  if (status === 'loading') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <Loader2 className="w-16 h-16 text-indigo-600 animate-spin mx-auto mb-4" />
            <h2 className="text-2xl font-bold mb-2">Processing Payment...</h2>
            <p className="text-gray-600 mb-4">
              Please wait while we confirm your subscription.
            </p>
            <p className="text-sm text-gray-500">
              This usually takes just a few seconds.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'success') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-10 h-10 text-green-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Payment Successful!</h2>
            <p className="text-gray-600 mb-6">
              Your subscription is now active. Redirecting to dashboard...
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (status === 'timeout') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="p-8 text-center">
            <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-10 h-10 text-yellow-600" />
            </div>
            <h2 className="text-2xl font-bold mb-2">Processing Payment</h2>
            <p className="text-gray-600 mb-4">
              Your payment is being processed. This may take 1-2 minutes.
            </p>
            <p className="text-sm text-gray-500 mb-6">
              Check your email for confirmation, or refresh your dashboard in a moment.
            </p>
            <Button
              onClick={() => setLocation('/dashboard')}
              className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return null
}