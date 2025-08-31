// src/components/auth/AuthGate.tsx - SIMPLIFIED FIXED FLOW
import React from 'react'
import { useParams } from 'wouter'
import { useParentAuth } from '../../contexts/ParentAuthContext'
import { useChildAuth } from '../../contexts/ChildAuthContext'
import { ParentLogin } from './ParentLogin'
import { ChildLogin } from './ChildLogin'

interface AuthGateProps {
  children: React.ReactNode | ((params: any) => React.ReactNode)
  requireParent?: boolean
  requireChild?: boolean
}

export const AuthGate: React.FC<AuthGateProps> = ({ 
  children, 
  requireParent = false, 
  requireChild = false 
}) => {
  const { user: parentUser, loading: parentLoading } = useParentAuth()
  const { childSession, loading: childLoading } = useChildAuth()
  const params = useParams()

  const renderChildren = () => {
    return typeof children === 'function' ? children(params) : children
  }

  // === PARENT-ONLY ROUTES ===
  if (requireParent) {
    if (parentLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }
    
    if (!parentUser) {
      return <ParentLogin />
    }
    
    return <>{renderChildren()}</>
  }

  // === CHILD-FIRST ROUTES ===
  if (requireChild) {
    if (childLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading...</p>
          </div>
        </div>
      )
    }
    
    if (childSession) {
      return <>{renderChildren()}</>
    }
    
    return <ChildLogin />
  }

  // === PUBLIC ROUTES ===
  return <>{renderChildren()}</>
}