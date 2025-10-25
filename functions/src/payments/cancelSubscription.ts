// functions/src/payments/cancelSubscription.ts
import * as functions from 'firebase-functions/v2'
import { db } from '../firebase-admin'

interface CancelSubscriptionInput {
  teacherId: string
  subscriptionId: string
}

export const cancelSubscription = functions.https.onCall(
  {
    region: 'asia-south1',
    secrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  async (request) => {
    const { teacherId, subscriptionId } = request.data as CancelSubscriptionInput

    // Validate input
    if (!teacherId || !subscriptionId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: teacherId or subscriptionId'
      )
    }

    // SECURITY: Verify authenticated user matches teacherId
    if (!request.auth || request.auth.uid !== teacherId) {
        throw new functions.https.HttpsError(
        'permission-denied',
        'You can only cancel your own subscription'
        )
    }

    try {
      // Verify teacher owns this subscription
      const teacherRef = db.collection('teachers').doc(teacherId)
      const teacherDoc = await teacherRef.get()

      if (!teacherDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Teacher not found')
      }

      const teacherData = teacherDoc.data()
      const storedSubId = teacherData?.subscription?.subscriptionId

      if (storedSubId !== subscriptionId) {
        throw new functions.https.HttpsError(
          'permission-denied',
          'Subscription does not belong to this teacher'
        )
      }

      // Mark for cancellation at period end (don't cancel in Razorpay yet)
      await teacherRef.update({
          'subscription.cancelAtPeriodEnd': true,
          'subscription.cancelRequestedAt': new Date(),
      })
        
      console.log('Subscription marked for cancellation:', teacherId, subscriptionId)

      return { success: true }
    } catch (error: any) {
      console.error('Error cancelling subscription:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Failed to cancel subscription: ${error.message}`
      )
    }
  }
)