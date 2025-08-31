import React, { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Clock, Target, Heart, BookOpen, Zap, Users } from 'lucide-react'
import { learningAnalytics, type ChildLearningProfile, type WeeklyProgress } from '../services/learningAnalytics'

interface ParentInsightsDashboardProps {
  childId: string
}

export default function ParentInsightsDashboard({ childId }: ParentInsightsDashboardProps) {
  const [insights, setInsights] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedWeek, setSelectedWeek] = useState<string>('')

  useEffect(() => {
    const loadInsights = async () => {
      setLoading(true)
      const data = await learningAnalytics.getParentInsights(childId)
      setInsights(data)
      setLoading(false)
    }
    
    if (childId) {
      loadInsights()
    }
  }, [childId])

  if (loading) {
    return (
      <div className="flex items-center justify-center p-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
      </div>
    )
  }

  if (!insights?.profile) {
    return (
      <div className="text-center p-8 text-gray-600">
        No learning data yet. Have your child complete a few activities to see insights!
      </div>
    )
  }

  const { profile, recentWeeks, quickStats } = insights

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {profile.username}'s Learning Journey
        </h1>
        <p className="text-gray-600">
          Age {profile.age} • {profile.currentLevel.replace('_', ' ')} • {quickStats.streakDays} day learning streak
        </p>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <BookOpen className="w-8 h-8 text-blue-600" />
            <div>
              <p className="text-sm text-gray-600">Total Sessions</p>
              <p className="text-2xl font-bold">{quickStats.totalSessions}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Zap className="w-8 h-8 text-green-600" />
            <div>
              <p className="text-sm text-gray-600">Reading Speed</p>
              <p className="text-2xl font-bold">{quickStats.averageWPM} <span className="text-sm font-normal">wpm</span></p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Target className="w-8 h-8 text-purple-600" />
            <div>
              <p className="text-sm text-gray-600">Top Strength</p>
              <p className="text-lg font-semibold">{quickStats.topStrengths[0] || 'Developing'}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4">
          <div className="flex items-center gap-3">
            <Clock className="w-8 h-8 text-orange-600" />
            <div>
              <p className="text-sm text-gray-600">Streak Days</p>
              <p className="text-2xl font-bold">{quickStats.streakDays}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Strengths & Struggles */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Strengths */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-green-600" />
            Strengths & Achievements
          </h2>
          <div className="space-y-3">
            {profile.strengths.length > 0 ? (
              profile.strengths
                .sort((a, b) => b.confidence - a.confidence)
                .slice(0, 5)
                .map((strength, index) => (
                  <div key={index} className="flex items-center justify-between">
                    <span className="font-medium">{strength.skill.replace('_', ' ')}</span>
                    <div className="flex items-center gap-2">
                      <div className="w-20 h-2 bg-gray-200 rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-green-500 transition-all duration-300"
                          style={{ width: `${strength.confidence * 10}%` }}
                        />
                      </div>
                      <span className="text-sm text-gray-600">{strength.confidence}/10</span>
                    </div>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 italic">Building strengths through practice...</p>
            )}
          </div>
        </div>

        {/* Areas for Growth */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Target className="w-5 h-5 text-blue-600" />
            Growth Areas & Support
          </h2>
          <div className="space-y-3">
            {profile.strugglingAreas.length > 0 ? (
              profile.strugglingAreas
                .sort((a, b) => b.frequency - a.frequency)
                .slice(0, 5)
                .map((area, index) => (
                  <div key={index} className="border-l-4 border-blue-400 pl-3">
                    <p className="font-medium text-gray-900">{area.skill.replace('_', ' ')}</p>
                    <p className="text-sm text-gray-600 mt-1">{area.improvementPlan}</p>
                    <span className="text-xs text-blue-600">Occurred {area.frequency} times recently</span>
                  </div>
                ))
            ) : (
              <p className="text-gray-500 italic">No significant struggles identified yet</p>
            )}
          </div>
        </div>
      </div>

      {/* Weekly Progress */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Users className="w-5 h-5 text-indigo-600" />
          Recent Weeks
        </h2>
        
        {recentWeeks.length > 0 ? (
          <div className="space-y-4">
            {recentWeeks.map((week, index) => (
              <div key={week.weekId} className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="font-semibold">
                    Week of {new Date(week.startDate).toLocaleDateString()}
                  </h3>
                  <div className="text-sm text-gray-500">
                    {week.sessionsCompleted} sessions • {Math.round(week.totalLearningTime)} minutes
                  </div>
                </div>
                
                {week.weeklyNarrative && (
                  <p className="text-gray-700 mb-3">{week.weeklyNarrative}</p>
                )}
                
                {week.newSkillsAcquired.length > 0 && (
                  <div className="mb-2">
                    <span className="font-medium text-green-700">New Skills: </span>
                    <span>{week.newSkillsAcquired.join(', ')}</span>
                  </div>
                )}
                
                {week.celebrationMoments.length > 0 && (
                  <div className="flex gap-1 flex-wrap">
                    {week.celebrationMoments.slice(0, 3).map((moment, idx) => (
                      <span key={idx} className="inline-flex items-center gap-1 bg-yellow-100 text-yellow-800 text-xs px-2 py-1 rounded-full">
                        ⭐ {moment}
                      </span>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        ) : (
          <p className="text-gray-500 italic">Complete a few learning sessions to see weekly insights</p>
        )}
      </div>

      {/* Best Learning Patterns */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
          <Heart className="w-5 h-5 text-pink-600" />
          What Works Best
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Best Brain States */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Best Learning Moods</h3>
            <div className="space-y-2">
              {profile.bestLearningStates.length > 0 ? (
                profile.bestLearningStates
                  .sort((a, b) => b.successRate - a.successRate)
                  .slice(0, 3)
                  .map((state, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{state.brainState.replace('_', ' ')}</span>
                      <span className="text-xs bg-green-100 text-green-700 px-2 py-1 rounded">
                        {Math.round(state.successRate * 100)}% success
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-sm">Building pattern data...</p>
              )}
            </div>
          </div>

          {/* Preferred Supports */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Helpful Supports</h3>
            <div className="space-y-2">
              {profile.preferredSupports.length > 0 ? (
                profile.preferredSupports
                  .sort((a, b) => b.effectiveness - a.effectiveness)
                  .slice(0, 3)
                  .map((support, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-sm capitalize">{support.type.replace('_', ' ')}</span>
                      <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded">
                        {support.effectiveness}/10 helpful
                      </span>
                    </div>
                  ))
              ) : (
                <p className="text-gray-500 text-sm">Learning preferences...</p>
              )}
            </div>
          </div>

          {/* Current Level */}
          <div>
            <h3 className="font-semibold mb-2 text-gray-800">Current Level</h3>
            <div className="space-y-2">
              <div className="text-lg font-bold text-indigo-600 capitalize">
                {profile.currentLevel.replace('_', ' ')}
              </div>
              <div className="text-sm text-gray-600">
                Reading at {profile.currentReadingSpeed} words per minute
              </div>
              <div className="text-sm text-gray-600">
                Prefers {profile.preferredDifficulty} difficulty
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Action Items for Parents */}
      {profile.strugglingAreas.length > 0 && (
        <div className="bg-blue-50 rounded-lg p-6">
          <h2 className="text-lg font-bold text-blue-900 mb-4">
            💡 Ways to Help at Home
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {profile.strugglingAreas
              .sort((a, b) => b.frequency - a.frequency)
              .slice(0, 4)
              .map((area, index) => (
                <div key={index} className="bg-white rounded-lg p-4">
                  <h3 className="font-semibold text-blue-800 mb-2">
                    {area.skill.replace('_', ' ')}
                  </h3>
                  <p className="text-sm text-blue-700">{area.improvementPlan}</p>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  )
}