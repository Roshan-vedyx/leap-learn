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
      } else if (event === 'subscription.completed') {
          await handleSubscriptionCompleted(payload)
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
  
    // Get existing subscription data to preserve cancellation flags
    const existingData = teacherDoc.data()
    const existingSubscription = existingData?.subscription || {}
  
    // Prepare update - preserve cancelAtPeriodEnd if it exists
    const updateData: any = {
      'subscription.tier': tier,
      'subscription.status': 'active',
      'subscription.currentPeriodEnd': new Date(currentPeriodEnd),
    }
  
    // CRITICAL: If user already cancelled, preserve the flag
    if (existingSubscription.cancelAtPeriodEnd !== true) {
      // Only set to false if it wasn't already true
      updateData['subscription.cancelAtPeriodEnd'] = false
    }
  
    // Update teacher subscription atomically with event marking
    await db.runTransaction(async (transaction) => {
      transaction.update(teacherDoc.ref, updateData)
  
      transaction.set(eventRef, {
        event: 'subscription.activated',
        subscriptionId,
        processedAt: new Date(),
      })
    })
  
    console.log('Subscription activated:', subscriptionId, tier, 
      existingSubscription.cancelAtPeriodEnd ? '(cancel flag preserved)' : '')
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
  
    // Get existing subscription data to check for cancellation
    const existingData = teacherDoc.data()
    const existingSubscription = existingData?.subscription || {}
  
    // Prepare update
    const updateData: any = {
      'subscription.currentPeriodEnd': new Date(currentPeriodEnd),
    }
  
    // If renewal happened but user had cancelled, they renewed - clear the flag
    // (This means they paid again, so we treat it as a fresh start)
    if (existingSubscription.cancelAtPeriodEnd === true) {
      updateData['subscription.cancelAtPeriodEnd'] = false
      updateData['subscription.cancelRequestedAt'] = null
      console.log('User renewed after cancellation - clearing cancel flag')
    }
  
    // Update current period end atomically with event marking
    await db.runTransaction(async (transaction) => {
      transaction.update(teacherDoc.ref, updateData)
  
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
  
    const teachersRef = db.collection('teachers')
    const snapshot = await teachersRef
      .where('subscription.subscriptionId', '==', subscriptionId)
      .limit(1)
      .get()
  
    if (snapshot.empty) {
      console.error('Teacher not found for subscription:', subscriptionId)
      return
    }
  
    // Idempotency check
    const eventId = `subscription_cancelled_${subscriptionId}_${subscription.created_at}`
    const eventRef = db.collection('webhook_events').doc(eventId)
    const eventDoc = await eventRef.get()
  
    if (eventDoc.exists) {
      console.log('Event already processed:', eventId)
      return
    }
  
    // This webhook fires when Razorpay actually cancels (from scheduled function)
    // Just mark as processed - scheduled function already updated tier
    await eventRef.set({
      event: 'subscription.cancelled',
      subscriptionId,
      processedAt: new Date(),
    })
  
    console.log('Subscription cancelled webhook processed:', subscriptionId)
}

async function handleSubscriptionCompleted(payload: any) {
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
    const eventId = `subscription_completed_${subscriptionId}`
    const eventRef = db.collection('webhook_events').doc(eventId)
    const eventDoc = await eventRef.get()
  
    if (eventDoc.exists) {
      console.log('Event already processed:', eventId)
      return
    }
  
    // Downgrade to free tier atomically
    await db.runTransaction(async (transaction) => {
      transaction.update(teacherDoc.ref, {
        'subscription.tier': 'free',
        'subscription.status': 'completed',
      })
      
      transaction.set(eventRef, {
        event: 'subscription.completed',
        subscriptionId,
        processedAt: new Date(),
      })
    })
    
    console.log('Subscription completed, downgraded to free:', subscriptionId)
}