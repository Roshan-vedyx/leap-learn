// src/pages/teacher/PhonicsWorksheetGenerator.tsx
import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Download, Loader2 } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Select } from '../../components/ui/Select'
import { generatePhonicsWorksheet } from '../../services/worksheetGenerator'

interface Word {
  id: string
  word: string
  complexity: string
  phonics_focus: string
  chunks: string[]
  alternative_chunks: string[]
  themes: string[]
}

interface WorksheetData {
  selectedPattern: string
  difficulty: string
  wordCount: number
  words: Word[]
}

export const PhonicsWorksheetGenerator: React.FC = () => {
  const [words, setWords] = useState<Word[]>([])
  const [availablePatterns, setAvailablePatterns] = useState<string[]>([])
  const [selectedPattern, setSelectedPattern] = useState('')
  const [difficulty, setDifficulty] = useState<'easy' | 'regular' | 'challenge'>('easy')
  const [wordCount, setWordCount] = useState(15)
  const [isLoading, setIsLoading] = useState(false)
  const [worksheetData, setWorksheetData] = useState<WorksheetData | null>(null)

  // Load words data on component mount
  useEffect(() => {
    const loadWords = async () => {
      try {
        const response = await fetch('/words.json')
        const data = await response.json()
        const wordsArray = data.words || []
        setWords(wordsArray)

        // Extract unique phonics patterns
        const patterns = [...new Set(wordsArray.map((w: Word) => w.phonics_focus))]
          .filter(Boolean)
          .sort()
        setAvailablePatterns(patterns)
        
        if (patterns.length > 0) {
          setSelectedPattern(patterns[0])
        }
      } catch (error) {
        console.error('Error loading words:', error)
      }
    }

    loadWords()
  }, [])

  const handleGenerateWorksheet = async () => {
    if (!selectedPattern) return

    setIsLoading(true)
    try {
      const worksheet = await generatePhonicsWorksheet({
        words,
        pattern: selectedPattern,
        difficulty,
        wordCount
      })
      setWorksheetData(worksheet)
    } catch (error) {
      console.error('Error generating worksheet:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleBack = () => {
    window.location.href = '/teacher/dashboard'
  }

  const handleDownloadPDF = () => {
    if (worksheetData) {
      // PDF generation will be implemented in next step
      console.log('Download PDF for:', worksheetData.selectedPattern)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Button
              onClick={handleBack}
              className="mr-4 bg-gray-100 text-gray-700 hover:bg-gray-200"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Dashboard
            </Button>
            
            <div className="flex items-center">
              <FileText className="w-6 h-6 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Phonics Practice Worksheets</h1>
                <p className="text-sm text-gray-600">Generate targeted phonics activities</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Worksheet Configuration */}
          <Card className="p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-6">Worksheet Settings</h2>
            
            <div className="space-y-6">
              {/* Phonics Pattern Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Which phonics pattern?
                </label>
                <select
                  value={selectedPattern}
                  onChange={(e) => setSelectedPattern(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="">Select a pattern...</option>
                  {availablePatterns.map((pattern) => (
                    <option key={pattern} value={pattern}>
                      {pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                    </option>
                  ))}
                </select>
              </div>

              {/* Difficulty Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty level
                </label>
                <select
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'regular' | 'challenge')}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value="easy">Easy</option>
                  <option value="regular">Regular</option>
                  <option value="challenge">Challenge</option>
                </select>
              </div>

              {/* Word Count */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Number of words
                </label>
                <select
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full p-3 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option value={10}>10 words</option>
                  <option value={15}>15 words</option>
                  <option value={20}>20 words</option>
                </select>
              </div>

              {/* Generate Button */}
              <Button
                onClick={handleGenerateWorksheet}
                disabled={!selectedPattern || isLoading}
                className="w-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <FileText className="w-4 h-4 mr-2" />
                    Generate Worksheet
                  </>
                )}
              </Button>
            </div>
          </Card>

          {/* Preview Area */}
          <Card className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-semibold text-gray-900">Worksheet Preview</h2>
              {worksheetData && (
                <Button
                  onClick={handleDownloadPDF}
                  className="bg-green-600 text-white hover:bg-green-700"
                >
                  <Download className="w-4 h-4 mr-2" />
                  Download PDF
                </Button>
              )}
            </div>

            {worksheetData ? (
              <div className="space-y-6">
                {/* Worksheet Title */}
                <div className="text-center border-b pb-4">
                  <h3 className="text-xl font-bold text-gray-900">
                    {worksheetData.selectedPattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())} Practice
                  </h3>
                  <p className="text-sm text-gray-600 mt-1">
                    {worksheetData.difficulty.charAt(0).toUpperCase() + worksheetData.difficulty.slice(1)} Level • {worksheetData.words.length} Words
                  </p>
                </div>

                {/* Word List Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Word Bank:</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {worksheetData.words.slice(0, 12).map((word) => (
                      <div key={word.id} className="p-2 bg-gray-50 rounded text-center">
                        {word.word}
                      </div>
                    ))}
                    {worksheetData.words.length > 12 && (
                      <div className="p-2 bg-gray-100 rounded text-center text-gray-500">
                        +{worksheetData.words.length - 12} more
                      </div>
                    )}
                  </div>
                </div>

                {/* Activities Preview */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Activities Include:</h4>
                  <div className="space-y-2 text-sm text-gray-700">
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span><strong>Word Sort:</strong> Sort words by syllables</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span><strong>Fill in the Pattern:</strong> Complete missing letters</span>
                    </div>
                    <div className="flex items-start">
                      <div className="w-2 h-2 bg-indigo-500 rounded-full mt-2 mr-3 flex-shrink-0" />
                      <span><strong>Build-a-Word:</strong> Use letter chunks to build words</span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center text-gray-500 py-12">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-30" />
                <p>Select your settings and click "Generate Worksheet" to preview</p>
              </div>
            )}
          </Card>
        </div>
      </main>
    </div>
  )
}