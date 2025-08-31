// src/hooks/useUserAnalytics.ts - REPLACE YOUR EXISTING FILE
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

  // Track session start with brain state - ONLY if brain state exists
  useEffect(() => {
    if (session.currentBrainState?.id && userId) {
      userAnalytics.trackLearningEvent({
        eventType: 'success',
        activityType: 'brain_state_selection',
        brainState: session.currentBrainState.id, // Safe - we checked it exists
        appSection: 'brain_check'
      })
    }
  }, [session.currentBrainState?.id, userId])

  // Track app section navigation - ONLY include brainState if it exists
  useEffect(() => {
    if (session.currentAppSection && userId) {
      const eventData: any = {
        eventType: 'reading',
        activityType: 'navigation',
        appSection: session.currentAppSection
      }
      
      // Only add brainState if it's not undefined
      if (session.currentBrainState?.id) {
        eventData.brainState = session.currentBrainState.id
      }
      
      userAnalytics.trackLearningEvent(eventData)
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
        returnedToLearning: recentUsage.returnedToLearning,
        brainState: session.currentBrainState?.id // Safe - undefined is handled
      })
    }
  }, [session.calmCornerHistory.length, userId])

  // Track session completion
  useEffect(() => {
    const lastSession = session.completedSessions[session.completedSessions.length - 1]
    if (lastSession && userId) {
      const eventData: any = {
        eventType: 'success',
        activityType: 'session_complete',
        duration: parseInt(lastSession.sessionDuration),
        completionRate: 100
      }
      
      // Only add brainState if it exists
      if (lastSession.brainState) {
        eventData.brainState = lastSession.brainState
      }
      
      userAnalytics.trackLearningEvent(eventData)
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