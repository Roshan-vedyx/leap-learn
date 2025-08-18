// src/components/auth/AuthGate.tsx - CHILD-FIRST FLOW VERSION
import React, { useState, useEffect } from 'react'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { useParentAuth } from '../../contexts/ParentAuthContext'
import { useChildAuth } from '../../contexts/ChildAuthContext'
import { ParentLogin } from './ParentLogin'
import { PinEntry } from './PinEntry'
import { db } from '../../config/firebase'
import type { ChildProfile } from '../../types/auth'

interface AuthGateProps {
  children: React.ReactNode
  requireChild?: boolean
  requireParent?: boolean
}

export const AuthGate: React.FC<AuthGateProps> = ({ 
  children, 
  requireChild = false,
  requireParent = false
}) => {
  const { user: parentUser, loading: parentLoading } = useParentAuth()
  const { childSession, loading: childLoading } = useChildAuth()
  const [availableChildren, setAvailableChildren] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null)
  const [loadingChildren, setLoadingChildren] = useState(false)
  const [debugMode] = useState(true)

  // === PARENT-ONLY ROUTES ===
  if (requireParent) {
    if (parentLoading) {
      return <LoadingScreen message="Loading parent dashboard..." />
    }
    
    if (!parentUser) {
      return <ParentLogin />
    }
    
    // Parent is authenticated, show parent content
    return <>{children}</>
  }

  // === CHILD-FIRST ROUTES ===
  if (requireChild) {
    // Check if child is already authenticated
    if (childSession) {
      if (debugMode) console.log('Child already authenticated:', childSession.username)
      return <>{children}</>
    }

    // Child needs authentication - check if we have any children in system
    useEffect(() => {
      const fetchAllChildren = async () => {
        setLoadingChildren(true)
        try {
          // For child-first flow, we need to check if ANY children exist
          // We'll get all children and let them select their profile
          const snapshot = await getDocs(collection(db, 'children'))
          const childrenData = snapshot.docs.map(doc => doc.data() as ChildProfile)
          setAvailableChildren(childrenData)
          
          if (debugMode) {
            console.log('All children in system:', childrenData.length)
          }
        } catch (error) {
          console.error('Error fetching children:', error)
        } finally {
          setLoadingChildren(false)
        }
      }

      fetchAllChildren()
    }, [])

    if (childLoading || loadingChildren) {
      return <LoadingScreen message="Loading..." />
    }

    // No children in system at all - need parent to set up first
    if (availableChildren.length === 0) {
      return <FirstTimeSetup />
    }

    // Show child selection if multiple children
    if (availableChildren.length > 1 && !selectedChild) {
      return <ChildSelector children={availableChildren} onSelect={setSelectedChild} />
    }
    
    // Show PIN entry for selected/only child
    const childToAuth = selectedChild || availableChildren[0]
    return (
      <PinEntry 
        childId={childToAuth.childId}
        childUsername={childToAuth.username}
      />
    )
  }

  // No auth required
  return <>{children}</>
}

// Loading Screen Component
const LoadingScreen: React.FC<{ message: string }> = ({ message }) => (
  <div className="page-container">
    <div className="container">
      <div className="content-area text-center">
        <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 
                      rounded-full animate-spin mx-auto mb-4" />
        <p className="text-body-text">{message}</p>
      </div>
    </div>
  </div>
)

// First Time Setup - Directs to parent setup
const FirstTimeSetup: React.FC = () => (
  <div className="page-container">
    <div className="container max-w-md mx-auto">
      <div className="content-area text-center">
        <div className="text-6xl mb-6">👋</div>
        <h1 className="text-3xl font-bold text-header-primary mb-4">
          Welcome to Vedyx Leap!
        </h1>
        <p className="text-lg text-body-text mb-8">
          This looks like the first time using the app. A parent or guardian needs to set up learning profiles first.
        </p>
        <button
          onClick={() => window.location.href = '/parent'}
          className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-semibold text-lg
                   hover:bg-indigo-700 transition-colors shadow-md"
        >
          Parent Setup
        </button>
        <p className="text-sm text-gray-500 mt-4">
          Parents: Bookmark /parent for future access
        </p>
      </div>
    </div>
  </div>
)

// Child Selector Component - Shows all children in system
const ChildSelector: React.FC<{ 
  children: ChildProfile[]
  onSelect: (child: ChildProfile) => void 
}> = ({ children, onSelect }) => (
  <div className="page-container">
    <div className="container max-w-md mx-auto">
      <div className="content-area">
        <div className="text-center mb-8">
          <div className="text-6xl mb-4">🌟</div>
          <h1 className="text-3xl font-bold text-header-primary mb-3">
            Who's Learning Today?
          </h1>
          <p className="text-lg text-body-text">
            Choose your profile to continue
          </p>
        </div>
        
        <div className="space-y-4">
          {children.map((child) => (
            <button
              key={child.childId}
              onClick={() => onSelect(child)}
              className="w-full p-6 text-left bg-white dark:bg-gray-800 
                       border-2 border-gray-200 dark:border-gray-700 
                       rounded-xl hover:border-indigo-300 dark:hover:border-indigo-600
                       hover:shadow-md transition-all duration-200 group"
            >
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full 
                              flex items-center justify-center group-hover:bg-indigo-200 
                              dark:group-hover:bg-indigo-800/50 transition-colors">
                  <span className="text-lg font-bold text-indigo-600 dark:text-indigo-400">
                    {child.username.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div>
                  <div className="text-lg font-semibold text-header-primary">
                    {child.username}
                  </div>
                  <div className="text-sm text-body-text">
                    {child.metadata.currentLevel} • {child.metadata.totalSessions} sessions
                  </div>
                </div>
              </div>
            </button>
          ))}
        </div>

        {/* Small parent access link */}
        <div className="text-center mt-8 pt-6 border-t border-gray-200">
          <button
            onClick={() => window.location.href = '/parent'}
            className="text-sm text-gray-500 hover:text-gray-700 underline"
          >
            Parent Dashboard
          </button>
        </div>
      </div>
    </div>
  </div>
)