// src/components/auth/TeacherAuthGuard.tsx
import React from 'react'
import { useTeacherAuth } from '../../contexts/TeacherAuthContext'
import { GraduationCap } from 'lucide-react'

interface TeacherAuthGuardProps {
  children: React.ReactNode
}

export const TeacherAuthGuard: React.FC<TeacherAuthGuardProps> = ({ children }) => {
  const { user, profile, loading } = useTeacherAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600/30 border-t-indigo-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Loading teacher dashboard...</p>
        </div>
      </div>
    )
  }

  if (!user || !profile) {
    // Redirect to teacher login
    sessionStorage.setItem('intendedRoute', window.location.pathname)
    window.location.href = '/teacher'
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <GraduationCap className="w-16 h-16 text-indigo-600 mx-auto mb-4" />
          <p className="text-gray-600">Redirecting to teacher login...</p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}