// src/pages/teacher/PhonicsWorksheetGenerator.tsx
import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Download, Loader2, Settings, Eye, BookOpen, User, Zap, Target, Brain } from 'lucide-react'
import { TeacherAppWrapper } from '../../components/teacher/TeacherAppWrapper'
import { Button } from '../../components/ui/Button'
import { generatePhonicsWorksheet } from '../../services/worksheetGenerator'
import { generateAndDownloadPDF } from '../../services/pdfGenerator'

interface Word {
  id: string
  word: string
  complexity: string
  phonics_focus: string
  chunks: string[]
  alternative_chunks: string[]
  themes: string[]
}

interface StudentProfile {
  processingStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  attentionSpan: 'brief' | 'moderate' | 'extended'
  sensoryNeeds: string[]
  motorPlanning: 'high_support' | 'some_support' | 'independent'
  socialEmotional: 'confidence_building' | 'challenge_ready' | 'mixed'
}

interface WorksheetConfig {
  studentProfile: StudentProfile
  energyLevel: 'full_focus' | 'partial' | 'survival_mode'
  learningGoal: 'pattern_recognition' | 'fluency_practice' | 'confidence_building'
  selectedPattern: string
  availableTime: number // in minutes
  preferredActivities: string[]
}

interface WorksheetData {
  config: WorksheetConfig
  words: Word[]
  activities: ActivityModule[]
  estimatedTime: number
}

interface ActivityModule {
  id: string
  name: string
  description: string
  estimatedTime: number
  cognitiveLoad: 'low' | 'medium' | 'high'
  sensoryDemands: string[]
  canSkip: boolean
  successRate: number // 0-1, how likely student is to succeed
  type: 'recognition' | 'production' | 'application' | 'creative'
}

