// functions/src/payments/createEmergencyOrder.ts
import * as functions from 'firebase-functions/v2'
import { db } from '../firebase-admin'
import Razorpay from 'razorpay'

interface CreateEmergencyOrderInput {
  teacherId: string
}

export const createEmergencyOrder = functions.https.onCall(
  {
    region: 'asia-south1',
    secrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  async (request) => {
    const { teacherId } = request.data as CreateEmergencyOrderInput

    // Validate input
    if (!teacherId) {
      throw new functions.https.HttpsError(
        'invalid-argument',
        'Missing required field: teacherId'
      )
    }

    try {
      // Verify teacher exists
      const teacherDoc = await db.collection('teachers').doc(teacherId).get()
      if (!teacherDoc.exists) {
        throw new functions.https.HttpsError('not-found', 'Teacher not found')
      }

      // Initialize Razorpay
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      })

      // Create Razorpay order for ₹149 (14900 paise)
      const order = await razorpay.orders.create({
        amount: 14900,
        currency: 'INR',
        notes: {
          teacherId,
          type: 'emergency_boost',
        },
      })

      console.log('Emergency order created:', teacherId, order.id)

      return { orderId: order.id, amount: order.amount }
    } catch (error: any) {
      console.error('Error creating emergency order:', error)
      throw new functions.https.HttpsError(
        'internal',
        `Failed to create emergency order: ${error.message}`
      )
    }
  }
)