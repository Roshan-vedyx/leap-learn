// src/services/userAnalytics.ts - REPLACE YOUR EXISTING FILE
import { collection, doc, addDoc, setDoc, getDoc, serverTimestamp } from 'firebase/firestore'
import { db } from '../lib/firebase-config'

// Individual user event types
interface UserLearningEvent {
  userId: string
  sessionId: string
  eventType: 'reading' | 'word_practice' | 'story_complete' | 'calm_corner' | 'struggle' | 'success'
  timestamp: number
  
  // Context - all optional to handle undefined values
  brainState?: string
  activityType?: string
  difficulty?: 'easy' | 'regular' | 'challenge'
  appSection?: string
  
  // Performance metrics
  duration?: number
  attempts?: number
  hintsUsed?: number
  wordsPerMinute?: number
  accuracy?: number
  
  // Learning data
  storyId?: string
  wordsPracticed?: string[]
  struggledWith?: string[]
  completionRate?: number
  
  // Accessibility usage
  ttsUsed?: boolean
  accessibilityMode?: string
  fontSizeUsed?: string
  
  // Calm corner specific
  calmCornerExperience?: 'heavy' | 'rock' | 'quiet'
  returnedToLearning?: boolean
}

// Aggregated user progress (stored per user)
interface UserProgress {
  userId: string
  totalSessions: number
  totalTimeSpent: number // minutes
  lastActive: number
  
  // Learning progression
  currentLevel: string
  readingSpeed: {
    current: number // words per minute
    trend: 'improving' | 'stable' | 'declining'
    history: Array<{ date: string; wpm: number }>
  }
  
  // Difficulty adaptation
  preferredDifficulty: 'easy' | 'regular' | 'challenge'
  adaptationHistory: Array<{
    date: string
    from: string
    to: string
    reason: string
  }>
  
  // Engagement patterns
  favoriteActivities: Array<{ activity: string; count: number }>
  preferredBrainStates: Array<{ state: string; count: number }>
  averageSessionLength: number
  
  // Struggle patterns
  commonStruggles: Array<{ area: string; count: number }>
  improvementAreas: string[]
  
  // Accessibility insights
  accessibilityUsage: {
    ttsUsageRate: number
    preferredFontSize: string
    calmCornerUsageRate: number
  }
  
  // Parent insights
  weeklyProgress: {
    sessionsCompleted: number
    skillsImproved: string[]
    recommendedFocus: string[]
  }
}

class UserAnalyticsService {
  private userId: string | null = null
  private sessionId: string
  private sessionStartTime: number
  private eventQueue: UserLearningEvent[] = []

