// src/services/payment/razorpayService.ts
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase-config'

declare global {
  interface Window {
    Razorpay: any
  }
}

interface RazorpayOptions {
  key: string
  subscription_id?: string
  amount?: number
  currency?: string
  name: string
  description?: string
  prefill: {
    email: string
    name: string
  }
  notes?: Record<string, any>
  handler: (response: any) => void
  modal?: {
    ondismiss?: () => void
  }
}

// Load Razorpay SDK
export const loadRazorpaySDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve()
      return
    }

    const script = document.createElement('script')
    script.src = 'https://checkout.razorpay.com/v1/checkout.js'
    script.async = true

    script.onload = () => resolve()
    script.onerror = () => reject(new Error('Failed to load Razorpay SDK'))

    document.body.appendChild(script)

    // Timeout after 10 seconds
    setTimeout(() => {
      if (!window.Razorpay) {
        reject(new Error('Razorpay SDK load timeout'))
      }
    }, 10000)
  })
}

// Open subscription checkout
export const openSubscriptionCheckout = async ({
  planId,
  teacherId,
  email,
  name,
  tier,
}: {
  planId: string
  teacherId: string
  email: string
  name: string
  tier: 'monthly' | 'annual'
}): Promise<void> => {
  try {
    // Load Razorpay SDK
    await loadRazorpaySDK()

    // Call Firebase function to create subscription
    const createSubscription = httpsCallable(functions, 'createSubscription')
    const result = await createSubscription({ teacherId, planId, tier })
    const { subscriptionId } = result.data as { subscriptionId: string }

    // Open Razorpay checkout
    const options: RazorpayOptions = {
      key: import.meta.env.VITE_RAZORPAY_KEY_ID,
      subscription_id: subscriptionId,
      name: 'Vedyx Leap',
      description: `${tier === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
      prefill: {
        email,
        name,
      },
      handler: (response: any) => {
        console.log('Payment successful:', response)
        // Redirect to success page
        window.location.href = `/payment-success?sid=${subscriptionId}&type=subscription`
      },
      modal: {
        ondismiss: () => {
          console.log('Checkout dismissed')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (error) {
    console.error('Subscription checkout error:', error)
    throw error
  }
}

// Open one-time payment checkout (Emergency Boost)
export const openOneTimeCheckout = async ({
  amount,
  teacherId,
  email,
  name,
  description,
}: {
  amount: number
  teacherId: string
  email: string
  name: string
  description: string
}): Promise<void> => {
    try {
        // Load Razorpay SDK
        await loadRazorpaySDK()
      
        // Check for pending emergency order first
        const { db } = await import('@/lib/firebase-config')
        const { collection, query, where, getDocs, orderBy, limit } = await import('firebase/firestore')
        
        const ordersRef = collection(db, 'emergency_orders')
        const recentOrderQuery = query(
          ordersRef,
          where('teacherId', '==', teacherId),
          where('status', 'in', ['created', 'pending']),
          orderBy('createdAt', 'desc'),
          limit(1)
        )
        
        const recentOrders = await getDocs(recentOrderQuery)
        
        if (!recentOrders.empty) {
          const recentOrder = recentOrders.docs[0].data()
          const orderAge = Date.now() - recentOrder.createdAt.toMillis()
          
          // If order created in last 5 minutes, block new purchase
          if (orderAge < 5 * 60 * 1000) {
            throw new Error('You have a payment in progress. Please complete it or wait 5 minutes.')
          }
        }
      
        // Call Firebase function to create order
        const createOrder = httpsCallable(functions, 'createEmergencyOrder')
        const orderResult = await createOrder({ teacherId })
        const { orderId } = orderResult.data as { orderId: string; amount: number }

    // Open Razorpay checkout
    const options: RazorpayOptions = {
    key: import.meta.env.VITE_RAZORPAY_KEY_ID,
    order_id: orderId,
    currency: 'INR',
      name: 'Vedyx Leap',
      description,
      prefill: {
        email,
        name,
      },
      notes: {
        teacherId,
        type: 'emergency_boost',
      },
      handler: async (response: any) => {
        console.log('Payment successful:', response)
      
        try {
          // Call Firebase function to verify and add credits
          const verifyEmergencyPayment = httpsCallable(functions, 'verifyEmergencyPayment')
          const result = await verifyEmergencyPayment({
            teacherId,
            orderId: response.razorpay_order_id,
            paymentId: response.razorpay_payment_id,
            signature: response.razorpay_signature,
          })
      
          // Wait for verification before redirect
          if (result.data) {
            console.log('Credits added successfully:', result.data)
            // Small delay to ensure Firestore propagation
            await new Promise(resolve => setTimeout(resolve, 500))
            window.location.href = '/dashboard?payment=success'
          }
        } catch (error) {
          console.error('Payment verification failed:', error)
          alert('Payment successful but verification failed. Please contact support or refresh your dashboard.')
        }
      },
      modal: {
        ondismiss: () => {
          console.log('Checkout dismissed')
        },
      },
    }

    const rzp = new window.Razorpay(options)
    rzp.open()
  } catch (error) {
    console.error('One-time checkout error:', error)
    throw error
  }
}