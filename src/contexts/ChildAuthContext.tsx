// src/contexts/ChildAuthContext.tsx - UPDATED FOR SIMPLIFIED FLOW
import React, { createContext, useContext, useState, useEffect } from 'react'
import bcrypt from 'bcryptjs'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
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
    checkExistingSession()
  }, [])

  const checkExistingSession = () => {
    try {
      const savedSession = localStorage.getItem('child-session')
      if (savedSession) {
        const session = JSON.parse(savedSession) as ChildSession
        
        // Check if session is still valid (24 hours)
        if (session.expiresAt > Date.now()) {
          console.log('🔄 Found valid child session:', session.username)
          setChildSession(session)
        } else {
          console.log('⏰ Child session expired, removing...')
          localStorage.removeItem('child-session')
        }
      }
    } catch (error) {
      console.error('❌ Error checking child session:', error)
      localStorage.removeItem('child-session')
    } finally {
      setLoading(false)
    }
  }

  const authenticateChild = async (childId: string, pin: string): Promise<boolean> => {
    try {
      console.log('🔑 Authenticating child:', childId)
      setLoading(true)
      
      // Get child profile from Firestore
      const childDoc = await getDoc(doc(db, 'children', childId))
      if (!childDoc.exists()) {
        console.log('❌ Child not found in database')
        return false
      }

      const childData = childDoc.data() as ChildProfile
      
      // Verify PIN
      const isValidPin = await bcrypt.compare(pin, childData.pinHash)
      if (!isValidPin) {
        console.log('❌ Invalid PIN provided')
        return false
      }

      // Create 24-hour session
      const session: ChildSession = {
        childId: childData.childId || childId, // Use childId from doc if available
        parentId: childData.parentId,
        username: childData.username,
        timestamp: Date.now(),
        expiresAt: Date.now() + (24 * 60 * 60 * 1000) // 24 hours
      }

      // Update last active timestamp in database
      await updateDoc(doc(db, 'children', childId), {
        lastActive: new Date(),
        'metadata.totalSessions': (childData.metadata.totalSessions || 0) + 1,
        'metadata.lastActiveDate': new Date()
      })

      // Save session
      setChildSession(session)
      localStorage.setItem('child-session', JSON.stringify(session))
      
      console.log('✅ Child authenticated successfully:', childData.username)
      return true
      
    } catch (error) {
      console.error('❌ Authentication error:', error)
      return false
    } finally {
      setLoading(false)
    }
  }

  const logout = () => {
    console.log('👋 Child logging out')
    setChildSession(null)
    localStorage.removeItem('child-session')
    
    // Redirect to main login screen
    window.location.href = '/'
  }

  return (
    <ChildAuthContext.Provider value={{ 
      childSession, 
      authenticateChild, 
      logout, 
      loading 
    }}>
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