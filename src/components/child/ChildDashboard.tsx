// src/components/child/ChildDashboard.tsx
// CLEAN dashboard that works with unified analytics

import React, { useState, useEffect } from 'react'
import { Star, Zap, BookOpen, Target, TrendingUp, Sparkles, Clock } from 'lucide-react'
import { analytics, type ChildProgress } from '../../services/analytics'

interface ChildDashboardProps {
  childId: string
  username?: string
}

export default function ChildDashboard({ childId, username = "Learning Champion" }: ChildDashboardProps) {
  const [progress, setProgress] = useState<ChildProgress | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadProgress()
  }, [childId])

  const loadProgress = async () => {
    setLoading(true)
    const data = await analytics.getProgress()
    setProgress(data)
    setLoading(false)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your amazing progress...</p>
        </div>
      </div>
    )
  }

  // Show welcome if no progress yet
  if (!progress || progress.totalMinutes === 0) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-6">
        <div className="max-w-4xl mx-auto">
          <div className="text-center bg-white rounded-2xl shadow-sm p-12">
            <Sparkles className="w-16 h-16 text-purple-500 mx-auto mb-6" />
            <h1 className="text-3xl font-bold text-gray-900 mb-4">
              Welcome to Your Learning Journey, {username}! 🌟
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              Start your first learning adventure to see your amazing progress here!
            </p>
            <div className="bg-purple-50 rounded-xl p-6">
              <p className="text-purple-800 font-medium">
                Your dashboard will show your superpowers, achievements, and growth as you learn! ✨
              </p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 md:p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        
        {/* Welcome Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl md:text-4xl font-bold text-gray-900 mb-2">
            Welcome back, {username}! 🌟
          </h1>
          <p className="text-lg text-gray-600">
            Ready for another amazing learning adventure?
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          
          {/* Total Sessions */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <BookOpen className="w-8 h-8 text-blue-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{progress.totalSessions}</div>
            <div className="text-sm text-gray-600">Learning Sessions</div>
          </div>

          {/* Total Time */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Clock className="w-8 h-8 text-green-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{Math.round(progress.totalMinutes)}</div>
            <div className="text-sm text-gray-600">Minutes Learning</div>
          </div>

          {/* Current Streak */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Zap className="w-8 h-8 text-yellow-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{progress.currentStreak}</div>
            <div className="text-sm text-gray-600">Day Streak</div>
          </div>

          {/* Skills Learned */}
          <div className="bg-white rounded-xl shadow-sm p-6 text-center">
            <Star className="w-8 h-8 text-purple-500 mx-auto mb-2" />
            <div className="text-2xl font-bold text-gray-900">{progress.strengths.length}</div>
            <div className="text-sm text-gray-600">Skills Mastered</div>
          </div>

        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Superpowers Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <Star className="w-6 h-6 text-yellow-500" />
              <h2 className="text-2xl font-bold text-gray-900">My Superpowers</h2>
              <Sparkles className="w-5 h-5 text-purple-500" />
            </div>
            
            {progress.strengths.length > 0 ? (
              <div className="space-y-3">
                {progress.strengths.slice(0, 5).map((skill, index) => (
                  <div key={skill} className="flex items-center gap-3 p-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-lg">
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center text-white font-bold text-sm">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 capitalize">
                        {skill.replace(/_/g, ' ')}
                      </div>
                    </div>
                    <Star className="w-5 h-5 text-yellow-500" />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <p className="text-gray-500">
                  Your superpowers will appear here as you practice!
                </p>
              </div>
            )}
          </div>

          {/* This Week Section */}
          <div className="bg-white rounded-2xl shadow-sm p-6">
            <div className="flex items-center gap-3 mb-6">
              <TrendingUp className="w-6 h-6 text-green-500" />
              <h2 className="text-2xl font-bold text-gray-900">This Week</h2>
            </div>
            
            <div className="space-y-4">
              
              {/* Week Stats */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-4 bg-blue-50 rounded-lg">
                  <div className="text-2xl font-bold text-blue-600">{progress.weekSessions}</div>
                  <div className="text-sm text-blue-600">Sessions</div>
                </div>
                <div className="text-center p-4 bg-green-50 rounded-lg">
                <div className="text-2xl font-bold text-green-600">{Math.round(progress.weekMinutes)}</div>
                  <div className="text-sm text-green-600">Minutes</div>
                </div>
              </div>

              {/* New Skills This Week */}
              {progress.weekSkills.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-900 mb-2">New Skills This Week:</h3>
                  <div className="flex flex-wrap gap-2">
                    {progress.weekSkills.map(skill => (
                      <span key={skill} className="px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium capitalize">
                        {skill.replace(/_/g, ' ')}
                      </span>
                    ))}
                  </div>
                </div>
              )}

            </div>
          </div>

          {/* Areas to Practice */}
          {progress.practicingAreas.length > 0 && (
            <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-blue-500" />
                <h2 className="text-2xl font-bold text-gray-900">Powers to Practice</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {progress.practicingAreas.slice(0, 3).map(area => (
                  <div key={area} className="p-4 bg-blue-50 rounded-lg text-center">
                    <div className="font-medium text-blue-900 capitalize mb-2">
                      {area.replace('_', ' ')}
                    </div>
                    <div className="text-sm text-blue-600">
                      Keep practicing to make this a superpower! 💪
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

        </div>

        {/* Encouragement */}
        <div className="text-center bg-white rounded-2xl shadow-sm p-8">
          <div className="text-4xl mb-4">🎉</div>
          <h3 className="text-xl font-bold text-gray-900 mb-2">
            You're doing amazing, {username}!
          </h3>
          <p className="text-gray-600">
            Every time you practice, you're growing your brain and becoming an even better learner!
          </p>
        </div>

      </div>
    </div>
  )
}