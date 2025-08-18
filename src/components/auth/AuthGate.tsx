// src/components/auth/AuthGate.tsx - COMPLETELY FIXED VERSION
import React, { useState, useEffect } from 'react'
import { collection, getDocs } from 'firebase/firestore'
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

type SystemState = 'loading' | 'no-children' | 'has-children'

export const AuthGate: React.FC<AuthGateProps> = ({ 
  children, 
  requireChild = false,
  requireParent = false
}) => {
  const { user: parentUser, loading: parentLoading } = useParentAuth()
  const { childSession, loading: childLoading } = useChildAuth()
  
  // State for child flow
  const [systemState, setSystemState] = useState<SystemState>('loading')
  const [availableChildren, setAvailableChildren] = useState<ChildProfile[]>([])
  const [selectedChild, setSelectedChild] = useState<ChildProfile | null>(null)
  const [hasInitialized, setHasInitialized] = useState(false)

  // Debug mode
  const DEBUG = true

  // Initialize system state check
  useEffect(() => {
    if (!hasInitialized) {
      initializeSystemState()
    }
  }, [hasInitialized])

  const initializeSystemState = async () => {
    if (DEBUG) console.log('🔍 AuthGate: Initializing system state check...')
    
    try {
      // Check if ANY children exist in the entire system
      const snapshot = await getDocs(collection(db, 'children'))
      const allChildren = snapshot.docs.map(doc => doc.data() as ChildProfile)
      
      if (DEBUG) {
        console.log(`📊 AuthGate: Found ${allChildren.length} total children in system`)
        console.log('📋 AuthGate: Children details:', allChildren.map(c => ({ username: c.username, parentId: c.parentId })))
      }

      if (allChildren.length === 0) {
        // Truly no children exist - first time setup needed
        setSystemState('no-children')
        setAvailableChildren([])
        if (DEBUG) console.log('✨ AuthGate: NO children found - setting to first-time setup')
      } else {
        // Children exist - make them available for selection
        setSystemState('has-children')
        setAvailableChildren(allChildren)
        if (DEBUG) console.log('👥 AuthGate: Children found - setting to child selection mode')
      }
    } catch (error) {
      console.error('❌ AuthGate: Error checking system state:', error)
      // On error, assume first time
      setSystemState('no-children')
      setAvailableChildren([])
    } finally {
      setHasInitialized(true)
      if (DEBUG) console.log('✅ AuthGate: System state initialization complete')
    }
  }

  // === PARENT-ONLY ROUTES ===
  if (requireParent) {
    if (DEBUG) console.log('🔐 AuthGate: Parent route requested')
    
    if (parentLoading) {
      if (DEBUG) console.log('⏳ AuthGate: Parent loading...')
      return <LoadingScreen message="Loading parent dashboard..." />
    }
    
    if (!parentUser) {
      if (DEBUG) console.log('🔑 AuthGate: No parent user - showing login')
      return <ParentLogin />
    }
    
    if (DEBUG) console.log('✅ AuthGate: Parent authenticated, showing content')
    return <>{children}</>
  }

  // === CHILD-FIRST ROUTES ===
  if (requireChild) {
    if (DEBUG) console.log('🧒 AuthGate: Child route requested')
    
    // Check if child is already authenticated
    if (childSession) {
      if (DEBUG) console.log('✅ AuthGate: Child already authenticated:', childSession.username)
      return <>{children}</>
    }

    // Still loading or initializing
    if (childLoading || !hasInitialized || systemState === 'loading') {
      if (DEBUG) console.log('⏳ AuthGate: Still loading child auth or system state')
      return <LoadingScreen message="Loading..." />
    }

    // NO CHILDREN EXIST - First time setup
    if (systemState === 'no-children') {
      if (DEBUG) console.log('🎯 AuthGate: Showing first time setup')
      return <FirstTimeSetup />
    }

    // CHILDREN EXIST - Handle selection/PIN flow
    if (systemState === 'has-children') {
      if (DEBUG) console.log(`🎯 AuthGate: ${availableChildren.length} children available`)
      
      // Multiple children - show selection screen
      if (availableChildren.length > 1 && !selectedChild) {
        if (DEBUG) console.log('🎯 AuthGate: Multiple children - showing selector')
        return <ChildSelector children={availableChildren} onSelect={setSelectedChild} />
      }
      
      // Single child or child selected - show PIN entry
      const childToAuth = selectedChild || availableChildren[0]
      if (DEBUG) console.log('🎯 AuthGate: Showing PIN entry for:', childToAuth?.username)
      
      if (!childToAuth) {
        console.error('❌ AuthGate: No child to authenticate!')
        return <LoadingScreen message="Error loading child data..." />
      }
      
      return (
        <PinEntry 
          childId={childToAuth.childId}
          childUsername={childToAuth.username}
        />
      )
    }

    // Fallback
    if (DEBUG) console.log('⚠️ AuthGate: Unexpected state, showing loading')
    return <LoadingScreen message="Setting up..." />
  }

  // No auth required - show content
  if (DEBUG) console.log('🔓 AuthGate: No auth required, showing content')
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
const FirstTimeSetup: React.FC = () => {
  console.log('🎉 FirstTimeSetup: Rendering first time setup screen')
  
  return (
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
            onClick={() => {
              console.log('🔄 FirstTimeSetup: Redirecting to parent setup')
              window.location.href = '/parent'
            }}
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
}

// Child Selector Component - Shows all children in system
const ChildSelector: React.FC<{ 
  children: ChildProfile[]
  onSelect: (child: ChildProfile) => void 
}> = ({ children, onSelect }) => {
  console.log('👥 ChildSelector: Rendering with', children.length, 'children')
  
  return (
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
                onClick={() => {
                  console.log('👤 ChildSelector: Child selected:', child.username)
                  onSelect(child)
                }}
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
              onClick={() => {
                console.log('🔄 ChildSelector: Redirecting to parent dashboard')
                window.location.href = '/parent'
              }}
              className="text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Parent Dashboard
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}