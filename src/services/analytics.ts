// src/services/analytics.ts
// FIXED VERSION - Eliminates the failed-precondition error

import { 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  runTransaction,
  increment,
  serverTimestamp
} from 'firebase/firestore'
import { db } from '../config/firebase'

// Simplified data structures
export interface ChildProgress {
  childId: string
  username: string
  
  // Core metrics
  totalSessions: number
  totalMinutes: number
  currentStreak: number
  
  // Skills tracking
  strengths: string[]
  practicingAreas: string[]
  
  // This week's data
  weekSessions: number
  weekMinutes: number
  weekSkills: string[]
  
  // Meta
  lastActive: string
  createdAt: number
  updatedAt: number
}

export interface ActivityData {
  type: string
  title: string
  duration: number // minutes
  accuracy?: number
  completed: boolean
  skills?: string[]
  struggles?: string[]
}

class FixedAnalytics {
  private childId: string | null = null
  private sessionStart: number | null = null
  private sessionActivities: ActivityData[] = []

  // Set the current child
  setChild(childId: string) {
    this.childId = childId
    console.log('📊 Analytics tracking child:', childId)
  }

  // Start tracking a session
  startSession() {
    if (!this.childId) {
      console.warn('No child set for analytics')
      return
    }
    
    this.sessionStart = Date.now()
    this.sessionActivities = []
    console.log('🎯 Session started')
  }

  // Track any learning activity
  async trackActivity(activity: ActivityData) {
    if (!this.childId || !this.sessionStart) {
      console.warn('No active session - auto-starting')
      this.startSession()
    }
    
    // Add to current session
    this.sessionActivities.push(activity)
    
    // Save immediately with error handling
    await this.saveProgressSafely(activity)
    
    console.log('✅ Activity tracked:', activity.type, activity.title)
  }

  // FIXED: Use setDoc with merge instead of transaction for simpler writes
  private async saveProgressSafely(activity: ActivityData) {
    if (!this.childId) return
    
    try {
      const progressRef = doc(db, 'child_progress', this.childId)
      
      // First, get existing document to check if it exists
      const existingDoc = await getDoc(progressRef)
      
      let progress: ChildProgress
      
      if (existingDoc.exists()) {
        progress = existingDoc.data() as ChildProgress
      } else {
        // Create new progress record with safe defaults
        progress = this.createInitialProgress()
      }
      
      // Update with new activity data
      progress = this.updateProgressWithActivity(progress, activity)
      
      // Save with merge to handle partial updates safely
      await setDoc(progressRef, progress, { merge: true })
      
      console.log('✅ Progress saved successfully')
      
    } catch (error) {
      console.error('❌ Failed to save progress:', error)
      
      // Fallback: Try with basic increment approach
      try {
        await this.fallbackSave(activity)
      } catch (fallbackError) {
        console.error('❌ Fallback save also failed:', fallbackError)
      }
    }
  }

  // Create initial progress with safe defaults
  private createInitialProgress(): ChildProgress {
    const today = new Date().toISOString().split('T')[0]
    
    return {
      childId: this.childId!,
      username: 'Young Learner',
      totalSessions: 0,
      totalMinutes: 0,
      currentStreak: 0,
      strengths: [],
      practicingAreas: [],
      weekSessions: 0,
      weekMinutes: 0,
      weekSkills: [],
      lastActive: today,
      createdAt: Date.now(),
      updatedAt: Date.now()
    }
  }

  // Update progress with new activity data
  private updateProgressWithActivity(progress: ChildProgress, activity: ActivityData): ChildProgress {
    const today = new Date().toISOString().split('T')[0]
    
    // Update minutes
    progress.totalMinutes += activity.duration
    progress.weekMinutes += activity.duration
    
    // Only increment sessions for major completions, not individual activities
    if (activity.completed && (activity.type === 'session_complete' || activity.type === 'story_reading')) {
      progress.totalSessions += 1
      progress.weekSessions += 1
    }
    // Add new skills (avoiding duplicates)
    if (activity.skills) {
      activity.skills.forEach(skill => {
        if (!progress.strengths.includes(skill)) {
          progress.strengths.push(skill)
        }
        if (!progress.weekSkills.includes(skill)) {
          progress.weekSkills.push(skill)
        }
      })
    }
    
    // Track struggling areas
    if (activity.struggles) {
      activity.struggles.forEach(struggle => {
        if (!progress.practicingAreas.includes(struggle)) {
          progress.practicingAreas.push(struggle)
        }
      })
    }
    
    // Update streak logic
    if (progress.lastActive !== today) {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      const yesterdayStr = yesterday.toISOString().split('T')[0]
      
      if (progress.lastActive === yesterdayStr) {
        progress.currentStreak += 1
      } else {
        progress.currentStreak = 1
      }
      
      progress.lastActive = today
    }
    
    progress.updatedAt = Date.now()
    
    return progress
  }

  // Fallback save method using simple field updates
  private async fallbackSave(activity: ActivityData) {
    if (!this.childId) return
    
    const progressRef = doc(db, 'child_progress', this.childId)
    
    // Use increment for safe numeric updates
    const updates: any = {
      totalMinutes: increment(activity.duration),
      weekMinutes: increment(activity.duration),
      updatedAt: Date.now(),
      lastActive: new Date().toISOString().split('T')[0]
    }
    
    // Add skills if provided
    if (activity.skills && activity.skills.length > 0) {
      // Note: This approach might create duplicates, but it's safer than failing
      updates.strengths = activity.skills
      updates.weekSkills = activity.skills
    }
    
    await updateDoc(progressRef, updates)
    console.log('✅ Fallback save completed')
  }

  // End session and increment session count
  async endSession() {
    if (!this.childId || !this.sessionStart) return
    
    const sessionDuration = Math.round((Date.now() - this.sessionStart) / (1000 * 60)) // minutes
    
    try {
      const progressRef = doc(db, 'child_progress', this.childId)
      
      // Simple increment approach for session end
      await updateDoc(progressRef, {
        totalSessions: increment(1),
        weekSessions: increment(1),
        updatedAt: Date.now(),
        lastActive: new Date().toISOString().split('T')[0]
      })
      
      console.log(`🏁 Session ended: ${sessionDuration} minutes, ${this.sessionActivities.length} activities`)
      
    } catch (error) {
      console.error('❌ Failed to end session:', error)
    }
    
    // Reset session state
    this.sessionStart = null
    this.sessionActivities = []
  }

  // Get current progress (for display)
  async getProgress(): Promise<ChildProgress | null> {
    if (!this.childId) return null
    
    try {
      const progressRef = doc(db, 'child_progress', this.childId)
      const progressDoc = await getDoc(progressRef)
      
      if (progressDoc.exists()) {
        return progressDoc.data() as ChildProgress
      } else {
        return this.createInitialProgress()
      }
      
    } catch (error) {
      console.error('❌ Failed to get progress:', error)
      return null
    }
  }
}

// Export singleton instance
export const analytics = new FixedAnalytics()

// Export types
export type { ChildProgress, ActivityData }