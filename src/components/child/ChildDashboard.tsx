// src/components/child/ChildDashboard.tsx
import React, { useState, useEffect } from 'react'
import { Star, Zap, BookOpen, Target, TrendingUp, Sparkles, Heart } from 'lucide-react'
import { learningAnalytics, type ChildLearningProfile, type WeeklyProgress } from '../../services/learningAnalytics'

interface ChildDashboardProps {
  childId: string
  username?: string
}

interface DashboardData {
  profile: ChildLearningProfile | null
  weeklyProgress: WeeklyProgress | null
  loading: boolean
}

export default function ChildDashboard({ childId, username = "Learning Champion" }: ChildDashboardProps) {
  const [data, setData] = useState<DashboardData>({
    profile: null,
    weeklyProgress: null,
    loading: true
  })
  
  const [selectedPowerToPractice, setSelectedPowerToPractice] = useState<string | null>(null)

  useEffect(() => {
    loadDashboardData()
  }, [childId])

  const loadDashboardData = async () => {
    try {
      setData(prev => ({ ...prev, loading: true }))
      
      const [profile, weeklyProgress] = await Promise.all([
        learningAnalytics.getChildProfile(childId),
        learningAnalytics.getWeeklyProgress(childId)
      ])
      
      setData({
        profile,
        weeklyProgress,
        loading: false
      })
    } catch (error) {
      console.error('Failed to load dashboard data:', error)
      setData(prev => ({ ...prev, loading: false }))
    }
  }

  if (data.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your learning journey...</p>
        </div>
      </div>
    )
  }

  const { profile, weeklyProgress } = data

  // If no data yet, show welcome message
  if (!profile || profile.totalActiveSessions === 0) {
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

  // Get top 3 strengths with confidence scores
  const topStrengths = profile.strengths
    .sort((a, b) => b.confidence - a.confidence)
    .slice(0, 3)

  // Get powers to practice (reframed struggling areas)
  const powersToPractice = profile.strugglingAreas
    .sort((a, b) => b.frequency - a.frequency)
    .slice(0, 4)
    .map(area => ({
      ...area,
      displayName: formatSkillName(area.skill),
      encouragement: getEncouragementMessage(area.skill)
    }))

  // Recent celebrations from this week
  const recentCelebrations = weeklyProgress?.celebrationMoments.slice(0, 3) || []

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

        {/* Main Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Left Column: My Superpowers */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* My Superpowers Section */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Star className="w-6 h-6 text-yellow-500" />
                <h2 className="text-2xl font-bold text-gray-900">My Superpowers</h2>
                <Sparkles className="w-5 h-5 text-purple-500" />
              </div>
              
              {topStrengths.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {topStrengths.map((strength, index) => (
                    <SuperpowerBadge 
                      key={strength.skill}
                      skill={strength.skill}
                      confidence={strength.confidence}
                      rank={index + 1}
                    />
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Target className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500">
                    Your superpowers will appear here as you practice! 🌱
                  </p>
                </div>
              )}
            </div>

            {/* This Week's Adventures */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-green-500" />
                <h2 className="text-2xl font-bold text-gray-900">This Week's Adventures</h2>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-green-50 rounded-xl p-4 text-center">
                  <BookOpen className="w-8 h-8 text-green-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-green-800">
                    {weeklyProgress?.sessionsCompleted || 0}
                  </div>
                  <div className="text-sm text-green-700">Adventures Completed</div>
                </div>
                
                <div className="bg-blue-50 rounded-xl p-4 text-center">
                  <TrendingUp className="w-8 h-8 text-blue-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-blue-800">
                    {weeklyProgress?.newSkillsAcquired.length || 0}
                  </div>
                  <div className="text-sm text-blue-700">New Powers Unlocked</div>
                </div>
                
                <div className="bg-purple-50 rounded-xl p-4 text-center">
                  <Heart className="w-8 h-8 text-purple-600 mx-auto mb-2" />
                  <div className="text-2xl font-bold text-purple-800">
                    {profile.streakDays}
                  </div>
                  <div className="text-sm text-purple-700">Day Streak</div>
                </div>
              </div>

              {/* Recent Celebrations */}
              {recentCelebrations.length > 0 && (
                <div>
                  <h3 className="font-semibold text-gray-800 mb-3">🎉 Recent Wins:</h3>
                  <div className="space-y-2">
                    {recentCelebrations.map((celebration, index) => (
                      <div key={index} className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-yellow-800 text-sm font-medium">✨ {celebration}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column: Reading Power & Choose Adventure */}
          <div className="space-y-6">
            
            {/* My Reading Power */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-6 h-6 text-orange-500" />
                <h2 className="text-xl font-bold text-gray-900">My Reading Power</h2>
              </div>
              
              <div className="text-center">
                <div className="relative w-24 h-24 mx-auto mb-4">
                  <ReadingPowerMeter speed={profile.currentReadingSpeed} />
                </div>
                <div className="text-3xl font-bold text-orange-600 mb-1">
                  {profile.currentReadingSpeed}
                </div>
                <div className="text-sm text-gray-600 mb-4">words per minute</div>
                
                <div className="bg-orange-50 rounded-lg p-3">
                  <p className="text-orange-800 text-sm font-medium">
                    {getReadingEncouragement(profile.currentReadingSpeed)}
                  </p>
                </div>
              </div>
            </div>

            {/* Choose My Next Adventure */}
            <div className="bg-white rounded-2xl shadow-sm p-6">
              <div className="flex items-center gap-3 mb-6">
                <Target className="w-6 h-6 text-purple-500" />
                <h2 className="text-xl font-bold text-gray-900">Powers to Practice</h2>
              </div>
              
              {powersToPractice.length > 0 ? (
                <div className="space-y-3">
                  {powersToPractice.map((power) => (
                    <PowerToPracticeCard
                      key={power.skill}
                      power={power}
                      isSelected={selectedPowerToPractice === power.skill}
                      onSelect={() => setSelectedPowerToPractice(
                        selectedPowerToPractice === power.skill ? null : power.skill
                      )}
                    />
                  ))}
                  
                  {selectedPowerToPractice && (
                    <div className="mt-4 p-4 bg-purple-50 rounded-xl border border-purple-200">
                      <p className="text-purple-800 text-sm font-medium mb-2">
                        💡 Practice Tip:
                      </p>
                      <p className="text-purple-700 text-sm">
                        {powersToPractice.find(p => p.skill === selectedPowerToPractice)?.improvementPlan}
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-center py-6">
                  <Sparkles className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-gray-500 text-sm">
                    You're doing amazing! Keep practicing to unlock new challenges! 🌟
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

// Superpower Badge Component
function SuperpowerBadge({ skill, confidence, rank }: { skill: string, confidence: number, rank: number }) {
  const getGlowIntensity = (confidence: number) => {
    if (confidence >= 9) return 'shadow-lg shadow-yellow-200'
    if (confidence >= 7) return 'shadow-md shadow-yellow-100'
    return 'shadow-sm'
  }

  const getBadgeColor = (rank: number) => {
    if (rank === 1) return 'from-yellow-400 to-yellow-500'
    if (rank === 2) return 'from-purple-400 to-purple-500'
    return 'from-blue-400 to-blue-500'
  }

  return (
    <div className={`relative bg-gradient-to-br ${getBadgeColor(rank)} rounded-xl p-4 text-white ${getGlowIntensity(confidence)} transform hover:scale-105 transition-transform`}>
      <div className="text-center">
        <Star className="w-8 h-8 mx-auto mb-2" fill="currentColor" />
        <div className="font-bold text-sm mb-1">
          {formatSkillName(skill)}
        </div>
        <div className="text-xs opacity-90">
          Level {Math.round(confidence)}/10
        </div>
      </div>
      
      {rank === 1 && (
        <div className="absolute -top-2 -right-2 bg-yellow-300 text-yellow-800 rounded-full w-6 h-6 flex items-center justify-center text-xs font-bold">
          #1
        </div>
      )}
    </div>
  )
}

// Reading Power Meter Component
function ReadingPowerMeter({ speed }: { speed: number }) {
  const percentage = Math.min((speed / 200) * 100, 100) // Cap at 200 WPM for visualization
  
  return (
    <div className="relative">
      <svg className="w-24 h-24 transform -rotate-90" viewBox="0 0 100 100">
        {/* Background circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          className="text-gray-200"
        />
        {/* Progress circle */}
        <circle
          cx="50"
          cy="50"
          r="40"
          stroke="currentColor"
          strokeWidth="8"
          fill="none"
          strokeDasharray={`${2 * Math.PI * 40}`}
          strokeDashoffset={`${2 * Math.PI * 40 * (1 - percentage / 100)}`}
          className="text-orange-500 transition-all duration-1000 ease-out"
          strokeLinecap="round"
        />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <Zap className="w-6 h-6 text-orange-500" />
      </div>
    </div>
  )
}

// Power to Practice Card Component
function PowerToPracticeCard({ 
  power, 
  isSelected, 
  onSelect 
}: { 
  power: any, 
  isSelected: boolean, 
  onSelect: () => void 
}) {
  return (
    <button
      onClick={onSelect}
      className={`w-full text-left p-3 rounded-lg border transition-all ${
        isSelected 
          ? 'border-purple-300 bg-purple-50' 
          : 'border-gray-200 bg-gray-50 hover:bg-gray-100'
      }`}
    >
      <div className="flex items-center justify-between">
        <div>
          <div className="font-medium text-gray-900 text-sm">
            {power.displayName}
          </div>
          <div className="text-xs text-gray-600 mt-1">
            {power.encouragement}
          </div>
        </div>
        <Target className={`w-4 h-4 ${isSelected ? 'text-purple-500' : 'text-gray-400'}`} />
      </div>
    </button>
  )
}

// Helper Functions
function formatSkillName(skill: string): string {
  const skillNames: Record<string, string> = {
    'easy_word_building': 'Word Building',
    'regular_word_building': 'Advanced Words', 
    'challenge_word_building': 'Complex Words',
    'easy_story_reading': 'Story Reading',
    'regular_story_reading': 'Chapter Reading',
    'challenge_story_reading': 'Advanced Reading',
    'long_words': 'Multi-syllable Words',
    'reading_speed': 'Reading Fluency',
    'comprehension': 'Understanding Stories',
    'spelling': 'Word Spelling',
    'focus': 'Concentration Power'
  }
  return skillNames[skill] || skill.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
}

function getEncouragementMessage(skill: string): string {
  const encouragements: Record<string, string> = {
    'long_words': 'Big words, big brain! 🧠',
    'reading_speed': 'Speed reading superhero! ⚡',
    'comprehension': 'Story detective skills! 🔍',
    'spelling': 'Word wizard in training! ✨',
    'focus': 'Concentration champion! 🎯'
  }
  return encouragements[skill] || 'Building awesome skills! 💪'
}

function getReadingEncouragement(speed: number): string {
  if (speed >= 150) return "You're a reading rocket! 🚀"
  if (speed >= 120) return "Amazing reading power! ⚡"
  if (speed >= 100) return "Reading speed growing strong! 💪"
  if (speed >= 80) return "Great progress, keep going! 🌟"
  return "Your reading power is building! 🌱"
}