export const PhonicsWorksheetGenerator: React.FC = () => {
  const [words, setWords] = useState<Word[]>([])
  const [availablePatterns, setAvailablePatterns] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [worksheetData, setWorksheetData] = useState<WorksheetData | null>(null)
  
  // Student-centered configuration state
  const [config, setConfig] = useState<WorksheetConfig>({
    studentProfile: {
      processingStyle: 'visual',
      attentionSpan: 'moderate',
      sensoryNeeds: [],
      motorPlanning: 'some_support',
      socialEmotional: 'confidence_building'
    },
    energyLevel: 'full_focus',
    learningGoal: 'pattern_recognition',
    selectedPattern: '',
    availableTime: 20,
    preferredActivities: []
  })

  // Available activity modules
  const ACTIVITY_MODULES: ActivityModule[] = [
    {
      id: 'pattern_detective',
      name: 'Pattern Detective',
      description: 'Circle the magic pattern in 4-6 words',
      estimatedTime: 5,
      cognitiveLoad: 'low',
      sensoryDemands: ['visual_scanning'],
      canSkip: false,
      successRate: 0.9,
      type: 'recognition'
    },
    {
      id: 'word_choice_sort',
      name: 'Word Choice Sort',
      description: 'Pick your favorite 3 words and sort them',
      estimatedTime: 8,
      cognitiveLoad: 'medium',
      sensoryDemands: ['decision_making', 'visual_organization'],
      canSkip: true,
      successRate: 0.85,
      type: 'recognition'
    },
    {
      id: 'build_your_word',
      name: 'Build Your Word',
      description: 'Choose 2-4 words to build from chunks',
      estimatedTime: 10,
      cognitiveLoad: 'high',
      sensoryDemands: ['motor_planning', 'sequence_building'],
      canSkip: true,
      successRate: 0.7,
      type: 'production'
    },
    {
      id: 'movement_spelling',
      name: 'Movement Spelling',
      description: 'Spell words with body movements',
      estimatedTime: 7,
      cognitiveLoad: 'medium',
      sensoryDemands: ['kinesthetic', 'gross_motor'],
      canSkip: true,
      successRate: 0.95,
      type: 'application'
    },
    {
      id: 'word_story_starter',
      name: 'Word Story Starter',
      description: 'Write 1-3 sentences using pattern words',
      estimatedTime: 12,
      cognitiveLoad: 'high',
      sensoryDemands: ['creative_thinking', 'fine_motor'],
      canSkip: true,
      successRate: 0.6,
      type: 'creative'
    },
    {
      id: 'pattern_hunt_real_world',
      name: 'Real World Hunt',
      description: 'Find 2-5 pattern words around you',
      estimatedTime: 15,
      cognitiveLoad: 'low',
      sensoryDemands: ['environmental_scanning'],
      canSkip: true,
      successRate: 0.8,
      type: 'application'
    }
  ]

  // Load words data on component mount
  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('/words.json')
        const data = await response.json()
        const wordsArray = data.words || []
        setWords(wordsArray)

        const patterns = [...new Set(wordsArray.map((w: Word) => w.phonics_focus))]
          .filter(Boolean)
          .sort()
        setAvailablePatterns(patterns)
        
        if (patterns.length > 0) {
          setConfig(prev => ({ ...prev, selectedPattern: patterns[0] }))
        }
      } catch (error) {
        console.error('Error loading words:', error)
      }
    }

    loadWords()
  }, [])

  const generateAdaptiveWorksheet = async () => {
    if (!config.selectedPattern || words.length === 0) return
    
    setIsLoading(true)
    try {
      // Filter words by pattern and student needs
      const patternWords = words.filter(w => w.phonics_focus === config.selectedPattern)
      
      // Select appropriate words based on student profile
      const selectedWords = selectWordsForStudent(patternWords, config)
      
      // Choose activities based on student profile and time available
      const selectedActivities = selectActivitiesForStudent(ACTIVITY_MODULES, config)
      
      const worksheetData: WorksheetData = {
        config,
        words: selectedWords,
        activities: selectedActivities,
        estimatedTime: selectedActivities.reduce((sum, activity) => sum + activity.estimatedTime, 0)
      }
      
      setWorksheetData(worksheetData)
    } catch (error) {
      console.error('Error generating worksheet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectWordsForStudent = (patternWords: Word[], config: WorksheetConfig): Word[] => {
    // Start with easier words for confidence building
    const easyWords = patternWords.filter(w => w.complexity === 'easy')
    const regularWords = patternWords.filter(w => w.complexity === 'regular')
    const challengeWords = patternWords.filter(w => w.complexity === 'challenge')
    
    let selectedWords: Word[] = []
    
    // Always include 2-3 confidence builders
    selectedWords.push(...easyWords.slice(0, 3))
    
    // Add appropriate challenge level based on goals and energy
    if (config.learningGoal === 'confidence_building' || config.energyLevel === 'survival_mode') {
      selectedWords.push(...regularWords.slice(0, 2))
    } else if (config.learningGoal === 'pattern_recognition') {
      selectedWords.push(...regularWords.slice(0, 3))
      selectedWords.push(...challengeWords.slice(0, 1))
    } else { // fluency_practice
      selectedWords.push(...regularWords.slice(0, 2))
      selectedWords.push(...challengeWords.slice(0, 2))
    }
    
    // Limit total words based on attention span
    const maxWords = config.studentProfile.attentionSpan === 'brief' ? 6 : 
                    config.studentProfile.attentionSpan === 'moderate' ? 10 : 15
    
    return selectedWords.slice(0, maxWords)
  }

  const selectActivitiesForStudent = (availableActivities: ActivityModule[], config: WorksheetConfig): ActivityModule[] => {
    let activities = [...availableActivities]
    
    // Filter based on student profile
    activities = activities.filter(activity => {
      // Remove high cognitive load activities for survival mode
      if (config.energyLevel === 'survival_mode' && activity.cognitiveLoad === 'high') {
        return false
      }
      
      // Remove activities that don't match processing style
      if (config.studentProfile.processingStyle === 'kinesthetic' && 
          !activity.sensoryDemands.includes('kinesthetic') && 
          !activity.sensoryDemands.includes('gross_motor')) {
        // Prioritize movement-based activities for kinesthetic learners
        return activity.sensoryDemands.includes('kinesthetic') || activity.sensoryDemands.includes('motor_planning')
      }
      
      return true
    })
    
    // Sort by success rate and appropriateness
    activities.sort((a, b) => {
      if (config.learningGoal === 'confidence_building') {
        return b.successRate - a.successRate
      }
      return a.estimatedTime - b.estimatedTime
    })
    
    // Select activities that fit in available time
    const selectedActivities: ActivityModule[] = []
    let totalTime = 0
    
    // Always include pattern detective (core recognition)
    const patternDetective = activities.find(a => a.id === 'pattern_detective')
    if (patternDetective) {
      selectedActivities.push(patternDetective)
      totalTime += patternDetective.estimatedTime
    }
    
    // Add other activities within time limit
    for (const activity of activities) {
      if (activity.id === 'pattern_detective') continue // already added
      
      if (totalTime + activity.estimatedTime <= config.availableTime) {
        selectedActivities.push(activity)
        totalTime += activity.estimatedTime
      }
      
      if (selectedActivities.length >= 4) break // Max 4 activities
    }
    
    return selectedActivities
  }

  const handleDownloadPDF = async () => {
    if (!worksheetData) return
    
    try {
      setIsLoading(true)
      await generateAndDownloadPDF({
        selectedPattern: worksheetData.config.selectedPattern,
        difficulty: 'adaptive', // We use adaptive difficulty
        wordCount: worksheetData.words.length,
        words: worksheetData.words,
        activities: worksheetData.activities.map(activity => ({
          type: activity.type as any,
          title: activity.name,
          instructions: activity.description,
          content: activity
        })),
        studentProfile: worksheetData.config.studentProfile
      })
    } catch (error) {
      console.error('Error generating PDF:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const formatPatternName = (pattern: string) => {
    return pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <TeacherAppWrapper title="Student-Centered Phonics Worksheets">
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-5 gap-8">
          
          {/* Student Profile Configuration */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <User className="w-5 h-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-gray-900">Student Profile</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning Style
                  </label>
                  <select 
                    value={config.studentProfile.processingStyle}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      studentProfile: {
                        ...prev.studentProfile,
                        processingStyle: e.target.value as any
                      }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="visual">Visual Processor</option>
                    <option value="auditory">Auditory Processor</option>
                    <option value="kinesthetic">Kinesthetic Learner</option>
                    <option value="mixed">Mixed Processing</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attention Span
                  </label>
                  <select 
                    value={config.studentProfile.attentionSpan}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      studentProfile: {
                        ...prev.studentProfile,
                        attentionSpan: e.target.value as any
                      }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="brief">Brief (5-10 min)</option>
                    <option value="moderate">Moderate (10-20 min)</option>
                    <option value="extended">Extended (20+ min)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Motor Planning Support
                  </label>
                  <select 
                    value={config.studentProfile.motorPlanning}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      studentProfile: {
                        ...prev.studentProfile,
                        motorPlanning: e.target.value as any
                      }
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="high_support">High Support Needed</option>
                    <option value="some_support">Some Support Helpful</option>
                    <option value="independent">Independent</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Today's Context */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="w-5 h-5 text-orange-600" />
                <h3 className="text-lg font-semibold text-gray-900">Today's Context</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student's Energy Level
                  </label>
                  <select 
                    value={config.energyLevel}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      energyLevel: e.target.value as any
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  >
                    <option value="full_focus">Full Focus - Ready to Learn</option>
                    <option value="partial">Partial Energy - Some Challenges OK</option>
                    <option value="survival_mode">Survival Mode - Success First</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Available Time (minutes)
                  </label>
                  <input 
                    type="number"
                    value={config.availableTime}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      availableTime: parseInt(e.target.value) || 20
                    }))}
                    min="5"
                    max="60"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>

            {/* Learning Goals */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 mb-4">
                <Target className="w-5 h-5 text-green-600" />
                <h3 className="text-lg font-semibold text-gray-900">Learning Focus</h3>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Primary Goal
                  </label>
                  <select 
                    value={config.learningGoal}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      learningGoal: e.target.value as any
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    <option value="confidence_building">Confidence Building</option>
                    <option value="pattern_recognition">Pattern Recognition</option>
                    <option value="fluency_practice">Fluency Practice</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phonics Pattern
                  </label>
                  <select 
                    value={config.selectedPattern}
                    onChange={(e) => setConfig(prev => ({
                      ...prev,
                      selectedPattern: e.target.value
                    }))}
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  >
                    {availablePatterns.map(pattern => (
                      <option key={pattern} value={pattern}>
                        {formatPatternName(pattern)}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mt-6">
                <Button
                  onClick={generateAdaptiveWorksheet}
                  disabled={isLoading || !config.selectedPattern}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Creating Personalized Worksheet...
                    </>
                  ) : (
                    <>
                      <Brain className="w-4 h-4 mr-2" />
                      Create Student Worksheet
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Worksheet Preview */}
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Adaptive Worksheet Preview</h2>
                </div>
                {worksheetData && (
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download PDF
                  </Button>
                )}
              </div>

              {worksheetData ? (
                <div className="space-y-6">
                  {/* Worksheet Summary */}
                  <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                    <h3 className="font-medium text-blue-900 mb-3">Personalized for This Student</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                      <div>
                        <span className="font-medium">Pattern:</span> {formatPatternName(worksheetData.config.selectedPattern)}
                      </div>
                      <div>
                        <span className="font-medium">Word Count:</span> {worksheetData.words.length} words
                      </div>
                      <div>
                        <span className="font-medium">Activities:</span> {worksheetData.activities.length} modules
                      </div>
                      <div>
                        <span className="font-medium">Estimated Time:</span> {worksheetData.estimatedTime} minutes
                      </div>
                    </div>
                  </div>

                  {/* Selected Activities */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Selected Activities:</h4>
                    {worksheetData.activities.map((activity, index) => (
                      <div key={activity.id} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white ${
                          activity.cognitiveLoad === 'low' ? 'bg-green-500' : 
                          activity.cognitiveLoad === 'medium' ? 'bg-yellow-500' : 'bg-red-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <p className="font-medium text-gray-900 text-sm">{activity.name}</p>
                          <p className="text-xs text-gray-600">{activity.description}</p>
                          <div className="flex items-center gap-4 mt-1 text-xs text-gray-500">
                            <span>{activity.estimatedTime} min</span>
                            <span>Success rate: {Math.round(activity.successRate * 100)}%</span>
                            {activity.canSkip && <span className="text-green-600">Can skip if needed</span>}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Word Preview */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Selected Words:</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                      {worksheetData.words.map(word => (
                        <div key={word.id} className={`p-2 rounded text-center text-sm ${
                          word.complexity === 'easy' ? 'bg-green-100 text-green-800' :
                          word.complexity === 'regular' ? 'bg-blue-100 text-blue-800' :
                          'bg-purple-100 text-purple-800'
                        }`}>
                          {word.word}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* ND Accommodations Note */}
                  <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                    <h4 className="font-medium text-amber-900 text-sm mb-2">Built-in ND Supports</h4>
                    <ul className="text-xs text-amber-800 space-y-1">
                      <li>• Choice-based activities: Student picks preferred options</li>
                      <li>• Success-first approach: Easy wins before challenges</li>
                      <li>• Flexible completion: "Do what feels right today"</li>
                      <li>• Movement breaks integrated throughout</li>
                      <li>• Clear visual hierarchy and generous white space</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <Brain className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">Ready to Create</p>
                  <p className="text-sm text-center max-w-sm">
                    Configure the student profile and learning context, then generate a personalized worksheet
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TeacherAppWrapper>
  )
}