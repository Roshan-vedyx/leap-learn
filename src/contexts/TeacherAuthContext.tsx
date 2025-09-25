// src/contexts/TeacherAuthContext.tsx
import React, { createContext, useContext, useEffect, useState } from 'react'
import { onAuthStateChanged } from 'firebase/auth'
import type { User } from 'firebase/auth'
import { doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../lib/firebase-config'

export interface TeacherProfile {
  teacherId: string
  email: string
  displayName: string
  photoURL?: string | null
  authProvider: 'email' | 'google'
  userType: 'teacher'
  teacherInfo?: {
    school?: string
    gradesTaught: string[]
    subjects: string[]
  }
  createdAt: Date
  subscription?: {
    tier: 'free' | 'pro' | 'school'
    status: 'active' | 'cancelled'
  }
}

interface TeacherAuthContextType {
  user: User | null
  profile: TeacherProfile | null
  loading: boolean
  signOut: () => Promise<void>
}

const TeacherAuthContext = createContext<TeacherAuthContextType>({
  user: null,
  profile: null,
  loading: true,
  signOut: async () => {}
})

export const useTeacherAuth = () => {
  const context = useContext(TeacherAuthContext)
  if (!context) {
    throw new Error('useTeacherAuth must be used within TeacherAuthProvider')
  }
  return context
}

export const TeacherAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null)
  const [profile, setProfile] = useState<TeacherProfile | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        try {
          // Check if user is a teacher
          const profileDoc = await getDoc(doc(db, 'teachers', user.uid))
          if (profileDoc.exists()) {
            const profileData = profileDoc.data() as TeacherProfile
            setUser(user)
            setProfile(profileData)
          } else {
            // Not a teacher - clear auth
            setUser(null)
            setProfile(null)
          }
        } catch (error) {
          console.error('Error fetching teacher profile:', error)
          setUser(null)
          setProfile(null)
        }
      } else {
        setUser(null)
        setProfile(null)
      }
      setLoading(false)
    })

    return unsubscribe
  }, [])

  const signOut = async () => {
    try {
      await auth.signOut()
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <TeacherAuthContext.Provider value={{ user, profile, loading, signOut }}>
      {children}
    </TeacherAuthContext.Provider>
  )
}