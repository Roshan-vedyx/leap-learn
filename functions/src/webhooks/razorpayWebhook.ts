import { onRequest } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import * as crypto from 'crypto';

export const razorpayWebhook = onRequest(
  { region: 'asia-south1',
    secrets: ['RAZORPAY_WEBHOOK_SECRET']
   },
  async (req, res) => {
    // Only accept POST
    if (req.method !== 'POST') {
      res.status(405).send('Method not allowed');
      return;
    }

    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET!;
    const signature = req.headers['x-razorpay-signature'] as string;

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(JSON.stringify(req.body))
      .digest('hex');

    if (signature !== expectedSignature) {
      console.error('Invalid webhook signature');
      res.status(400).send('Invalid signature');
      return;
    }

    const { event, payload } = req.body;
    const subscription = payload.subscription?.entity || payload.payment?.entity;

    if (!subscription) {
      console.log('No subscription/payment in payload');
      res.status(200).send('OK');
      return;
    }

    const db = admin.firestore();

    // Find teacher by subscriptionId
    const usersSnapshot = await db
      .collection('users')
      .where('subscription.subscriptionId', '==', subscription.id)
      .limit(1)
      .get();

    if (usersSnapshot.empty) {
      console.log(`No teacher found for subscription ${subscription.id}`);
      res.status(200).send('OK');
      return;
    }

    const teacherDoc = usersSnapshot.docs[0];
    const teacherRef = teacherDoc.ref;

    // Idempotency check
    const eventId = `${event}_${subscription.id}_${subscription.created_at}`;
    const eventRef = db.collection('webhook_events').doc(eventId);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
      console.log(`Event ${eventId} already processed`);
      res.status(200).send('OK - already processed');
      return;
    }

    // Mark event as processed
    await eventRef.set({
      event,
      subscriptionId: subscription.id,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Handle events
    try {
      if (event === 'subscription.activated') {
        const tier = subscription.plan_id.includes('annual') ? 'annual' : 'monthly';
        const currentPeriodEnd = new Date(subscription.current_end * 1000);

        await teacherRef.update({
          'subscription.tier': tier,
          'subscription.status': 'active',
          'subscription.currentPeriodEnd': admin.firestore.Timestamp.fromDate(currentPeriodEnd),
          'subscription.cancelAtPeriodEnd': false,
        });

        console.log(`Activated ${tier} subscription for ${teacherDoc.id}`);
      } else if (event === 'subscription.charged') {
        const currentPeriodEnd = new Date(subscription.current_end * 1000);

        await teacherRef.update({
          'subscription.currentPeriodEnd': admin.firestore.Timestamp.fromDate(currentPeriodEnd),
          'subscription.status': 'active',
        });

        console.log(`Renewed subscription for ${teacherDoc.id}`);
      } else if (event === 'subscription.cancelled') {
        await teacherRef.update({
          'subscription.status': 'cancelled',
          'subscription.cancelAtPeriodEnd': true,
        });

        console.log(`Cancelled subscription for ${teacherDoc.id}`);
      }
    } catch (error) {
      console.error('Error processing webhook:', error);
    }

    res.status(200).send('OK');
  }
);