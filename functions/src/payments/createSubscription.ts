// functions/src/payments/createSubscription.ts
import * as functions from 'firebase-functions/v2'
import { db } from '../firebase-admin'
import Razorpay from 'razorpay'

interface CreateSubscriptionInput {
  teacherId: string
  planId: string
  tier: 'monthly' | 'annual'
}

export const createSubscription = functions.https.onCall(
  {
    region: 'asia-south1',
    secrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  async (request) => {
    const { teacherId, planId, tier } = request.data as CreateSubscriptionInput

    // Validate input
    if (!teacherId || !planId || !tier) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: teacherId, planId, or tier'
      )
    }

    if (tier !== 'monthly' && tier !== 'annual') {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Invalid tier. Must be "monthly" or "annual"'
      )
    }

    // SECURITY: Verify authenticated user matches teacherId
    if (!request.auth || request.auth.uid !== teacherId) {
        throw new functions.https.HttpsError(
        'permission-denied',
        'You can only create subscriptions for your own account'
        )
    }
    
    try {
      // Check if teacher already has premium subscription
      const teacherDoc = await db.collection('teachers').doc(teacherId).get()
      if (!teacherDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Teacher not found')
      }

      const teacherData = teacherDoc.data()
      const currentTier = teacherData?.subscription?.tier || 'free'
      
      if (currentTier === 'monthly' || currentTier === 'annual') {
        throw new functions.https.HttpsError(
          'already-exists',
          'You already have an active premium subscription'
        )
      }

      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      })

      // Create or reuse Razorpay customer
      const email = teacherData?.email || `teacher-${teacherId}@vedyx.ai`
      const name = teacherData?.displayName || 'Teacher'

      let customerId = teacherData?.subscription?.customerId

      if (!customerId) {
        const customer = await razorpay.customers.create({
          name,
          email,
          fail_existing: 0, // Reuse existing customer if email matches
        })
        customerId = customer.id
      }

      // Create subscription
      const totalCount = tier === 'annual' ? 12 : 120
      
      const subscriptionData: any = {
        plan_id: planId,
        customer_id: customerId,
        total_count: totalCount,
        customer_notify: 1,
      }
      
      const subscription: any = await razorpay.subscriptions.create(subscriptionData)

      // Store subscription ID and customer ID (don't update tier/status yet - webhook will do that)
      await db.collection('teachers').doc(teacherId).update({
        'subscription.subscriptionId': subscription.id,
        'subscription.customerId': customerId,
      })

      return { subscriptionId: subscription.id }
    } catch (error: any) {
      console.error('Error creating subscription:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Failed to create subscription: ${error.message}`
      )
    }
  }
)