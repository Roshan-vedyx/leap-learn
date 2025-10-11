// src/components/worksheets/WeeklyUsageCounter.tsx
import React from 'react'
import { Calendar } from 'lucide-react'

interface WeeklyUsageCounterProps {
  used: number
  remaining: number
  limit: number
  resetDate: Date
  isPremium: boolean
}

export const WeeklyUsageCounter: React.FC<WeeklyUsageCounterProps> = ({
  used,
  remaining,
  limit,
  resetDate,
  isPremium
}) => {
  // Don't show for premium users
  if (isPremium) return null

  // Calculate days until reset
  const now = new Date()
  const diffTime = resetDate.getTime() - now.getTime()
  const daysUntilReset = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  const percentage = (used / limit) * 100

  return (
    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <Calendar className="w-4 h-4 text-blue-600" />
          <span className="text-sm font-medium text-gray-700">
            {remaining} of {limit} worksheets left this week
          </span>
        </div>
        <span className="text-xs text-gray-500">
          Resets in {daysUntilReset} {daysUntilReset === 1 ? 'day' : 'days'}
        </span>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-300 ${
            percentage < 50
              ? 'bg-green-500'
              : percentage < 80
              ? 'bg-yellow-500'
              : 'bg-red-500'
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>

      {remaining === 0 && (
        <p className="text-xs text-gray-600 mt-2">
          You've used this week's free worksheets. They'll reset on Monday!
        </p>
      )}
    </div>
  )
}