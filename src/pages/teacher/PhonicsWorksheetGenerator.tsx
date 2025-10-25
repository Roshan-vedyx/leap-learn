// src/pages/teacher/PhonicsWorksheetGenerator.tsx
import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Download, Loader2, Eye, Brain, ChevronDown } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { generatePhonicsWorksheet } from '../../services/worksheetGenerator'
import { generateAndDownloadPDF } from '../../services/pdfGenerator'
import { useUserTier, useUsageLimit, useTrackGeneration, usePurchaseEmergencyPack } from '../../hooks/useUsageTracking'
import { WeeklyUsageCounter } from '../../components/worksheets/WeeklyUsageCounter'
import { UpgradeModal } from '../../components/worksheets/UpgradeModal'

interface WorksheetData {
  config: any
  words: any[]
  activities: any[]
  estimatedTime: number
}

export const PhonicsWorksheetGenerator: React.FC = () => {
  // Simple state for the three-step process
  const [selectedSkillLevel, setSelectedSkillLevel] = useState<string>('')
  const [optionalAge, setOptionalAge] = useState<number | null>(null)
  const [showFineTune, setShowFineTune] = useState(false)
  
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

  const canGenerateBasic = selectedSkillLevel !== ''

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
      
      // Build config from skill level and optional age
      const config = {
        skillLevel: selectedSkillLevel,
        age: optionalAge
      }

      // Mock words for demo - replace with actual backend call
      const mockWords = Array.from({length: 20}, (_, i) => ({
        id: `word_${i}`,
        word: `word${i}`,
        complexity: i < 5 ? 'easy' : i < 15 ? 'medium' : 'hard'
      }))

      const result = {
        config,
        words: mockWords,
        activities: [
          { name: 'Pattern Detective', description: 'Find and circle the pattern' },
          { name: 'Word Building', description: 'Build new words with the pattern' },
          { name: 'Reading Practice', description: 'Read words aloud' }
        ],
        estimatedTime: 15
      }

      setWorksheetData(result)
      if (!isPremium) {
        await refetch()
      }
    } catch (error) {
      console.error('Error generating worksheet:', error)
      alert('Failed to generate worksheet. Please try again.')
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadPDF = async () => {
    if (!worksheetData) return
    await generateAndDownloadPDF(worksheetData)
  }

  const resetSelections = () => {
    setSelectedSkillLevel('')
    setOptionalAge(null)
    setShowFineTune(false)
    setWorksheetData(null)
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
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto mb-4">
        <Button
          variant="outline"
          onClick={() => window.history.back()}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="font-medium">Back to Dashboard</span>
        </Button>
      </div>
      
      <div className="max-w-7xl mx-auto">
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

        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Quick Phonics Worksheet
          </h1>
          <p className="text-lg text-gray-600">
            Three simple choices, one great worksheet
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Quick Configuration */}
          <div className="lg:col-span-2 space-y-8">
            
            {/* Main Form - Simplified */}
            <div className="space-y-6">
              {/* Single Dropdown */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-3">
                  What's your child working on?
                </label>
                <select
                  value={selectedSkillLevel}
                  onChange={(e) => setSelectedSkillLevel(e.target.value)}
                  className="w-full p-4 border-2 border-gray-200 rounded-lg text-base focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all"
                >
                  <option value="">Select a skill level...</option>
                  <option value="letters_sounds">Learning letters & sounds (ages 5-7)</option>
                  <option value="cvc_words">Building CVC words (ages 6-8)</option>
                  <option value="magic_e">Magic E & patterns (ages 7-10)</option>
                  <option value="complex_patterns">Complex patterns (ages 8-12)</option>
                  <option value="reading_fluency">Reading fluency (ages 9-14)</option>
                </select>
              </div>

              {/* Optional Fine-Tune Section */}
              <div className="border border-gray-200 rounded-lg overflow-hidden">
                <button
                  onClick={() => setShowFineTune(!showFineTune)}
                  className="w-full px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between text-sm font-medium text-gray-700"
                >
                  <span className="flex items-center gap-2">
                    <span>✨</span>
                    <span>Fine-tune (optional)</span>
                  </span>
                  <ChevronDown className={`w-4 h-4 transition-transform ${showFineTune ? 'rotate-180' : ''}`} />
                </button>
                
                {showFineTune && (
                  <div className="p-4 space-y-3">
                    <div>
                      <label className="block text-xs font-medium text-gray-600 mb-2">
                        My child's actual age
                      </label>
                      <select
                        value={optionalAge ?? ''}
                        onChange={(e) => setOptionalAge(e.target.value ? parseInt(e.target.value) : null)}
                        className="w-full p-2 border border-gray-300 rounded text-sm focus:border-blue-500 focus:ring-1 focus:ring-blue-200"
                      >
                        <option value="">Prefer not to say</option>
                        {Array.from({length: 10}, (_, i) => i + 5).map(age => (
                          <option key={age} value={age}>{age} years old</option>
                        ))}
                      </select>
                      <p className="text-xs text-gray-500 mt-1">
                        Helps us pick age-appropriate themes
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Generate Button */}
              <Button
                onClick={generateWorksheet}
                disabled={!canGenerateBasic || isLoading || usageLoading}
                variant="primary"
                className="w-full py-4 text-base font-medium"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-5 h-5 mr-2" />
                    Generate Worksheet
                  </>
                )}
              </Button>

              {/* Usage Counter */}
              {!isPremium && (
                <WeeklyUsageCounter
                  remaining={remaining}
                  resetDate={resetDate}
                  onUpgrade={() => setShowUpgradeModal(true)}
                />
              )}
            </div>
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
    </div>
  )
}