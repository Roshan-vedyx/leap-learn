// src/components/parent/ParentDashboard.tsx
// Updated to include insights view

import React, { useState, useEffect } from 'react'
import { User, Plus, Settings, LogOut, Shield, Eye, EyeOff, BarChart3 } from 'lucide-react'
import { signOut } from 'firebase/auth'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { auth, db } from '../../config/firebase'
import { useParentAuth } from '../../contexts/ParentAuthContext'
import { Button } from '@/components/ui/Button'
import type { ChildProfile } from '../../types/auth'
import { ChildSetup } from '../auth/ChildSetup'
import ParentInsightsView from './ParentInsightsView'

type TabType = 'children' | 'insights'

export const ParentDashboard: React.FC = () => {
  const { user } = useParentAuth()
  const [children, setChildren] = useState<ChildProfile[]>([])
  const [loading, setLoading] = useState(true)
  const [showChildSetup, setShowChildSetup] = useState(false)
  const [activeTab, setActiveTab] = useState<TabType>('children')
  const [selectedChildId, setSelectedChildId] = useState<string>('')

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
      
      // Auto-select first child for insights
      if (childrenData.length > 0 && !selectedChildId) {
        setSelectedChildId(childrenData[0].id)
      }
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

  const selectedChild = children.find(child => child.id === selectedChildId)

  return (
    <div className="page-container">
      <div className="container">
        
        {/* Header */}
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

        {/* Privacy Notice */}
        <div className="bg-green-50 dark:bg-green-900/30 border border-green-200 dark:border-green-800 
                      rounded-xl p-6 mb-8">
          <div className="flex items-start gap-4">
            <Shield className="w-6 h-6 text-green-600 dark:text-green-400 mt-1 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-800 dark:text-green-200 mb-2">
                Your Child's Privacy is Protected
              </h3>
              <p className="text-green-700 dark:text-green-300 text-sm leading-relaxed">
                You can see growth patterns and manage accounts, but your child's daily activities, 
                creative responses, and learning content remain completely private.
              </p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        {children.length > 0 && (
          <div className="flex space-x-1 mb-8 bg-gray-100 dark:bg-gray-800 rounded-lg p-1">
            <button
              onClick={() => setActiveTab('children')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'children'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <User className="w-4 h-4" />
              Manage Children
            </button>
            <button
              onClick={() => setActiveTab('insights')}
              className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors ${
                activeTab === 'insights'
                  ? 'bg-white dark:bg-gray-700 text-gray-900 dark:text-white shadow-sm'
                  : 'text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              Learning Insights
            </button>
          </div>
        )}

        {/* Tab Content */}
        {activeTab === 'children' && (
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
              <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl">
                <User className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-gray-600 dark:text-gray-300 mb-2">
                  No children added yet
                </h3>
                <p className="text-gray-500 dark:text-gray-400 mb-6">
                  Add your first child to get started with their learning journey.
                </p>
                <Button onClick={() => setShowChildSetup(true)}>
                  Add Your First Child
                </Button>
              </div>
            ) : (
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {children.map((child) => (
                  <div key={child.id} className="bg-white dark:bg-gray-800 rounded-xl p-6 shadow-sm">
                    <div className="flex items-center gap-4 mb-4">
                      <div className="w-12 h-12 bg-indigo-100 dark:bg-indigo-900 rounded-full flex items-center justify-center">
                        <User className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                          {child.username}
                        </h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400">
                          Age {child.age} • Added {new Date(child.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Button
                        onClick={() => {
                          setSelectedChildId(child.id)
                          setActiveTab('insights')
                        }}
                        variant="outline"
                        className="w-full flex items-center gap-2"
                      >
                        <BarChart3 className="w-4 h-4" />
                        View Learning Journey
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'insights' && selectedChild && (
          <div>
            {/* Child Selector */}
            {children.length > 1 && (
              <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  View insights for:
                </label>
                <select
                  value={selectedChildId}
                  onChange={(e) => setSelectedChildId(e.target.value)}
                  className="border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 
                           bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                >
                  {children.map((child) => (
                    <option key={child.id} value={child.id}>
                      {child.username}
                    </option>
                  ))}
                </select>
              </div>
            )}
            
            <ParentInsightsView 
              childId={selectedChildId} 
              childName={selectedChild.username}
            />
          </div>
        )}

        {activeTab === 'insights' && !selectedChild && children.length === 0 && (
          <div className="text-center py-12">
            <BarChart3 className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Add a child to see insights
            </h3>
            <p className="text-gray-500 mb-6">
              Once you add a child, their learning insights will appear here.
            </p>
          </div>
        )}

      </div>
    </div>
  )
}