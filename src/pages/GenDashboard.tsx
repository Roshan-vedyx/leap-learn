// src/pages/Dashboard.tsx
import React from 'react'
import { Link } from 'wouter'
import { Zap, Target, Sparkles, Clock } from 'lucide-react'
import { useUsageLimit, useUserTier } from '../hooks/useUsageTracking'

export const GenDashboard: React.FC = () => {
  const { tier, isPremium } = useUserTier()
  const { remaining, used, resetDate, loading } = useUsageLimit()

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
              {!isPremium && (
                <div className="text-sm text-gray-600">
                  <span className="font-semibold">{remaining}</span> worksheets left this week
                </div>
              )}
              <Link href="/teacher/pricing">
                <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium">
                  {isPremium ? 'Manage Plan' : 'Upgrade to Premium'}
                </button>
              </Link>
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

        {/* Two Generator Options */}
        <div className="max-w-5xl mx-auto">
          <h3 className="text-2xl font-bold text-blue-900 text-center mb-8">
            Two ways to generate the worksheet you need.
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Quick Generate Card */}
            <Link href="/worksheet-generator">
                <div 
                    onClick={() => sessionStorage.setItem('intendedRoute', '/worksheet-generator')}
                    className="bg-gradient-to-br from-amber-50 to-orange-50 border-2 border-amber-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer group"
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
                  Try Free
                </button>
              </div>
            </Link>

            {/* Custom Generate Card */}
            <Link href="/teacher/dashboard">
                <div 
                    onClick={() => sessionStorage.setItem('intendedRoute', '/teacher/dashboard')}
                    className="bg-gradient-to-br from-cyan-50 to-blue-50 border-2 border-cyan-200 rounded-2xl p-8 hover:shadow-xl transition-all cursor-pointer group"
                >
                <div className="flex items-center gap-3 mb-4">
                  <div className="p-3 bg-cyan-100 rounded-lg group-hover:bg-cyan-200 transition-colors">
                    <Target className="w-8 h-8 text-cyan-600" />
                  </div>
                  <h4 className="text-2xl font-bold text-gray-900">Custom Generate</h4>
                </div>

                <p className="text-gray-700 mb-4 leading-relaxed">
                  Full control over every detail (2-3 mins)
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-600 mb-6">
                  <Clock className="w-4 h-4" />
                  <span>Choose phonics pattern, sight words & more</span>
                </div>

                <button className="w-full bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition-colors">
                  Try Free
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
                <h4 className="text-xl font-bold text-gray-900">Quick Generate</h4>
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
    </div>
  )
}