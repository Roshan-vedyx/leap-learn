// src/hooks/useUserAnalytics.ts
import { useEffect } from 'react'
import { useSessionStore } from '../stores/sessionStore'
import { userAnalytics } from '../services/userAnalytics'

// Hook to integrate user analytics with your existing session store
export const useUserAnalytics = (userId?: string) => {
  const session = useSessionStore()

  // Set user when provided
  useEffect(() => {
    if (userId) {
      userAnalytics.setUser(userId)
    }
  }, [userId])

  // Track session start with brain state
  useEffect(() => {
    if (session.currentBrainState && userId) {
      userAnalytics.trackLearningEvent({
        eventType: 'success',
        activityType: 'brain_state_selection',
        brainState: session.currentBrainState.id,
        appSection: 'brain_check'
      })
    }
  }, [session.currentBrainState?.id, userId])

  // Track app section navigation
  useEffect(() => {
    if (session.currentAppSection && userId) {
      userAnalytics.trackLearningEvent({
        eventType: 'reading',
        activityType: 'navigation',
        appSection: session.currentAppSection,
        brainState: session.currentBrainState?.id
      })
    }
  }, [session.currentAppSection, userId])

  // Track calm corner usage
  useEffect(() => {
    const recentUsage = session.calmCornerHistory[session.calmCornerHistory.length - 1]
    if (recentUsage && userId) {
      userAnalytics.trackCalmCornerUse({
        experience: recentUsage.experience,
        duration: recentUsage.duration,
        triggeredFrom: recentUsage.triggeredFrom,
        returnedToLearning: recentUsage.returnedToLearning
      })
    }
  }, [session.calmCornerHistory.length, userId])

  // Track session completion
  useEffect(() => {
    const lastSession = session.completedSessions[session.completedSessions.length - 1]
    if (lastSession && userId) {
      userAnalytics.trackLearningEvent({
        eventType: 'success',
        activityType: 'session_complete',
        duration: parseInt(lastSession.sessionDuration),
        brainState: lastSession.brainState,
        completionRate: 100
      })
    }
  }, [session.completedSessions.length, userId])

  // Return manual tracking methods
  return {
    trackWordPractice: userAnalytics.trackWordPractice,
    trackStoryReading: userAnalytics.trackStoryReading,
    trackCalmCornerUse: userAnalytics.trackCalmCornerUse,
    trackLearningEvent: userAnalytics.trackLearningEvent,
    getUserProgress: userAnalytics.getUserProgress
  }
}