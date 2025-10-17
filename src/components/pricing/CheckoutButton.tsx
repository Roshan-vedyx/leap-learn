import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useTeacherAuth } from '@/contexts/TeacherAuthContext';
import { openSubscriptionCheckout, openOneTimeCheckout } from '@/services/payment/razorpayService';

interface CheckoutButtonProps {
  type: 'subscription' | 'one-time';
  planId?: string;
  tier?: 'monthly' | 'annual';
  amount?: number;
  description?: string;
  children: React.ReactNode;
}

export const CheckoutButton = ({
  type,
  planId,
  tier,
  amount,
  description,
  children,
}: CheckoutButtonProps) => {
  const { user, profile } = useTeacherAuth();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    if (!user || !profile) {
      console.log('No user or profile');
      return;
    }

    setLoading(true);

    try {
      if (type === 'subscription') {
        if (!planId || !tier) {
          console.error('Missing planId or tier for subscription');
          return;
        }

        await openSubscriptionCheckout({
          planId,
          teacherId: user.uid,
          email: user.email || '',
          name: profile.name,
          tier,
        });
      } else {
        if (!amount || !description) {
          console.error('Missing amount or description for one-time');
          return;
        }

        await openOneTimeCheckout({
          amount,
          teacherId: user.uid,
          email: user.email || '',
          name: profile.name,
          description,
        });
      }
    } catch (error) {
      console.error('Checkout error:', error);
      setLoading(false);
    }
  };

  return (
    <Button onClick={handleClick} disabled={loading || !user}>
      {loading ? 'Loading...' : children}
    </Button>
  );
};