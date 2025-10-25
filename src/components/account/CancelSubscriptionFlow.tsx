// src/components/account/CancelSubscriptionFlow.tsx
import React, { useState } from 'react'
import { X, AlertTriangle, Loader2 } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useTeacherAuth } from '@/contexts/TeacherAuthContext'
import { httpsCallable } from 'firebase/functions'
import { functions } from '@/lib/firebase-config'

interface CancelSubscriptionFlowProps {
  isOpen: boolean
  onClose: () => void
  onBack: () => void
}

type FlowStep = 'reason' | 'confirm' | 'success'

export const CancelSubscriptionFlow: React.FC<CancelSubscriptionFlowProps> = ({
  isOpen,
  onClose,
  onBack,
}) => {
  const { profile, user } = useTeacherAuth()
  const [step, setStep] = useState<FlowStep>('reason')
  const [reason, setReason] = useState('')
  const [confirmed, setConfirmed] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  if (!isOpen) return null

  const subscription = profile?.subscription

  // Format end date
  const formatDate = (date: any) => {
    if (!date) return 'N/A'
    const d = date.toDate ? date.toDate() : new Date(date)
    return d.toLocaleDateString('en-IN', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    })
  }

  const endDate = formatDate(subscription?.currentPeriodEnd)

  // Handle cancellation
  const handleCancel = async () => {
    if (!user || !subscription?.subscriptionId) {
      setError('Missing subscription information')
      return
    }

    setLoading(true)
    setError('')

    try {
      const cancelSubscription = httpsCallable(functions, 'cancelSubscription')
      await cancelSubscription({
        teacherId: user.uid,
        subscriptionId: subscription.subscriptionId,
      })

      setStep('success')
    } catch (err: any) {
      console.error('Cancellation error:', err)
      setError(err.message || 'Failed to cancel subscription. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 'success' ? 'Subscription Canceled' : 'Cancel Subscription'}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Step 1: Reason & Pause Option */}
        {step === 'reason' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                We're sorry to see you go
              </h3>
              <p className="text-sm text-gray-600">
                Help us improve by letting us know why you're canceling (optional)
              </p>
            </div>

            {/* Reason dropdown */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Reason for canceling
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="">Select a reason (optional)</option>
                <option value="too_expensive">Too expensive</option>
                <option value="not_using">Not using it enough</option>
                <option value="found_alternative">Found an alternative</option>
                <option value="technical_issues">Technical issues</option>
                <option value="other">Other</option>
              </select>
            </div>

            {/* Support contact option */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <p className="text-sm font-medium text-blue-900 mb-2">
                💡 Need help or want to pause temporarily?
            </p>
            <p className="text-sm text-blue-700 mb-3">
                We're here to help! Email us and we'll work out the best solution for you.
            </p>
            <Button
                variant="outline"
                className="w-full border-blue-300 text-blue-700 hover:bg-blue-100"
                onClick={() => {
                window.open('mailto:support@vedyx.ai?subject=Pause Subscription Request', '_blank')
                }}
            >
                Contact Support
            </Button>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={onBack}
              >
                Go Back
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
                onClick={() => setStep('confirm')}
              >
                Continue to Cancel
              </Button>
            </div>
          </div>
        )}

        {/* Step 2: Confirmation with Consequences */}
        {step === 'confirm' && (
          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Confirm cancellation
              </h3>
              <p className="text-sm text-gray-600">
                Please review what will happen when you cancel
              </p>
            </div>

            {/* Warning box */}
            <div className="bg-yellow-50 border-2 border-yellow-300 rounded-lg p-4 space-y-3">
              <div className="flex items-start gap-3">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                <div className="space-y-2 text-sm">
                  <p className="font-semibold text-yellow-900">
                    If you cancel:
                  </p>
                  <ul className="space-y-1 text-yellow-800">
                    <li>• Your subscription will remain active until <strong>{endDate}</strong></li>
                    <li>• After that, you'll lose access to unlimited worksheet generation</li>
                    <li>• You'll revert to 3 worksheets per week on the Free plan</li>
                    <li>• Your account data and settings will be saved if you return</li>
                  </ul>
                </div>
              </div>
            </div>

            {/* Confirmation checkbox */}
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
                className="mt-1 w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">
                I understand I will lose Premium access on <strong>{endDate}</strong>
              </span>
            </label>

            {/* Error message */}
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                <p className="text-sm text-red-700">{error}</p>
              </div>
            )}

            {/* Action buttons */}
            <div className="flex gap-3">
              <Button
                variant="outline"
                className="flex-1"
                onClick={() => setStep('reason')}
                disabled={loading}
              >
                Go Back
              </Button>
              <Button
                className="flex-1 bg-red-600 hover:bg-red-700 text-white"
                onClick={handleCancel}
                disabled={!confirmed || loading}
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Canceling...
                  </>
                ) : (
                  'Cancel Subscription'
                )}
              </Button>
            </div>
          </div>
        )}

        {/* Step 3: Success */}
        {step === 'success' && (
          <div className="p-6 space-y-6">
            <div className="text-center py-4">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">
                Subscription Canceled
              </h3>
              <p className="text-gray-600">
                Your cancellation has been processed
              </p>
            </div>

            {/* What happens next */}
            <div className="bg-gray-50 rounded-lg p-4 space-y-2 text-sm">
              <p className="font-semibold text-gray-900">What happens next:</p>
              <ul className="space-y-1 text-gray-700">
                <li>✓ You'll keep Premium access until {endDate}</li>
                <li>✓ No further charges will be made</li>
                <li>✓ You can reactivate anytime before {endDate}</li>
              </ul>
            </div>

            {/* Close button */}
            <Button
              className="w-full"
              onClick={onClose}
            >
              Return to Dashboard
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}