// src/components/pricing/CheckoutButton.tsx
import React, { useState } from 'react'
import { Button } from '@/components/ui/Button'
import { useTeacherAuth } from '@/contexts/TeacherAuthContext'
import { openSubscriptionCheckout, openOneTimeCheckout } from '@/services/payment/razorpayService'

interface CheckoutButtonProps {
  type: 'subscription' | 'one-time'
  planId?: string
  tier?: 'monthly' | 'annual'
  amount?: number
  description?: string
  children: React.ReactNode
  disabled?: boolean
  className?: string
}

export const CheckoutButton: React.FC<CheckoutButtonProps> = ({
  type,
  planId,
  tier,
  amount,
  description,
  children,
  disabled = false,
  className = '',
}) => {
  const { user, profile } = useTeacherAuth()
  const [loading, setLoading] = useState(false)

  const handleClick = async () => {
    if (!user || !profile) {
      alert('Please sign in to continue')
      return
    }
  
    setLoading(true)
  
    try {
      if (type === 'subscription') {
        if (!planId || !tier) {
          throw new Error('Invalid subscription configuration')
        }
  
        await openSubscriptionCheckout({
          planId,
          teacherId: user.uid,
          email: profile.email,
          name: profile.displayName,
          tier,
        })
      } else if (type === 'one-time') {
        if (!amount || !description) {
          throw new Error('Invalid payment configuration')
        }
  
        await openOneTimeCheckout({
          amount,
          teacherId: user.uid,
          email: profile.email,
          name: profile.displayName,
          description,
        })
      }
    } catch (error: any) {
      console.error('Checkout error:', error)
      
      // Show user-friendly error messages
      let errorMessage = 'Payment failed. Please try again.'
      
      if (error.message?.includes('already have an active')) {
        errorMessage = 'You already have an active subscription.'
      } else if (error.message?.includes('Failed to load')) {
        errorMessage = 'Could not load payment gateway. Please check your internet connection.'
      } else if (error.code === 'permission-denied') {
        errorMessage = 'Permission denied. Please sign in again.'
      }
      
      alert(errorMessage)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Button
      onClick={handleClick}
      disabled={disabled || loading}
      className={className}
    >
      {loading ? 'Processing...' : children}
    </Button>
  )
}