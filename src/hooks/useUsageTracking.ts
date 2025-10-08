// src/hooks/useUsageTracking.ts
import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase-config'
import { useTeacherAuth } from '../contexts/TeacherAuthContext'

// ============================================================================
// TYPES
// ============================================================================

interface UsageData {
  month: string // Format: "2025-10"
  adaptiveWorksheetsGenerated: number
  lastReset: Date
  lastGenerated?: Date
}

type Tier = 'free' | 'monthly' | 'annual'

// ============================================================================
// CONSTANTS
// ============================================================================

const FREE_TIER_LIMIT = 2 // Free users get 2 adaptive worksheets per month

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get current month in YYYY-MM format
 */
const getCurrentMonth = (): string => {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, '0')
  return `${year}-${month}`
}

/**
 * Check if usage doc needs reset (new month)
 */
const needsReset = (usageData: UsageData | null): boolean => {
  if (!usageData) return false
  return usageData.month !== getCurrentMonth()
}

// ============================================================================
// HOOK 1: useUserTier
// Returns the user's subscription tier
// ============================================================================

export const useUserTier = () => {
  const { profile, loading: authLoading } = useTeacherAuth()
  
  const tier: Tier = profile?.subscription?.tier || 'free'
  
  return {
    tier,
    loading: authLoading,
    isPremium: tier === 'monthly' || tier === 'annual'
  }
}

// ============================================================================
// HOOK 2: useUsageLimit
// Returns usage stats and whether user can generate more worksheets
// ============================================================================

export const useUsageLimit = () => {
  const { user, profile, loading: authLoading } = useTeacherAuth()
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)

  const tier: Tier = profile?.subscription?.tier || 'free'
  const isPremium = tier === 'pro' || tier === 'school'

  useEffect(() => {
    if (!user || authLoading) {
      setLoading(false)
      return
    }

    const fetchUsage = async () => {
      try {
        const usageRef = doc(db, 'usage', user.uid)
        const usageDoc = await getDoc(usageRef)

        if (usageDoc.exists()) {
          const data = usageDoc.data() as UsageData

          // Check if we need to reset for new month
          if (needsReset(data)) {
            // Reset usage for new month
            const resetData: UsageData = {
              month: getCurrentMonth(),
              adaptiveWorksheetsGenerated: 0,
              lastReset: new Date()
            }
            await setDoc(usageRef, resetData)
            setUsageData(resetData)
          } else {
            setUsageData(data)
          }
        } else {
          // First time - create usage doc
          const newData: UsageData = {
            month: getCurrentMonth(),
            adaptiveWorksheetsGenerated: 0,
            lastReset: new Date()
          }
          await setDoc(usageRef, newData)
          setUsageData(newData)
        }
      } catch (error) {
        console.error('Error fetching usage data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchUsage()
  }, [user, authLoading])

  // Calculate remaining worksheets
  const used = usageData?.adaptiveWorksheetsGenerated || 0
  const limit = isPremium ? Infinity : FREE_TIER_LIMIT
  const remaining = isPremium ? Infinity : Math.max(0, FREE_TIER_LIMIT - used)
  const canGenerate = isPremium || remaining > 0

  return {
    used,
    remaining,
    limit,
    canGenerate,
    loading: loading || authLoading,
    isPremium
  }
}

// ============================================================================
// HOOK 3: useTrackGeneration
// Increments the usage counter after successful generation
// ============================================================================

export const useTrackGeneration = () => {
  const { user } = useTeacherAuth()
  const [isTracking, setIsTracking] = useState(false)

  const trackGeneration = async () => {
    if (!user) {
      console.warn('Cannot track generation: user not authenticated')
      return
    }

    setIsTracking(true)

    try {
      const usageRef = doc(db, 'usage', user.uid)
      const usageDoc = await getDoc(usageRef)

      if (usageDoc.exists()) {
        const data = usageDoc.data() as UsageData

        // Check if we need to reset for new month
        if (needsReset(data)) {
          // Reset and track new generation
          await setDoc(usageRef, {
            month: getCurrentMonth(),
            adaptiveWorksheetsGenerated: 1,
            lastReset: new Date(),
            lastGenerated: new Date()
          })
        } else {
          // Increment existing count
          await updateDoc(usageRef, {
            adaptiveWorksheetsGenerated: increment(1),
            lastGenerated: serverTimestamp()
          })
        }
      } else {
        // First generation ever - create doc
        await setDoc(usageRef, {
          month: getCurrentMonth(),
          adaptiveWorksheetsGenerated: 1,
          lastReset: new Date(),
          lastGenerated: new Date()
        })
      }

      console.log('✅ Usage tracked successfully')
    } catch (error) {
      console.error('Error tracking generation:', error)
    } finally {
      setIsTracking(false)
    }
  }

  return {
    trackGeneration,
    isTracking
  }
}

// ============================================================================
// BONUS: Admin hook to manually reset usage (for testing)
// ============================================================================

export const useResetUsage = () => {
  const { user } = useTeacherAuth()

  const resetUsage = async () => {
    if (!user) return

    try {
      const usageRef = doc(db, 'usage', user.uid)
      await setDoc(usageRef, {
        month: getCurrentMonth(),
        adaptiveWorksheetsGenerated: 0,
        lastReset: new Date()
      })
      console.log('✅ Usage reset successfully')
    } catch (error) {
      console.error('Error resetting usage:', error)
    }
  }

  return { resetUsage }
}