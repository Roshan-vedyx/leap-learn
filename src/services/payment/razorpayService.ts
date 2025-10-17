import { getFunctions, httpsCallable } from 'firebase/functions';

const RAZORPAY_KEY_ID = import.meta.env.VITE_RAZORPAY_KEY_ID;

interface RazorpayInstance {
  open: () => void;
}

declare global {
  interface Window {
    Razorpay: new (options: any) => RazorpayInstance;
  }
}

// Load Razorpay SDK dynamically
export const loadRazorpaySDK = (): Promise<void> => {
  return new Promise((resolve, reject) => {
    if (window.Razorpay) {
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.async = true;

    const timeout = setTimeout(() => {
      reject(new Error('Razorpay SDK load timeout'));
    }, 10000);

    script.onload = () => {
      clearTimeout(timeout);
      resolve();
    };

    script.onerror = () => {
      clearTimeout(timeout);
      reject(new Error('Failed to load Razorpay SDK'));
    };

    document.body.appendChild(script);
  });
};

interface SubscriptionCheckoutParams {
  planId: string;
  teacherId: string;
  email: string;
  name: string;
  tier: 'monthly' | 'annual';
}

export const openSubscriptionCheckout = async (params: SubscriptionCheckoutParams) => {
  const { planId, teacherId, email, name, tier } = params;

  await loadRazorpaySDK();

  const functions = getFunctions();
  const createSubscription = httpsCallable(functions, 'createSubscription');

  // Create subscription
  const result = await createSubscription({ teacherId, planId, tier });
  const { subscriptionId } = result.data as { subscriptionId: string };

  // Open Razorpay checkout
  const razorpay = new window.Razorpay({
    key: RAZORPAY_KEY_ID,
    subscription_id: subscriptionId,
    name: 'LiteracyApp',
    description: `${tier === 'annual' ? 'Annual' : 'Monthly'} Subscription`,
    prefill: {
      email,
      name,
    },
    theme: {
      color: '#3b82f6',
    },
    handler: (response: any) => {
      console.log('Subscription payment success:', response);
      window.location.href = `/payment-success?sid=${subscriptionId}`;
    },
    modal: {
      ondismiss: () => {
        console.log('Checkout dismissed');
      },
    },
  });

  razorpay.open();
};

interface OneTimeCheckoutParams {
  amount: number;
  teacherId: string;
  email: string;
  name: string;
  description: string;
}

export const openOneTimeCheckout = async (params: OneTimeCheckoutParams) => {
  const { amount, teacherId, email, name, description } = params;

  await loadRazorpaySDK();

  const razorpay = new window.Razorpay({
    key: RAZORPAY_KEY_ID,
    amount,
    currency: 'INR',
    name: 'LiteracyApp',
    description,
    prefill: {
      email,
      name,
    },
    notes: {
      teacherId,
      type: 'emergency_boost',
    },
    theme: {
      color: '#3b82f6',
    },
    handler: async (response: any) => {
      console.log('One-time payment success:', response);

      // Call addEmergencyCredits function
      const functions = getFunctions();
      const addEmergencyCredits = httpsCallable(functions, 'addEmergencyCredits');

      try {
        await addEmergencyCredits({
          teacherId,
          paymentId: response.razorpay_payment_id,
        });
        window.location.href = '/dashboard';
      } catch (error) {
        console.error('Error adding credits:', error);
        window.location.href = '/dashboard';
      }
    },
    modal: {
      ondismiss: () => {
        console.log('Checkout dismissed');
      },
    },
  });

  razorpay.open();
};