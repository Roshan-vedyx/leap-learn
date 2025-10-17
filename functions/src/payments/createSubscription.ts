import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';

interface CreateSubscriptionRequest {
  teacherId: string;
  planId: string;
  tier: 'monthly' | 'annual';
}

export const createSubscription = onCall(
  { 
    region: 'asia-south1',
    secrets: ['RAZORPAY_KEY_ID', 'RAZORPAY_KEY_SECRET']
  },
  async (request) => {
    // Initialize Razorpay inside function where secrets are available
    const razorpay = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID!,
      key_secret: process.env.RAZORPAY_KEY_SECRET!,
    });

    // Auth check
    if (!request.auth) {
      throw new HttpsError('unauthenticated', 'Must be logged in');
    }

    const { teacherId, planId, tier } = request.data as CreateSubscriptionRequest;

    // Verify caller is the teacher
    if (request.auth.uid !== teacherId) {
      throw new HttpsError('permission-denied', 'Can only subscribe for yourself');
    }

    const db = admin.firestore();
    const teacherRef = db.collection('users').doc(teacherId);
    const teacherDoc = await teacherRef.get();

    if (!teacherDoc.exists) {
      throw new HttpsError('not-found', 'Teacher profile not found');
    }

    const profile = teacherDoc.data();

    // Block if already premium
    if (profile?.subscription?.tier === 'monthly' || profile?.subscription?.tier === 'annual') {
      throw new HttpsError('already-exists', 'Already has active subscription');
    }

    const email = request.auth.token.email || '';
    const name = profile?.name || 'Teacher';

    let customerId = profile?.subscription?.customerId;

    // Create or reuse Razorpay customer
    if (!customerId) {
      const customer = await razorpay.customers.create({
        name,
        email,
        fail_existing: 0,
      });
      customerId = customer.id;
    }

    // Create subscription
    const subscription: any = await razorpay.subscriptions.create({
      plan_id: planId,
      customer_id: customerId,
      total_count: tier === 'annual' ? 12 : 120,
      notify: 1,
    } as any);

    // Store subscription details
    await teacherRef.update({
      'subscription.subscriptionId': subscription.id,
      'subscription.customerId': customerId,
      'subscription.provider': 'razorpay',
    });

    return { subscriptionId: subscription.id };
  }
);