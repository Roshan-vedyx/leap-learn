// src/components/parent/ParentDashboard.tsx
import React, { useState, useEffect } from 'react'
import { User, Plus, Settings, LogOut, Shield, Eye, EyeOff } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { useParentAuth } from '../../contexts/ParentAuthContext'
import { Button } from '@/components/ui/Button'
import type { ChildProfile } from '../../types/auth'
import { ChildSetup } from '../auth/ChildSetup'

export const ParentDashboard: React.FC = () => {
  const { user } = useParentAuth()
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showChildSetup, setShowChildSetup] = useState(false)

  const fetchChildren = async () => {
    if (!user) return
    
    try {
      const childrenQuery = query(
        collection(db, 'children'),
        where('parentId', '==', user.uid)
      )
      const snapshot = await getDocs(childrenQuery)
      const childrenData = snapshot.docs.map(doc => doc.data() as ChildProfile)
      setChildren(childrenData)
    } catch (error) {
      console.error('Error fetching children:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchChildren()
  }, [user])

  const handleSignOut = async () => {
    try {
      await signOut(auth)
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const handleChildSetupComplete = () => {
    setShowChildSetup(false)
    fetchChildren()
  }

  if (showChildSetup) {
    return (
      <ChildSetup 
        onComplete={handleChildSetupComplete}
        onCancel={() => setShowChildSetup(false)}
      />
    )
  }

  if (loading) {
    return (
      <div className="page-container">
        <div className="container">
          <div className="content-area text-center">
            <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 
                          rounded-full animate-spin mx-auto mb-4" />
            <p className="text-body-text">Loading dashboard...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="page-container">
      <div className="container">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-header-primary mb-2">
              Family Dashboard
            </h1>
            <p className="text-body-text">
              Welcome back, {user?.email}
            </p>
          </div>
          
          <Button
            onClick={handleSignOut}
            variant="outline"
            className="flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Sign Out
          </Button>
        </div>

        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 
                      rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Your Child's Privacy is Protected
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                You can see basic progress and manage accounts, but your child's daily activities, 
                creative responses, and learning content remain completely private.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-semibold text-header-primary">
              Your Children ({children.length})
            </h2>
            <Button 
              onClick={() => setShowChildSetup(true)}
              className="flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              Add Child
            </Button>
          </div>

          {children.length === 0 ? (
            <div className="text-center py-12 bg-gray-50 dark:bg-gray-900/30 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-700">
              <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-600 dark:text-gray-300 mb-2">
                No children added yet
              </h3>
              <p className="text-gray-500 dark:text-gray-400 mb-6">
                Add your first child to get started with their learning journey
              </p>
              <Button onClick={() => setShowChildSetup(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Your First Child
              </Button>
            </div>
          ) : (
            <div className="card-grid">
              {children.map((child) => (
                <ChildCard key={child.childId} child={child} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

const ChildCard: React.FC<{ child: ChildProfile }> = ({ child }) => {
  const [showDetails, setShowDetails] = useState(false)

  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 
                  rounded-xl p-6 shadow-sm hover:shadow-md transition-shadow">
      
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900/30 rounded-full 
                        flex items-center justify-center">
            <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-header-primary">
              {child.username}
            </h3>
            <p className="text-sm text-body-text">
              {child.metadata.currentLevel}
            </p>
          </div>
        </div>
        
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setShowDetails(!showDetails)}
          className="flex items-center gap-2"
        >
          {showDetails ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          {showDetails ? 'Hide' : 'Details'}
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {child.metadata.totalSessions}
          </div>
          <div className="text-sm text-body-text">Total Sessions</div>
        </div>
        
        <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
          <div className="text-sm font-medium text-green-600 dark:text-green-400">
            {child.metadata.lastActiveDate 
              ? new Date(child.metadata.lastActiveDate).toLocaleDateString()
              : 'Never'
            }
          </div>
          <div className="text-sm text-body-text">Last Active</div>
        </div>
      </div>

      {showDetails && (
        <div className="space-y-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          <div>
            <h4 className="font-medium text-header-primary mb-2">Privacy Settings</h4>
            <div className="text-sm text-body-text">
              Weekly Report: {child.metadata.allowWeeklyReport ? 'Enabled' : 'Disabled'}
            </div>
          </div>

          <div>
            <h4 className="font-medium text-header-primary mb-2">Accessibility</h4>
            <div className="text-sm text-body-text space-y-1">
              <div>Font Size: {child.preferences.fontSize}</div>
              <div>High Contrast: {child.preferences.highContrast ? 'On' : 'Off'}</div>
              <div>Audio Support: {child.preferences.audioSupport ? 'On' : 'Off'}</div>
            </div>
          </div>

          <div className="flex gap-2 pt-2">
            <Button variant="outline" size="sm" className="flex-1">
              <Settings className="w-4 h-4 mr-2" />
              Manage
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}