// src/components/auth/PinReset.tsx
import React, { useState } from 'react'
import { Lock, CheckCircle, AlertCircle, ArrowLeft } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { doc, updateDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import bcrypt from 'bcryptjs'

interface PinResetProps {
  childId: string
  childUsername: string
  onSuccess: () => void
  onCancel: () => void
}

export const PinReset: React.FC<PinResetProps> = ({
  childId,
  childUsername,
  onSuccess,
  onCancel
}) => {
  const [newPin, setNewPin] = useState('')
  const [confirmPin, setConfirmPin] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [step, setStep] = useState(1) // 1: Enter PIN, 2: Confirm PIN

  const handlePinChange = (value: string, isConfirm: boolean = false) => {
    // Only allow numbers, max 4 digits
    if (value.length <= 4 && /^\d*$/.test(value)) {
      if (isConfirm) {
        setConfirmPin(value)
      } else {
        setNewPin(value)
      }
      setError('')
    }
  }

  const handleNext = () => {
    if (step === 1) {
      if (newPin.length !== 4) {
        setError('PIN must be 4 digits')
        return
      }
      setError('')
      setStep(2)
    }
  }

  const handleBack = () => {
    if (step === 2) {
      setStep(1)
      setConfirmPin('')
      setError('')
    }
  }

  const handleSubmit = async () => {
    if (newPin.length !== 4) {
      setError('PIN must be 4 digits')
      return
    }

    if (newPin !== confirmPin) {
      setError('PINs do not match. Please try again.')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Hash the new PIN
      const hashedPin = await bcrypt.hash(newPin, 10)
      
      // Update the PIN in Firestore
      await updateDoc(doc(db, 'children', childId), {
        pinHash: hashedPin,
        lastActive: new Date()
      })

      // Success!
      onSuccess()
      
    } catch (err: any) {
      console.error('PIN reset error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      
      {/* Header */}
      <div className="text-center mb-8">
        <div className="flex justify-center mb-6">
          <div className="p-4 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Lock className="w-12 h-12 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Create New PIN
        </h1>
        <p className="text-gray-600 dark:text-gray-300">
          Great job, {childUsername}! Now let's create your new secret PIN.
        </p>
      </div>

      {/* Step 1: Enter New PIN */}
      {step === 1 && (
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
              Enter your new 4-digit PIN
            </label>
            <input
              type="password"
              value={newPin}
              onChange={(e) => handlePinChange(e.target.value)}
              placeholder="••••"
              className="w-full text-center text-3xl font-mono tracking-widest
                       py-4 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:border-green-500 focus:ring-2 focus:ring-green-500/20
                       transition-colors duration-200"
              maxLength={4}
              autoFocus
            />
            
            {/* PIN Dots Visual */}
            <div className="flex justify-center gap-3 mt-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                    index < newPin.length 
                      ? 'bg-green-600 dark:bg-green-400' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mt-4">
              Choose 4 numbers that are special to you but easy to remember
            </p>
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={onCancel}
              variant="outline"
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={handleNext}
              disabled={newPin.length !== 4}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {/* Step 2: Confirm PIN */}
      {step === 2 && (
        <div className="space-y-6">
          <div>
            <label className="block text-lg font-semibold text-gray-700 dark:text-gray-300 mb-4 text-center">
              Enter your PIN again to confirm
            </label>
            <input
              type="password"
              value={confirmPin}
              onChange={(e) => handlePinChange(e.target.value, true)}
              placeholder="••••"
              className="w-full text-center text-3xl font-mono tracking-widest
                       py-4 px-6 border-2 border-gray-300 dark:border-gray-600 rounded-xl
                       bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                       focus:border-green-500 focus:ring-2 focus:ring-green-500/20
                       transition-colors duration-200"
              maxLength={4}
              autoFocus
            />
            
            {/* PIN Dots Visual */}
            <div className="flex justify-center gap-3 mt-4">
              {[0, 1, 2, 3].map((index) => (
                <div
                  key={index}
                  className={`w-4 h-4 rounded-full transition-colors duration-200 ${
                    index < confirmPin.length 
                      ? 'bg-green-600 dark:bg-green-400' 
                      : 'bg-gray-300 dark:bg-gray-600'
                  }`}
                />
              ))}
            </div>

            {/* Match indicator */}
            {confirmPin.length === 4 && (
              <div className="text-center mt-4">
                {newPin === confirmPin ? (
                  <div className="flex items-center justify-center gap-2 text-green-600 dark:text-green-400">
                    <CheckCircle className="w-5 h-5" />
                    <span className="text-sm font-medium">PINs match! ✨</span>
                  </div>
                ) : (
                  <div className="flex items-center justify-center gap-2 text-red-600 dark:text-red-400">
                    <AlertCircle className="w-5 h-5" />
                    <span className="text-sm">PINs don't match</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {error && (
            <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm">
              <AlertCircle className="w-4 h-4" />
              {error}
            </div>
          )}

          <div className="flex gap-3">
            <Button
              onClick={handleBack}
              variant="outline"
              className="flex-1"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={confirmPin.length !== 4 || newPin !== confirmPin || loading}
              className="flex-1 bg-green-600 hover:bg-green-700 text-white"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                'Save New PIN'
              )}
            </Button>
          </div>
        </div>
      )}

      {/* Progress indicator */}
      <div className="flex justify-center mt-8">
        <div className="flex gap-2">
          <div className={`w-3 h-3 rounded-full ${step >= 1 ? 'bg-green-500' : 'bg-gray-300'}`} />
          <div className={`w-3 h-3 rounded-full ${step >= 2 ? 'bg-green-500' : 'bg-gray-300'}`} />
        </div>
      </div>
    </div>
  )
}