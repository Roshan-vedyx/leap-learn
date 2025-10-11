// src/components/worksheets/UpgradeModal.tsx
import React from 'react'
import { X, Sparkles, Zap, Clock } from 'lucide-react'
import { Button } from '../ui/Button'

interface UpgradeModalProps {
  isOpen: boolean
  onClose: () => void
  onUpgrade: () => void
  onEmergencyPack: () => void
  daysUntilReset: number
}

export const UpgradeModal: React.FC<UpgradeModalProps> = ({
  isOpen,
  onClose,
  onUpgrade,
  onEmergencyPack,
  daysUntilReset
}) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-xl max-w-lg w-full p-6 relative">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-gray-600"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">
            You've used this week's free worksheets
          </h2>
          <p className="text-gray-600">
            No worries! Here are your options:
          </p>
        </div>

        {/* Option 1: Premium - Primary CTA */}
        <div className="border-2 border-blue-500 rounded-lg p-4 mb-4 bg-blue-50">
          <div className="flex items-start gap-3 mb-3">
            <Sparkles className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Upgrade to Premium
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Unlimited worksheets, forever. No weekly limits.
              </p>
              <p className="text-2xl font-bold text-blue-600">
                $9.99<span className="text-sm font-normal">/month</span>
              </p>
            </div>
          </div>
          <Button onClick={onUpgrade} className="w-full bg-blue-600 hover:bg-blue-700">
            Upgrade Now
          </Button>
        </div>

        {/* Option 2: Emergency Pack - Secondary CTA */}
        <div className="border border-gray-300 rounded-lg p-4 mb-4">
          <div className="flex items-start gap-3 mb-3">
            <Zap className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Emergency Pack
              </h3>
              <p className="text-sm text-gray-600 mb-2">
                Get 2 more worksheets just for this week
              </p>
              <p className="text-xl font-bold text-gray-900">
                $2.99<span className="text-sm font-normal"> one-time</span>
              </p>
            </div>
          </div>
          <Button 
            onClick={onEmergencyPack} 
            variant="outline"
            className="w-full"
          >
            Buy Emergency Pack
          </Button>
        </div>

        {/* Option 3: Wait - Tertiary option */}
        <div className="border border-gray-200 rounded-lg p-4 bg-gray-50">
          <div className="flex items-start gap-3">
            <Clock className="w-6 h-6 text-gray-600 flex-shrink-0 mt-1" />
            <div>
              <h3 className="font-semibold text-gray-900 mb-1">
                Wait until Monday
              </h3>
              <p className="text-sm text-gray-600">
                Your free worksheets reset in{' '}
                <span className="font-medium">{daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}</span>
              </p>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-xs text-gray-500 text-center mt-4">
          All purchases are secure and you can cancel Premium anytime
        </p>
      </div>
    </div>
  )
}