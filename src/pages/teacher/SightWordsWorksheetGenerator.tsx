// src/pages/teacher/SightWordsWorksheetGenerator.tsx
import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Download, Loader2, Settings, Eye, BookOpen, User, Zap, Target, Brain, Heart, Star, Smile } from 'lucide-react'
import { TeacherAppWrapper } from '../../components/teacher/TeacherAppWrapper'
import { Button } from '../../components/ui/Button'
import { useUserTier, useUsageLimit, useTrackGeneration, usePurchaseEmergencyPack } from '../../hooks/useUsageTracking'
import { WeeklyUsageCounter } from '../../components/worksheets/WeeklyUsageCounter'
import { UpgradeModal } from '../../components/worksheets/UpgradeModal'

interface SightWord {
  id: string
  word: string
  frequency_tier: 'essential' | 'high' | 'medium' | 'advanced'
  grade_intro: number // when typically introduced, but we use flexibly
  complexity: 'easy' | 'regular' | 'tricky'
  visual_features: string[] // ['double_letters', 'silent_letters', 'unusual_pattern']
  meaning_category: string[] // ['emotions', 'actions', 'descriptions', 'questions']
  student_interest_tags: string[] // ['animals', 'friendship', 'mystery', 'space']
  phonetic_irregular: boolean // true for words that don't follow typical patterns
  length: number
  emotional_valence: 'positive' | 'neutral' | 'complex'
}

interface StudentProfile {
  processingStyle: 'visual_strengths' | 'auditory_strengths' | 'kinesthetic_movement' | 'pattern_detective' | 'story_connections'
  attentionSpan: 'quick_wins' | 'moderate_focus' | 'deep_dive_ready'
  sensoryNeeds: string[]
  motorPlanning: 'high_support' | 'some_support' | 'independent_writing'
  confidenceLevel: 'building_trust' | 'ready_to_stretch' | 'seeking_challenge'
  interests: string[] // what they actually care about
  knownWordEstimate: 'emerging_reader' | 'developing_reader' | 'fluent_but_gaps'
}

interface SightWordConfig {
  studentProfile: StudentProfile
  todaysEnergy: 'survival_mode' | 'steady_learning' | 'peak_performance'
  learningGoal: 'confidence_building' | 'filling_gaps' | 'expanding_vocabulary' | 'fluency_practice'
  knownWords: string[] // words they already recognize confidently
  curiousWords: string[] // words they've asked about or shown interest in
  interestContext: string // current book, topic, or project they're working on
  availableTime: number
  preferredActivities: string[]
  avoidToday: string[] // activities or approaches to skip today
}

interface WorksheetData {
  config: SightWordConfig
  selectedWords: SightWord[]
  activities: SightWordActivity[]
  estimatedTime: number
  rationale: string // why these words were chosen
  successPrediction: number
}

interface SightWordActivity {
  id: string
  name: string
  description: string
  estimatedTime: number
  cognitiveLoad: 'light' | 'moderate' | 'intensive'
  requires: string[] // ['writing', 'cutting', 'movement_space']
  adaptations: string[]
  successRate: number
  type: 'recognition' | 'meaning_connection' | 'context_practice' | 'creative_expression'
}

