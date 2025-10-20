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
      console.error('User not authenticated')
      return
    }

    setLoading(true)

    try {
      if (type === 'subscription') {
        if (!planId || !tier) {
          console.error('Missing planId or tier for subscription')
          return
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
          console.error('Missing amount or description for one-time payment')
          return
        }

        await openOneTimeCheckout({
          amount,
          teacherId: user.uid,
          email: profile.email,
          name: profile.displayName,
          description,
        })
      }
    } catch (error) {
      console.error('Checkout error:', error)
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