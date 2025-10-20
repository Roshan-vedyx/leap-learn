// src/pages/teacher/PricingPage.tsx
import React from 'react'
import { useTeacherAuth } from '@/contexts/TeacherAuthContext'
import { Card, CardContent } from '@/components/ui/Card'
import { CheckoutButton } from '@/components/pricing/CheckoutButton'
import { Check, Zap } from 'lucide-react'

const PLANS = {
  monthly: import.meta.env.VITE_RAZORPAY_PLAN_MONTHLY,
  annual: import.meta.env.VITE_RAZORPAY_PLAN_ANNUAL,
}

export const PricingPage: React.FC = () => {
  const { profile } = useTeacherAuth()

  const currentTier = profile?.subscription?.tier || 'free'
  const isPremium = currentTier === 'monthly' || currentTier === 'annual'

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Choose Your Plan
          </h1>
          <p className="text-xl text-gray-600">
            Generate unlimited worksheets with premium access
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          {/* Free Plan */}
          <Card className="relative">
            <CardContent className="p-6">
              {currentTier === 'free' && (
                <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">Free</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹0</span>
                <span className="text-gray-600">/week</span>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">3 worksheets per week</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">All worksheet types</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Mood-based generation</span>
                </li>
              </ul>

              {currentTier === 'free' && (
                <div className="text-center py-3 bg-gray-100 rounded-lg text-gray-600 font-medium">
                  Current Plan
                </div>
              )}
            </CardContent>
          </Card>

          {/* Monthly Plan */}
          <Card className="relative border-2 border-indigo-500">
            <CardContent className="p-6">
              {currentTier === 'monthly' && (
                <div className="absolute top-4 right-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">Monthly</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹799</span>
                <span className="text-gray-600">/month</span>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited worksheets</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">All worksheet types</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Cancel anytime</span>
                </li>
              </ul>

              {currentTier === 'monthly' ? (
                <div className="text-center py-3 bg-gray-100 rounded-lg text-gray-600 font-medium">
                  Current Plan
                </div>
              ) : (
                <CheckoutButton
                  type="subscription"
                  planId={PLANS.monthly}
                  tier="monthly"
                  className="w-full bg-indigo-600 hover:bg-indigo-700 text-white"
                >
                  Subscribe Monthly
                </CheckoutButton>
              )}
            </CardContent>
          </Card>

          {/* Annual Plan */}
          <Card className="relative border-2 border-green-500">
            <CardContent className="p-6">
              <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                SAVE 17%
              </div>
              
              {currentTier === 'annual' && (
                <div className="absolute top-4 left-4 bg-blue-100 text-blue-800 text-xs font-semibold px-3 py-1 rounded-full">
                  Current Plan
                </div>
              )}
              
              <h3 className="text-2xl font-bold mb-2">Annual</h3>
              <div className="mb-6">
                <span className="text-4xl font-bold">₹7,999</span>
                <span className="text-gray-600">/year</span>
                <div className="text-sm text-gray-500 mt-1">
                  ₹666/month
                </div>
              </div>

              <ul className="space-y-3 mb-6">
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Unlimited worksheets</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">All worksheet types</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Priority support</span>
                </li>
                <li className="flex items-start">
                  <Check className="w-5 h-5 text-green-500 mr-2 mt-0.5 flex-shrink-0" />
                  <span className="text-gray-700">Save ₹1,589/year</span>
                </li>
              </ul>

              {currentTier === 'annual' ? (
                <div className="text-center py-3 bg-gray-100 rounded-lg text-gray-600 font-medium">
                  Current Plan
                </div>
              ) : (
                <CheckoutButton
                  type="subscription"
                  planId={PLANS.annual}
                  tier="annual"
                  className="w-full bg-green-600 hover:bg-green-700 text-white"
                >
                  Subscribe Annually
                </CheckoutButton>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Emergency Boost */}
        {!isPremium && (
          <div className="max-w-2xl mx-auto">
            <Card className="border-2 border-orange-400">
              <CardContent className="p-6">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-orange-100 rounded-lg">
                    <Zap className="w-6 h-6 text-orange-600" />
                  </div>
                  
                  <div className="flex-1">
                    <h3 className="text-xl font-bold mb-2">Emergency Boost</h3>
                    <p className="text-gray-600 mb-4">
                      Need just a few more worksheets this week? Get 2 extra worksheets instantly for ₹149.
                    </p>
                    
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-3xl font-bold">₹149</span>
                        <span className="text-gray-600 ml-2">one-time</span>
                      </div>
                      
                      <CheckoutButton
                        type="one-time"
                        amount={14900}
                        description="Emergency Boost - 2 Worksheets"
                        className="bg-orange-600 hover:bg-orange-700 text-white"
                      >
                        Buy Now
                      </CheckoutButton>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  )
}