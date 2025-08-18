// src/contexts/ParentAuthContext.tsx - CREATE THIS NEW FILE
import React, { createContext, useContext } from 'react'
import type { User } from 'firebase/auth'
import { useAuthState } from 'react-firebase-hooks/auth'
import { auth } from '../config/firebase'

interface ParentAuthContextType {
  user: User | null
  loading: boolean
  error: Error | undefined
}

const ParentAuthContext = createContext<ParentAuthContextType | undefined>(undefined)

export const ParentAuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, loading, error] = useAuthState(auth)

  return (
    <ParentAuthContext.Provider value={{ user, loading, error }}>
      {children}
    </ParentAuthContext.Provider>
  )
}

export const useParentAuth = () => {
  const context = useContext(ParentAuthContext)
  if (context === undefined) {
    throw new Error('useParentAuth must be used within a ParentAuthProvider')
  }
  return context
}