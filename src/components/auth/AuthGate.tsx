// src/components/auth/AuthGate.tsx - FIXED VERSION
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

  // === PARENT-ONLY ROUTES (like /parent dashboard) ===
  if (requireParent) {
    if (parentLoading) {
      return <ParentLogin />  // Show login screen while loading
    }
    
    if (!parentUser) {
      return <ParentLogin />
    }
    
    return <>{renderChildren()}</>
  }

  // === CHILD-FIRST ROUTES (like /, /practice-reading) ===
  if (requireChild) {
    if (childLoading) {
      return <ChildLogin />  // Show login screen while loading
    }
    
    // Child already authenticated - show app
    if (childSession) {
      return <>{renderChildren()}</>
    }
    
    // No child session - show simple login screen
    return <ChildLogin />
  }

  // === PUBLIC ROUTES ===
  return <>{renderChildren()}</>
}