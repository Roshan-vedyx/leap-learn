// src/services/learningAnalytics.ts
// COMPLETE REPLACEMENT for userAnalytics.ts

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
    limit
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
      struggledWith: string[]
      masteredSkills: string[]
    }>
    
    // Support usage
    supportsUsed: Array<{
      type: 'tts' | 'calm_corner' | 'break' | 'visual_aid'
      frequency: number
      triggeredBy: string
      effectiveness: 'helped' | 'neutral' | 'not_helpful'
    }>
    
    // Key moments
    breakthroughMoments: string[] // "First time reading 3-syllable words independently"
    challengesMet: string[] // "Worked through frustration with spelling"
    
    // Overall session outcome
    mood: {
      start: string
      end: string
      energyLevel: 'low' | 'medium' | 'high'
    }
    
    parentNotes?: string // For manual parent observations
  }
  
  // 3. Weekly Progress Summary - Automated insights for parents
  interface WeeklyProgress {
    weekId: string // format: "2025-W35"
    childId: string
    startDate: string
    endDate: string
    
    // High-level progress
    sessionsCompleted: number
    totalLearningTime: number
    averageSessionLength: number
    
    // Skills development
    skillsImproved: Array<{
      skill: string
      progressMade: string
      evidence: string[]
    }>
    
    newSkillsAcquired: string[]
    areasNeedingSupport: string[]
    
    // Patterns and insights
    bestLearningTimes: string[] // "Tuesday afternoons", "After school"
    mostEngagingActivities: string[]
    effectiveStrategies: string[]
    
    // Recommendations for parents
    recommendedFocus: string[]
    celebrationMoments: string[]
    supportSuggestions: string[]
    
    // Auto-generated parent report
    weeklyNarrative: string
    
    createdAt: number
  }
  
  class LearningAnalyticsService {
    private childId: string | null = null
    private currentSession: Partial<LearningSession> | null = null
    private sessionStart: number | null = null
    
    // Start a learning session
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
          end: brainState,
          energyLevel: 'medium'
        }
      }
      
      console.log('📚 Learning session started for child:', childId)
    }
    
    // Track meaningful learning activity completion
    async trackActivityCompletion(activity: {
      type: 'story_reading' | 'word_building' | 'comprehension' | 'creative_writing'
      title: string
      difficulty: 'easy' | 'regular' | 'challenge'
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
      
      // Clean the data
      const cleanedActivity = {
        ...activity,
        struggledWith: activity.struggledWith || [],
        masteredSkills: activity.masteredSkills || []
      }
      
      this.currentSession.activitiesCompleted = this.currentSession.activitiesCompleted || []
      this.currentSession.activitiesCompleted.push(cleanedActivity)
      
      // Update child profile with new insights
      await this.updateChildProfile(cleanedActivity)
      
      console.log('📊 Activity completed:', activity.type, activity.title)
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
    
    // End session and save all data
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
      
      // Save session to Firestore
      try {
        await setDoc(doc(db, 'learning_sessions', completedSession.sessionId), completedSession)
        console.log('✅ Learning session saved:', completedSession.sessionId)
        
        // Update weekly progress
        await this.updateWeeklyProgress(completedSession)
        
      } catch (error) {
        console.error('❌ Failed to save learning session:', error)
      }
      
      // Reset for next session
      this.currentSession = null
      this.sessionStart = null
    }
    
    // Update child's learning profile based on session data
    private async updateChildProfile(activity: any) {
      if (!this.childId) return
      
      try {
        const profileRef = doc(db, 'child_profiles', this.childId)
        const profileDoc = await getDoc(profileRef)
        
        let profile: ChildLearningProfile
        
        if (profileDoc.exists()) {
          profile = profileDoc.data() as ChildLearningProfile
        } else {
          // Create new profile
          profile = await this.createInitialProfile(this.childId)
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
        
        // Save updated profile
        profile.updatedAt = Date.now()
        await setDoc(profileRef, profile)
        
      } catch (error) {
        console.error('❌ Failed to update child profile:', error)
      }
    }
    
    // Helper: Update strengths
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
    
    // Helper: Update struggle areas
    private updateStruggleAreas(profile: ChildLearningProfile, activity: any) {
      activity.struggledWith.forEach((struggle: string) => {
        const existingStruggle = profile.strugglingAreas.find(s => s.skill === struggle)
        if (existingStruggle) {
          existingStruggle.frequency++
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
    
    // Generate weekly progress summary
    private async updateWeeklyProgress(session: LearningSession) {
      const weekId = this.getWeekId(session.startTime)
      const weekProgressRef = doc(db, 'weekly_progress', `${session.childId}_${weekId}`)
      
      try {
        const weekDoc = await getDoc(weekProgressRef)
        
        let weekProgress: WeeklyProgress
        
        if (weekDoc.exists()) {
          weekProgress = weekDoc.data() as WeeklyProgress
        } else {
          weekProgress = this.createInitialWeekProgress(session.childId, weekId)
        }
        
        // Update with session data
        weekProgress.sessionsCompleted++
        weekProgress.totalLearningTime += session.duration
        weekProgress.averageSessionLength = weekProgress.totalLearningTime / weekProgress.sessionsCompleted
        
        // Extract skills from activities
        session.activitiesCompleted.forEach(activity => {
          if (activity.masteredSkills) {
            activity.masteredSkills.forEach(skill => {
              if (!weekProgress.newSkillsAcquired.includes(skill)) {
                weekProgress.newSkillsAcquired.push(skill)
              }
            })
          }
        })
        
        // Auto-generate insights
        weekProgress.weeklyNarrative = await this.generateWeeklyNarrative(weekProgress)
        
        await setDoc(weekProgressRef, weekProgress)
        
      } catch (error) {
        console.error('❌ Failed to update weekly progress:', error)
      }
    }
    
    // === EASY-TO-USE TRACKING METHODS ===
    
    // For word building activities
    async trackWordPractice(data: {
      words: string[]
      correctWords: string[]
      timeSpent: number
      hintsUsed: number
      difficulty: 'easy' | 'regular' | 'challenge'
      theme: string
    }) {
      const accuracy = (data.correctWords.length / data.words.length) * 100
      const struggledWords = data.words.filter(w => !data.correctWords.includes(w))
      
      await this.trackActivityCompletion({
        type: 'word_building',
        title: `${data.theme} Word Building`,
        difficulty: data.difficulty,
        timeSpent: Math.round(data.timeSpent / 60000), // convert to minutes
        performance: {
          accuracy,
          hintsUsed: data.hintsUsed,
          attempts: data.words.length,
          completionRate: accuracy
        },
        struggledWith: struggledWords,
        masteredSkills: data.correctWords.length > data.words.length * 0.8 ? 
          [`${data.difficulty}_word_building`] : []
      })
      
      // Track breakthrough if they mastered challenging words
      if (data.difficulty === 'challenge' && accuracy > 80) {
        await this.trackBreakthrough(`Mastered challenging words in ${data.theme}`)
      }
    }
    
    // For story reading
    async trackStoryReading(data: {
      storyId: string
      storyTitle: string
      readingTime: number
      wordsRead: number
      comprehensionScore?: number
      completionRate: number
      difficulty: string
      struggledWith?: string[]
    }) {
      const wpm = Math.round(data.wordsRead / (data.readingTime / 60000))
      
      await this.trackActivityCompletion({
        type: 'story_reading',
        title: data.storyTitle,
        difficulty: data.difficulty as any,
        timeSpent: Math.round(data.readingTime / 60000),
        performance: {
          wpm,
          accuracy: data.comprehensionScore,
          completionRate: data.completionRate
        },
        struggledWith: data.struggledWith || [],
        masteredSkills: wpm > 100 ? ['fluent_reading'] : []
      })
    }
    
    // For calm corner usage
    async trackCalmCornerUsage(data: {
      experience: 'heavy' | 'rock' | 'quiet'
      duration: number
      triggeredFrom: string
      returnedToLearning: boolean
    }) {
      await this.trackSupportUsage({
        type: 'calm_corner',
        triggeredBy: data.triggeredFrom,
        effectiveness: data.returnedToLearning ? 'helped' : 'neutral'
      })
      
      if (data.returnedToLearning) {
        await this.trackChallengeOvercome('Used calm corner and returned to learning')
      }
    }
    
    // === EASY DATA RETRIEVAL METHODS ===
    
    // Get child's current learning profile
    async getChildProfile(childId: string): Promise<ChildLearningProfile | null> {
      try {
        const profileDoc = await getDoc(doc(db, 'child_profiles', childId))
        return profileDoc.exists() ? profileDoc.data() as ChildLearningProfile : null
      } catch (error) {
        console.error('❌ Failed to get child profile:', error)
        return null
      }
    }
    
    // Get child's recent sessions
    async getRecentSessions(childId: string, limit: number = 10): Promise<LearningSession[]> {
      try {
        const sessionsQuery = query(
          collection(db, 'learning_sessions'),
          where('childId', '==', childId),
          orderBy('startTime', 'desc'),
          limit(limit)
        )
        const snapshot = await getDocs(sessionsQuery)
        return snapshot.docs.map(doc => doc.data() as LearningSession)
      } catch (error) {
        console.error('❌ Failed to get recent sessions:', error)
        return []
      }
    }
    
    // Get child's weekly progress
    async getWeeklyProgress(childId: string, weekId?: string): Promise<WeeklyProgress | null> {
      const targetWeekId = weekId || this.getCurrentWeekId()
      
      try {
        const weekDoc = await getDoc(doc(db, 'weekly_progress', `${childId}_${targetWeekId}`))
        return weekDoc.exists() ? weekDoc.data() as WeeklyProgress : null
      } catch (error) {
        console.error('❌ Failed to get weekly progress:', error)
        return null
      }
    }
    
    // Get parent-friendly summary
    async getParentInsights(childId: string): Promise<{
      profile: ChildLearningProfile | null
      recentWeeks: WeeklyProgress[]
      quickStats: {
        totalSessions: number
        averageWPM: number
        topStrengths: string[]
        needsSupport: string[]
        streakDays: number
      }
    }> {
      const profile = await this.getChildProfile(childId)
      
      // Get last 4 weeks
      const recentWeeks: WeeklyProgress[] = []
      for (let i = 0; i < 4; i++) {
        const weekId = this.getWeekId(Date.now() - (i * 7 * 24 * 60 * 60 * 1000))
        const weekProgress = await this.getWeeklyProgress(childId, weekId)
        if (weekProgress) recentWeeks.push(weekProgress)
      }
      
      const quickStats = profile ? {
        totalSessions: profile.totalActiveSessions,
        averageWPM: profile.currentReadingSpeed,
        topStrengths: profile.strengths
          .sort((a, b) => b.confidence - a.confidence)
          .slice(0, 3)
          .map(s => s.skill),
        needsSupport: profile.strugglingAreas
          .sort((a, b) => b.frequency - a.frequency)
          .slice(0, 3)
          .map(s => s.skill),
        streakDays: profile.streakDays
      } : {
        totalSessions: 0,
        averageWPM: 0,
        topStrengths: [],
        needsSupport: [],
        streakDays: 0
      }
      
      return { profile, recentWeeks, quickStats }
    }
    
    // === HELPER METHODS ===
    
    private generateSessionId(): string {
      return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    }
    
    private getWeekId(timestamp: number): string {
      const date = new Date(timestamp)
      const year = date.getFullYear()
      const weekNum = this.getWeekNumber(date)
      return `${year}-W${weekNum.toString().padStart(2, '0')}`
    }
    
    private getCurrentWeekId(): string {
      return this.getWeekId(Date.now())
    }
    
    private getWeekNumber(date: Date): number {
      const start = new Date(date.getFullYear(), 0, 1)
      const diff = date.getTime() - start.getTime()
      return Math.ceil(diff / (7 * 24 * 60 * 60 * 1000))
    }
    
    private async createInitialProfile(childId: string): Promise<ChildLearningProfile> {
      const profile: ChildLearningProfile = {
        childId,
        parentId: '', // Will be set from child record
        username: '',
        age: 0,
        currentLevel: 'early_reader',
        currentReadingSpeed: 0,
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
      
      await setDoc(doc(db, 'child_profiles', childId), profile)
      return profile
    }
    
    private createInitialWeekProgress(childId: string, weekId: string): WeeklyProgress {
      const [year, week] = weekId.split('-W')
      const startDate = this.getDateOfWeek(parseInt(year), parseInt(week))
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 6)
      
      return {
        weekId,
        childId,
        startDate: startDate.toISOString().split('T')[0],
        endDate: endDate.toISOString().split('T')[0],
        sessionsCompleted: 0,
        totalLearningTime: 0,
        averageSessionLength: 0,
        skillsImproved: [],
        newSkillsAcquired: [],
        areasNeedingSupport: [],
        bestLearningTimes: [],
        mostEngagingActivities: [],
        effectiveStrategies: [],
        recommendedFocus: [],
        celebrationMoments: [],
        supportSuggestions: [],
        weeklyNarrative: '',
        createdAt: Date.now()
      }
    }
    
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
    
    private async generateWeeklyNarrative(progress: WeeklyProgress): string {
      // Simple template-based narrative for now
      // TODO: Use AI to generate personalized insights
      
      const sessions = progress.sessionsCompleted
      const time = Math.round(progress.totalLearningTime)
      const skills = progress.newSkillsAcquired.join(', ')
      
      return `This week your child completed ${sessions} learning sessions, spending ${time} minutes engaged in reading activities. ${skills ? `They developed new skills in: ${skills}.` : ''} ${progress.celebrationMoments.length > 0 ? `Celebrate their progress!` : ''}`
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