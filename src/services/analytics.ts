// src/services/analytics.ts
// REPLACE ALL analytics files with this ONE unified system

import { 
    collection, 
    doc, 
    setDoc, 
    getDoc, 
    updateDoc,
    getDocs,
    query,
    where,
    orderBy,
    limit,
    writeBatch,
    runTransaction,
    increment
  } from 'firebase/firestore'
  import { db } from '../config/firebase'
  
  // SIMPLE data structures - only what we need
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
  
  class UnifiedAnalytics {
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
      
      // Save immediately to Firestore
      await this.saveProgress(activity)
      
      console.log('✅ Activity tracked:', activity.type, activity.title)
    }
  
    // Save progress to Firestore
    private async saveProgress(activity: ActivityData) {
      if (!this.childId) return
      
      try {
        await runTransaction(db, async (transaction) => {
          const progressRef = doc(db, 'child_progress', this.childId!)
          const progressDoc = await transaction.get(progressRef)
          
          let progress: ChildProgress
          
          if (progressDoc.exists()) {
            progress = progressDoc.data() as ChildProgress
          } else {
            // Create new progress record
            progress = {
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
              lastActive: new Date().toISOString().split('T')[0],
              createdAt: Date.now(),
              updatedAt: Date.now()
            }
          }
          
          // Update with new activity
          progress.totalMinutes += activity.duration
          progress.weekMinutes += activity.duration
          
          // Add new skills
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
          
          // Check if it's a new day (update streak)
          const today = new Date().toISOString().split('T')[0]
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
          
          transaction.set(progressRef, progress, { merge: true })
        })
        
      } catch (error) {
        console.error('❌ Failed to save progress:', error)
      }
    }
  
    // End session and increment session count
    async endSession() {
      if (!this.childId || !this.sessionStart) return
      
      const sessionDuration = Math.round((Date.now() - this.sessionStart) / 1000 / 60)
      
      try {
        // Increment session count
        const progressRef = doc(db, 'child_progress', this.childId)
        await updateDoc(progressRef, {
          totalSessions: increment(1),
          weekSessions: increment(1),
          updatedAt: Date.now()
        })
        
        console.log(`✅ Session ended - ${sessionDuration} minutes, ${this.sessionActivities.length} activities`)
        
      } catch (error) {
        console.error('❌ Failed to end session:', error)
      }
      
      // Reset
      this.sessionStart = null
      this.sessionActivities = []
    }
  
    // Get child's progress data
    async getProgress(childId: string): Promise<ChildProgress | null> {
      try {
        const docRef = doc(db, 'child_progress', childId)
        const docSnap = await getDoc(docRef)
        
        if (docSnap.exists()) {
          return docSnap.data() as ChildProgress
        }
        
        return null
      } catch (error) {
        console.error('Error getting progress:', error)
        return null
      }
    }
  
    // Quick track methods for common activities
    async trackWordPractice(words: string[], correct: string[], minutes: number) {
      const accuracy = words.length > 0 ? (correct.length / words.length) * 100 : 0
      
      await this.trackActivity({
        type: 'word_practice',
        title: `Word Practice - ${words.length} words`,
        duration: minutes,
        accuracy,
        completed: true,
        skills: accuracy > 80 ? ['word_recognition'] : [],
        struggles: accuracy < 60 ? ['word_recognition'] : []
      })
    }
  
    async trackStoryReading(storyTitle: string, minutes: number, completed: boolean) {
      await this.trackActivity({
        type: 'story_reading',
        title: storyTitle,
        duration: minutes,
        completed,
        skills: completed ? ['reading_comprehension'] : [],
        struggles: !completed ? ['reading_focus'] : []
      })
    }
  
    async trackCalmCorner(minutes: number) {
      await this.trackActivity({
        type: 'calm_corner',
        title: 'Calm Corner Visit',
        duration: minutes,
        completed: true,
        skills: ['self_regulation']
      })
    }
  
    // Reset weekly data (call this weekly via cloud function or manual)
    async resetWeeklyData(childId: string) {
      try {
        const progressRef = doc(db, 'child_progress', childId)
        await updateDoc(progressRef, {
          weekSessions: 0,
          weekMinutes: 0,
          weekSkills: [],
          updatedAt: Date.now()
        })
      } catch (error) {
        console.error('Error resetting weekly data:', error)
      }
    }
  }
  
  // Export single instance
  export const analytics = new UnifiedAnalytics()
  
  // Export types
  export type { ChildProgress, ActivityData }