// src/types/auth.ts - Updated with Google authentication support
export interface ParentProfile {
    parentId: string
    email: string
    displayName?: string | null  // New: for Google display name
    photoURL?: string | null     // New: for Google profile photo
    authProvider: 'email' | 'google'  // New: track auth method
    createdAt: Date
    lastLoginAt?: Date           // New: track last login
    subscription: {
      tier: 'free' | 'premium'
      status: 'active' | 'cancelled' | 'expired'
    }
    children: string[]  // Array of child IDs
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
  
  // Auth states
  export type AuthState = 'loading' | 'authenticated' | 'unauthenticated'
  
  // Error types for better error handling
  export interface AuthError {
    code: string
    message: string
    type: 'google' | 'email' | 'firebase'
  }
  
  // Google auth specific types
  export interface GoogleAuthResult {
    isNewUser: boolean
    user: {
      uid: string
      email: string | null
      displayName: string | null
      photoURL: string | null
    }
  }