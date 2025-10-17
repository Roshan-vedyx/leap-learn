import { CheckoutButton } from '@/components/pricing/CheckoutButton';
import { useTeacherAuth } from '@/contexts/TeacherAuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Check } from 'lucide-react';

const PLANS = {
  monthly: import.meta.env.VITE_RAZORPAY_PLAN_MONTHLY,
  annual: import.meta.env.VITE_RAZORPAY_PLAN_ANNUAL,
};

export const PricingPage = () => {
  const { profile } = useTeacherAuth();
  const isPremium = profile?.subscription?.tier === 'monthly' || profile?.subscription?.tier === 'annual';
  const currentTier = profile?.subscription?.tier || 'free';

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Choose Your Plan</h1>
        <p className="text-lg text-gray-600">
          Unlock unlimited worksheet generation for your classroom
        </p>
      </div>

      {/* Subscription Plans */}
      <div className="grid md:grid-cols-3 gap-8 mb-16">
        {/* Free Plan */}
        <Card className={currentTier === 'free' ? 'border-blue-500 border-2' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Free</CardTitle>
              {currentTier === 'free' && <Badge>Current Plan</Badge>}
            </div>
            <CardDescription>
              <span className="text-3xl font-bold">₹0</span>
              <span className="text-gray-600">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>3 worksheets per month</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>All worksheet types</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>Basic accessibility features</span>
              </li>
            </ul>
          </CardContent>
        </Card>

        {/* Monthly Plan */}
        <Card className={currentTier === 'monthly' ? 'border-blue-500 border-2' : ''}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Monthly</CardTitle>
              {currentTier === 'monthly' && <Badge>Current Plan</Badge>}
            </div>
            <CardDescription>
              <span className="text-3xl font-bold">₹799</span>
              <span className="text-gray-600">/month</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="font-semibold">Unlimited worksheets</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>All worksheet types</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>Advanced accessibility</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
            </ul>
            {currentTier !== 'monthly' && (
              <CheckoutButton type="subscription" planId={PLANS.monthly} tier="monthly">
                Subscribe Monthly
              </CheckoutButton>
            )}
          </CardContent>
        </Card>

        {/* Annual Plan */}
        <Card className={currentTier === 'annual' ? 'border-blue-500 border-2' : 'border-green-500 border-2'}>
          <CardHeader>
            <div className="flex items-center justify-between mb-2">
              <CardTitle>Annual</CardTitle>
              {currentTier === 'annual' ? (
                <Badge>Current Plan</Badge>
              ) : (
                <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                  SAVE 17%
                </Badge>
              )}
            </div>
            <CardDescription>
              <span className="text-3xl font-bold">₹7,999</span>
              <span className="text-gray-600">/year</span>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-3 mb-6">
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="font-semibold">Unlimited worksheets</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>All worksheet types</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>Advanced accessibility</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span>Priority support</span>
              </li>
              <li className="flex items-start gap-2">
                <Check className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                <span className="font-semibold text-green-700">Save ₹1,589/year</span>
              </li>
            </ul>
            {currentTier !== 'annual' && (
              <CheckoutButton type="subscription" planId={PLANS.annual} tier="annual">
                Subscribe Annual
              </CheckoutButton>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Emergency Boost */}
      {!isPremium && (
        <div className="max-w-2xl mx-auto">
          <Card className="border-orange-200 bg-orange-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <span>🚀</span>
                Emergency Boost
              </CardTitle>
              <CardDescription className="text-gray-700">
                Need more worksheets right now? Get an instant credit top-up
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-2xl font-bold mb-1">₹149</p>
                  <p className="text-sm text-gray-600">+2 worksheet credits</p>
                </div>
                <CheckoutButton
                  type="one-time"
                  amount={14900}
                  description="Emergency Boost - 2 Worksheet Credits"
                >
                  Buy Now
                </CheckoutButton>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};