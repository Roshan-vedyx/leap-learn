// functions/src/scheduled/checkExpiredSubscriptions.ts
import * as functions from 'firebase-functions/v2'
import { db } from '../firebase-admin'
import Razorpay from 'razorpay'

/**
 * Runs daily at 2 AM IST to check for subscriptions that should be downgraded
 * after their cancellation period ends
 */
export const checkExpiredSubscriptions = functions.scheduler.onSchedule(
  {
    schedule: 'every day 02:00',
    timeZone: 'Asia/Kolkata',
    region: 'asia-south1',
    secrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET'],
  },
  async (event) => {
    console.log('Starting expired subscriptions check...')

    try {
      const razorpay = new Razorpay({
        key_id: process.env.RAZORPAY_KEY_ID!,
        key_secret: process.env.RAZORPAY_KEY_SECRET!,
      })

      const now = new Date()

      // Find all teachers with cancelAtPeriodEnd flag whose period has ended
      const teachersRef = db.collection('teachers')
      const snapshot = await teachersRef
        .where('subscription.cancelAtPeriodEnd', '==', true)
        .get()

      if (snapshot.empty) {
        console.log('No subscriptions to check')
        return
      }

      let processedCount = 0
      let errorCount = 0

      for (const doc of snapshot.docs) {
        const teacherData = doc.data()
        const subscription = teacherData.subscription

        // Check if period has ended
        const periodEnd = subscription.currentPeriodEnd.toDate()
        
        if (now >= periodEnd) {
          try {
            // Cancel in Razorpay
            await razorpay.subscriptions.cancel(subscription.subscriptionId, false)

            // Downgrade to free tier
            await doc.ref.update({
              'subscription.tier': 'free',
              'subscription.status': 'cancelled',
              'subscription.cancelledAt': new Date(),
              'subscription.cancelAtPeriodEnd': false,
            })

            console.log(`Downgraded teacher ${doc.id} to free tier`)
            processedCount++
          } catch (error: any) {
            console.error(`Error processing teacher ${doc.id}:`, error.message)
            errorCount++
          }
        }
      }

      console.log(
        `Expired subscriptions check complete: ${processedCount} processed, ${errorCount} errors`
      )
    } catch (error) {
      console.error('Fatal error in checkExpiredSubscriptions:', error)
      throw error
    }
  }
)