// src/hooks/useLearningAnalytics.ts
// REPLACE useUserAnalytics.ts with this file

import { useEffect, useState } from 'react'
import { useSessionStore } from '../stores/sessionStore'
import { learningAnalytics, type ChildLearningProfile } from '../services/learningAnalytics'

export const useLearningAnalytics = (childId?: string) => {
  const session = useSessionStore()
  const [isSessionActive, setIsSessionActive] = useState(false)
  const [childProfile, setChildProfile] = useState<ChildLearningProfile | null>(null)

  // Start session when brain state is selected
  useEffect(() => {
    if (childId && session.currentBrainState?.id && !isSessionActive) {
      learningAnalytics.startSession(childId, session.currentBrainState.id)
      setIsSessionActive(true)
      console.log('📚 Learning session started')
    }
  }, [childId, session.currentBrainState?.id, isSessionActive])

  // Auto-track calm corner usage
  useEffect(() => {
    const recentUsage = session.calmCornerHistory[session.calmCornerHistory.length - 1]
    if (recentUsage && isSessionActive) {
      learningAnalytics.trackCalmCornerUsage({
        experience: recentUsage.experience,
        duration: recentUsage.duration,
        triggeredFrom: recentUsage.triggeredFrom,
        returnedToLearning: recentUsage.returnedToLearning
      })
    }
  }, [session.calmCornerHistory.length, isSessionActive])

  // End session when they complete or leave
  useEffect(() => {
    const lastSession = session.completedSessions[session.completedSessions.length - 1]
    if (lastSession && isSessionActive) {
      const endBrainState = lastSession.brainState || session.currentBrainState?.id || 'unknown'
      learningAnalytics.endSession(endBrainState, 'medium') // TODO: track actual energy level
      setIsSessionActive(false)
      console.log('📚 Learning session ended')
    }
  }, [session.completedSessions.length])

  // Load child profile on mount
  useEffect(() => {
    if (childId) {
      learningAnalytics.getChildProfile(childId).then(setChildProfile)
    }
  }, [childId])

  // Return simple tracking methods for components
  return {
    // Main tracking methods
    trackWordPractice: learningAnalytics.trackWordPractice,
    trackStoryReading: learningAnalytics.trackStoryReading,
    trackCalmCornerUsage: learningAnalytics.trackCalmCornerUsage,
    
    // Support and breakthrough tracking
    trackSupportUsage: learningAnalytics.trackSupportUsage,
    trackBreakthrough: learningAnalytics.trackBreakthrough,
    trackChallengeOvercome: learningAnalytics.trackChallengeOvercome,
    
    // Data retrieval
    getChildProfile: () => learningAnalytics.getChildProfile(childId!),
    getRecentSessions: (limit?: number) => learningAnalytics.getRecentSessions(childId!, limit),
    getWeeklyProgress: (weekId?: string) => learningAnalytics.getWeeklyProgress(childId!, weekId),
    getParentInsights: () => learningAnalytics.getParentInsights(childId!),
    
    // Current state
    isSessionActive,
    childProfile
  }
}