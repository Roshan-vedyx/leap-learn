// src/components/teacher/TeacherAppWrapper.tsx
import React from 'react'
import { GraduationCap, LogOut, User, FileText, BarChart3 } from 'lucide-react'
import { useTeacherAuth } from '../../contexts/TeacherAuthContext'
import { Button } from '../ui/Button'

interface TeacherAppWrapperProps {
  children: React.ReactNode
  currentPage?: string
}

export const TeacherAppWrapper: React.FC<TeacherAppWrapperProps> = ({ 
  children, 
  currentPage 
}) => {
  const { profile, signOut } = useTeacherAuth()

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/teacher'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  const navigation = [
    { name: 'Dashboard', href: '/teacher/dashboard', icon: BarChart3 },
    { name: 'Worksheets', href: '/teacher/worksheets', icon: FileText },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Professional Teacher Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo & Brand */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2">
                <div className="rounded-lg bg-blue-600 p-2">
                  <GraduationCap className="h-5 w-5 text-white" />
                </div>
                <div>
                  <h1 className="text-lg font-semibold text-gray-900">Vedyx Leap</h1>
                  <p className="text-xs text-gray-500 font-medium">Teacher Platform</p>
                </div>
              </div>
            </div>

            {/* Navigation */}
            <nav className="hidden md:flex items-center space-x-8">
              {navigation.map((item) => {
                const Icon = item.icon
                const isActive = currentPage === item.name.toLowerCase()
                return (
                  <a
                    key={item.name}
                    href={item.href}
                    className={`flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                      isActive
                        ? 'bg-blue-50 text-blue-700'
                        : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {item.name}
                  </a>
                )
              })}
            </nav>

            {/* User Profile & Actions */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-sm">
                {profile?.photoURL ? (
                  <img
                    src={profile.photoURL}
                    alt="Profile"
                    className="h-8 w-8 rounded-full object-cover"
                  />
                ) : (
                  <div className="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                    <User className="h-4 w-4 text-gray-500" />
                  </div>
                )}
                <div className="hidden sm:block">
                  <p className="font-medium text-gray-900">
                    {profile?.displayName || 'Teacher'}
                  </p>
                  <p className="text-xs text-gray-500">{profile?.email}</p>
                </div>
              </div>
              
              <Button
                onClick={handleSignOut}
                variant="ghost"
                size="sm"
                className="text-gray-600 hover:text-gray-900 p-2"
                title="Sign out"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {children}
      </main>
    </div>
  )
}