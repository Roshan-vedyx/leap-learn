// src/hooks/useUsageTracking.ts
import { useState, useEffect, useCallback } from 'react'
import { doc, getDoc, setDoc, updateDoc, runTransaction, serverTimestamp } from 'firebase/firestore'
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
 * Get the Monday of the current week in LOCAL timezone (YYYY-MM-DD)
 * Fixed: Now uses local timezone instead of UTC to prevent early/late resets
 */
const getCurrentWeekStart = (): string => {
  const now = new Date()
  const dayOfWeek = now.getDay() // 0 = Sunday, 1 = Monday, etc.
  const diff = dayOfWeek === 0 ? -6 : 1 - dayOfWeek // Calculate days to Monday
  const monday = new Date(now)
  monday.setDate(now.getDate() + diff)
  monday.setHours(0, 0, 0, 0)
  
  // Format in local timezone (not UTC)
  const year = monday.getFullYear()
  const month = String(monday.getMonth() + 1).padStart(2, '0')
  const day = String(monday.getDate()).padStart(2, '0')
  return `${year}-${month}-${day}`
}

/**
 * Check if usage doc needs reset
 */
const needsReset = (usageData: UsageData | null): boolean => {
  if (!usageData || !usageData.weekStartDate) return false
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
  const cancelAtPeriodEnd = profile?.subscription?.cancelAtPeriodEnd || false
  const currentPeriodEnd = profile?.subscription?.currentPeriodEnd
    ? (profile.subscription.currentPeriodEnd.toDate?.() || new Date(profile.subscription.currentPeriodEnd))
    : null

  // Grant premium access if: (1) tier is premium OR (2) canceling but still within period
  const isPremium = 
    (tier === 'monthly' || tier === 'annual') || 
    (cancelAtPeriodEnd && currentPeriodEnd && new Date() < currentPeriodEnd)
  
  return {
    tier,
    loading: authLoading,
    isPremium
  }
}

// ============================================================================
// HOOK 2: useUsageLimit
// Returns usage stats and whether user can generate more worksheets
// Now includes refetch capability for real-time updates
// ============================================================================

