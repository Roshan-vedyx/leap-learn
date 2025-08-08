// src/stores/sessionStore.ts
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
}

interface SessionState {
  // Current session state
  currentBrainState: BrainState | null
  currentStoryId: string | null
  creativeResponse: CreativeResponse | null
  
  // Session history
  completedSessions: SessionData[]
  
  // UI state
  isInCalmCorner: boolean
  
  // Actions
  setBrainState: (brainState: BrainState) => void
  setStoryId: (storyId: string) => void
  setCreativeResponse: (response: CreativeResponse) => void
  completeSession: () => void
  resetSession: () => void
  toggleCalmCorner: () => void
  
  // Getters
  getCurrentMood: () => 'calm' | 'energetic' | 'focused' | 'neutral'
  getSessionProgress: () => {
    step: number
    totalSteps: number
    progressPercent: number
  }
}

export const useSessionStore = create<SessionState>()(
  persist(
    (set, get) => ({
      // Initial state
      currentBrainState: null,
      currentStoryId: null,
      creativeResponse: null,
      completedSessions: [],
      isInCalmCorner: false,

      // Actions
      setBrainState: (brainState: BrainState) => {
        set({ currentBrainState: brainState })
      },

      setStoryId: (storyId: string) => {
        set({ currentStoryId: storyId })
      },

      setCreativeResponse: (response: CreativeResponse) => {
        set({ creativeResponse: response })
      },

      completeSession: () => {
        const state = get()
        const sessionData: SessionData = {
          completedAt: new Date().toISOString(),
          brainState: state.currentBrainState?.id || 'unknown',
          hasCreativeResponse: !!state.creativeResponse,
          sessionDuration: '8-12 minutes'
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
          isInCalmCorner: false
        })
      },

      toggleCalmCorner: () => {
        set((state) => ({ isInCalmCorner: !state.isInCalmCorner }))
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
      }
    }),
    {
      name: 'vedyx-leap-session', // localStorage key
      partialize: (state) => ({
        // Only persist necessary data
        completedSessions: state.completedSessions,
        currentBrainState: state.currentBrainState,
        currentStoryId: state.currentStoryId,
        creativeResponse: state.creativeResponse
      })
    }
  )
)