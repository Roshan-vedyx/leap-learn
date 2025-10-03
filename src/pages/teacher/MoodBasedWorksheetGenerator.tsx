// src/pages/teacher/MoodBasedWorksheetGenerator.tsx

import React, { useState } from 'react'
import { Cloud, Zap, Moon, Download, Eye, ArrowLeft } from 'lucide-react'
import { generateMoodBasedWorksheet } from '../../lib/worksheetGenerator'
import { generateMoodPDF } from '../../components/worksheets/pdf/MoodPDFGenerator'
import WorksheetPreview from '../../components/worksheets/WorksheetPreview'

type MoodType = 'overwhelmed' | 'highEnergy' | 'lowEnergy' | null
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
  const [selectedMood, setSelectedMood] = useState<MoodType>(null)
  const [worksheetData, setWorksheetData] = useState<any>(null)
  const [showPreview, setShowPreview] = useState(false)
  const [hasGenerated, setHasGenerated] = useState(false)

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

  const handleMoodSelect = (mood: MoodType) => {
    if (!mood) return
    
    setSelectedMood(mood)
    
    // Generate immediately with 2 activities
    const data = generateMoodBasedWorksheet(mood)
    setWorksheetData(data)
    setShowPreview(true)
    setHasGenerated(true)
  }
  
  const handleGenerateAnother = () => {
    if (selectedMood) {
      const data = generateMoodBasedWorksheet(selectedMood)
      setWorksheetData(data)
    }
  }

  const handleDownload = async () => {
    if (!worksheetData || !selectedMood) return
    await generateMoodPDF(worksheetData, selectedMood)
  }
  
  const handleStartOver = () => {
    setSelectedMood(null)
    setWorksheetData(null)
    setShowPreview(false)
  }

  const handleQuickPick = () => {
    setSelectedMood('overwhelmed')
    
    const data = generateMoodBasedWorksheet('overwhelmed')
    setWorksheetData(data)
    setShowPreview(true)
    setHasGenerated(true)
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
            <span className={selectedMood ? 'font-semibold text-blue-600' : ''}>
                Choose Mood
            </span>
            <span>→</span>
            <span className={showPreview ? 'font-semibold text-blue-600' : ''}>
                Preview
            </span>
          </div>

          {showPreview && (
            <button
                onClick={handleStartOver}
                className="mt-4 text-sm text-gray-500 hover:text-gray-700 underline"
            >
                Start over
            </button>
          )}
        </div>

        <div className="flex gap-8 justify-center">
          {/* Left Column - Selection */}
          <div className={`${showPreview ? 'flex-1' : 'max-w-3xl mx-auto w-full'} transition-all`}>
            {/* Mood Selection */}
            {!showPreview && (
              <div className="space-y-8">
                <h2 className="text-3xl font-semibold text-center text-gray-800">
                  How is your child today?
                </h2>
                
                {/* Quick Pick Button */}
                <div className="mb-6 p-4 bg-purple-50 rounded-xl border-2 border-purple-300">
                  <p className="text-sm text-gray-700 mb-3 text-center">
                    In a rush? Don't want to choose?
                  </p>
                  <button
                    onClick={handleQuickPick}
                    className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all hover:shadow-xl"
                  >
                    ⚡ Quick Pick: Generate Now (Overwhelmed + Easy Words)
                  </button>
                </div>
                
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
                    <strong>Tip: You don't need to do one worksheet per day.</strong> <br/>
                    Some days your child might do none. Some days they might do two. 
                    Match the worksheet to your child's state right now, not to external expectations.
                  </p>
                </div>
              </div>
            )}
            
          </div>

          {/* Right Column - Preview */}
          {showPreview && worksheetData && (
            <div className="w-2/5 flex flex-col gap-4">
              <div className="bg-white rounded-xl shadow-lg p-6 border-2 border-gray-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <Eye className="w-5 h-5 text-gray-600" />
                    <h3 className="text-lg font-semibold text-gray-900">Preview</h3>
                  </div>
                </div>

                <WorksheetPreview data={worksheetData} />

                <div className="mt-6 space-y-3">
                  <button
                    onClick={handleDownload}
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold shadow-lg transition-all hover:shadow-xl flex items-center justify-center gap-2"
                  >
                    <Download className="w-5 h-5" />
                    Download PDF
                  </button>

                  <button
                    onClick={handleGenerateAnother}
                    className="w-full bg-gray-100 hover:bg-gray-200 text-gray-900 px-6 py-3 rounded-lg font-semibold transition-all"
                  >
                    Generate Similar
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}