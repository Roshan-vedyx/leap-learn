// src/hooks/useAnalyticsIntegration.ts
import { useEffect } from 'react'
import { useSessionStore } from '../stores/sessionStore'
import { analytics } from '../services/analytics'
import { useUserAnalytics } from './useUserAnalytics'

// Hook that automatically tracks session store changes
export const useAnalyticsIntegration = (userId?: string) => {
  const session = useSessionStore()
  
  // Add user-level analytics
  const userAnalytics = useUserAnalytics(userId)

  useEffect(() => {
    // Track when brain state is set (session effectively starts)
    if (session.currentBrainState) {
      analytics.sessionStart(
        session.currentBrainState.id,
        // You can add accessibility mode from your preferences here
      )
    }
  }, [session.currentBrainState])

  useEffect(() => {
    // Track when user enters different app sections
    if (session.currentAppSection) {
      analytics.track('activity_start', {
        app_section: session.currentAppSection,
        brain_state: session.currentBrainState?.id
      })
    }
  }, [session.currentAppSection])

  useEffect(() => {
    // Track Calm Corner usage as struggle moments
    if (session.isInCalmCorner) {
      analytics.struggle({
        activity: 'calm_corner_needed',
        attempts: session.calmCornerHistory.length
      })
    }
  }, [session.isInCalmCorner])

  useEffect(() => {
    // Track session completions as success
    if (session.completedSessions.length > 0) {
      const lastSession = session.completedSessions[session.completedSessions.length - 1]
      if (lastSession) {
        analytics.success({
          activity: 'session_complete',
          duration: parseInt(lastSession.sessionDuration)
        })
      }
    }
  }, [session.completedSessions.length])

  // Return both app-level and user-level tracking methods
  return {
    // App-level analytics
    trackStruggle: analytics.struggle,
    trackSuccess: analytics.success,
    trackActivity: analytics.activityStart,
    track: analytics.track,
    
    // User-level analytics
    trackWordPractice: userAnalytics.trackWordPractice,
    trackStoryReading: userAnalytics.trackStoryReading,
    trackCalmCornerUse: userAnalytics.trackCalmCornerUse,
    getUserProgress: userAnalytics.getUserProgress
  }
}