import { onCall, HttpsError } from 'firebase-functions/v2/https';
import * as admin from 'firebase-admin';
import Razorpay from 'razorpay';

interface AddEmergencyCreditsRequest {
  teacherId: string;
  paymentId: string;
}

export const addEmergencyCredits = onCall(
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

    const { teacherId, paymentId } = request.data as AddEmergencyCreditsRequest;

    // Verify caller is the teacher
    if (request.auth.uid !== teacherId) {
      throw new HttpsError('permission-denied', 'Can only add credits for yourself');
    }

    // Verify payment
    const payment = await razorpay.payments.fetch(paymentId);

    if (payment.status !== 'captured') {
      throw new HttpsError('failed-precondition', 'Payment not captured');
    }

    if (payment.amount !== 14900) {
      throw new HttpsError('invalid-argument', 'Invalid payment amount');
    }

    const db = admin.firestore();

    // Idempotency check
    const eventRef = db.collection('payment_events').doc(paymentId);
    const eventDoc = await eventRef.get();

    if (eventDoc.exists) {
      console.log(`Payment ${paymentId} already processed`);
      throw new HttpsError('already-exists', 'Credits already added for this payment');
    }

    // Mark as processed
    await eventRef.set({
      paymentId,
      teacherId,
      amount: payment.amount,
      processedAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    // Add credits
    const teacherRef = db.collection('users').doc(teacherId);
    await teacherRef.update({
      worksheetCredits: admin.firestore.FieldValue.increment(2),
    });

    console.log(`Added 2 emergency credits for ${teacherId}`);

    return { success: true, creditsAdded: 2 };
  }
);