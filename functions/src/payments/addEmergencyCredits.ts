// functions/src/payments/addEmergencyCredits.ts
import * as functions from 'firebase-functions/v2'
import { db } from '../firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import Razorpay from 'razorpay'

interface AddEmergencyCreditsInput {
  teacherId: string
  paymentId: string
}

export const addEmergencyCredits = functions.https.onCall(
  {
    region: 'asia-south1',
    secrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  async (request) => {
    const { teacherId, paymentId } = request.data as AddEmergencyCreditsInput

    // Validate input
    if (!teacherId || !paymentId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: teacherId or paymentId'
      )
    }

    try {
      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      })

      // Fetch and verify payment
      const payment = await razorpay.payments.fetch(paymentId)

      if (payment.status !== 'captured') {
        throw new functions.https.HttpsError(
          'failed-precondition',
          'Payment not captured'
        )
      }

      if (payment.amount !== 14900) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid payment amount. Expected ₹149'
        )
      }

      // Idempotency check - ensure payment is not processed twice
      const eventId = `payment_${paymentId}`
      const eventRef = db.collection('payment_events').doc(eventId)
      const eventDoc = await eventRef.get()

      if (eventDoc.exists) {
        console.log('Payment already processed:', paymentId)
        return {
          success: true,
          creditsAdded: 2,
          message: 'Credits already added for this payment',
        }
      }

      // Verify teacher exists
      const teacherRef = db.collection('teachers').doc(teacherId)
      const teacherDoc = await teacherRef.get()

      if (!teacherDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Teacher not found')
      }

      // Add 2 credits to worksheetCredits
      await teacherRef.update({
        worksheetCredits: FieldValue.increment(2),
      })

      // Mark payment as processed
      await eventRef.set({
        paymentId,
        teacherId,
        amount: payment.amount,
        creditsAdded: 2,
        processedAt: new Date(),
      })

      console.log('Emergency credits added:', teacherId, paymentId)

      return {
        success: true,
        creditsAdded: 2,
      }
    } catch (error: any) {
      console.error('Error adding emergency credits:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Failed to add emergency credits: ${error.message}`
      )
    }
  }
)