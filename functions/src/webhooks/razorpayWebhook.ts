// functions/src/webhooks/razorpayWebhook.ts
import * as functions from 'firebase-functions/v2'
import { db } from '../firebase-admin'
import * as crypto from 'crypto'

export const razorpayWebhook = functions.https.onRequest(
  {
    region: 'asia-south1',
    secrets: ['RAZORPAY_WEBHOOK_SECRET'],
  },
  async (request, response) => {
    // Only accept POST requests
    if (request.method !== 'POST') {
      response.status(405).send('Method Not Allowed')
      return
    }

    try {
      const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!
      const signature = request.headers['x-razorpay-signature'] as string

      if (!signature) {
        console.error('Missing signature')
        response.status(400).send('Missing signature')
        return
      }

      // Verify webhook signature
      const body = request.rawBody || JSON.stringify(request.body)
      const expectedSignature = crypto
        .createHmac('sha256', webhookSecret)
        .update(body)
        .digest('hex')

      if (signature !== expectedSignature) {
        console.error('Invalid signature')
        response.status(401).send('Invalid signature')
        return
      }

      const event = request.body.event
      const payload = request.body.payload

      console.log('Razorpay webhook event:', event)

      // Handle different subscription events
      if (event === 'subscription.activated') {
        await handleSubscriptionActivated(payload)
      } else if (event === 'subscription.charged') {
        await handleSubscriptionCharged(payload)
      } else if (event === 'subscription.cancelled') {
        await handleSubscriptionCancelled(payload)
      } else {
        console.log('Unhandled event type:', event)
      }

      // Always return 200 to Razorpay
      response.status(200).send('OK')
    } catch (error) {
        console.error('Webhook error:', error)
        
        // If it's a transient error (Firestore timeout, network), tell Razorpay to retry
        if (error instanceof Error && (
          error.message.includes('Firestore') ||
          error.message.includes('timeout') ||
          error.message.includes('UNAVAILABLE')
        )) {
          response.status(500).send('Temporary error, please retry')
          return
        }
        
        // For other errors (malformed payload, etc), return 200 to avoid infinite retries
        response.status(200).send('OK')
    }
  }
)

async function handleSubscriptionActivated(payload: any) {
  const subscription = payload.subscription.entity
  const subscriptionId = subscription.id
  const planId = subscription.plan_id
  const currentPeriodEnd = subscription.current_end * 1000 // Convert to ms

  // Determine tier from plan ID
  const tier = planId.includes('annual') ? 'annual' : 'monthly'

  // Find teacher by subscriptionId
  const teachersRef = db.collection('teachers')
  const snapshot = await teachersRef
    .where('subscription.subscriptionId', '==', subscriptionId)
    .limit(1)
    .get()

  if (snapshot.empty) {
    console.error('Teacher not found for subscription:', subscriptionId)
    return
  }

  const teacherDoc = snapshot.docs[0]

  // Idempotency check
  const eventId = `subscription_activated_${subscriptionId}_${subscription.created_at}`
  const eventRef = db.collection('webhook_events').doc(eventId)
  const eventDoc = await eventRef.get()

  if (eventDoc.exists) {
    console.log('Event already processed:', eventId)
    return
  }

  // Update teacher subscription
  // Update teacher subscription atomically with event marking
  await db.runTransaction(async (transaction) => {
    transaction.update(teacherDoc.ref, {
    'subscription.tier': tier,
    'subscription.status': 'active',
    'subscription.currentPeriodEnd': new Date(currentPeriodEnd),
    })
    
    transaction.set(eventRef, {
    event: 'subscription.activated',
    subscriptionId,
    processedAt: new Date(),
    })
  })
  
  console.log('Subscription activated:', subscriptionId, tier)
}

async function handleSubscriptionCharged(payload: any) {
  const subscription = payload.subscription.entity
  const subscriptionId = subscription.id
  const currentPeriodEnd = subscription.current_end * 1000

  // Find teacher
  const teachersRef = db.collection('teachers')
  const snapshot = await teachersRef
    .where('subscription.subscriptionId', '==', subscriptionId)
    .limit(1)
    .get()

  if (snapshot.empty) {
    console.error('Teacher not found for subscription:', subscriptionId)
    return
  }

  const teacherDoc = snapshot.docs[0]

  // Idempotency check
  const eventId = `subscription_charged_${subscriptionId}_${subscription.created_at}`
  const eventRef = db.collection('webhook_events').doc(eventId)
  const eventDoc = await eventRef.get()

  if (eventDoc.exists) {
    console.log('Event already processed:', eventId)
    return
  }

  // Update current period end atomically with event marking
    await db.runTransaction(async (transaction) => {
        transaction.update(teacherDoc.ref, {
        'subscription.currentPeriodEnd': new Date(currentPeriodEnd),
        })
        
        transaction.set(eventRef, {
        event: 'subscription.charged',
        subscriptionId,
        processedAt: new Date(),
        })
    })
    
    console.log('Subscription charged:', subscriptionId)
}

async function handleSubscriptionCancelled(payload: any) {
  const subscription = payload.subscription.entity
  const subscriptionId = subscription.id

  // Find teacher
  const teachersRef = db.collection('teachers')
  const snapshot = await teachersRef
    .where('subscription.subscriptionId', '==', subscriptionId)
    .limit(1)
    .get()

  if (snapshot.empty) {
    console.error('Teacher not found for subscription:', subscriptionId)
    return
  }

  const teacherDoc = snapshot.docs[0]

  // Idempotency check
  const eventId = `subscription_cancelled_${subscriptionId}_${subscription.created_at}`
  const eventRef = db.collection('webhook_events').doc(eventId)
  const eventDoc = await eventRef.get()

  if (eventDoc.exists) {
    console.log('Event already processed:', eventId)
    return
  }

  // Update status atomically with event marking
    await db.runTransaction(async (transaction) => {
        transaction.update(teacherDoc.ref, {
        'subscription.status': 'cancelled',
        })
        
        transaction.set(eventRef, {
        event: 'subscription.cancelled',
        subscriptionId,
        processedAt: new Date(),
        })
    })
    
    console.log('Subscription cancelled:', subscriptionId)
}