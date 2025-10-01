// src/pages/teacher/MoodBasedWorksheetGenerator.tsx

import React, { useState } from 'react'
import { Cloud, Zap, Moon, Download, Eye, ArrowLeft } from 'lucide-react'
import { generateMoodBasedWorksheet } from '../../lib/worksheetGenerator'
import { generateMoodPDF } from '../../components/worksheets/pdf/MoodPDFGenerator'
import WorksheetPreview from '../../components/worksheets/WorksheetPreview'

type MoodType = 'overwhelmed' | 'highEnergy' | 'lowEnergy' | null
type PhonicsType = 'cvc' | 'blends' | 'digraphs' | 'sight' | null
type ActivityType = string | null

interface MoodOption {
  type: 'overwhelmed' | 'highEnergy' | 'lowEnergy'
  label: string
  description: string
  icon: React.ComponentType<any>
  color: string
  activeColor: string
}

interface ActivityOption {
  id: string
  label: string
  description: string
}

export default function MoodBasedWorksheetGenerator() {
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [selectedMood, setSelectedMood] = useState<MoodType>(null)
  const [selectedPhonics, setSelectedPhonics] = useState<PhonicsType>(null)
  const [selectedActivity, setSelectedActivity] = useState<ActivityType>(null)
  const [worksheetData, setWorksheetData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)

  const moodOptions: MoodOption[] = [
    {
      type: 'overwhelmed',
      label: 'Overwhelmed',
      description: 'Need calm, simple tasks',
      icon: Cloud,
      color: 'bg-blue-50 hover:bg-blue-100 border-blue-200',
      activeColor: 'bg-blue-100 border-blue-400',
    },
    {
      type: 'highEnergy',
      label: 'High Energy',
      description: 'Ready to move and learn',
      icon: Zap,
      color: 'bg-orange-50 hover:bg-orange-100 border-orange-200',
      activeColor: 'bg-orange-100 border-orange-400',
    },
    {
      type: 'lowEnergy',
      label: 'Low Energy',
      description: 'Gentle, minimal effort',
      icon: Moon,
      color: 'bg-purple-50 hover:bg-purple-100 border-purple-200',
      activeColor: 'bg-purple-100 border-purple-400',
    },
  ]

  const activityOptions: Record<'overwhelmed' | 'highEnergy' | 'lowEnergy', ActivityOption[]> = {
    overwhelmed: [
      { id: 'trace3', label: 'Trace 3 Words', description: 'Just trace 3. That\'s enough.' },
      { id: 'breatheCircle', label: 'Breathe & Circle', description: 'Find words while breathing calmly' },
    ],
    highEnergy: [
      { id: 'soundHunt', label: 'Sound Hunt', description: 'Find all the sounds you can!' },
      { id: 'bodyLetter', label: 'Body Letter Fun', description: 'Make letters with your body' },
    ],
    lowEnergy: [
      { id: 'pointRest', label: 'Point & Rest', description: 'Just point. No writing needed.' },
      { id: 'traceOne', label: 'Trace Just One', description: 'One word. That\'s perfect.' },
    ],
  }

  const handleMoodSelect = (mood: MoodType) => {
    setSelectedMood(mood)
    setStep(2)
    setSelectedActivity(null)
    setShowPreview(false)
    setWorksheetData(null)
  }

  const handlePhonicsSelect = (phonics: PhonicsType) => {
    setSelectedPhonics(phonics)
    setStep(3)
    setShowPreview(false)
    setWorksheetData(null)
  }

  const handleActivitySelect = (activityId: string) => {
    setSelectedActivity(activityId)
    
    // Generate worksheet data immediately for preview
    if (selectedMood && selectedPhonics) {
      const data = generateMoodBasedWorksheet(
        selectedMood,
        selectedPhonics,
        activityId
      )
      setWorksheetData(data)
      setShowPreview(true)
    }
  }

  const handleDownload = async () => {
    if (!worksheetData || !selectedMood || !selectedActivity) return
    await generateMoodPDF(worksheetData, selectedMood, selectedActivity)
  }

  const handleBack = () => {
    if (step === 3) {
      setStep(2)
      setShowPreview(false)
      setSelectedActivity(null)
      setWorksheetData(null)
    } else if (step === 2) {
      setStep(1)
      setSelectedPhonics(null)
    }
  }

  const handleStartOver = () => {
    setStep(1)
    setSelectedMood(null)
    setSelectedPhonics(null)
    setSelectedActivity(null)
    setWorksheetData(null)
    setShowPreview(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-3">
            Mood-Based Phonics Worksheets
          </h1>
          <p className="text-lg text-gray-600 mb-4">
            Match the worksheet to how your child feels right now
          </p>
          
          {/* Breadcrumb indicator */}
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
            <span className={step >= 1 ? 'font-semibold text-blue-600' : ''}>
              Choose Mood
            </span>
            <span>→</span>
            <span className={step >= 2 ? 'font-semibold text-blue-600' : ''}>
              Phonics Pattern
            </span>
            <span>→</span>
            <span className={step >= 3 ? 'font-semibold text-blue-600' : ''}>
              Activity
            </span>
          </div>

          {step > 1 && (
            <button
              onClick={handleStartOver}
              className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
              Start over
            </button>
          )}
        </div>

        <div className="flex gap-8">
          {/* Left Column - Selection */}
          <div className={`${showPreview ? 'flex-1' : 'max-w-3xl mx-auto w-full'} transition-all`}>
            {/* Step 1: Mood Selection */}
            {step === 1 && (
              <div className="space-y-8">
                <h2 className="text-3xl font-semibold text-center text-gray-800">
                  How is your child today?
                </h2>
                <div className="grid md:grid-cols-3 gap-6">
                  {moodOptions.map((mood) => {
                    const Icon = mood.icon
                    return (
                      <button
                        key={mood.type}
                        onClick={() => handleMoodSelect(mood.type)}
                        className={`${mood.color} border-2 rounded-2xl p-8 text-left transition-all hover:shadow-xl hover:-translate-y-1 active:translate-y-0 flex flex-col items-center text-center space-y-4 group`}
                      >
                        <Icon className="w-20 h-20 text-gray-700 group-hover:scale-110 transition-transform" />
                        <div>
                          <h3 className="text-2xl font-bold text-gray-900 mb-2">
                            {mood.label}
                          </h3>
                          <p className="text-sm text-gray-600">{mood.description}</p>
                        </div>
                      </button>
                    )
                  })}
                </div>

                {/* Helper text */}
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 max-w-2xl mx-auto">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    <strong>Tip:</strong> Choose based on right now, not what the plan was. 
                    If your child resists a worksheet, try a different mood. Resistance often means 
                    the cognitive or physical demand doesn't match their current capacity.
                  </p>
                </div>
              </div>
            )}

            {/* Step 2: Phonics Pattern */}
            {step === 2 && (
              <div className="space-y-8">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to mood selection</span>
                </button>
                
                <h2 className="text-3xl font-semibold text-center text-gray-800">
                  What are you practicing?
                </h2>
                
                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {[
                    { id: 'cvc', label: 'CVC Words', example: 'cat, dog, sun' },
                    { id: 'blends', label: 'Blends', example: 'stop, tree, swim' },
                    { id: 'digraphs', label: 'Digraphs', example: 'shop, fish, that' },
                    { id: 'sight', label: 'Sight Words', example: 'the, said, was' },
                  ].map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handlePhonicsSelect(option.id as PhonicsType)}
                      className={`p-8 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                        selectedPhonics === option.id
                          ? 'bg-gray-100 border-gray-400 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <p className="font-bold text-xl text-gray-900 mb-2">{option.label}</p>
                      <p className="text-sm text-gray-500">{option.example}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Step 3: Activity Selection */}
            {step === 3 && selectedMood && (
              <div className="space-y-8">
                <button
                  onClick={handleBack}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" />
                  <span className="text-sm font-medium">Back to phonics selection</span>
                </button>
                
                <h2 className="text-3xl font-semibold text-center text-gray-800">
                  Choose activity type
                </h2>
                
                <div className="grid gap-4 max-w-2xl mx-auto">
                  {activityOptions[selectedMood].map((activity) => (
                    <button
                      key={activity.id}
                      onClick={() => handleActivitySelect(activity.id)}
                      className={`p-8 rounded-xl border-2 text-left transition-all hover:shadow-lg ${
                        selectedActivity === activity.id
                          ? 'bg-gray-100 border-gray-400 shadow-md'
                          : 'bg-white border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-bold text-xl text-gray-900 mb-2">{activity.label}</h3>
                      <p className="text-sm text-gray-600">{activity.description}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Column - Preview */}
          {showPreview && worksheetData && (
            <div className="w-[420px] flex-shrink-0">
              <div className="sticky top-6">
                <div className="bg-white rounded-2xl shadow-2xl p-6 border-2 border-gray-200">
                  <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3 text-gray-700">
                      <Eye className="w-6 h-6" />
                      <span className="font-bold text-lg">Preview</span>
                    </div>
                    <button
                      onClick={handleDownload}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold text-sm shadow-lg flex items-center gap-2 transition-all hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0"
                    >
                      <Download className="w-5 h-5" />
                      Download PDF
                    </button>
                  </div>
                  
                  <WorksheetPreview 
                    data={worksheetData}
                    mood={selectedMood!}
                    activityType={selectedActivity!}
                  />

                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <p className="text-sm text-green-800 leading-relaxed">
                      <strong>Success = </strong>Your child stayed regulated while touching phonics content. 
                      Whether they complete the whole page doesn't matter. Participation is the goal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}