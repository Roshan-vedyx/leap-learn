// src/pages/teacher/PhonicsWorksheetGenerator.tsx
import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Download, Loader2, Eye, Brain, BookOpen, Zap, Target, Heart, Sun, Cloud, CloudRain, Clock, ChevronDown, ChevronRight } from 'lucide-react'
import { TeacherAppWrapper } from '../../components/teacher/TeacherAppWrapper'
import { Button } from '../../components/ui/Button'
import { generatePhonicsWorksheet } from '../../services/worksheetGenerator'
import { generateAndDownloadPDF } from '../../services/pdfGenerator'
import { useUserTier, useUsageLimit, useTrackGeneration, usePurchaseEmergencyPack } from '../../hooks/useUsageTracking'
import { WeeklyUsageCounter } from '../../components/worksheets/WeeklyUsageCounter'
import { UpgradeModal } from '../../components/worksheets/UpgradeModal'


// Student archetype definitions
const STUDENT_ARCHETYPES = [
  {
    id: 'pattern_lover',
    icon: BookOpen,
    title: 'Loves patterns, hates writing',
    description: 'Gets phonics rules but won\'t put pencil to paper',
    details: 'Often gifted but has motor/processing issues',
    config: {
      processingStyle: 'visual',
      motorPlanning: 'high_support',
      socialEmotional: 'confidence_building',
      preferredActivities: ['pattern_detective', 'word_choice_sort']
    }
  },
  {
    id: 'creative_overwhelmed',
    icon: Heart,
    title: 'Creative but easily overwhelmed',
    description: 'Rich vocabulary, imaginative ideas',
    details: 'Shuts down with too many choices/instructions',
    config: {
      processingStyle: 'mixed',
      attentionSpan: 'brief',
      socialEmotional: 'confidence_building',
      preferredActivities: ['pattern_detective']
    }
  },
  {
    id: 'high_energy',
    icon: Zap,
    title: 'High energy, needs movement',
    description: 'Learns best when body is engaged',
    details: 'Traditional sit-still work causes frustration',
    config: {
      processingStyle: 'kinesthetic',
      attentionSpan: 'brief',
      socialEmotional: 'challenge_ready',
      preferredActivities: ['movement_spelling', 'build_your_word']
    }
  },
  {
    id: 'careful_processor',
    icon: Target,
    title: 'Careful processor, needs confidence',
    description: 'Smart but scared of making mistakes',
    details: 'Needs guaranteed wins before attempting harder things',
    config: {
      processingStyle: 'visual',
      attentionSpan: 'extended',
      socialEmotional: 'confidence_building',
      preferredActivities: ['pattern_detective', 'word_choice_sort']
    }
  }
]

const ENERGY_LEVELS = [
  {
    id: 'good_focus',
    icon: Sun,
    label: 'Good focus day',
    description: 'They can handle some challenge',
    config: { energyLevel: 'full_focus', learningGoal: 'pattern_recognition' }
  },
  {
    id: 'mixed_energy',
    icon: Cloud,
    label: 'Mixed energy',
    description: 'Keep it manageable',
    config: { energyLevel: 'partial', learningGoal: 'confidence_building' }
  },
  {
    id: 'rough_day',
    icon: CloudRain,
    label: 'Rough day',
    description: 'Just keep them engaged',
    config: { energyLevel: 'survival_mode', learningGoal: 'confidence_building' }
  }
]

const TIME_OPTIONS = [
  { id: 'quick', label: '5-10 minutes', description: 'transition activity', time: 10 },
  { id: 'main', label: '15-20 minutes', description: 'main lesson', time: 20 },
  { id: 'deep', label: '25+ minutes', description: 'deep practice', time: 30 }
]

interface WorksheetData {
  config: any
  words: any[]
  activities: any[]
  estimatedTime: number
}

