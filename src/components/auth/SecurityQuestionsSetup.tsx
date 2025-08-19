// src/components/auth/SecurityQuestionsSetup.tsx - NEW FILE
import React, { useState } from 'react'
import { Shield, CheckCircle, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { SECURITY_QUESTIONS, type SecurityQuestionOption } from '../../types/auth'
import bcrypt from 'bcryptjs'

interface SecurityQuestionsSetupProps {
  onComplete: (questions: { id: string; question: string; answerHash: string }[]) => void
  onSkip?: () => void
}

export const SecurityQuestionsSetup: React.FC<SecurityQuestionsSetupProps> = ({ 
  onComplete, 
  onSkip 
}) => {
  const [selectedQuestions, setSelectedQuestions] = useState<string[]>([])
  const [answers, setAnswers] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const handleQuestionToggle = (questionId: string) => {
    if (selectedQuestions.includes(questionId)) {
      // Remove question
      setSelectedQuestions(prev => prev.filter(id => id !== questionId))
      setAnswers(prev => {
        const newAnswers = { ...prev }
        delete newAnswers[questionId]
        return newAnswers
      })
    } else if (selectedQuestions.length < 3) {
      // Add question (max 3)
      setSelectedQuestions(prev => [...prev, questionId])
    }
  }

  const handleAnswerChange = (questionId: string, answer: string) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: answer.toLowerCase().trim() // Normalize for consistency
    }))
  }

  const handleSubmit = async () => {
    if (selectedQuestions.length < 2) {
      setError('Please choose at least 2 questions')
      return
    }

    // Check all answers are filled
    const missingAnswers = selectedQuestions.filter(id => !answers[id]?.trim())
    if (missingAnswers.length > 0) {
      setError('Please answer all selected questions')
      return
    }

    setLoading(true)
    setError('')

    try {
      // Hash all answers
      const hashedQuestions = await Promise.all(
        selectedQuestions.map(async (questionId) => {
          const question = SECURITY_QUESTIONS.find(q => q.id === questionId)!
          const answerHash = await bcrypt.hash(answers[questionId], 10)
          
          return {
            id: questionId,
            question: question.question,
            answerHash
          }
        })
      )

      onComplete(hashedQuestions)
    } catch (err) {
      setError('Failed to save security questions. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <div className="text-center mb-8">
        <div className="flex justify-center mb-4">
          <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
            <Shield className="w-8 h-8 text-green-600 dark:text-green-400" />
          </div>
        </div>
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
          Help Me Remember
        </h2>
        <p className="text-gray-600 dark:text-gray-300">
          Choose 2-3 questions to help you remember your PIN if you ever need it.
          Pick the ones that are easy for you to remember!
        </p>
      </div>

      <div className="space-y-4 mb-8">
        {SECURITY_QUESTIONS.map((question) => {
          const isSelected = selectedQuestions.includes(question.id)
          const canSelect = selectedQuestions.length < 3 || isSelected

          return (
            <div key={question.id} className="relative">
              <div
                className={`p-4 border-2 rounded-lg cursor-pointer transition-all ${
                  isSelected
                    ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                    : canSelect
                    ? 'border-gray-300 dark:border-gray-600 hover:border-green-300 dark:hover:border-green-600 bg-white dark:bg-gray-800'
                    : 'border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-900 opacity-50 cursor-not-allowed'
                }`}
                onClick={() => canSelect && handleQuestionToggle(question.id)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center mt-0.5 ${
                    isSelected
                      ? 'border-green-500 bg-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}>
                    {isSelected && (
                      <CheckCircle className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900 dark:text-white mb-2">
                      {question.question}
                    </h3>
                    {isSelected && (
                      <input
                        type="text"
                        value={answers[question.id] || ''}
                        onChange={(e) => handleAnswerChange(question.id, e.target.value)}
                        placeholder={question.placeholder}
                        className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg 
                                 bg-white dark:bg-gray-700 text-gray-900 dark:text-white
                                 focus:ring-2 focus:ring-green-500 focus:border-transparent
                                 placeholder-gray-400 dark:placeholder-gray-500"
                        onClick={(e) => e.stopPropagation()}
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {error && (
        <div className="flex items-center gap-2 text-red-600 dark:text-red-400 text-sm mb-4">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}

      <div className="text-center text-sm text-gray-600 dark:text-gray-400 mb-6">
        Selected: {selectedQuestions.length}/3 questions
        {selectedQuestions.length >= 2 && (
          <span className="text-green-600 dark:text-green-400 ml-2">✓ Ready to save</span>
        )}
      </div>

      <div className="flex gap-4">
        {onSkip && (
          <Button
            onClick={onSkip}
            variant="outline"
            className="flex-1 py-3"
          >
            Skip for Now
          </Button>
        )}
        <Button
          onClick={handleSubmit}
          disabled={loading || selectedQuestions.length < 2}
          className="flex-1 bg-green-600 hover:bg-green-700 text-white py-3"
        >
          {loading ? (
            <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
          ) : (
            'Save Questions'
          )}
        </Button>
      </div>
    </div>
  )
}