import * as admin from 'firebase-admin';

// Initialize Firebase Admin
admin.initializeApp();

// Export payment functions
export { createSubscription } from './payments/createSubscription';
export { addEmergencyCredits } from './payments/addEmergencyCredits';
export { razorpayWebhook } from './webhooks/razorpayWebhook';