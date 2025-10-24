// functions/src/payments/verifyEmergencyPayment.ts
import * as functions from 'firebase-functions/v2'
import { db } from '../firebase-admin'
import { FieldValue } from 'firebase-admin/firestore'
import * as crypto from 'crypto'

interface VerifyEmergencyPaymentInput {
  teacherId: string
  orderId: string
  paymentId: string
  signature: string
}

export const verifyEmergencyPayment = functions.https.onCall(
  {
    region: 'asia-south1',
    secrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  async (request) => {
    const { teacherId, orderId, paymentId, signature } = request.data as VerifyEmergencyPaymentInput

    // Validate all fields exist
    if (!teacherId || !orderId || !paymentId || !signature) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required fields: teacherId, orderId, paymentId, or signature'
      )
    }

    // SECURITY: Verify authenticated user matches teacherId
    if (!request.auth || request.auth.uid !== teacherId) {
        throw new functions.https.HttpsError(
        'permission-denied',
        'You can only verify payments for your own account'
        )
    }

    try {
      // Verify signature
      const text = orderId + '|' + paymentId
      const expectedSignature = crypto
        .createHmac('sha256', process.env.RAZORPAY_KEY_SECRET!)
        .update(text)
        .digest('hex')

      if (signature !== expectedSignature) {
        throw new functions.https.HttpsError(
          'invalid-argument',
          'Invalid payment signature'
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

      // Add credits and mark payment atomically
        await db.runTransaction(async (transaction) => {
            transaction.update(teacherRef, {
            worksheetCredits: FieldValue.increment(2),
            })
            
            transaction.set(eventRef, {
            paymentId,
            orderId,
            teacherId,
            amount: 14900,
            creditsAdded: 2,
            processedAt: new Date(),
            })
        })
        
        console.log('Emergency credits added:', teacherId, paymentId)

      return {
        success: true,
        creditsAdded: 2,
      }
    } catch (error: any) {
      console.error('Error verifying emergency payment:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Failed to verify emergency payment: ${error.message}`
      )
    }
  }
)