  constructor() {
    this.sessionId = this.generateSessionId()
    this.sessionStartTime = Date.now()
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Set current user (called when user logs in)
  setUser(userId: string) {
    this.userId = userId
    console.log('📊 User analytics active for:', userId)
  }

  // Clean event data to remove undefined values
  private cleanEventData(event: any): any {
    const cleaned = {} as any
    
    Object.keys(event).forEach(key => {
      const value = event[key]
      if (value !== undefined && value !== null) {
        cleaned[key] = value
      }
    })
    
    return cleaned
  }

  // Track individual learning events
  async trackLearningEvent(event: Omit<UserLearningEvent, 'userId' | 'sessionId' | 'timestamp'>) {
    if (!this.userId) {
      console.log('📊 Analytics: No user set, skipping event')
      return
    }

    const fullEvent: UserLearningEvent = {
      ...event,
      userId: this.userId,
      sessionId: this.sessionId,
      timestamp: Date.now()
    }

    // Clean undefined values before sending to Firestore
    const cleanedEvent = this.cleanEventData(fullEvent)

    // Add to queue for batch processing
    this.eventQueue.push(fullEvent)

    // Save to Firestore (individual events for detailed tracking)
    try {
      await addDoc(collection(db, 'user_events'), cleanedEvent)
      console.log('📝 Learning event tracked:', event.eventType)
    } catch (error) {
      console.error('❌ Failed to track learning event:', error)
    }

    // Process for aggregated insights
    this.processEventForInsights(fullEvent)
  }

  // Process events for aggregated user progress
  private async processEventForInsights(event: UserLearningEvent) {
    if (!this.userId) return

    try {
      const userProgressRef = doc(db, 'user_progress', this.userId)
      const progressDoc = await getDoc(userProgressRef)
      
      let currentProgress: UserProgress
      
      if (progressDoc.exists()) {
        currentProgress = progressDoc.data() as UserProgress
      } else {
        // Initialize new user progress document
        currentProgress = this.createInitialUserProgress(this.userId)
        console.log('📊 Creating new user progress document for:', this.userId)
      }

      // Update progress based on event type
      currentProgress = this.updateProgressWithEvent(currentProgress, event)
      
      // Use setDoc instead of updateDoc to handle both create and update
      await setDoc(userProgressRef, currentProgress)
      
    } catch (error) {
      console.error('❌ Failed to update user progress:', error)
    }
  }

  // Create initial user progress document
  private createInitialUserProgress(userId: string): UserProgress {
    return {
      userId,
      totalSessions: 0,
      totalTimeSpent: 0,
      lastActive: Date.now(),
      currentLevel: 'beginner',
      readingSpeed: { current: 0, trend: 'stable', history: [] },
      preferredDifficulty: 'regular',
      adaptationHistory: [],
      favoriteActivities: [],
      preferredBrainStates: [],
      averageSessionLength: 0,
      commonStruggles: [],
      improvementAreas: [],
      accessibilityUsage: {
        ttsUsageRate: 0,
        preferredFontSize: 'default',
        calmCornerUsageRate: 0
      },
      weeklyProgress: {
        sessionsCompleted: 0,
        skillsImproved: [],
        recommendedFocus: []
      }
    }
  }

  private updateProgressWithEvent(progress: UserProgress, event: UserLearningEvent): UserProgress {
    const updated = { ...progress }
    updated.lastActive = event.timestamp

    switch (event.eventType) {
      case 'reading':
        if (event.wordsPerMinute) {
          updated.readingSpeed.current = event.wordsPerMinute
          updated.readingSpeed.history.push({
            date: new Date().toISOString(),
            wpm: event.wordsPerMinute
          })
          // Keep last 30 readings
          updated.readingSpeed.history = updated.readingSpeed.history.slice(-30)
        }
        break

      case 'struggle':
        if (event.struggledWith) {
          event.struggledWith.forEach(struggle => {
            const existing = updated.commonStruggles.find(s => s.area === struggle)
            if (existing) {
              existing.count++
            } else {
              updated.commonStruggles.push({ area: struggle, count: 1 })
            }
          })
        }
        break

      case 'success':
        if (event.activityType) {
          const existing = updated.favoriteActivities.find(a => a.activity === event.activityType!)
          if (existing) {
            existing.count++
          } else {
            updated.favoriteActivities.push({ activity: event.activityType, count: 1 })
          }
        }
        break

      case 'calm_corner':
        updated.accessibilityUsage.calmCornerUsageRate = 
          (updated.accessibilityUsage.calmCornerUsageRate + 1) / updated.totalSessions
        break
    }

    // Track brain state preferences (only if brainState exists)
    if (event.brainState) {
      const existing = updated.preferredBrainStates.find(s => s.state === event.brainState!)
      if (existing) {
        existing.count++
      } else {
        updated.preferredBrainStates.push({ state: event.brainState, count: 1 })
      }
    }

    // Track accessibility usage
    if (event.ttsUsed) {
      updated.accessibilityUsage.ttsUsageRate++
    }

    return updated
  }

  // Convenience methods for common events
  async trackWordPractice(data: {
    wordsAttempted: string[]
    wordsCorrect: string[]
    timePerWord: number
    hintsUsed: number
    difficulty: 'easy' | 'regular' | 'challenge'
    brainState?: string // Made optional
  }) {
    await this.trackLearningEvent({
      eventType: 'word_practice',
      activityType: 'word_building',
      duration: data.timePerWord * data.wordsAttempted.length,
      attempts: data.wordsAttempted.length,
      hintsUsed: data.hintsUsed,
      difficulty: data.difficulty,
      wordsPracticed: data.wordsAttempted,
      struggledWith: data.wordsAttempted.filter(w => !data.wordsCorrect.includes(w)),
      accuracy: (data.wordsCorrect.length / data.wordsAttempted.length) * 100,
      brainState: data.brainState // Only include if provided
    })
  }

  async trackStoryReading(data: {
    storyId: string
    readingTime: number
    wordsRead: number
    completionRate: number
    brainState?: string // Made optional
    difficulty: string
  }) {
    const wpm = data.wordsRead / (data.readingTime / 60000) // convert ms to minutes
    
    await this.trackLearningEvent({
      eventType: 'reading',
      activityType: 'story_reading',
      storyId: data.storyId,
      duration: data.readingTime,
      completionRate: data.completionRate,
      wordsPerMinute: wpm,
      brainState: data.brainState, // Only include if provided
      difficulty: data.difficulty as any
    })
  }

  async trackCalmCornerUse(data: {
    experience: 'heavy' | 'rock' | 'quiet'
    duration: number
    triggeredFrom: string
    returnedToLearning: boolean
    brainState?: string // Made optional
  }) {
    await this.trackLearningEvent({
      eventType: 'calm_corner',
      activityType: 'sensory_regulation',
      duration: data.duration,
      appSection: data.triggeredFrom,
      calmCornerExperience: data.experience,
      returnedToLearning: data.returnedToLearning,
      brainState: data.brainState // Only include if provided
    })
  }

  // Get current user progress (for parent dashboard)
  async getUserProgress(): Promise<UserProgress | null> {
    if (!this.userId) return null

    try {
      const progressDoc = await getDoc(doc(db, 'user_progress', this.userId))
      return progressDoc.exists() ? (progressDoc.data() as UserProgress) : null
    } catch (error) {
      console.error('❌ Failed to get user progress:', error)
      return null
    }
  }
}

// Export singleton
export const userAnalytics = new UserAnalyticsService()

// Export types
export type { UserLearningEvent, UserProgress }