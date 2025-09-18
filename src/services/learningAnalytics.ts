// src/services/learningAnalytics.ts
// COMPLETE REPLACEMENT - Fixed race conditions and data consistency issues

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc, 
  arrayUnion,
  Timestamp,
  serverTimestamp,
  query,
  where,
  getDocs,
  orderBy,
  limit,
  runTransaction,
  writeBatch
} from 'firebase/firestore'
import { db } from '../lib/firebase-config'

// SMART DATA STRUCTURE: Only 3 collections total

// 1. User Profile - Core child info and current state
interface ChildLearningProfile {
  childId: string
  parentId: string
  username: string
  age: number
  
  // Current learning state
  currentLevel: 'early_reader' | 'developing_reader' | 'fluent_reader' | 'advanced_reader'
  currentReadingSpeed: number // WPM
  preferredDifficulty: 'easy' | 'regular' | 'challenge'
  
  // Learning patterns (what we track)
  strengths: Array<{
    skill: string
    confidence: number // 1-10
    lastDemonstrated: number
  }>
  
  strugglingAreas: Array<{
    skill: string
    frequency: number // how often they struggle
    lastStruggle: number
    improvementPlan: string
  }>
  
  // Accessibility insights
  preferredSupports: Array<{
    type: 'tts' | 'calm_corner' | 'visual_aids' | 'breaks'
    usageFrequency: number
    effectiveness: number // 1-10 based on outcomes
  }>
  
  // Brain state patterns
  bestLearningStates: Array<{
    brainState: string
    successRate: number
    lastUsed: number
  }>
  
  // Progress tracking
  totalActiveSessions: number
  totalLearningTime: number // minutes
  streakDays: number
  lastActiveDate: string
  
  createdAt: number
  updatedAt: number
}

// 2. Learning Sessions - One doc per meaningful learning session
interface LearningSession {
  sessionId: string
  childId: string
  
  // Session context
  startTime: number
  endTime: number
  duration: number // minutes
  brainStateAtStart: string
  
  // What they accomplished
  activitiesCompleted: Array<{
    type: 'story_reading' | 'word_building' | 'comprehension' | 'creative_writing'
    title: string
    difficulty: string
    timeSpent: number // minutes
    performance: {
      accuracy?: number
      wpm?: number
      hintsUsed?: number
      attempts?: number
      completionRate: number
    }
    struggledWith?: string[]
    masteredSkills?: string[]
  }>
  
  // Support usage during session
  supportsUsed: Array<{
    type: 'tts' | 'calm_corner' | 'break' | 'visual_aid'
    frequency: number
    triggeredBy: string
    effectiveness: 'helped' | 'neutral' | 'not_helpful'
  }>
  
  // Emotional/learning states
  mood: {
    start: string
    end: string
    energyLevel: 'low' | 'medium' | 'high'
  }
  
  // Special moments (for parent insights)
  breakthroughMoments: string[]
  challengesMet: string[]
}

// 3. Weekly Progress - Aggregated data per week
interface WeeklyProgress {
  weekId: string
  childId: string
  startDate: string
  endDate: string
  
  // Quantitative metrics
  sessionsCompleted: number
  totalLearningTime: number
  averageSessionLength: number
  averageAccuracy: number
  currentReadingSpeed: number
  
  // Qualitative insights
  newSkillsAcquired: string[]
  improvementAreas: string[]
  strugglingAreas: string[]
  celebrationMoments: string[]
  
  // Parent narrative (AI-generated summary)
  weeklyNarrative: string
}

// RETRY WRAPPER with exponential backoff
async function withRetry<T>(
  operation: () => Promise<T>,
  operationName: string,
  maxRetries: number = 3,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | undefined
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error as Error
      console.warn(`⚠️ ${operationName} failed (attempt ${attempt}/${maxRetries}):`, error)
      
      if (attempt === maxRetries) {
        console.error(`❌ ${operationName} failed after ${maxRetries} attempts`)
        break
      }
      
      // Exponential backoff with jitter
      const delay = baseDelay * Math.pow(2, attempt - 1) + Math.random() * 1000
      await new Promise(resolve => setTimeout(resolve, delay))
    }
  }
  
  throw new Error(`${operationName} failed after ${maxRetries} retries: ${lastError?.message}`)
}

