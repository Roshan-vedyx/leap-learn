// src/types/auth.ts - Updated with recovery system
export interface ParentProfile {
    parentId: string
    email: string
    displayName?: string | null
    photoURL?: string | null
    authProvider: 'email' | 'google'
    createdAt: Date
    lastLoginAt?: Date
    subscription: {
      tier: 'free' | 'premium'
      status: 'active' | 'cancelled' | 'expired'
    }
    children: string[]
  }
  
  export interface SecurityQuestion {
    id: string
    question: string
    answerHash: string
  }
  
  export interface RecoveryAttempts {
    sessionAttempts: number
    lastSessionAttempt: Date
    totalSessions: number
    lastCooldownStart?: Date
    isInCooldown: boolean
    requiresParentReset: boolean
  }
  
  export interface ChildProfile {
    childId: string
    parentId: string
    username: string
    pinHash: string
    createdAt: Date
    lastActive: Date
    
    // Recovery system
    securityQuestions: SecurityQuestion[]
    recoveryAttempts: RecoveryAttempts
    
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
  
  // Recovery system types
  export interface SecurityQuestionOption {
    id: string
    question: string
    placeholder: string
  }
  
  export const SECURITY_QUESTIONS: SecurityQuestionOption[] = [
    {
      id: 'favorite_animal',
      question: "What is your favorite animal?",
      placeholder: "e.g., dog, cat, elephant"
    },
    {
      id: 'bedroom_color',
      question: "What color is your bedroom wall?",
      placeholder: "e.g., blue, white, pink"
    },
    {
      id: 'breakfast_food',
      question: "What do you usually eat for breakfast?",
      placeholder: "e.g., cereal, toast, eggs"
    },
    {
      id: 'favorite_color',
      question: "What is your favorite color?",
      placeholder: "e.g., red, purple, green"
    },
    {
      id: 'pet_name',
      question: "What is your pet's name? (or a pet you'd like to have)",
      placeholder: "e.g., Buddy, Fluffy, Max"
    },
    {
      id: 'favorite_snack',
      question: "What is your favorite snack?",
      placeholder: "e.g., cookies, apples, chips"
    }
  ]
  
  export type AuthState = 'loading' | 'authenticated' | 'unauthenticated'
  
  export interface AuthError {
    code: string
    message: string
    type: 'google' | 'email' | 'firebase'
  }
  
  export interface GoogleAuthResult {
    isNewUser: boolean
    user: {
      uid: string
      email: string | null
      displayName: string | null
      photoURL: string | null
    }
  }