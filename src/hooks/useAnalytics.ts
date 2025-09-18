// src/hooks/useAnalytics.ts
// ONE hook to rule them all

import { useEffect, useState } from 'react'
import { analytics, type ChildProgress } from '../services/analytics'
import { useSessionStore } from '../stores/sessionStore'

export const useAnalytics = (childId?: string) => {
  const session = useSessionStore()
  const [progress, setProgress] = useState<ChildProgress | null>(null)
  const [isSessionActive, setIsSessionActive] = useState(false)

  // Set child when provided
  useEffect(() => {
    if (childId) {
      analytics.setChild(childId)
      loadProgress()
    }
  }, [childId])

  // Auto-start session when brain state selected
  useEffect(() => {
    if (childId && session.currentBrainState?.id && !isSessionActive) {
      analytics.startSession()
      setIsSessionActive(true)
      console.log('🎯 Analytics session started')
    }
  }, [childId, session.currentBrainState?.id, isSessionActive])

  // Auto-end session when they complete activities
  useEffect(() => {
    const lastSession = session.completedSessions[session.completedSessions.length - 1]
    if (lastSession && isSessionActive) {
      analytics.endSession()
      setIsSessionActive(false)
      loadProgress() // Refresh data
      console.log('🎯 Analytics session ended')
    }
  }, [session.completedSessions.length, isSessionActive])

  // Load progress data
  const loadProgress = async () => {
    if (childId) {
      const data = await analytics.getProgress(childId)
      setProgress(data)
    }
  }

  // Quick tracking methods
  const trackWordPractice = async (words: string[], correct: string[], minutes: number) => {
    await analytics.trackWordPractice(words, correct, minutes)
    await loadProgress() // Refresh dashboard data
  }

  const trackStoryReading = async (storyTitle: string, minutes: number, completed: boolean) => {
    await analytics.trackStoryReading(storyTitle, minutes, completed)
    await loadProgress()
  }

  const trackCalmCorner = async (minutes: number) => {
    await analytics.trackCalmCorner(minutes)
    await loadProgress()
  }

  const trackAnyActivity = async (
    type: string,
    title: string,
    minutes: number,
    options: {
      accuracy?: number
      completed?: boolean
      skills?: string[]
      struggles?: string[]
    } = {}
  ) => {
    await analytics.trackActivity({
      type,
      title,
      duration: minutes,
      accuracy: options.accuracy,
      completed: options.completed ?? true,
      skills: options.skills,
      struggles: options.struggles
    })
    await loadProgress()
  }

  return {
    // Data
    progress,
    isSessionActive,
    
    // Methods
    trackWordPractice,
    trackStoryReading,
    trackCalmCorner,
    trackAnyActivity,
    
    // Manual refresh
    refreshProgress: loadProgress
  }
}