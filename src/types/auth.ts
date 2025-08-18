// src/types/auth.ts - CREATE THIS NEW FILE
export interface ParentProfile {
    parentId: string
    email: string
    createdAt: Date
    subscription: {
      tier: 'free' | 'premium'
      status: 'active' | 'trial' | 'expired'
      expiresAt?: Date
    }
    children: string[]
  }
  
  export interface ChildProfile {
    childId: string
    parentId: string
    username: string
    pinHash: string
    createdAt: Date
    lastActive: Date
    preferences: {
      fontSize: 'default' | 'large' | 'extra-large'
      highContrast: boolean
      reducedMotion: boolean
      audioSupport: boolean
    }
    metadata: {
      totalSessions: number
      lastActiveDate: Date | null
      currentLevel: string
      allowWeeklyReport: boolean
    }
  }
  
  export interface ChildSession {
    childId: string
    parentId: string
    username: string
    timestamp: number
    expiresAt: number
  }