// src/components/account/AccountSettingsModal.tsx
import React, { useState } from 'react'
import { X, CreditCard, Pause, BarChart3, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useTeacherAuth } from '@/contexts/TeacherAuthContext'
import { CancelSubscriptionFlow } from './CancelSubscriptionFlow'

interface AccountSettingsModalProps {
  isOpen: boolean
  onClose: () => void
}

export const AccountSettingsModal: React.FC<AccountSettingsModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { profile } = useTeacherAuth()
  const [showCancelFlow, setShowCancelFlow] = useState(false)

  if (!isOpen) return null

  const subscription = profile?.subscription
  const isPremium = subscription?.tier === 'monthly' || subscription?.tier === 'annual'
  const isCanceling = subscription?.cancelAtPeriodEnd

  // Format date
  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  // Calculate days remaining
  const getDaysRemaining = () => {
    if (!subscription?.currentPeriodEnd) return 0
    const end = subscription.currentPeriodEnd.toDate 
      ? subscription.currentPeriodEnd.toDate() 
      : new Date(subscription.currentPeriodEnd)
    const now = new Date()
    const diff = end.getTime() - now.getTime()
    return Math.ceil(diff / (1000 * 60 * 60 * 24))
  }

  // Show cancel flow instead of settings
  if (showCancelFlow) {
    return (
      <CancelSubscriptionFlow
        isOpen={showCancelFlow}
        onClose={() => {
          setShowCancelFlow(false)
          onClose()
        }}
        onBack={() => setShowCancelFlow(false)}
      />
    )
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Account Settings</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          {/* Subscription Overview */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Subscription Overview
            </h3>
            <Card>
              <CardContent className="p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Current Plan</span>
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-gray-900">
                        {isPremium 
                          ? `${subscription.tier.charAt(0).toUpperCase() + subscription.tier.slice(1)} Premium`
                          : 'Free Plan'
                        }
                      </span>
                      {isCanceling && (
                        <span className="px-2 py-1 bg-orange-100 text-orange-700 text-xs font-medium rounded">
                          Cancels on {formatDate(subscription.currentPeriodEnd)}
                        </span>
                      )}
                      {isPremium && !isCanceling && (
                        <span className="px-2 py-1 bg-green-100 text-green-700 text-xs font-medium rounded">
                          Active
                        </span>
                      )}
                    </div>
                  </div>

                  {isPremium && (
                    <>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-600">
                          {isCanceling ? 'Access Until' : 'Next Billing Date'}
                        </span>
                        <span className="font-medium text-gray-900">
                          {formatDate(subscription.currentPeriodEnd)}
                        </span>
                      </div>

                      {!isCanceling && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-gray-600">Amount</span>
                          <span className="font-medium text-gray-900">
                            ₹{subscription.tier === 'annual' ? '7,999/year' : '799/month'}
                          </span>
                        </div>
                      )}

                      {isCanceling && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded-lg">
                          <p className="text-sm text-orange-800">
                            <strong>{getDaysRemaining()} days</strong> of Premium access remaining
                          </p>
                        </div>
                      )}
                    </>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Actions */}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Quick Actions
            </h3>
            <div className="grid gap-3">
              {/* Update Payment - placeholder for future */}
              {isPremium && !isCanceling && (
                <button
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                  onClick={() => {
                    // TODO: Implement Razorpay customer portal link
                    alert('Payment method update coming soon!')
                  }}
                >
                  <div className="p-2 bg-blue-100 rounded-lg">
                    <CreditCard className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Update Payment Method</p>
                    <p className="text-sm text-gray-500">Change your card details</p>
                  </div>
                </button>
              )}

              {/* Usage History - placeholder */}
              <button
                className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-blue-300 hover:bg-blue-50 transition-all text-left"
                onClick={() => {
                  // TODO: Show usage modal
                  alert('Usage history coming soon!')
                }}
              >
                <div className="p-2 bg-purple-100 rounded-lg">
                  <BarChart3 className="w-5 h-5 text-purple-600" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-gray-900">Usage History</p>
                  <p className="text-sm text-gray-500">View past worksheet generations</p>
                </div>
              </button>

              {/* Cancel Subscription */}
              {isPremium && !isCanceling && (
                <button
                  className="flex items-center gap-3 p-4 border-2 border-gray-200 rounded-lg hover:border-red-300 hover:bg-red-50 transition-all text-left"
                  onClick={() => setShowCancelFlow(true)}
                >
                  <div className="p-2 bg-red-100 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-red-600" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Cancel Subscription</p>
                    <p className="text-sm text-gray-500">End your Premium access</p>
                  </div>
                </button>
              )}

              {/* Reactivate - if canceling */}
              {isCanceling && (
                <button
                  className="flex items-center gap-3 p-4 border-2 border-green-200 bg-green-50 rounded-lg hover:border-green-400 transition-all text-left"
                  onClick={() => {
                    // TODO: Implement reactivation
                    alert('Reactivation coming soon! Contact support.')
                  }}
                >
                  <div className="p-2 bg-green-200 rounded-lg">
                    <AlertCircle className="w-5 h-5 text-green-700" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium text-gray-900">Reactivate Subscription</p>
                    <p className="text-sm text-gray-600">Keep your Premium benefits</p>
                  </div>
                </button>
              )}
            </div>
          </div>

          {/* Subscription Details */}
          {isPremium && (
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                What's Included
              </h3>
              <Card>
                <CardContent className="p-4">
                  <ul className="space-y-2 text-sm text-gray-700">
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Unlimited worksheet generation
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      All worksheet types & moods
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      ADHD-friendly adaptive content
                    </li>
                    <li className="flex items-center gap-2">
                      <span className="text-green-600">✓</span>
                      Priority support
                    </li>
                  </ul>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4">
          <Button
            onClick={onClose}
            variant="outline"
            className="w-full"
          >
            Close
          </Button>
        </div>
      </div>
    </div>
  )
}