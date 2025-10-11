// src/hooks/useUsageTracking.ts
import { useState, useEffect } from 'react'
import { doc, getDoc, setDoc, updateDoc, increment, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase-config'
import { useTeacherAuth } from '../contexts/TeacherAuthContext'

// ============================================================================
// TYPES
// ============================================================================

interface UsageData {
    weekStartDate: string // ISO date of Monday (e.g., "2025-10-13")
    worksheetsGenerated: number
    lastReset: Date
    lastGenerated?: Date
    totalAllTime: number
    emergencyPacksPurchased?: number
    lastEmergencyPackDate?: Date
}

type Tier = 'free' | 'monthly' | 'annual'

// ============================================================================
// CONSTANTS
// ============================================================================

const FREE_TIER_LIMIT = 3 // Free users get 3 worksheets per week
const EMERGENCY_PACK_BONUS = 2 // Emergency pack adds 2 extra worksheets

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

/**
 * Get the Monday of the current week in ISO format (YYYY-MM-DD)
 */
const getCurrentWeekStart = (): string => {
    const now = new Date()
    const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
    const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Calculate days to Monday
    const monday = new Date(now)
    monday.setDate(now.getDate() + diff)
    monday.setHours(0, 0, 0, 0)
    return monday.toISOString().split('T')[0] // Returns "2025-10-13"
}

/**
 * Check if usage doc needs reset 
 */
const needsReset = (usageData: UsageData | null): boolean => {
    if (!usageData) return false
    const currentWeekStart = getCurrentWeekStart()
    return usageData.weekStartDate !== currentWeekStart
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
          
            // Check if we need to reset for new week
            if (needsReset(data)) {
              const resetData: UsageData = {
                weekStartDate: getCurrentWeekStart(),
                worksheetsGenerated: 0,
                lastReset: new Date(),
                totalAllTime: data.totalAllTime || data.worksheetsGenerated || 0,
                emergencyPacksPurchased: 0 // Reset emergency packs each week
              }
              await setDoc(usageRef, resetData)
              setUsageData(resetData)
            } else {
              setUsageData(data)
            }
          } else {
            // First time - create usage doc
            const newData: UsageData = {
              weekStartDate: getCurrentWeekStart(),
              worksheetsGenerated: 0,
              lastReset: new Date(),
              totalAllTime: 0,
              emergencyPacksPurchased: 0
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
  const used = usageData?.worksheetsGenerated || 0
  const emergencyBonus = (usageData?.emergencyPacksPurchased || 0) * EMERGENCY_PACK_BONUS
  const weeklyLimit = FREE_TIER_LIMIT + emergencyBonus
  const limit = isPremium ? Infinity : weeklyLimit
  const remaining = isPremium ? Infinity : Math.max(0, weeklyLimit - used)
  const canGenerate = isPremium || remaining > 0

  // Calculate next Monday for reset date
  const getNextMonday = () => {
    const weekStart = new Date(usageData?.weekStartDate || getCurrentWeekStart())
    weekStart.setDate(weekStart.getDate() + 7)
    return weekStart
  }
  const resetDate = usageData ? getNextMonday() : new Date()

  return {
    used,
    remaining,
    limit,
    canGenerate,
    loading: loading || authLoading,
    isPremium,
    resetDate
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
      
        // Check if we need to reset for new week
        if (needsReset(data)) {
          // New week - reset count and track first generation
          await setDoc(usageRef, {
            weekStartDate: getCurrentWeekStart(),
            worksheetsGenerated: 1,
            lastReset: new Date(),
            lastGenerated: new Date(),
            totalAllTime: (data.totalAllTime || 0) + 1,
            emergencyPacksPurchased: 0
          })
        } else {
          // Same week - increment count
          await updateDoc(usageRef, {
            worksheetsGenerated: increment(1),
            lastGenerated: serverTimestamp(),
            totalAllTime: increment(1)
          })
        }
      } else {
        // First generation ever
        await setDoc(usageRef, {
          weekStartDate: getCurrentWeekStart(),
          worksheetsGenerated: 1,
          lastReset: new Date(),
          lastGenerated: new Date(),
          totalAllTime: 1,
          emergencyPacksPurchased: 0
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

/**
 * Purchase emergency pack - adds 2 worksheets to current week
 */
export const usePurchaseEmergencyPack = () => {
    const { user } = useTeacherAuth()
    const [isPurchasing, setIsPurchasing] = useState(false)
  
    const purchaseEmergencyPack = async () => {
      if (!user) return { success: false, error: 'Not authenticated' }
  
      setIsPurchasing(true)
      try {
        const usageRef = doc(db, 'usage', user.uid)
        const usageDoc = await getDoc(usageRef)
  
        if (!usageDoc.exists()) {
          return { success: false, error: 'Usage data not found' }
        }
  
        const data = usageDoc.data() as UsageData
  
        // Check if already purchased this week
        if (data.emergencyPacksPurchased && data.emergencyPacksPurchased > 0) {
          return { success: false, error: 'You already purchased an emergency pack this week' }
        }
  
        // TODO: Add Stripe payment here
        // For now, just mock the purchase
        await updateDoc(usageRef, {
          emergencyPacksPurchased: 1,
          lastEmergencyPackDate: new Date()
        })
  
        console.log('✅ Emergency pack purchased successfully')
        return { success: true }
      } catch (error) {
        console.error('Error purchasing emergency pack:', error)
        return { success: false, error: 'Purchase failed' }
      } finally {
        setIsPurchasing(false)
      }
    }
  
    return { purchaseEmergencyPack, isPurchasing }
}