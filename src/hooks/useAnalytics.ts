// src/hooks/useAnalytics.ts
// Clean React hook for analytics - no more console errors

import { useEffect, useState } from 'react'
import { analytics, type ChildProgress, type ActivityData } from '../services/analytics'

export const useAnalytics = (childId?: string) => {
  const [progress, setProgress] = useState<ChildProgress | null>(null)
  const [isTracking, setIsTracking] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Initialize child tracking when childId changes
  useEffect(() => {
    if (childId) {
      analytics.setChild(childId)
      analytics.startSession()
      setIsTracking(true)
      loadProgress()
    } else {
      setIsTracking(false)
      setProgress(null)
    }
  }, [childId])

  // Load current progress
  const loadProgress = async () => {
    try {
      setError(null)
      const currentProgress = await analytics.getProgress()
      setProgress(currentProgress)
    } catch (err) {
      console.error('Failed to load progress:', err)
      setError('Failed to load progress')
    }
  }

  // Track activity with error handling
  const trackActivity = async (activity: ActivityData) => {
    if (!isTracking) {
      console.warn('Analytics not initialized')
      return false
    }

    try {
      setError(null)
      await analytics.trackActivity(activity)
      
      // Refresh progress after tracking
      await loadProgress()
      
      console.log('✅ Activity tracked successfully')
      return true
      
    } catch (err) {
      console.error('Failed to track activity:', err)
      setError('Failed to track activity')
      return false
    }
  }

  // Quick track methods for common activities
  const trackAnyActivity = async (type: string, title: string, duration: number, extraData?: Partial<ActivityData>) => {
    const activity: ActivityData = {
      type,
      title,
      duration,
      completed: true,
      ...extraData
    }
    
    return await trackActivity(activity)
  }

  const trackStoryReading = async (storyTitle: string, minutes: number, wpm?: number) => {
    return await trackAnyActivity('story_reading', storyTitle, minutes, {
      accuracy: wpm ? Math.min(100, Math.max(0, (wpm - 50) * 2)) : undefined, // rough accuracy estimate
      skills: ['reading_fluency', 'comprehension']
    })
  }

  const trackWordBuilding = async (gameTitle: string, minutes: number, accuracy?: number) => {
    return await trackAnyActivity('word_building', gameTitle, minutes, {
      accuracy,
      skills: accuracy && accuracy > 80 ? ['phonics', 'spelling'] : undefined,
      struggles: accuracy && accuracy < 60 ? ['phonics'] : undefined
    })
  }

  const trackStruggle = async (activityTitle: string, skillArea: string) => {
    return await trackAnyActivity('struggle_support', activityTitle, 1, {
      completed: false,
      struggles: [skillArea]
    })
  }

  // End session
  const endSession = async () => {
    if (!isTracking) return
    
    try {
      setError(null)
      await analytics.endSession()
      setIsTracking(false)
      
      console.log('📊 Session ended successfully')
      
    } catch (err) {
      console.error('Failed to end session:', err)
      setError('Failed to end session')
    }
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (isTracking) {
        analytics.endSession().catch(console.error)
      }
    }
  }, [isTracking])

  return {
    // State
    progress,
    isTracking,
    error,
    
    // Actions
    trackActivity,
    trackAnyActivity,
    trackStoryReading,
    trackWordBuilding,
    trackStruggle,
    endSession,
    refreshProgress: loadProgress,
    
    // Quick data access
    totalSessions: progress?.totalSessions || 0,
    totalMinutes: progress?.totalMinutes || 0,
    currentStreak: progress?.currentStreak || 0,
    strengths: progress?.strengths || [],
    weekMinutes: progress?.weekMinutes || 0
  }
}