export const useUsageLimit = () => {
  const { user, profile, loading: authLoading } = useTeacherAuth()
  const [usageData, setUsageData] = useState<UsageData | null>(null)
  const [loading, setLoading] = useState(true)
  const [refetchTrigger, setRefetchTrigger] = useState(0)

  // Fixed: Use consistent tier check (monthly/annual, not pro/school)
  const tier: Tier = profile?.subscription?.tier || 'free'
  const cancelAtPeriodEnd = profile?.subscription?.cancelAtPeriodEnd || false
  const currentPeriodEnd = profile?.subscription?.currentPeriodEnd
    ? (profile.subscription.currentPeriodEnd.toDate?.() || new Date(profile.subscription.currentPeriodEnd))
    : null

  // Grant premium access if: (1) tier is premium OR (2) canceling but still within period
  const isPremium = 
    (tier === 'monthly' || tier === 'annual') || 
    (cancelAtPeriodEnd && currentPeriodEnd && new Date() < currentPeriodEnd)

  const fetchUsage = useCallback(async () => {
    if (authLoading) {
      return  // Stay in loading state while checking auth
    }
    
    if (!user) {
      setUsageData(null)  
      setLoading(false)   
      return              
    }

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
      throw error // Propagate error so UI can handle it
    } finally {
      setLoading(false)
    }
  }, [user, authLoading])

  useEffect(() => {
    fetchUsage()
  }, [fetchUsage, refetchTrigger])

  // Manual refetch function for after purchases or generations
  const refetch = useCallback(() => {
    setRefetchTrigger(prev => prev + 1)
  }, [])

  // Calculate remaining worksheets
  const used = usageData?.worksheetsGenerated || 0
  const emergencyBonus = (usageData?.emergencyPacksPurchased || 0) * EMERGENCY_PACK_BONUS
  const weeklyLimit = FREE_TIER_LIMIT + emergencyBonus
  const limit = isPremium ? Infinity : weeklyLimit
  const remaining = isPremium ? Infinity : Math.max(0, weeklyLimit - used)
  const canGenerate = isPremium || remaining > 0

  // Calculate next Monday for reset date
  const getNextMonday = () => {
    if (!usageData?.weekStartDate) return new Date()
    const weekStart = new Date(usageData.weekStartDate)
    weekStart.setDate(weekStart.getDate() + 7)
    return weekStart
  }
  const resetDate = getNextMonday()
  
  // Calculate days until reset
  const getDaysUntilReset = () => {
    const now = new Date()
    const reset = getNextMonday()
    const diff = Math.ceil((reset.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
    return Math.max(0, diff)
  }
  const daysUntilReset = getDaysUntilReset()

  return {
    used,
    remaining,
    limit,
    canGenerate,
    loading: loading || authLoading,
    isPremium,
    resetDate,
    daysUntilReset,
    refetch // Expose refetch for manual updates
  }
}

// ============================================================================
// HOOK 3: useTrackGeneration
// Increments the usage counter ATOMICALLY using Firestore transactions
// Fixed: Now throws errors on failure to prevent silent limit bypasses
// ============================================================================

export const useTrackGeneration = () => {
  const { user } = useTeacherAuth()
  const [isTracking, setIsTracking] = useState(false)

  const trackGeneration = async (): Promise<void> => {
    if (!user) {
      throw new Error('Cannot track generation: user not authenticated')
    }

    setIsTracking(true)

    try {
      const usageRef = doc(db, 'usage', user.uid)
      
      // Use transaction for atomic read-modify-write
      await runTransaction(db, async (transaction) => {
        const usageDoc = await transaction.get(usageRef)

        if (usageDoc.exists()) {
          const data = usageDoc.data() as UsageData
        
          // Check if we need to reset for new week
          if (needsReset(data)) {
            // New week - reset count and track first generation
            transaction.set(usageRef, {
              weekStartDate: getCurrentWeekStart(),
              worksheetsGenerated: 1,
              lastReset: serverTimestamp(),
              lastGenerated: serverTimestamp(),
              totalAllTime: (data.totalAllTime || 0) + 1,
              emergencyPacksPurchased: 0
            })
          } else {
            // Same week - increment count
            transaction.update(usageRef, {
              worksheetsGenerated: (data.worksheetsGenerated || 0) + 1,
              lastGenerated: serverTimestamp(),
              totalAllTime: (data.totalAllTime || 0) + 1
            })
          }
        } else {
          // First generation ever
          transaction.set(usageRef, {
            weekStartDate: getCurrentWeekStart(),
            worksheetsGenerated: 1,
            lastReset: serverTimestamp(),
            lastGenerated: serverTimestamp(),
            totalAllTime: 1,
            emergencyPacksPurchased: 0
          })
        }
      })

      console.log('✅ Usage tracked successfully')
    } catch (error) {
      console.error('❌ Error tracking generation:', error)
      throw new Error('Failed to track worksheet usage. Please try again.')
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
// HOOK 4: usePurchaseEmergencyPack
// Purchase emergency pack - adds 2 worksheets to current week
// Fixed: Better validation and no page reload
// ============================================================================

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

      // Fixed: Stronger validation (>= instead of > 0)
      if (data.emergencyPacksPurchased && data.emergencyPacksPurchased >= 1) {
        return { 
          success: false, 
          error: 'You already purchased an emergency pack this week. It resets on Monday!' 
        }
      }

      // TODO: Add Stripe payment here before updating Firestore
      // const paymentResult = await processStripePayment(user.uid, 299) // $2.99
      // if (!paymentResult.success) throw new Error('Payment failed')

      // Update Firestore
      await updateDoc(usageRef, {
        emergencyPacksPurchased: 1,
        lastEmergencyPackDate: serverTimestamp()
      })

      console.log('✅ Emergency pack purchased successfully')
      return { success: true }
    } catch (error) {
      console.error('❌ Error purchasing emergency pack:', error)
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Purchase failed' 
      }
    } finally {
      setIsPurchasing(false)
    }
  }

  return { purchaseEmergencyPack, isPurchasing }
}

// ============================================================================
// BONUS: Admin hook to manually reset usage (for testing)
// Fixed: Removed invalid getCurrentMonth() reference
// ============================================================================

export const useResetUsage = () => {
  const { user } = useTeacherAuth()

  const resetUsage = async () => {
    if (!user) return

    try {
      const usageRef = doc(db, 'usage', user.uid)
      await setDoc(usageRef, {
        weekStartDate: getCurrentWeekStart(),
        worksheetsGenerated: 0,
        lastReset: serverTimestamp(),
        totalAllTime: 0,
        emergencyPacksPurchased: 0
      })
      console.log('✅ Usage reset successfully')
    } catch (error) {
      console.error('❌ Error resetting usage:', error)
    }
  }

  return { resetUsage }
}