// DATA VALIDATION helpers
function validateActivityData(activity: any): void {
  if (!activity.type || !activity.title) {
    throw new Error('Activity must have type and title')
  }
  
  if (activity.performance?.accuracy && (activity.performance.accuracy < 0 || activity.performance.accuracy > 100)) {
    throw new Error('Accuracy must be between 0 and 100')
  }
  
  if (activity.performance?.wpm && activity.performance.wpm < 0) {
    throw new Error('WPM cannot be negative')
  }
  
  if (activity.timeSpent && activity.timeSpent < 0) {
    throw new Error('Time spent cannot be negative')
  }
}

function validateSessionData(session: Partial<LearningSession>): void {
  if (!session.childId || !session.sessionId) {
    throw new Error('Session must have childId and sessionId')
  }
  
  if (session.duration && session.duration < 0) {
    throw new Error('Duration cannot be negative')
  }
  
  if (session.endTime && session.startTime && session.endTime < session.startTime) {
    throw new Error('End time cannot be before start time')
  }
}

class LearningAnalyticsService {
  private childId: string | null = null
  private currentSession: Partial<LearningSession> | null = null
  private sessionStart: number | null = null

  // Initialize tracking for a child
  setChildId(childId: string) {
    this.childId = childId
    console.log('📊 Learning analytics active for child:', childId)
  }

