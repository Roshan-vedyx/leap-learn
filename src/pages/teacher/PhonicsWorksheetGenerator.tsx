// src/pages/teacher/PhonicsWorksheetGenerator.tsx
import React, { useState, useEffect } from 'react'
import { ArrowLeft, FileText, Download, Loader2, Settings, Eye, BookOpen } from 'lucide-react'
import { TeacherAppWrapper } from '../../components/teacher/TeacherAppWrapper'
import { Button } from '../../components/ui/Button'
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

  const handleDownloadPDF = () => {
    if (worksheetData) {
      // PDF generation will be implemented in next step
      console.log('Download PDF for:', worksheetData.selectedPattern)
      alert('PDF download feature will be available in the next update!')
    }
  }

  const formatPatternName = (pattern: string) => {
    return pattern.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())
  }

  return (
    <TeacherAppWrapper currentPage="worksheets">
      {/* Breadcrumb Navigation */}
      <div className="flex items-center gap-2 text-sm text-gray-500 mb-6">
        <Button
          onClick={() => window.location.href = '/teacher/dashboard'}
          variant="ghost"
          size="sm"
          className="text-gray-600 hover:text-gray-900 p-0"
        >
          Dashboard
        </Button>
        <span>/</span>
        <span className="text-gray-900 font-medium">Phonics Worksheets</span>
      </div>

      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="bg-blue-50 p-2 rounded-lg">
            <BookOpen className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Phonics Practice Worksheets</h1>
            <p className="text-gray-600 mt-1">
              Generate research-based phonics activities for neurodivergent learners
            </p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <div className="space-y-6">
          <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
            <div className="flex items-center gap-2 mb-6">
              <Settings className="w-5 h-5 text-gray-600" />
              <h2 className="text-lg font-semibold text-gray-900">Worksheet Configuration</h2>
            </div>
            
            <div className="space-y-6">
              {/* Phonics Pattern Selection */}
              <div>
                <label htmlFor="pattern-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Phonics Pattern
                </label>
                <select
                  id="pattern-select"
                  value={selectedPattern}
                  onChange={(e) => setSelectedPattern(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="" disabled>Select a phonics pattern...</option>
                  {availablePatterns.map((pattern) => (
                    <option key={pattern} value={pattern}>
                      {formatPatternName(pattern)}
                    </option>
                  ))}
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Choose the specific sound pattern to focus on
                </p>
              </div>

              {/* Difficulty Level */}
              <div>
                <label htmlFor="difficulty-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Difficulty Level
                </label>
                <select
                  id="difficulty-select"
                  value={difficulty}
                  onChange={(e) => setDifficulty(e.target.value as 'easy' | 'regular' | 'challenge')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value="easy">Easy (Simple words, high frequency)</option>
                  <option value="regular">Regular (Mixed complexity)</option>
                  <option value="challenge">Challenge (Complex patterns)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  Adjust complexity for your students' reading level
                </p>
              </div>

              {/* Word Count */}
              <div>
                <label htmlFor="word-count-select" className="block text-sm font-medium text-gray-700 mb-2">
                  Number of Words
                </label>
                <select
                  id="word-count-select"
                  value={wordCount}
                  onChange={(e) => setWordCount(parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                >
                  <option value={10}>10 words (Quick practice)</option>
                  <option value={15}>15 words (Standard worksheet)</option>
                  <option value={20}>20 words (Extended practice)</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">
                  More words provide additional practice opportunities
                </p>
              </div>

              {/* Generate Button */}
              <div className="pt-4">
                <Button
                  onClick={handleGenerateWorksheet}
                  disabled={!selectedPattern || isLoading}
                  className="w-full bg-blue-600 text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Generating Worksheet...
                    </>
                  ) : (
                    <>
                      <FileText className="w-4 h-4 mr-2" />
                      Generate Worksheet
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Worksheet Features Info */}
          <div className="bg-blue-50 p-6 rounded-lg border border-blue-200">
            <h3 className="font-medium text-blue-900 mb-3">✨ Worksheet Features</h3>
            <ul className="space-y-2 text-sm text-blue-800">
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Word Sort Activity:</strong> Students categorize words by syllable count</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Pattern Recognition:</strong> Fill in missing letters in target pattern</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Word Building:</strong> Use phonetic chunks to construct words</span>
              </li>
              <li className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0" />
                <span><strong>Reading Practice:</strong> Sentences using target pattern words</span>
              </li>
            </ul>
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
                  Download PDF
                </Button>
              )}
            </div>

            {worksheetData ? (
              <div className="space-y-6">
                {/* Worksheet Header */}
                <div className="text-center p-4 border-2 border-dashed border-gray-200 rounded-lg">
                  <h3 className="text-xl font-bold text-gray-900 mb-1">
                    {formatPatternName(worksheetData.selectedPattern)} Practice
                  </h3>
                  <p className="text-sm text-gray-600">
                    {difficulty.charAt(0).toUpperCase() + difficulty.slice(1)} Level • {worksheetData.words.length} Words
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Created on {new Date().toLocaleDateString()}
                  </p>
                </div>

                {/* Word Bank Preview */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-3 text-sm">Word Bank:</h4>
                  <div className="grid grid-cols-3 gap-2 text-sm">
                    {worksheetData.words.slice(0, 12).map((word) => (
                      <div key={word.id} className="p-2 bg-gray-50 rounded border text-center font-medium">
                        {word.word}
                      </div>
                    ))}
                    {worksheetData.words.length > 12 && (
                      <div className="p-2 bg-gray-100 rounded border text-center text-gray-500 text-xs">
                        +{worksheetData.words.length - 12} more words
                      </div>
                    )}
                  </div>
                </div>

                {/* Activities Preview */}
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900 text-sm">Included Activities:</h4>
                  
                  <div className="space-y-3">
                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        1
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Word Sort Challenge</p>
                        <p className="text-xs text-gray-600">Sort words by number of syllables (1, 2, 3+ syllables)</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        2
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Fill the Pattern</p>
                        <p className="text-xs text-gray-600">Complete words with missing letters in the target pattern</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        3
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Build-a-Word</p>
                        <p className="text-xs text-gray-600">Use letter chunks to construct target pattern words</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3 p-3 bg-slate-50 rounded-md">
                      <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-xs font-bold">
                        4
                      </div>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 text-sm">Reading Practice</p>
                        <p className="text-xs text-gray-600">Sentences featuring target pattern words in context</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Teaching Notes */}
                <div className="bg-amber-50 p-4 rounded-lg border border-amber-200">
                  <h4 className="font-medium text-amber-900 text-sm mb-2">📝 Teaching Notes</h4>
                  <ul className="text-xs text-amber-800 space-y-1">
                    <li>• This worksheet targets {formatPatternName(worksheetData.selectedPattern).toLowerCase()} recognition and production</li>
                    <li>• Activities progress from recognition to application for systematic skill building</li>
                    <li>• Consider pre-teaching any unfamiliar vocabulary before worksheet completion</li>
                    <li>• Encourage students to sound out words rather than guess for maximum benefit</li>
                  </ul>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-96 text-gray-500">
                <FileText className="w-16 h-16 mb-4 opacity-30" />
                <p className="text-lg font-medium mb-2">No Worksheet Generated Yet</p>
                <p className="text-sm text-center max-w-sm">
                  Configure your settings on the left and click "Generate Worksheet" to create a preview
                </p>
              </div>
            )}
          </div>

          {/* Usage Statistics */}
          {worksheetData && (
            <div className="bg-white p-4 rounded-lg border border-gray-200 shadow-sm">
              <h3 className="font-medium text-gray-900 text-sm mb-3">📊 Pattern Statistics</h3>
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div className="text-center p-2 bg-blue-50 rounded">
                  <div className="font-semibold text-blue-900">{worksheetData.words.length}</div>
                  <div className="text-blue-700">Total Words</div>
                </div>
                <div className="text-center p-2 bg-emerald-50 rounded">
                  <div className="font-semibold text-emerald-900">
                    {Math.round(worksheetData.words.reduce((acc, word) => acc + word.word.length, 0) / worksheetData.words.length)}
                  </div>
                  <div className="text-emerald-700">Avg. Length</div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </TeacherAppWrapper>
  )
}