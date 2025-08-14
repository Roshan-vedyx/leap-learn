// src/stores/sessionStore.ts - Enhanced with Calm Corner analytics
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

// Types for the store
interface BrainState {
  id: string
  label: string
  emoji: string
  description: string
  color: string
  mood: 'calm' | 'energetic' | 'focused' | 'neutral'
}

interface CreativeResponse {
  prompt: string
  response: string
  timestamp: string
}

interface SessionData {
  completedAt: string
  brainState: string
  hasCreativeResponse: boolean
  sessionDuration: string
  usedCalmCorner?: boolean
  calmCornerUsage?: {
    experience: 'heavy' | 'rock' | 'quiet'
    duration: number
    triggeredFrom: string // which part of app triggered it
  }[]
}

// Calm Corner specific types
interface CalmCornerPreferences {
  mostUsed: 'heavy' | 'rock' | 'quiet'
  sessionCount: number
  averageDuration: number
  lastUsed?: string
  timeOfDayPatterns?: {
    morning: number
    afternoon: number
    evening: number
  }
  triggerPatterns?: Record<string, number> // which app sections trigger overwhelm
}

interface CalmCornerUsage {
  experience: 'heavy' | 'rock' | 'quiet'
  duration: number
  timestamp: string
  triggeredFrom: string
  returnedToLearning: boolean
}

interface SessionState {
  // Current session state
  currentBrainState: BrainState | null
  currentStoryId: string | null
  creativeResponse: CreativeResponse | null
  currentAppSection: string // track where user is in app
  
  // Session history
  completedSessions: SessionData[]
  
  // UI state
  isInCalmCorner: boolean
  
  // Calm Corner analytics
  calmCornerPreferences: CalmCornerPreferences
  calmCornerHistory: CalmCornerUsage[]
  
  // Actions
  setBrainState: (brainState: BrainState) => void
  setStoryId: (storyId: string) => void
  setCreativeResponse: (response: CreativeResponse) => void
  setCurrentAppSection: (section: string) => void
  completeSession: () => void
  resetSession: () => void
  toggleCalmCorner: () => void
  
  // Calm Corner specific actions
  recordCalmCornerUsage: (usage: Omit<CalmCornerUsage, 'timestamp'>) => void
  updateCalmCornerPreferences: (prefs: Partial<CalmCornerPreferences>) => void
  shouldShowCalmCornerSuggestion: () => boolean
  
  // Getters
  getCurrentMood: () => 'calm' | 'energetic' | 'focused' | 'neutral'
  getSessionProgress: () => {
    step: number
    totalSteps: number
    progressPercent: number
  }
  getCalmCornerAnalytics: () => {
    totalUsage: number
    preferredExperience: 'heavy' | 'rock' | 'quiet'
    averageSessionLength: number
    successRate: number // percentage who return to learning
    mostTriggeredSection: string
  }
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentBrainState: null,
      currentStoryId: null,
      creativeResponse: null,
      currentAppSection: 'home',
      completedSessions: [],
      isInCalmCorner: false,
      
      // Calm Corner initial state
      calmCornerPreferences: {
        mostUsed: 'heavy',
        sessionCount: 0,
        averageDuration: 0,
        timeOfDayPatterns: {
          morning: 0,
          afternoon: 0,
          evening: 0
        },
        triggerPatterns: {}
      },
      calmCornerHistory: [],

      // Actions
      setBrainState: (brainState: BrainState) => {
        set({ currentBrainState: brainState })
      },

      setStoryId: (storyId: string) => {
        set({ currentStoryId: storyId, currentAppSection: 'story' })
      },

      setCreativeResponse: (response: CreativeResponse) => {
        set({ creativeResponse: response, currentAppSection: 'create' })
      },

      setCurrentAppSection: (section: string) => {
        set({ currentAppSection: section })
      },

      completeSession: () => {
        const state = get()
        const sessionData: SessionData = {
          completedAt: new Date().toISOString(),
          brainState: state.currentBrainState?.id || 'unknown',
          hasCreativeResponse: !!state.creativeResponse,
          sessionDuration: '8-12 minutes',
          usedCalmCorner: state.calmCornerHistory.length > 0,
          calmCornerUsage: state.calmCornerHistory.filter(usage => 
            new Date(usage.timestamp).getTime() > Date.now() - 30 * 60 * 1000 // last 30 minutes
          )
        }
        
        set({
          completedSessions: [...state.completedSessions, sessionData]
        })
      },

      resetSession: () => {
        set({
          currentBrainState: null,
          currentStoryId: null,
          creativeResponse: null,
          isInCalmCorner: false,
          currentAppSection: 'home',
          calmCornerHistory: [] // Reset for new session
        })
      },