export const SightWordsWorksheetGenerator: React.FC = () => {
  const [availableWords, setAvailableWords] = useState<SightWord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [worksheetData, setWorksheetData] = useState<WorksheetData | null>(null)
  
  const [config, setConfig] = useState<SightWordConfig>({
    studentProfile: {
      processingStyle: 'visual_strengths',
      attentionSpan: 'moderate_focus',
      sensoryNeeds: [],
      motorPlanning: 'some_support',
      confidenceLevel: 'building_trust',
      interests: [],
      knownWordEstimate: 'developing_reader'
    },
    todaysEnergy: 'steady_learning',
    learningGoal: 'confidence_building',
    knownWords: [],
    curiousWords: [],
    interestContext: '',
    availableTime: 15,
    preferredActivities: [],
    avoidToday: []
  })

  // Usage tracking
  const { tier, isPremium } = useUserTier()
  const usageLimit = useUsageLimit()
  const { remaining, canGenerate, loading: usageLoading, resetDate, refetch } = usageLimit
  const { trackGeneration } = useTrackGeneration()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { purchaseEmergencyPack, isPurchasing } = usePurchaseEmergencyPack()

  // Mock sight word activities - in real app these would be more sophisticated
  const SIGHT_WORD_ACTIVITIES: SightWordActivity[] = [
    {
      id: 'word_detective',
      name: 'Word Detective',
      description: 'Find and circle your chosen words in a mini story',
      estimatedTime: 6,
      cognitiveLoad: 'light',
      requires: ['visual_scanning'],
      adaptations: ['Large print available', 'Color coding options', 'Partner reading'],
      successRate: 0.95,
      type: 'recognition'
    },
    {
      id: 'meaning_connections',
      name: 'What Does This Mean to You?',
      description: 'Connect words to personal experiences through pictures or phrases',
      estimatedTime: 8,
      cognitiveLoad: 'moderate',
      requires: ['self_reflection'],
      adaptations: ['Drawing instead of writing', 'Voice recording option', 'Visual symbol choices'],
      successRate: 0.88,
      type: 'meaning_connection'
    },
    {
      id: 'context_champions',
      name: 'Context Champions',
      description: 'See words in 3 different contexts (story, question, description)',
      estimatedTime: 7,
      cognitiveLoad: 'moderate',
      requires: ['reading_comprehension'],
      adaptations: ['Audio support', 'Visual context clues', 'Multiple choice format'],
      successRate: 0.82,
      type: 'context_practice'
    },
    {
      id: 'word_building_blocks',
      name: 'Word Building Blocks',
      description: 'Build words from letter tiles or write in creative ways',
      estimatedTime: 10,
      cognitiveLoad: 'moderate',
      requires: ['fine_motor', 'sequencing'],
      adaptations: ['Large manipulatives', 'Digital letter tiles', 'Trace-over options'],
      successRate: 0.75,
      type: 'creative_expression'
    },
    {
      id: 'movement_words',
      name: 'Movement Words',
      description: 'Spell words with movement, find word cards around room',
      estimatedTime: 8,
      cognitiveLoad: 'light',
      requires: ['movement_space', 'gross_motor'],
      adaptations: ['Seated movements', 'Partner participation', 'Simplified gestures'],
      successRate: 0.92,
      type: 'recognition'
    },
    {
      id: 'story_starring_you',
      name: 'Story Starring You',
      description: 'Create a mini story using your words and your interests',
      estimatedTime: 12,
      cognitiveLoad: 'intensive',
      requires: ['creative_thinking', 'writing'],
      adaptations: ['Sentence starters', 'Picture prompts', 'Dictation option'],
      successRate: 0.68,
      type: 'creative_expression'
    }
  ]

  useEffect(() => {
    // In real app, load from your words database
    setAvailableWords([]) // Mock data would go here
  }, [])

  const generateWorksheet = async () => {
    // Check usage limit for free users
    if (!isPremium && !canGenerate) {
      setShowUpgradeModal(true)
      return
    }
    
    setIsLoading(true)
    
    try {
      if (!isPremium) {
        try {
          await trackGeneration()
        } catch (error) {
          setIsLoading(false)
          alert('Failed to track usage. Please try again.')
          return
        }
      }
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      // Smart word selection based on student profile
      const selectedWords = selectWordsForStudent(config)
      const selectedActivities = selectActivitiesForStudent(config)
      
      const worksheetData: WorksheetData = {
        config,
        selectedWords,
        activities: selectedActivities,
        estimatedTime: selectedActivities.reduce((sum, activity) => sum + activity.estimatedTime, 0),
        rationale: generateRationale(config, selectedWords),
        successPrediction: calculateSuccessPrediction(config, selectedWords, selectedActivities)
      }
      
      setWorksheetData(worksheetData)
      // Refetch to update counter
      if (!isPremium) {
        refetch()
      }
    } catch (error) {
      console.error('Error generating worksheet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const selectWordsForStudent = (config: SightWordConfig): SightWord[] => {
    // Mock implementation - real version would query your database
    const mockWords: SightWord[] = [
      {
        id: '1', word: 'friend', frequency_tier: 'high', grade_intro: 1, complexity: 'regular',
        visual_features: ['common_ending'], meaning_category: ['relationships'], 
        student_interest_tags: ['friendship'], phonetic_irregular: false, length: 6, emotional_valence: 'positive'
      },
      {
        id: '2', word: 'because', frequency_tier: 'essential', grade_intro: 2, complexity: 'tricky',
        visual_features: ['silent_letters', 'long_word'], meaning_category: ['connectors'], 
        student_interest_tags: ['universal'], phonetic_irregular: true, length: 7, emotional_valence: 'neutral'
      },
      {
        id: '3', word: 'amazing', frequency_tier: 'medium', grade_intro: 3, complexity: 'regular',
        visual_features: ['familiar_chunks'], meaning_category: ['descriptions'], 
        student_interest_tags: ['universal'], phonetic_irregular: false, length: 7, emotional_valence: 'positive'
      }
    ]
    
    return mockWords.slice(0, getOptimalWordCount(config))
  }

  const selectActivitiesForStudent = (config: SightWordConfig): SightWordActivity[] => {
    let activities = [...SIGHT_WORD_ACTIVITIES]
    
    // Filter out activities to avoid today
    activities = activities.filter(activity => 
      !config.avoidToday.includes(activity.id)
    )
    
    // Prioritize based on student profile
    if (config.studentProfile.processingStyle === 'kinesthetic_movement') {
      activities.sort((a, b) => {
        if (a.id === 'movement_words') return -1
        if (b.id === 'movement_words') return 1
        return 0
      })
    }
    
    // Adjust for energy level
    if (config.todaysEnergy === 'survival_mode') {
      activities = activities.filter(a => a.cognitiveLoad === 'light')
    }
    
    // Select appropriate number based on time and attention
    const maxActivities = config.studentProfile.attentionSpan === 'quick_wins' ? 2 : 
                         config.studentProfile.attentionSpan === 'moderate_focus' ? 3 : 4
    
    return activities.slice(0, maxActivities)
  }

  const getOptimalWordCount = (config: SightWordConfig): number => {
    if (config.todaysEnergy === 'survival_mode') return 3
    if (config.studentProfile.attentionSpan === 'quick_wins') return 4
    if (config.learningGoal === 'confidence_building') return 5
    return 6 // maximum for any session
  }

  const generateRationale = (config: SightWordConfig, words: SightWord[]): string => {
    return `Selected ${words.length} words focusing on ${config.learningGoal.replace('_', ' ')} with ${config.studentProfile.processingStyle.replace('_', ' ')} approach. Energy level: ${config.todaysEnergy.replace('_', ' ')}.`
  }

  const calculateSuccessPrediction = (config: SightWordConfig, words: SightWord[], activities: SightWordActivity[]): number => {
    // Simple mock calculation
    const baseSuccess = config.learningGoal === 'confidence_building' ? 0.9 : 0.8
    const energyMultiplier = config.todaysEnergy === 'peak_performance' ? 1.1 : 
                           config.todaysEnergy === 'survival_mode' ? 0.9 : 1.0
    return Math.min(0.98, baseSuccess * energyMultiplier)
  }

  const handleDownload = async () => {
    if (!worksheetData) return
    
    // Mock PDF generation - integrate with your existing pdfGenerator
    alert('PDF generation would happen here using your existing pdfGenerator service')
  }

  const handleUpgrade = () => {
    window.location.href = '/teacher/pricing'
  }

  const handleEmergencyPack = async () => {
    const result = await purchaseEmergencyPack()
    if (result.success) {
      await refetch()
      setShowUpgradeModal(false)
      alert('✅ Emergency pack activated! You now have 2 more worksheets this week.')
    } else {
      alert(result.error || 'Purchase failed. Please try again.')
    }
  }

  const calculateDaysUntilReset = () => {
    if (!resetDate) return 7
    const now = new Date()
    const diffTime = resetDate.getTime() - now.getTime()
    return Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)))
  }

  return (
    <TeacherAppWrapper>
      {/* Usage Counter */}
      {!isPremium && (
        <WeeklyUsageCounter
          used={usageLimit?.used || 0}
          remaining={remaining}
          limit={usageLimit?.limit || 3}
          resetDate={resetDate || new Date()}
          isPremium={isPremium}
        />
      )}

      {/* Upgrade Modal */}
      <UpgradeModal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        onUpgrade={handleUpgrade}
        onEmergencyPack={handleEmergencyPack}
        daysUntilReset={calculateDaysUntilReset()}
      />
      <div className="max-w-6xl mx-auto p-6">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="outline"
            onClick={() => window.history.back()}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </Button>
          <div className="flex items-center gap-3">
            <Eye className="w-8 h-8 text-emerald-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Sight Words Practice Generator</h1>
              <p className="text-gray-600">Create personalized sight word experiences that honor how each student learns</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Configuration Panel */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Student-Centered Approach Header */}
            <div className="bg-emerald-50 p-6 rounded-lg border border-emerald-200">
              <div className="flex items-start gap-3">
                <Heart className="w-6 h-6 text-emerald-600 mt-1" />
                <div>
                  <h3 className="font-semibold text-emerald-900 mb-2">Student-Centered Approach</h3>
                  <p className="text-emerald-800 text-sm mb-3">
                    Instead of "What grade-level words should they know?", we ask "What words will help this student feel successful and curious today?"
                  </p>
                  <div className="grid md:grid-cols-2 gap-4 text-xs text-emerald-700">
                    <div>
                      <strong>Traditional:</strong> Rainbow write 20 words
                    </div>
                    <div>
                      <strong>ND-Friendly:</strong> Choose 3-5 meaningful words, multiple ways to engage
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Student Profile */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <User className="w-5 h-5 text-blue-600" />
                Student Profile
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    How does this student learn best?
                  </label>
                  <select
                    value={config.studentProfile.processingStyle}
                    onChange={(e) => setConfig({
                      ...config,
                      studentProfile: {
                        ...config.studentProfile,
                        processingStyle: e.target.value as any
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="visual_strengths">Visual patterns and shapes</option>
                    <option value="auditory_strengths">Sounds and rhythms</option>
                    <option value="kinesthetic_movement">Movement and touch</option>
                    <option value="pattern_detective">Finding patterns and rules</option>
                    <option value="story_connections">Through stories and meaning</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Attention span today
                  </label>
                  <select
                    value={config.studentProfile.attentionSpan}
                    onChange={(e) => setConfig({
                      ...config,
                      studentProfile: {
                        ...config.studentProfile,
                        attentionSpan: e.target.value as any
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="quick_wins">Quick wins (5-10 min focus)</option>
                    <option value="moderate_focus">Moderate focus (10-20 min)</option>
                    <option value="deep_dive_ready">Deep dive ready (20+ min)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Confidence level lately
                  </label>
                  <select
                    value={config.studentProfile.confidenceLevel}
                    onChange={(e) => setConfig({
                      ...config,
                      studentProfile: {
                        ...config.studentProfile,
                        confidenceLevel: e.target.value as any
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="building_trust">Building trust - needs gentle wins</option>
                    <option value="ready_to_stretch">Ready to stretch a little</option>
                    <option value="seeking_challenge">Seeking challenge and growth</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Reading level estimate
                  </label>
                  <select
                    value={config.studentProfile.knownWordEstimate}
                    onChange={(e) => setConfig({
                      ...config,
                      studentProfile: {
                        ...config.studentProfile,
                        knownWordEstimate: e.target.value as any
                      }
                    })}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="emerging_reader">Emerging reader (knows 20-50 sight words)</option>
                    <option value="developing_reader">Developing reader (knows 50-150 sight words)</option>
                    <option value="fluent_but_gaps">Fluent reader with specific gaps</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Today's Context */}
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-orange-600" />
                Today's Context
              </h3>
              
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Student's energy today
                  </label>
                  <select
                    value={config.todaysEnergy}
                    onChange={(e) => setConfig({...config, todaysEnergy: e.target.value as any})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="survival_mode">Survival mode - keep it simple</option>
                    <option value="steady_learning">Steady learning mode</option>
                    <option value="peak_performance">Peak performance - bring the challenge!</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Learning goal today
                  </label>
                  <select
                    value={config.learningGoal}
                    onChange={(e) => setConfig({...config, learningGoal: e.target.value as any})}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  >
                    <option value="confidence_building">Build confidence with known-ish words</option>
                    <option value="filling_gaps">Fill specific gaps in sight vocabulary</option>
                    <option value="expanding_vocabulary">Expand vocabulary with new words</option>
                    <option value="fluency_practice">Practice fluency and speed</option>
                  </select>
                </div>
              </div>

              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  What are they reading/interested in lately? (helps choose relevant words)
                </label>
                <input
                  type="text"
                  value={config.interestContext}
                  onChange={(e) => setConfig({...config, interestContext: e.target.value})}
                  placeholder="e.g., 'Dog Man books', 'wants to learn about space', 'writing stories about friendship'"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={generateWorksheet}
                disabled={isLoading}
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating personalized practice...
                  </>
                ) : (
                  <>
                    <Star className="w-5 h-5" />
                    Generate Student-Centered Worksheet
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-emerald-600" />
                Worksheet Preview
              </h3>

              {worksheetData ? (
                <div className="space-y-4">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <div className="text-sm text-gray-600">Estimated Time</div>
                      <div className="font-medium">{worksheetData.estimatedTime} minutes</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-600">Success Prediction</div>
                      <div className="font-medium text-emerald-600">
                        {Math.round(worksheetData.successPrediction * 100)}% likely to succeed
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Selected Words</h4>
                    <div className="flex flex-wrap gap-2">
                      {worksheetData.selectedWords.map((word) => (
                        <div
                          key={word.id}
                          className={`px-3 py-1 rounded-full text-sm font-medium ${
                            word.complexity === 'easy' ? 'bg-green-100 text-green-800' :
                            word.complexity === 'regular' ? 'bg-blue-100 text-blue-800' :
                            'bg-orange-100 text-orange-800'
                          }`}
                        >
                          {word.word}
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Activities</h4>
                    <div className="space-y-2">
                      {worksheetData.activities.map((activity) => (
                        <div key={activity.id} className="flex justify-between items-center py-2 px-3 bg-gray-50 rounded">
                          <div>
                            <div className="font-medium text-sm">{activity.name}</div>
                            <div className="text-xs text-gray-600">{activity.description}</div>
                          </div>
                          <div className="text-xs text-gray-500">
                            {activity.estimatedTime}min
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="pt-4 border-t">
                    <h4 className="font-medium text-gray-900 mb-2">Why These Choices?</h4>
                    <p className="text-sm text-gray-600">{worksheetData.rationale}</p>
                  </div>

                  <Button
                    onClick={handleDownload}
                    className="w-full bg-emerald-600 text-white hover:bg-emerald-700 flex items-center justify-center gap-2"
                  >
                    <Download className="w-4 h-4" />
                    Download Worksheet
                  </Button>

                  {/* ND Accommodations Note */}
                  <div className="bg-emerald-50 p-4 rounded-lg border border-emerald-200">
                    <h4 className="font-medium text-emerald-900 text-sm mb-2">Built-in ND Supports</h4>
                    <ul className="text-xs text-emerald-800 space-y-1">
                      <li>• Student chooses which words to focus on</li>
                      <li>• Multiple ways to demonstrate knowledge</li>
                      <li>• No handwriting required unless student prefers it</li>
                      <li>• Success-first approach: starts with confidence builders</li>
                      <li>• Clear instructions with visual supports</li>
                      <li>• Movement breaks and sensory options included</li>
                    </ul>
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <Smile className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">Ready to Create</p>
                  <p className="text-sm text-center max-w-sm">
                    Tell us about this student and what they need today, then we'll create personalized sight word practice
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