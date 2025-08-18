// src/components/auth/PinEntry.tsx - CREATE THIS NEW FILE
import React, { useState } from 'react'
import { Lock, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useChildAuth } from '../../contexts/ChildAuthContext'

interface PinEntryProps {
  childId: string
  childUsername: string
  onSuccess?: () => void
}

export const PinEntry: React.FC<PinEntryProps> = ({ 
  childId, 
  childUsername, 
  onSuccess 
}) => {
  const [pin, setPin] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { authenticateChild } = useChildAuth()

  const handlePinChange = (value: string) => {
    // Only allow numbers, max 4 digits
    if (value.length <= 4 && /^\d*$/.test(value)) {
      setPin(value)
      setError('')
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (pin.length !== 4) {
      setError('Please enter your 4-digit PIN')
      return
    }

    setIsLoading(true)
    setError('')

    const success = await authenticateChild(childId, pin)
    
    if (success) {
      onSuccess?.()
    } else {
      setError('Wrong PIN! Try again.')
      setPin('')
    }
    
    setIsLoading(false)
  }

  return (
    <div className="page-container">
      <div className="container max-w-md mx-auto">
        <div className="content-area">
          
          {/* Header */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="p-4 bg-indigo-100 dark:bg-indigo-900/30 rounded-full">
                <Lock className="w-12 h-12 text-indigo-600 dark:text-indigo-400" />
              </div>
            </div>
            
            <h1 className="text-3xl font-bold text-header-primary mb-3">
              Welcome back, {childUsername}!
            </h1>
            <p className="text-lg text-body-text">
              Enter your secret PIN to access your learning space
            </p>
          </div>

          {/* PIN Form */}
          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* PIN Input */}
            <div className="relative">
              <label htmlFor="pin" className="sr-only">
                Enter your 4-digit PIN
              </label>
              <input
                id="pin"
                type="password"
                value={pin}
                onChange={(e) => handlePinChange(e.target.value)}
                placeholder="Enter PIN"
                className="w-full text-center text-3xl font-mono tracking-widest
                         py-4 px-6 border-2 border-input-border rounded-xl
                         bg-input-background text-input-text
                         focus:border-primary focus:ring-2 focus:ring-primary/20
                         transition-colors duration-200"
                maxLength={4}
                autoComplete="off"
                autoFocus
              />
              
              {/* PIN Dots Visual */}
              <div className="flex justify-center gap-3 mt-4">
                {[0, 1, 2, 3].map((index) => (
                  <div
                    key={index}
                    className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                      index < pin.length 
                        ? 'bg-indigo-600 dark:bg-indigo-400' 
                        : 'bg-gray-300 dark:bg-gray-600'
                    }`}
                  />
                ))}
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 
                            text-red-700 dark:text-red-400 px-4 py-3 rounded-lg text-center">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              disabled={pin.length !== 4 || isLoading}
              className="w-full py-4 text-lg font-semibold
                       bg-indigo-600 hover:bg-indigo-700 text-white
                       disabled:opacity-50 disabled:cursor-not-allowed
                       transition-all duration-200"
            >
              {isLoading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Checking...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  Enter My Space
                  <ArrowRight className="w-5 h-5" />
                </span>
              )}
            </Button>

            {/* Help Text */}
            <div className="text-center">
              <p className="text-sm text-body-text">
                Forgot your PIN? Ask your parent to help reset it.
              </p>
            </div>

          </form>
        </div>
      </div>
    </div>
  )
}