      toggleCalmCorner: () => {
        set((state) => ({ isInCalmCorner: !state.isInCalmCorner }))
      },

      // Calm Corner specific actions
      recordCalmCornerUsage: (usage: Omit<CalmCornerUsage, 'timestamp'>) => {
        const state = get()
        const newUsage: CalmCornerUsage = {
          ...usage,
          timestamp: new Date().toISOString()
        }
        
        // Update preferences
        const updatedPrefs = {
          ...state.calmCornerPreferences,
          mostUsed: usage.experience,
          sessionCount: state.calmCornerPreferences.sessionCount + 1,
          averageDuration: Math.round(
            (state.calmCornerPreferences.averageDuration * state.calmCornerPreferences.sessionCount + usage.duration) /
            (state.calmCornerPreferences.sessionCount + 1)
          ),
          lastUsed: newUsage.timestamp
        }

        // Update time of day patterns
        const hour = new Date().getHours()
        if (hour >= 6 && hour < 12) {
          updatedPrefs.timeOfDayPatterns!.morning++
        } else if (hour >= 12 && hour < 18) {
          updatedPrefs.timeOfDayPatterns!.afternoon++
        } else {
          updatedPrefs.timeOfDayPatterns!.evening++
        }

        // Update trigger patterns
        if (!updatedPrefs.triggerPatterns) updatedPrefs.triggerPatterns = {}
        updatedPrefs.triggerPatterns[usage.triggeredFrom] = 
          (updatedPrefs.triggerPatterns[usage.triggeredFrom] || 0) + 1

        set({
          calmCornerHistory: [...state.calmCornerHistory, newUsage],
          calmCornerPreferences: updatedPrefs
        })
      },

      updateCalmCornerPreferences: (prefs: Partial<CalmCornerPreferences>) => {
        const state = get()
        set({
          calmCornerPreferences: { ...state.calmCornerPreferences, ...prefs }
        })
      },

      shouldShowCalmCornerSuggestion: () => {
        const state = get()
        const now = Date.now()
        const recentUsage = state.calmCornerHistory.filter(usage => 
          now - new Date(usage.timestamp).getTime() < 10 * 60 * 1000 // last 10 minutes
        )
        
        // Show suggestion if user seems to be struggling
        // (multiple sections visited quickly, or time spent in section suggests difficulty)
        return recentUsage.length === 0 && 
               state.calmCornerPreferences.triggerPatterns?.[state.currentAppSection] > 2
      },

      // Getters
      getCurrentMood: () => {
        const state = get()
        return state.currentBrainState?.mood || 'neutral'
      },

      getSessionProgress: () => {
        const state = get()
        let step = 0
        const totalSteps = 4 // Brain Check → Story → Create → Celebrate
        
        if (state.currentBrainState) step = 1
        if (state.currentStoryId) step = 2
        if (state.creativeResponse) step = 3
        
        return {
          step,
          totalSteps,
          progressPercent: (step / totalSteps) * 100
        }
      },

      getCalmCornerAnalytics: () => {
        const state = get()
        const history = state.calmCornerHistory
        
        if (history.length === 0) {
          return {
            totalUsage: 0,
            preferredExperience: 'heavy' as const,
            averageSessionLength: 0,
            successRate: 0,
            mostTriggeredSection: 'none'
          }
        }

        // Calculate preferred experience
        const experienceCounts = history.reduce((acc, usage) => {
          acc[usage.experience] = (acc[usage.experience] || 0) + 1
          return acc
        }, {} as Record<string, number>)
        
        const preferredExperience = Object.entries(experienceCounts)
          .sort(([,a], [,b]) => b - a)[0][0] as 'heavy' | 'rock' | 'quiet'

        // Calculate success rate (those who returned to learning)
        const successfulReturns = history.filter(usage => usage.returnedToLearning).length
        const successRate = Math.round((successfulReturns / history.length) * 100)

        // Find most triggered section
        const triggers = state.calmCornerPreferences.triggerPatterns || {}
        const mostTriggeredSection = Object.entries(triggers)
          .sort(([,a], [,b]) => b - a)[0]?.[0] || 'none'

        return {
          totalUsage: history.length,
          preferredExperience,
          averageSessionLength: state.calmCornerPreferences.averageDuration,
          successRate,
          mostTriggeredSection
        }
      }
    }),
    {
      name: 'vedyx-leap-session', // localStorage key
      partialize: (state) => ({
        // Persist all necessary data
        completedSessions: state.completedSessions,
        currentBrainState: state.currentBrainState,
        currentStoryId: state.currentStoryId,
        creativeResponse: state.creativeResponse,
        calmCornerPreferences: state.calmCornerPreferences,
        calmCornerHistory: state.calmCornerHistory.slice(-50) // Keep last 50 usage records
      })
    }
  )
)