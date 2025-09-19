// src/components/parent/ParentInsightsView.tsx
// Realistic teacher-to-parent insights dashboard

import React, { useState, useEffect } from 'react'
import { Clock, TrendingUp, AlertCircle, CheckCircle, Brain, Target } from 'lucide-react'
import { analytics, type ChildProgress } from '../../services/analytics'

interface ParentInsightsViewProps {
  childId: string
  childName: string
}

interface TeacherObservation {
  category: 'learning_pattern' | 'focus' | 'skill_development' | 'concern' | 'breakthrough'
  title: string
  observation: string
  context: string
  parentNote?: string
}

export default function ParentInsightsView({ childId, childName }: ParentInsightsViewProps) {
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

  // Create realistic teacher observations from data
  const createTeacherObservations = (progress: ChildProgress): TeacherObservation[] => {
    const observations: TeacherObservation[] = []

    // Focus and attention patterns
    const avgSessionTime = progress.totalMinutes / Math.max(progress.totalSessions, 1)
    if (avgSessionTime > 15) {
      observations.push({
        category: 'focus',
        title: 'Focus Development',
        observation: `${childName} is maintaining attention for an average of ${Math.round(avgSessionTime)} minutes per session.`,
        context: `This is solid focus time for learning activities. They seem to have found a good rhythm.`,
        parentNote: `If they're also focusing well on other activities at home, this suggests their attention skills are developing nicely.`
      })
    } else if (avgSessionTime < 8) {
      observations.push({
        category: 'learning_pattern',
        title: 'Learning in Chunks',
        observation: `${childName} typically engages for ${Math.round(avgSessionTime)} minutes at a time.`,
        context: `Short, focused bursts can be very effective for learning. They're not pushing past their optimal attention window.`,
        parentNote: `This might be their natural learning rhythm - quality over quantity.`
      })
    }

    // Consistency patterns
    if (progress.currentStreak >= 5) {
      observations.push({
        category: 'breakthrough',
        title: 'Building Learning Habits',
        observation: `${childName} has chosen to engage with learning activities ${progress.currentStreak} days running.`,
        context: `This kind of consistency usually means they're finding the activities engaging rather than overwhelming.`,
        parentNote: `This suggests the difficulty level is in their sweet spot right now.`
      })
    }

    // Skill development based on strengths
    if (progress.strengths.length > 0) {
      const primaryStrength = progress.strengths[0].replace(/_/g, ' ')
      observations.push({
        category: 'skill_development',
        title: 'Showing Strength Areas',
        observation: `${childName} is demonstrating confidence with ${primaryStrength} activities.`,
        context: `When kids show consistent success in an area, it often becomes a foundation for tackling harder challenges.`,
        parentNote: `You might notice them applying these skills in other contexts - like when reading signs or books at home.`
      })
    }

    // Areas of growth
    if (progress.practicingAreas.length > 0) {
      const practiceArea = progress.practicingAreas[0].replace(/_/g, ' ')
      observations.push({
        category: 'learning_pattern',
        title: 'Working on Challenge Areas',
        observation: `${childName} is spending time with ${practiceArea} concepts.`,
        context: `I'm seeing them approach these activities without avoidance, which is a good sign.`,
        parentNote: `If they mention this topic at home, it means it's on their mind - a natural part of the learning process.`
      })
    }

    // Week-specific observations
    if (progress.weekSessions < 3 && progress.totalSessions > 10) {
      observations.push({
        category: 'concern',
        title: 'Lower Engagement This Week',
        observation: `${childName} has engaged less frequently this week compared to their usual pattern.`,
        context: `Could be normal life stuff - growth spurts, schedule changes, or just needing a breather.`,
        parentNote: `Worth checking if anything's changed at home or school that might be affecting their energy.`
      })
    }

    return observations
  }

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          <p className="ml-3 text-gray-600">Loading insights for {childName}...</p>
        </div>
      </div>
    )
  }

  if (!progress || progress.totalMinutes === 0) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <div className="bg-white rounded-lg border p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            {childName}'s Learning Insights
          </h2>
          <p className="text-gray-600 mb-4">
            No learning activity data yet. Once {childName} completes a few sessions, 
            I'll be able to share observations about their learning patterns and progress.
          </p>
          <div className="bg-blue-50 border border-blue-200 rounded p-4">
            <p className="text-blue-800 text-sm">
              <strong>What you'll see here:</strong> Concrete observations about focus, learning patterns, 
              and skill development - the kind of insights I'd share in a parent conference.
            </p>
          </div>
        </div>
      </div>
    )
  }

  const observations = createTeacherObservations(progress)
  const avgSessionTime = Math.round(progress.totalMinutes / Math.max(progress.totalSessions, 1))

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      
      {/* Header with key stats */}
      <div className="bg-white rounded-lg border p-6">
        <h1 className="text-2xl font-semibold text-gray-900 mb-4">
          Learning Check-in: {childName}
        </h1>
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center">
                <CheckCircle className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-900">{progress.totalSessions}</div>
                <div className="text-sm text-blue-700">Sessions completed</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-green-500 rounded-full flex items-center justify-center">
                <Clock className="w-10 h-10 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-900">{avgSessionTime} min</div>
                <div className="text-sm text-green-700">Average session</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-orange-50 to-orange-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-orange-500 rounded-full flex items-center justify-center">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-orange-900">{progress.currentStreak}</div>
                <div className="text-sm text-orange-700">Day streak</div>
              </div>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-4 shadow-sm">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-purple-500 rounded-full flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="text-2xl font-bold text-purple-900">{progress.weekSessions}</div>
                <div className="text-sm text-purple-700">This week</div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Teacher Observations */}
      <div className="space-y-4">
        <h2 className="text-xl font-semibold text-gray-900">
          What I'm Noticing
        </h2>
        
        {observations.map((obs, index) => {
          const getIcon = () => {
            switch (obs.category) {
              case 'breakthrough': return <CheckCircle className="w-5 h-5 text-green-600" />
              case 'concern': return <AlertCircle className="w-5 h-5 text-orange-600" />
              case 'focus': return <Brain className="w-5 h-5 text-purple-600" />
              case 'skill_development': return <Target className="w-5 h-5 text-blue-600" />
              default: return <TrendingUp className="w-5 h-5 text-gray-600" />
            }
          }

          const getBorderColor = () => {
            switch (obs.category) {
              case 'breakthrough': return 'border-l-green-400'
              case 'concern': return 'border-l-orange-400'
              case 'focus': return 'border-l-purple-400'
              case 'skill_development': return 'border-l-blue-400'
              default: return 'border-l-gray-400'
            }
          }

          return (
            <div key={index} className={`bg-white border-l-4 ${getBorderColor()} rounded-lg p-6`}>
              <div className="flex items-start gap-3">
                {getIcon()}
                <div className="flex-1">
                  <h3 className="font-semibold text-gray-900 mb-2">
                    {obs.title}
                  </h3>
                  <p className="text-gray-700 mb-3">
                    {obs.observation}
                  </p>
                  <p className="text-gray-600 text-sm mb-3">
                    {obs.context}
                  </p>
                  {obs.parentNote && (
                    <div className="bg-green-100 rounded p-3">
                      <p className="text-gray-700 text-sm">
                        <strong>For you as a parent:</strong> {obs.parentNote}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Current focus areas */}
      <div className="bg-white rounded-lg border p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">
          Current Learning Focus
        </h2>
        
        <div className="grid md:grid-cols-2 gap-6">
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Strong areas we're building on:</h3>
            <div className="space-y-2">
              {progress.strengths.slice(0, 3).map((strength) => (
                <div key={strength} className="text-sm bg-green-50 rounded px-3 py-2 text-green-800">
                  {strength.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
          
          <div>
            <h3 className="font-medium text-gray-900 mb-3">Areas we're working on:</h3>
            <div className="space-y-2">
              {progress.practicingAreas.slice(0, 3).map((area) => (
                <div key={area} className="text-sm bg-blue-50 rounded px-3 py-2 text-blue-800">
                  {area.replace(/_/g, ' ')}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Practical parent section */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h2 className="text-lg font-semibold text-blue-900 mb-4">
          What This Means at Home
        </h2>
        
        <div className="space-y-3 text-sm">
          {avgSessionTime > 15 && (
            <p className="text-blue-800">
              <strong>Good focus stamina:</strong> They can probably handle 10-15 minute homework chunks without getting overwhelmed.
            </p>
          )}
          
          {progress.currentStreak >= 3 && (
            <p className="text-blue-800">
              <strong>Building routine:</strong> They seem to be in a good learning rhythm. Try to keep screen time and activity schedules consistent.
            </p>
          )}
          
          {progress.practicingAreas.length > 0 && (
            <p className="text-blue-800">
              <strong>Growing edges:</strong> If they get frustrated with {progress.practicingAreas[0].replace(/_/g, ' ')} activities at home, that's normal - it means they're working at the right challenge level.
            </p>
          )}

          <p className="text-blue-800">
            <strong>Need more context?</strong> These insights are based on learning activity patterns. If you have specific concerns about {childName}'s learning, consider discussing them with their teacher or learning specialist.
          </p>
        </div>
      </div>

    </div>
  )
}