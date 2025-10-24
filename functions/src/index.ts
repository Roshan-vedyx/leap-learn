import { setGlobalOptions } from "firebase-functions";
//import * as logger from "firebase-functions/logger";

// Global settings for all Cloud Functions
setGlobalOptions({ maxInstances: 10 });

// --- PAYMENT FUNCTIONS ---

import { createSubscription } from './payments/createSubscription'
import { createEmergencyOrder } from './payments/createEmergencyOrder'
import { verifyEmergencyPayment } from './payments/verifyEmergencyPayment'
import { cancelSubscription } from './payments/cancelSubscription'

// --- WEBHOOKS ---
import { razorpayWebhook } from "./webhooks/razorpayWebhook";

// --- EXPORT FUNCTIONS ---
export {
    createSubscription,
    createEmergencyOrder,
    verifyEmergencyPayment,
    cancelSubscription,
    razorpayWebhook,
};
