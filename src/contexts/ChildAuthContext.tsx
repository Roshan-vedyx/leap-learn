// src/contexts/ChildAuthContext.tsx - CREATE THIS NEW FILE
import React, { createContext, useContext, useState, useEffect } from 'react'
import bcrypt from 'bcryptjs'
import { doc, getDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import type { ChildSession, ChildProfile } from '../types/auth'

interface ChildAuthContextType {
  childSession: ChildSession | null
  authenticateChild: (childId: string, pin: string) => Promise<boolean>
  logout: () => void
  loading: boolean
}

const ChildAuthContext = createContext<ChildAuthContextType | undefined>(undefined)

export const ChildAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [childSession, setChildSession] = useState<ChildSession | null>(null)
  const [loading, setLoading] = useState(true)

  // Check for existing session on mount
  useEffect(() => {
    const savedSession = localStorage.getItem('child-session')
    if (savedSession) {
      try {
        const session = JSON.parse(savedSession) as ChildSession
        // Check if session is still valid (24 hours)
        if (session.expiresAt > Date.now()) {
          setChildSession(session)
        } else {
          localStorage.removeItem('child-session')
        }
      } catch (error) {
        localStorage.removeItem('child-session')
      }
    }
    setLoading(false)
  }, [])

  const authenticateChild = async (childId: string, pin: string): Promise<boolean> => {
    try {
      setLoading(true)
      
      // Get child profile from Firestore
      const childDoc = await getDoc(doc(db, 'children', childId))
      if (!childDoc.exists()) {
        return false
      }

      const childData = childDoc.data() as ChildProfile
      
      // Verify PIN
      const isValidPin = await bcrypt.compare(pin, childData.pinHash)
      if (!isValidPin) {
        return false
      }

      // Create session
      const session: ChildSession = {
        childId: childData.childId,
        parentId: childData.parentId,
        username: childData.username,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }

      setChildSession(session)
      localStorage.setItem('child-session', JSON.stringify(session))
      
      return true
    } catch (error) {
      console.error('Authentication error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    setChildSession(null)
    localStorage.removeItem('child-session')
  }

  return (
    <ChildAuthContext.Provider value={{ childSession, authenticateChild, logout, loading }}>
      {children}
    </ChildAuthContext.Provider>
  )
}

export const useChildAuth = () => {
  const context = useContext(ChildAuthContext)
  if (context === undefined) {
    throw new Error('useChildAuth must be used within a ChildAuthProvider')
  }
  return context
}