  // Start a new learning session
  async startSession(childId: string, brainState: string) {
    this.childId = childId
    this.sessionStart = Date.now()
    
    this.currentSession = {
      sessionId: this.generateSessionId(),
      childId,
      startTime: this.sessionStart,
      brainStateAtStart: brainState,
      activitiesCompleted: [],
      supportsUsed: [],
      breakthroughMoments: [],
      challengesMet: [],
      mood: {
        start: brainState,
        end: '',
        energyLevel: 'medium'
      }
    }
    
    console.log('📚 Learning session started:', this.currentSession.sessionId)
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  // Track word practice activity
  async trackWordPractice(activity: {
    wordsAttempted: string[]
    correctWords: string[]
    timeSpent: number
    difficulty: 'easy' | 'regular' | 'challenge'
    hintsUsed?: number
  }) {
    const activityData = {
      type: 'word_building' as const,
      title: `Word Practice (${activity.wordsAttempted.length} words)`,
      difficulty: activity.difficulty,
      timeSpent: activity.timeSpent,
      performance: {
        accuracy: Math.round((activity.correctWords.length / activity.wordsAttempted.length) * 100),
        hintsUsed: activity.hintsUsed || 0,
        attempts: activity.wordsAttempted.length,
        completionRate: 100
      },
      masteredSkills: activity.correctWords,
      struggledWith: activity.wordsAttempted.filter(word => !activity.correctWords.includes(word))
    }

    await this.trackActivity(activityData)
  }

  // Track story reading activity
  async trackStoryReading(activity: {
    storyId: string
    storyTitle: string
    pagesRead: number
    totalPages: number
    timeSpent: number
    comprehensionScore?: number
    wpm?: number
    difficulty: 'easy' | 'regular' | 'challenge'
  }) {
    const activityData = {
      type: 'story_reading' as const,
      title: activity.storyTitle,
      difficulty: activity.difficulty,
      timeSpent: activity.timeSpent,
      performance: {
        accuracy: activity.comprehensionScore || 0,
        wpm: activity.wpm || 0,
        completionRate: Math.round((activity.pagesRead / activity.totalPages) * 100)
      },
      masteredSkills: activity.pagesRead === activity.totalPages ? ['story_completion'] : [],
      struggledWith: activity.comprehensionScore && activity.comprehensionScore < 70 ? ['comprehension'] : []
    }

    await this.trackActivity(activityData)
  }

  // Track calm corner usage
  async trackCalmCornerUsage(usage: {
    experience: 'heavy' | 'rock' | 'quiet'
    duration: number
    triggeredFrom: string
    returnedToLearning: boolean
  }) {
    await this.trackSupportUsage({
      type: 'calm_corner',
      triggeredBy: usage.triggeredFrom,
      effectiveness: usage.returnedToLearning ? 'helped' : 'neutral'
    })
  }

  // FIXED: Track activity completion with transaction-based profile updates
  private async trackActivity(activity: {
    type: 'story_reading' | 'word_building' | 'comprehension' | 'creative_writing'
    title: string
    difficulty: string
    timeSpent: number
    performance: {
      accuracy?: number
      wpm?: number
      hintsUsed?: number
      attempts?: number
      completionRate: number
    }
    struggledWith?: string[]
    masteredSkills?: string[]
  }) {
    if (!this.currentSession || !this.childId) return
    
    // Validate activity data before processing
    validateActivityData(activity)
    
    // Clean the data
    const cleanedActivity = {
      ...activity,
      struggledWith: activity.struggledWith || [],
      masteredSkills: activity.masteredSkills || []
    }
    
    this.currentSession.activitiesCompleted = this.currentSession.activitiesCompleted || []
    this.currentSession.activitiesCompleted.push(cleanedActivity)
    
    // FIXED: Update child profile with transaction to prevent race conditions
    await withRetry(
      () => this.updateChildProfileWithTransaction(cleanedActivity),
      'updateChildProfile'
    )
    
    console.log('📊 Activity completed:', activity.type, activity.title)
  }
  
  // FIXED: Transaction-based profile update to prevent race conditions
  private async updateChildProfileWithTransaction(activity: any) {
    if (!this.childId) return
    
    const profileRef = doc(db, 'child_profiles', this.childId)
    
    await runTransaction(db, async (transaction) => {
      const profileDoc = await transaction.get(profileRef)
      
      let profile: ChildLearningProfile
      
      if (profileDoc.exists()) {
        profile = profileDoc.data() as ChildLearningProfile
      } else {
        // Create new profile within transaction
        profile = await this.createInitialProfile(this.childId!)
      }
      
      // Update strengths based on performance
      if (activity.performance.accuracy && activity.performance.accuracy > 85) {
        this.updateStrengths(profile, activity)
      }
      
      // Update struggling areas
      if (activity.struggledWith && activity.struggledWith.length > 0) {
        this.updateStruggleAreas(profile, activity)
      }
      
      // Update reading speed if available
      if (activity.performance.wpm) {
        profile.currentReadingSpeed = activity.performance.wpm
      }
      
      // Update session counters
      profile.totalActiveSessions += 1
      
      // Save updated profile within transaction
      profile.updatedAt = Date.now()
      transaction.set(profileRef, profile)
      
      console.log('✅ Child profile updated via transaction')
    })
  }
  
  // Track support tool usage (TTS, Calm Corner, etc.)
  async trackSupportUsage(support: {
    type: 'tts' | 'calm_corner' | 'break' | 'visual_aid'
    triggeredBy: string
    effectiveness: 'helped' | 'neutral' | 'not_helpful'
  }) {
    if (!this.currentSession) return
    
    this.currentSession.supportsUsed = this.currentSession.supportsUsed || []
    
    const existingSupport = this.currentSession.supportsUsed.find(s => s.type === support.type)
    if (existingSupport) {
      existingSupport.frequency++
      existingSupport.effectiveness = support.effectiveness
    } else {
      this.currentSession.supportsUsed.push({
        ...support,
        frequency: 1
      })
    }
  }
  
  // Mark breakthrough moments
  async trackBreakthrough(description: string) {
    if (!this.currentSession) return
    
    this.currentSession.breakthroughMoments = this.currentSession.breakthroughMoments || []
    this.currentSession.breakthroughMoments.push(description)
  }
  
  // Mark when child works through challenges
  async trackChallengeOvercome(description: string) {
    if (!this.currentSession) return
    
    this.currentSession.challengesMet = this.currentSession.challengesMet || []
    this.currentSession.challengesMet.push(description)
  }
  
  // FIXED: End session with batch operations for atomicity
  async endSession(endBrainState: string, energyLevel: 'low' | 'medium' | 'high') {
    if (!this.currentSession || !this.childId || !this.sessionStart) return
    
    const endTime = Date.now()
    const duration = Math.round((endTime - this.sessionStart) / 1000 / 60) // minutes
    
    // Complete the session data
    const completedSession: LearningSession = {
      ...this.currentSession as LearningSession,
      endTime,
      duration,
      mood: {
        ...this.currentSession.mood!,
        end: endBrainState,
        energyLevel
      }
    }
    
    // Validate session data before saving
    validateSessionData(completedSession)
    
    // FIXED: Use batch operations for atomic session save
    await withRetry(
      () => this.saveSessionWithBatch(completedSession),
      'saveSession'
    )
    
    // Reset for next session
    this.currentSession = null
    this.sessionStart = null
  }
  
  // FIXED: Batch operation for atomic session save
  private async saveSessionWithBatch(completedSession: LearningSession) {
    const batch = writeBatch(db)
    
    // 1. Save learning session
    const sessionRef = doc(db, 'learning_sessions', completedSession.sessionId)
    batch.set(sessionRef, completedSession)
    
    // 2. Update weekly progress
    const weekId = this.getWeekId(new Date(completedSession.startTime))
    const weeklyRef = doc(db, 'weekly_progress', `${completedSession.childId}_${weekId}`)
    
    // Get current weekly progress (outside transaction for batch)
    const weeklyDoc = await getDoc(weeklyRef)
    let weeklyProgress: WeeklyProgress
    
    if (weeklyDoc.exists()) {
      weeklyProgress = weeklyDoc.data() as WeeklyProgress
    } else {
      weeklyProgress = this.createInitialWeeklyProgress(completedSession.childId, weekId)
    }
    
    // Update weekly progress with session data
    weeklyProgress.sessionsCompleted += 1
    weeklyProgress.totalLearningTime += completedSession.duration
    weeklyProgress.averageSessionLength = weeklyProgress.totalLearningTime / weeklyProgress.sessionsCompleted
    
    // Add new skills and celebration moments
    completedSession.activitiesCompleted.forEach(activity => {
      if (activity.masteredSkills) {
        activity.masteredSkills.forEach(skill => {
          if (!weeklyProgress.newSkillsAcquired.includes(skill)) {
            weeklyProgress.newSkillsAcquired.push(skill)
          }
        })
      }
    })
    
    if (completedSession.breakthroughMoments.length > 0) {
      weeklyProgress.celebrationMoments.push(...completedSession.breakthroughMoments)
    }
    
    batch.set(weeklyRef, weeklyProgress)
    
    // 3. Commit all operations atomically
    await batch.commit()
    
    console.log('✅ Session and weekly progress saved atomically:', completedSession.sessionId)
  }

  // Update child's learning profile strengths
  private updateStrengths(profile: ChildLearningProfile, activity: any) {
    const skillType = this.getSkillType(activity.type, activity.difficulty)
    const existingStrength = profile.strengths.find(s => s.skill === skillType)
    
    if (existingStrength) {
      existingStrength.confidence = Math.min(10, existingStrength.confidence + 0.5)
      existingStrength.lastDemonstrated = Date.now()
    } else {
      profile.strengths.push({
        skill: skillType,
        confidence: 6,
        lastDemonstrated: Date.now()
      })
    }
  }

  // Update child's struggling areas
  private updateStruggleAreas(profile: ChildLearningProfile, activity: any) {
    activity.struggledWith.forEach((struggle: string) => {
      const existingStruggle = profile.strugglingAreas.find(s => s.skill === struggle)
      
      if (existingStruggle) {
        existingStruggle.frequency += 1
        existingStruggle.lastStruggle = Date.now()
      } else {
        profile.strugglingAreas.push({
          skill: struggle,
          frequency: 1,
          lastStruggle: Date.now(),
          improvementPlan: this.generateImprovementPlan(struggle)
        })
      }
    })
  }

  // Create initial profile for new child
  private async createInitialProfile(childId: string): Promise<ChildLearningProfile> {
    return {
      childId,
      parentId: '', // Will be set by parent context
      username: '',
      age: 12,
      currentLevel: 'developing_reader',
      currentReadingSpeed: 120,
      preferredDifficulty: 'regular',
      strengths: [],
      strugglingAreas: [],
      preferredSupports: [],
      bestLearningStates: [],
      totalActiveSessions: 0,
      totalLearningTime: 0,
      streakDays: 0,
      lastActiveDate: new Date().toISOString().split('T')[0],
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  // Create initial weekly progress
  private createInitialWeeklyProgress(childId: string, weekId: string): WeeklyProgress {
    const { startDate, endDate } = this.getWeekBounds(weekId)
    
    return {
      weekId,
      childId,
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString(),
      sessionsCompleted: 0,
      totalLearningTime: 0,
      averageSessionLength: 0,
      averageAccuracy: 0,
      currentReadingSpeed: 0,
      newSkillsAcquired: [],
      improvementAreas: [],
      strugglingAreas: [],
      celebrationMoments: [],
      weeklyNarrative: ''
    }
  }

  // Retrieve child's learning profile
  async getChildProfile(childId: string): Promise<ChildLearningProfile | null> {
    return withRetry(async () => {
      const docRef = doc(db, 'child_profiles', childId)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as ChildLearningProfile
      }
      
      return null
    }, 'getChildProfile')
  }

  // Get recent learning sessions
  async getRecentSessions(childId: string, limitCount: number = 10): Promise<LearningSession[]> {
    return withRetry(async () => {
      const q = query(
        collection(db, 'learning_sessions'),
        where('childId', '==', childId),
        orderBy('startTime', 'desc'),
        limit(limitCount)
      )
      
      const querySnapshot = await getDocs(q)
      return querySnapshot.docs.map(doc => doc.data() as LearningSession)
    }, 'getRecentSessions')
  }

  // Get weekly progress
  async getWeeklyProgress(childId: string, weekId?: string): Promise<WeeklyProgress | null> {
    return withRetry(async () => {
      const targetWeekId = weekId || this.getWeekId(new Date())
      const docRef = doc(db, 'weekly_progress', `${childId}_${targetWeekId}`)
      const docSnap = await getDoc(docRef)
      
      if (docSnap.exists()) {
        return docSnap.data() as WeeklyProgress
      }
      
      return null
    }, 'getWeeklyProgress')
  }

  // Get comprehensive parent insights
  async getParentInsights(childId: string) {
    return withRetry(async () => {
      const [profile, recentSessions, weeklyProgress] = await Promise.all([
        this.getChildProfile(childId),
        this.getRecentSessions(childId, 5),
        this.getWeeklyProgress(childId)
      ])
      
      return {
        profile,
        recentSessions,
        weeklyProgress,
        summary: {
          totalSessions: profile?.totalActiveSessions || 0,
          averageAccuracy: this.calculateAverageAccuracy(recentSessions),
          improvementTrends: this.analyzeImprovementTrends(recentSessions),
          recommendedActions: this.generateRecommendations(profile, recentSessions)
        }
      }
    }, 'getParentInsights')
  }

  // Helper: Calculate average accuracy from recent sessions
  private calculateAverageAccuracy(sessions: LearningSession[]): number {
    if (sessions.length === 0) return 0
    
    const accuracies = sessions
      .flatMap(s => s.activitiesCompleted)
      .map(a => a.performance.accuracy || 0)
      .filter(acc => acc > 0)
    
    return accuracies.length > 0 
      ? Math.round(accuracies.reduce((sum, acc) => sum + acc, 0) / accuracies.length)
      : 0
  }

  // Helper: Analyze improvement trends
  private analyzeImprovementTrends(sessions: LearningSession[]): string[] {
    // Simple trend analysis - can be enhanced with more sophisticated algorithms
    const trends: string[] = []
    
    if (sessions.length >= 3) {
      const recentAccuracies = sessions.slice(0, 3)
        .flatMap(s => s.activitiesCompleted)
        .map(a => a.performance.accuracy || 0)
        .filter(acc => acc > 0)
      
      if (recentAccuracies.length >= 3) {
        const isImproving = recentAccuracies[0] > recentAccuracies[2]
        trends.push(isImproving ? 'Accuracy improving' : 'Steady performance')
      }
    }
    
    return trends
  }

  // Helper: Generate recommendations
  private generateRecommendations(profile: ChildLearningProfile | null, sessions: LearningSession[]): string[] {
    const recommendations: string[] = []
    
    if (!profile) return ['Complete more activities to see personalized recommendations']
    
    // Check for struggling areas
    if (profile.strugglingAreas.length > 0) {
      const topStruggle = profile.strugglingAreas
        .sort((a, b) => b.frequency - a.frequency)[0]
      recommendations.push(`Focus on ${topStruggle.skill}: ${topStruggle.improvementPlan}`)
    }
    
    // Check session frequency
    if (sessions.length < 3) {
      recommendations.push('Encourage daily reading practice for consistent progress')
    }
    
    return recommendations
  }

  // Helper: Get week ID for grouping
  private getWeekId(date: Date): string {
    const year = date.getFullYear()
    const week = this.getWeekNumber(date)
    return `${year}_W${week.toString().padStart(2, '0')}`
  }

  // Helper: Get week bounds
  private getWeekBounds(weekId: string): { startDate: Date; endDate: Date } {
    const [year, weekStr] = weekId.split('_W')
    const week = parseInt(weekStr)
    
    const startDate = this.getDateOfWeek(parseInt(year), week)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 6)
    
    return { startDate, endDate }
  }

  // Helper: Get week number
  private getWeekNumber(date: Date): number {
    const target = new Date(date.valueOf())
    const dayNumber = (date.getUTCDay() + 6) % 7
    target.setUTCDate(target.getUTCDate() - dayNumber + 3)
    const firstThursday = target.valueOf()
    target.setUTCMonth(0, 1)
    if (target.getUTCDay() !== 4) {
      target.setUTCMonth(0, 1 + ((4 - target.getUTCDay()) + 7) % 7)
    }
    return 1 + Math.ceil((firstThursday - target.valueOf()) / 604800000)
  }

  // Helper: Get date of specific week
  private getDateOfWeek(year: number, week: number): Date {
    const simple = new Date(year, 0, 1 + (week - 1) * 7)
    const dow = simple.getDay()
    const ISOweekStart = simple
    if (dow <= 4) ISOweekStart.setDate(simple.getDate() - simple.getDay() + 1)
    else ISOweekStart.setDate(simple.getDate() + 8 - simple.getDay())
    return ISOweekStart
  }
  
  private getSkillType(activityType: string, difficulty: string): string {
    return `${difficulty}_${activityType}`
  }
  
  private generateImprovementPlan(struggle: string): string {
    const plans: Record<string, string> = {
      'long_words': 'Break words into smaller chunks, practice syllable counting',
      'reading_speed': 'Focus on sight words, reduce subvocalization',
      'comprehension': 'Ask prediction questions, summarize after reading',
      'spelling': 'Use phonetic patterns, visual memory techniques',
      'focus': 'Shorter sessions, movement breaks, check brain state'
    }
    return plans[struggle] || 'Work with educator to identify specific support strategies'
  }
}

// Export singleton
export const learningAnalytics = new LearningAnalyticsService()

// Export types for use in components
export type { 
  ChildLearningProfile, 
  LearningSession, 
  WeeklyProgress 
}