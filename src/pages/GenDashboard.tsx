// src/pages/Dashboard.tsx
import React, { useState } from 'react'
import { Link } from 'wouter'
import { Zap, Target, Sparkles, Clock, X } from 'lucide-react'
import { useUsageLimit, useUserTier } from '../hooks/useUsageTracking'
import { useTeacherAuth } from '../contexts/TeacherAuthContext'
import { CheckoutButton } from '@/components/pricing/CheckoutButton'
import { AccountSettingsModal } from '@/components/account/AccountSettingsModal'

export const GenDashboard: React.FC = () => {
  const { tier, isPremium } = useUserTier()
  const { remaining, used, resetDate, loading } = useUsageLimit()
  const { user } = useTeacherAuth()
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [showAccountSettings, setShowAccountSettings] = useState(false)

  // Calculate days until reset
  const getDaysUntilReset = () => {
    const now = new Date()
    const diff = resetDate.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Vedyx Learning</h1>
            <div className="flex items-center gap-4">
              {!isPremium && user && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{remaining}</span> worksheets left this week
                </div>
              )}
              
              {/* Show Sign In button for non-authenticated users */}
              {!user && (
                <button 
                  onClick={() => window.location.href = '/teacher'}
                  className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium"
                >
                  Sign In
                </button>
              )}
              
              {/* Show appropriate button for authenticated users */}
              {user && (
                <button 
                  onClick={() => {
                    if (isPremium) {
                      setShowAccountSettings(true)
                    } else {
                      setShowPricingModal(true)
                    }
                  }}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                >
                  {isPremium ? 'Account Settings' : 'Upgrade to Premium'}
                </button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center mb-12">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Match worksheets to your child's mood.
          </h2>
          <p className="text-lg md:text-xl text-gray-600 max-w-3xl mx-auto">
            Is your child overwhelmed? Bouncing off the walls? Too tired to focus?
            Get an instant worksheet designed for their energy level <span className="font-semibold">RIGHT NOW</span>.
          </p>
        </div>

        {/* Usage Status Banner (Free users only) */}
        {!isPremium && !loading && (
          <div className="max-w-2xl mx-auto mb-12 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Sparkles className="w-5 h-5 text-blue-600" />
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Free Plan: {used}/3 worksheets used this week
                  </p>
                  <p className="text-xs text-gray-600 mt-0.5">
                    Resets {getDaysUntilReset()} {getDaysUntilReset() === 1 ? 'day' : 'days'} • 
                    <Link href="/teacher/pricing" className="text-blue-600 hover:underline ml-1">
                      Upgrade for unlimited
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Stats - Only show for logged-in users */}
        {user && (
          <div className="max-w-5xl mx-auto mb-12">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Worksheets Created</p>
                    <p className="text-2xl font-bold text-gray-900 mt-1">{used}</p>
                  </div>
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <Sparkles className="w-6 h-6 text-blue-600" />
                  </div>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-gray-500">This week</span>
                </div>
              </div>

              <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
                <div>
                  <p className="text-sm font-medium text-gray-600">Your Plan</p>
                  <p className="text-2xl font-bold text-gray-900 mt-1">
                    {isPremium ? tier.charAt(0).toUpperCase() + tier.slice(1) : 'Free'}
                  </p>
                </div>
                <div className="flex items-center mt-2 text-sm">
                  <span className="text-gray-500">
                    {isPremium ? 'Unlimited worksheets' : `${remaining}/3 remaining`}
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two Generator Options */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-blue-900 text-center mb-8">
            Choose how you want to create today's worksheet.
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Generate Card */}
            <Link href="/worksheet-generator">
                <div 
                    onClick={() => sessionStorage.setItem('intendedRoute', '/worksheet-generator')}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer group h-[350px]"
                >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-amber-100 rounded-lg group-hover:bg-amber-200 transition-colors">
                    <Zap className="w-8 h-8 text-amber-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900">Quick Generate</h4>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  Pick mood → Get worksheet (30 secs)
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span>Perfect for busy moments</span>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  {user ? 'Create Now' : 'Try Free'}
                </button>
              </div>
            </Link>

            {/* Custom Generate Card */}
            <Link href="/skill-builder">
                <div 
                    onClick={() => sessionStorage.setItem('intendedRoute', '/skill-builder')}
                    className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer group"
                >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                    <Target className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900">Skill Builder</h4>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                    Target specific phonics, sight words & skills (2-3 mins)
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span>Choose exact patterns you're working on</span>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  {user ? 'Create Now' : 'Try Free'}
                </button>
              </div>
            </Link>
          </div>

          {/* Bottom Note */}
          <p className="text-center text-gray-600 mt-8">
            Try both for free. No credit card needed.
          </p>
        </div>

        {/* Which Generator Section */}
        <div className="mt-20 max-w-4xl mx-auto">
          <h3 className="text-3xl font-bold text-blue-900 text-center mb-12">
            Which Generator Is Right For You?
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Generate Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-6 h-6 text-amber-600" />
                <h4 className="text-xl font-bold text-gray-900">Skill Builder</h4>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>When you need something <strong>now</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Mood-responsive activities</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Automatic skill selection</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>30 seconds start to finish</span>
                </li>
              </ul>
            </div>

            {/* Custom Generate Details */}
            <div className="bg-white border border-gray-200 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-6 h-6 text-cyan-600" />
                <h4 className="text-xl font-bold text-gray-900">Custom Generate</h4>
              </div>
              <ul className="space-y-3 text-gray-700">
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Target specific <strong>phonics patterns</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Choose exact <strong>sight words</strong></span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>Adjust difficulty & length</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-green-600 mt-1">✓</span>
                  <span>2-3 minutes with guidance</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-20 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-gray-600">
          <p>
            Sensory-Smart Learning by Vedyx Learning. Designed for different brains.
          </p>
        </div>
      </footer>

      {/* Pricing Modal */}
      {showPricingModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl max-w-4xl w-full p-6 relative max-h-[90vh] overflow-y-auto">
            <button
              onClick={() => setShowPricingModal(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-3xl font-bold mb-6">Choose Your Plan</h2>

            <div className="grid md:grid-cols-2 gap-6 mb-6">
              {/* Monthly Plan */}
              <div className="border-2 border-blue-500 rounded-lg p-6">
                <h3 className="text-xl font-bold mb-2">Monthly</h3>
                <p className="text-3xl font-bold mb-4">
                  ₹799<span className="text-sm font-normal text-gray-600">/month</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-700">
                  <li>✓ Unlimited worksheets</li>
                  <li>✓ All worksheet types</li>
                  <li>✓ Cancel anytime</li>
                </ul>
                <CheckoutButton
                  type="subscription"
                  planId={import.meta.env.VITE_RAZORPAY_PLAN_MONTHLY}
                  tier="monthly"
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Subscribe Monthly
                </CheckoutButton>
              </div>

              {/* Annual Plan */}
              <div className="border-2 border-green-500 rounded-lg p-6 relative">
                <div className="absolute top-4 right-4 bg-green-100 text-green-800 text-xs font-semibold px-3 py-1 rounded-full">
                  SAVE 17%
                </div>
                <h3 className="text-xl font-bold mb-2">Annual</h3>
                <p className="text-3xl font-bold mb-4">
                  ₹7,999<span className="text-sm font-normal text-gray-600">/year</span>
                </p>
                <ul className="space-y-2 mb-6 text-sm text-gray-700">
                  <li>✓ Unlimited worksheets</li>
                  <li>✓ All worksheet types</li>
                  <li>✓ Save ₹1,589/year</li>
                </ul>
                <CheckoutButton
                  type="subscription"
                  planId={import.meta.env.VITE_RAZORPAY_PLAN_ANNUAL}
                  tier="annual"
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Subscribe Annually
                </CheckoutButton>
              </div>
            </div>

            {/* Emergency Boost */}
            <div className="border-2 border-orange-400 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="font-bold mb-1">Emergency Boost</h3>
                  <p className="text-sm text-gray-600">Get 2 extra worksheets for ₹149</p>
                </div>
                <CheckoutButton
                  type="one-time"
                  amount={14900}
                  description="Emergency Boost - 2 Worksheets"
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  Buy Now
                </CheckoutButton>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Account Settings Modal */}
      <AccountSettingsModal
        isOpen={showAccountSettings}
        onClose={() => setShowAccountSettings(false)}
      />
    </div>
  )
}