export const PhonicsWorksheetGenerator: React.FC = () => {
  // Simple state for the three-step process
  const [selectedArchetype, setSelectedArchetype] = useState<string>('')
  const [selectedEnergy, setSelectedEnergy] = useState<string>('')
  const [selectedTime, setSelectedTime] = useState<string>('')
  const [selectedPattern, setSelectedPattern] = useState<string>('')
  const [availablePatterns, setAvailablePatterns] = useState<string[]>([])
  
  // Worksheet generation state
  const [isLoading, setIsLoading] = useState(false)
  const [worksheetData, setWorksheetData] = useState<WorksheetData | null>(null)
  
  // Advanced options (collapsed by default)
  const [showAdvanced, setShowAdvanced] = useState(false)

  // Usage tracking
  const { tier, isPremium } = useUserTier()
  const usageLimit = useUsageLimit()
  const { remaining, canGenerate, loading: usageLoading, resetDate, refetch } = usageLimit
  const { trackGeneration } = useTrackGeneration()
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const { purchaseEmergencyPack, isPurchasing } = usePurchaseEmergencyPack()

  useEffect(() => {
    // Load available phonics patterns
    setAvailablePatterns(['magic_e', 'long_vowels', 'consonant_blends', 'digraphs', 'r_controlled'])
  }, [])

  const canGenerateBasic = selectedArchetype && selectedEnergy && selectedTime && selectedPattern

  const generateWorksheet = async () => {
    if (!canGenerateBasic) return
    
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
      // Build config from selections
      const archetype = STUDENT_ARCHETYPES.find(a => a.id === selectedArchetype)!
      const energy = ENERGY_LEVELS.find(e => e.id === selectedEnergy)!
      const timeOption = TIME_OPTIONS.find(t => t.id === selectedTime)!

      // Mock words for demo - replace with actual data fetching
      const mockWords = Array.from({length: 20}, (_, i) => ({
        id: `word_${i}`,
        word: `word${i}`,
        complexity: i < 5 ? 'easy' : i < 15 ? 'regular' : 'challenge',
        phonics_focus: selectedPattern,
        chunks: [`chunk${i}`],
        alternative_chunks: [],
        themes: []
      }))

      const result = await generatePhonicsWorksheet({
        words: mockWords,
        selectedPattern,
        archetype: archetype.config,
        energy: energy.config,
        availableTime: timeOption.time
      })
      
      setWorksheetData(result)
      if (!isPremium) {
        refetch()
      }
    } catch (error) {
      console.error('Error generating worksheet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!worksheetData) return
    await generateAndDownloadPDF(worksheetData)
  }

  const resetSelections = () => {
    setSelectedArchetype('')
    setSelectedEnergy('')
    setSelectedTime('')
    setSelectedPattern('')
    setWorksheetData(null)
    setShowAdvanced(false)
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
            <Brain className="w-8 h-8 text-blue-600" />
            <div>
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
                onEmergencyPack={handleEmergencyPack}
                daysUntilReset={calculateDaysUntilReset()}
              />
              <h1 className="text-2xl font-bold text-gray-900">Quick Phonics Worksheet</h1>
              <p className="text-gray-600">Three simple choices, one great worksheet</p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Configuration */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Step 1: What are you teaching? */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                1. What phonics pattern are you teaching today?
              </h3>
              <div className="grid md:grid-cols-3 gap-3 mb-6">
                {availablePatterns.map((pattern) => (
                  <button
                    key={pattern}
                    onClick={() => setSelectedPattern(pattern)}
                    className={`p-3 rounded border-2 text-sm transition-all ${
                      selectedPattern === pattern 
                        ? 'border-blue-500 bg-blue-50 text-blue-700' 
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    {pattern.replace(/_/g, ' ')}
                  </button>
                ))}
              </div>
            </div>

            {/* Step 2: Student Type */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                2. Which student does this sound like?
              </h3>
              <div className="grid md:grid-cols-2 gap-4">
                {STUDENT_ARCHETYPES.map((archetype) => {
                  const Icon = archetype.icon
                  const isSelected = selectedArchetype === archetype.id
                  return (
                    <button
                      key={archetype.id}
                      onClick={() => setSelectedArchetype(archetype.id)}
                      className={`p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <Icon className={`w-5 h-5 mt-1 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{archetype.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{archetype.description}</p>
                          <p className="text-xs text-gray-500 mt-1 italic">{archetype.details}</p>
                        </div>
                      </div>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 3: Today's Energy */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                3. How's today feeling?
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {ENERGY_LEVELS.map((energy) => {
                  const Icon = energy.icon
                  const isSelected = selectedEnergy === energy.id
                  return (
                    <button
                      key={energy.id}
                      onClick={() => setSelectedEnergy(energy.id)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Icon className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      <p className="font-medium text-gray-900 text-sm">{energy.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{energy.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Step 4: Time Available */}
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                4. How much time do you have?
              </h3>
              <div className="grid md:grid-cols-3 gap-4">
                {TIME_OPTIONS.map((timeOption) => {
                  const isSelected = selectedTime === timeOption.id
                  return (
                    <button
                      key={timeOption.id}
                      onClick={() => setSelectedTime(timeOption.id)}
                      className={`p-4 rounded-lg border-2 text-center transition-all ${
                        isSelected 
                          ? 'border-blue-500 bg-blue-50' 
                          : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }`}
                    >
                      <Clock className={`w-6 h-6 mx-auto mb-2 ${isSelected ? 'text-blue-600' : 'text-gray-600'}`} />
                      <p className="font-medium text-gray-900 text-sm">{timeOption.label}</p>
                      <p className="text-xs text-gray-600 mt-1">{timeOption.description}</p>
                    </button>
                  )
                })}
              </div>
            </div>

            {/* Remove the old Step 4 since we moved phonics pattern to Step 1 */}

            {/* Advanced Options (Collapsed) */}
            <div className="bg-gray-50 rounded-lg">
              <button
                onClick={() => setShowAdvanced(!showAdvanced)}
                className="w-full p-4 flex items-center justify-between text-left text-gray-700 hover:text-gray-900"
              >
                <span className="text-sm font-medium">Need more control? Advanced options</span>
                {showAdvanced ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
              </button>
              
              {showAdvanced && (
                <div className="px-4 pb-4 space-y-4">
                  <p className="text-xs text-gray-600">
                    Fine-tune the worksheet after you see the basic version. Most teachers won't need these options.
                  </p>
                  {/* Add detailed options here if needed */}
                  <div className="bg-white p-4 rounded border text-center text-gray-500 text-sm">
                    Advanced customization options would go here
                    <br />
                    (Sensory needs, specific activities to avoid, etc.)
                  </div>
                </div>
              )}
            </div>

            {/* Generate Button */}
            <div className="flex justify-center">
              <Button
                onClick={generateWorksheet}
                disabled={!canGenerate || isLoading}
                className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Creating Your Worksheet...
                  </>
                ) : (
                  <>
                    <Brain className="w-5 h-5 mr-2" />
                    Generate Worksheet
                  </>
                )}
              </Button>
            </div>

            {/* Reset Option */}
            {(selectedArchetype || selectedEnergy || selectedTime || worksheetData) && (
              <div className="text-center">
                <Button
                  onClick={resetSelections}
                  variant="outline"
                  className="text-gray-600"
                >
                  Start Over
                </Button>
              </div>
            )}
          </div>

          {/* Preview Panel */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm min-h-[600px]">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-gray-600" />
                  <h2 className="text-lg font-semibold text-gray-900">Worksheet Preview</h2>
                </div>
                {worksheetData && (
                  <Button
                    onClick={handleDownloadPDF}
                    variant="outline"
                    size="sm"
                    className="border-blue-600 text-blue-600 hover:bg-blue-50"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                )}
              </div>

              {worksheetData ? (
                <div className="space-y-6">
                  {/* Success Prediction */}
                  <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                    <h4 className="font-medium text-green-900 text-sm mb-2">Worksheet Generated!</h4>
                    <ul className="text-xs text-green-800 space-y-1">
                      <li>• {worksheetData.words.length} carefully selected words</li>
                      <li>• {worksheetData.activities.length} activities matching their style</li>
                      <li>• Estimated time: {worksheetData.estimatedTime} minutes</li>
                      <li>• Built-in success supports and movement breaks</li>
                    </ul>
                  </div>

                  {/* Quick Preview */}
                  <div className="space-y-3">
                    <h4 className="font-medium text-gray-900">Activities Include:</h4>
                    {worksheetData.activities.slice(0, 3).map((activity, index) => (
                      <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-medium text-white ${
                          index === 0 ? 'bg-green-500' : index === 1 ? 'bg-blue-500' : 'bg-purple-500'
                        }`}>
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900 text-sm">{activity.name || activity.title}</p>
                          <p className="text-xs text-gray-600">{activity.description || activity.instructions}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                  <Brain className="w-16 h-16 mb-4 opacity-30" />
                  <p className="text-lg font-medium mb-2">Ready to Generate</p>
                  <p className="text-sm text-center max-w-sm">
                    Make your selections above, and we'll create a worksheet that works for your student
                  </p>
                  {canGenerate && (
                    <p className="text-xs text-green-600 mt-2 font-medium">
                      ✓ Ready to generate!
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </TeacherAppWrapper>
  )
}