import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { db } from '@/config/firebase'
import { collection, addDoc } from 'firebase/firestore'
import { ChevronRight, Star, ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react'

// Assessment data
const questions = [
  {
    id: 1,
    section: "Learning Style",
    question: "When your child needs to learn something new (like tying shoes or a math concept), they learn best when you...",
    options: [
      { id: 'A', text: 'Show them step-by-step while they watch', score: { visual: 1 } },
      { id: 'B', text: 'Let them try it themselves right away', score: { kinesthetic: 1 } },
      { id: 'C', text: 'Explain it out loud with lots of details', score: { auditory: 1 } },
      { id: 'D', text: 'Give them written instructions to follow', score: { reading: 1 } }
    ]
  },
  {
    id: 2,
    section: "Learning Style", 
    question: "Your child is trying to build something (LEGO, puzzle, craft). They typically...",
    options: [
      { id: 'A', text: 'Study the picture/example carefully first', score: { visual: 1 } },
      { id: 'B', text: 'Jump in and figure it out by trying different pieces', score: { kinesthetic: 1 } },
      { id: 'C', text: 'Ask you to talk them through each step', score: { auditory: 1 } },
      { id: 'D', text: 'Read all the instructions before starting', score: { reading: 1 } }
    ]
  },
  {
    id: 3,
    section: "Learning Style",
    question: "When your child tells you about their day, they...",
    options: [
      { id: 'A', text: 'Use lots of gestures and act things out', score: { visual: 1 } },
      { id: 'B', text: 'Move around while talking', score: { kinesthetic: 1 } },
      { id: 'C', text: 'Give you every single detail in order', score: { auditory: 1 } },
      { id: 'D', text: 'Prefer to write notes or draw pictures about it', score: { visual: 0.5, reading: 0.5 } }
    ]
  },
  {
    id: 4,
    section: "Learning Style",
    question: "If your child had to remember a phone number, they would most likely...",
    options: [
      { id: 'A', text: 'Picture the numbers in their head', score: { visual: 1 } },
      { id: 'B', text: 'Tap out the rhythm with their fingers', score: { kinesthetic: 1 } },
      { id: 'C', text: 'Repeat it out loud several times', score: { auditory: 1 } },
      { id: 'D', text: 'Write it down immediately', score: { reading: 1 } }
    ]
  },
  {
    id: 5,
    section: "Focus Patterns",
    question: "During homework time, your child...",
    options: [
      { id: 'A', text: 'Stays focused but takes frequent movement breaks', score: { kinesthetic: 1, adhd: 0.5 } },
      { id: 'B', text: 'Gets distracted easily but refocuses quickly', score: { adhd: 1 } },
      { id: 'C', text: 'Hyperfocuses and loses track of time', score: { autism: 1 } },
      { id: 'D', text: 'Works steadily at their own consistent pace', score: { neurotypical: 1 } }
    ]
  },
  {
    id: 6,
    section: "Focus Patterns",
    question: "In a busy, noisy environment (like a restaurant), your child...",
    options: [
      { id: 'A', text: 'Becomes overstimulated and wants to leave', score: { sensory: 1, autism: 0.5 } },
      { id: 'B', text: 'Gets very energetic and loud themselves', score: { adhd: 1 } },
      { id: 'C', text: 'Shuts down or becomes withdrawn', score: { autism: 1, sensory: 0.5 } },
      { id: 'D', text: 'Adapts fine but might be tired later', score: { neurotypical: 1 } }
    ]
  },
  {
    id: 7,
    section: "Focus Patterns",
    question: "When your child encounters a problem or frustration, they typically...",
    options: [
      { id: 'A', text: 'Get very upset but calm down quickly with support', score: { adhd: 0.5, emotional: 1 } },
      { id: 'B', text: 'Bounce between different solutions rapidly', score: { adhd: 1 } },
      { id: 'C', text: 'Need time alone to process before trying again', score: { autism: 1 } },
      { id: 'D', text: 'Ask for help and work through it step-by-step', score: { neurotypical: 1 } }
    ]
  },
  {
    id: 8,
    section: "Focus Patterns",
    question: "Your child's attention span is...",
    options: [
      { id: 'A', text: 'Short for boring tasks, laser-focused on interests', score: { adhd: 1 } },
      { id: 'B', text: 'Inconsistent - varies greatly day to day', score: { adhd: 1 } },
      { id: 'C', text: 'Very deep when engaged, hard to interrupt', score: { autism: 1 } },
      { id: 'D', text: 'Pretty consistent across different activities', score: { neurotypical: 1 } }
    ]
  },
  {
    id: 9,
    section: "Strengths",
    question: "Your child's biggest strength is their ability to...",
    options: [
      { id: 'A', text: 'Think creatively and see unique solutions', score: { creative: 1 } },
      { id: 'B', text: 'Notice details others miss', score: { detail: 1, autism: 0.5 } },
      { id: 'C', text: 'Connect with others and show empathy', score: { social: 1 } },
      { id: 'D', text: 'Learn quickly once they understand the pattern', score: { pattern: 1 } }
    ]
  },
  {
    id: 10,
    section: "Strengths",
    question: "When playing or working, your child is happiest when they can...",
    options: [
      { id: 'A', text: 'Follow their own ideas and interests', score: { creative: 1, adhd: 0.5 } },
      { id: 'B', text: 'Organize and categorize things their way', score: { detail: 1, autism: 0.5 } },
      { id: 'C', text: 'Collaborate and share with others', score: { social: 1 } },
      { id: 'D', text: 'Master something completely before moving on', score: { mastery: 1 } }
    ]
  },
  {
    id: 11,
    section: "Strengths",
    question: "Other people often comment that your child...",
    options: [
      { id: 'A', text: 'Has an amazing imagination', score: { creative: 1 } },
      { id: 'B', text: 'Remembers incredible details', score: { detail: 1, autism: 0.5 } },
      { id: 'C', text: 'Is very caring and thoughtful', score: { social: 1 } },
      { id: 'D', text: 'Picks up new things remarkably fast', score: { pattern: 1 } }
    ]
  }
]

type AssessmentData = {
  childName: string
  childAge: string
  parentEmail: string
  answers: { questionId: number; answer: string }[]
  scores: Record<string, number>
  primaryLearningStyle: string
  neurodivergentTraits: string[]
  strengths: string[]
  timestamp: Date
}

type FlowStep = 'landing' | 'info' | 'questions' | 'results'

export const AssessmentFlow = () => {
  const [step, setStep] = useState<FlowStep>('landing')
  const [childName, setChildName] = useState('')
  const [childAge, setChildAge] = useState('')
  const [parentEmail, setParentEmail] = useState('')
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ questionId: number; answer: string }[]>([])
  const [results, setResults] = useState<any>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  const calculateResults = (answers: { questionId: number; answer: string }[]) => {
    const scores: Record<string, number> = {}
    
    answers.forEach(answer => {
      const question = questions.find(q => q.id === answer.questionId)
      const option = question?.options.find(opt => opt.id === answer.answer)
      
      if (option?.score) {
        Object.entries(option.score).forEach(([key, value]) => {
          scores[key] = (scores[key] || 0) + value
        })
      }
    })

    // Determine primary learning style
    const learningStyles = { visual: scores.visual || 0, kinesthetic: scores.kinesthetic || 0, auditory: scores.auditory || 0, reading: scores.reading || 0 }
    const primaryLearningStyle = Object.entries(learningStyles).reduce((a, b) => learningStyles[a[0]] > learningStyles[b[0]] ? a : b)[0]

    // Identify neurodivergent traits
    const neurodivergentTraits = []
    if ((scores.adhd || 0) >= 2) neurodivergentTraits.push('ADHD')
    if ((scores.autism || 0) >= 2) neurodivergentTraits.push('Autism')
    if ((scores.sensory || 0) >= 1) neurodivergentTraits.push('Sensory Processing')

    // Identify strengths
    const strengths = []
    if ((scores.creative || 0) >= 2) strengths.push('Creative Thinking')
    if ((scores.detail || 0) >= 2) strengths.push('Detail-Oriented')
    if ((scores.social || 0) >= 2) strengths.push('Social Connection')
    if ((scores.pattern || 0) >= 2) strengths.push('Pattern Recognition')

    return { scores, primaryLearningStyle, neurodivergentTraits, strengths }
  }

  const generatePersonalizedReport = (data: any) => {
    const { primaryLearningStyle, neurodivergentTraits, strengths } = data
    
    const reports: Record<string, { title: string; description: string; strategies: string[] }> = {
      visual: {
        title: `${childName} is a Visual Learner`,
        description: `${childName} thrives when they can see concepts and information presented visually. They likely learn best through diagrams, videos, and hands-on projects that let their imagination shine.`,
        strategies: ['Use mind maps for studying', 'Create visual schedules', 'Try project-based learning', 'Use colorful materials and charts']
      },
      kinesthetic: {
        title: `${childName} is a Kinesthetic Learner`,
        description: `${childName} needs movement to focus and learn effectively. They likely do their best thinking while moving and may struggle with traditional sit-still learning.`,
        strategies: ['Provide fidget tools', 'Consider standing desk options', 'Take movement breaks every 15-20 minutes', 'Use hands-on learning activities']
      },
      auditory: {
        title: `${childName} is an Auditory Learner`,
        description: `${childName} learns best through listening and verbal processing. They benefit from discussions, explanations, and hearing information out loud.`,
        strategies: ['Read instructions aloud', 'Use audio books and podcasts', 'Encourage verbal explanations', 'Practice through discussion']
      },
      reading: {
        title: `${childName} is a Reading/Writing Learner`,
        description: `${childName} excels when they can work systematically with written information. They prefer clear structure and written instructions.`,
        strategies: ['Provide step-by-step written instructions', 'Use lists and organizers', 'Encourage note-taking', 'Allow extra time for reading']
      }
    }

    const baseReport = reports[primaryLearningStyle] || reports.visual

    // Add neurodivergent-specific insights
    let additionalInsights = ""
    if (neurodivergentTraits.includes('ADHD')) {
      additionalInsights += ` ${childName} shows traits that suggest they may benefit from ADHD-friendly strategies like shorter work sessions and variety in activities.`
    }
    if (neurodivergentTraits.includes('Autism')) {
      additionalInsights += ` ${childName} shows traits that suggest they may benefit from clear routines and detailed explanations.`
    }
    if (neurodivergentTraits.includes('Sensory Processing')) {
      additionalInsights += ` ${childName} may be sensitive to sensory input and benefit from a calm, organized learning environment.`
    }

    return {
      ...baseReport,
      description: baseReport.description + additionalInsights,
      strengths,
      neurodivergentTraits
    }
  }

  const handleSubmitResults = async () => {
    setIsSubmitting(true)
    
    const calculatedResults = calculateResults(answers)
    const personalizedReport = generatePersonalizedReport(calculatedResults)
    
    const assessmentData: AssessmentData = {
      childName,
      childAge,
      parentEmail,
      answers,
      ...calculatedResults,
      timestamp: new Date()
    }

    try {
      await addDoc(collection(db, 'assessments'), assessmentData)
      setResults({ ...calculatedResults, report: personalizedReport })
      setStep('results')
    } catch (error) {
      console.error('Error saving assessment:', error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (step === 'landing') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-4 sm:p-6 lg:p-8 text-center">
            <CardContent>
              <div className="mb-6">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  Does Your Child Learn Differently?
                </h1>
                <p className="text-lg sm:text-xl text-gray-600 mb-6">
                  Discover their unique learning style in 5 minutes
                </p>
                <div className="flex flex-col sm:flex-row justify-center items-center space-y-3 sm:space-y-0 sm:space-x-4 mb-6">
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm sm:text-base">Free & Personalized</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm sm:text-base">Science-Based</span>
                  </div>
                  <div className="flex items-center text-green-600">
                    <CheckCircle className="w-5 h-5 mr-2" />
                    <span className="text-sm sm:text-base">Actionable Results</span>
                  </div>
                </div>
              </div>
              
              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-6 text-left">
                <p className="text-sm sm:text-base text-gray-700">
                  <strong>Is your smart kid struggling in traditional classrooms?</strong> This assessment 
                  helps identify if your child is visual, kinesthetic, auditory, or reading/writing learner, 
                  plus signs of neurodivergent learning patterns.
                </p>
              </div>

              <Button 
                onClick={() => setStep('info')}
                className="w-full sm:w-auto bg-blue-600 hover:bg-blue-700 text-white px-6 sm:px-8 py-4 text-base sm:text-lg min-h-[48px]"
              >
                Start Free Assessment
                <ChevronRight className="ml-2 w-5 h-5" />
              </Button>
              
              <p className="text-xs sm:text-sm text-gray-500 mt-4 px-2">
                No signup required • Results in your email • 100% privacy protected
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (step === 'info') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full"
        >
          <Card className="p-4 sm:p-6">
            <CardContent>
              <h2 className="text-xl sm:text-2xl font-bold mb-6">Tell us about your child</h2>
              
              <div className="space-y-4 sm:space-y-5">
                <div>
                  <label className="block text-sm font-medium mb-2">Child's Name</label>
                  <Input
                    value={childName}
                    onChange={(e) => setChildName(e.target.value)}
                    placeholder="Enter your child's name"
                    className="w-full min-h-[48px] text-base"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Child's Age</label>
                  <select
                    value={childAge}
                    onChange={(e) => setChildAge(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg min-h-[48px] text-base bg-white"
                  >
                    <option value="">Select age</option>
                    {[...Array(8)].map((_, i) => (
                      <option key={i} value={i + 8}>{i + 8} years old</option>
                    ))}
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Your Email</label>
                  <Input
                    type="email"
                    value={parentEmail}
                    onChange={(e) => setParentEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    className="w-full min-h-[48px] text-base"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    We'll send your personalized report here
                  </p>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => setStep('landing')}
                  className="w-full sm:flex-1 min-h-[48px] text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Back
                </Button>
                <Button
                  onClick={() => setStep('questions')}
                  disabled={!childName || !childAge || !parentEmail}
                  className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-700 text-white min-h-[48px] text-base"
                >
                  Start Questions
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (step === 'questions') {
    const question = questions[currentQuestion]
    const progress = ((currentQuestion + 1) / questions.length) * 100

    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4 sm:p-6">
        <motion.div
          key={currentQuestion}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="max-w-2xl w-full"
        >
          <Card className="p-4 sm:p-6">
            <CardContent>
              <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-4 space-y-2 sm:space-y-0">
                  <span className="text-sm text-gray-500">
                    Question {currentQuestion + 1} of {questions.length}
                  </span>
                  <span className="text-sm text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                    {question.section}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>

              <h3 className="text-lg sm:text-xl font-semibold mb-6 leading-tight">
                {question.question}
              </h3>

              <div className="space-y-3">
                {question.options.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => {
                      const newAnswers = [...answers.filter(a => a.questionId !== question.id), 
                                        { questionId: question.id, answer: option.id }]
                      setAnswers(newAnswers)
                      
                      setTimeout(() => {
                        if (currentQuestion < questions.length - 1) {
                          setCurrentQuestion(currentQuestion + 1)
                        } else {
                          handleSubmitResults()
                        }
                      }, 300)
                    }}
                    className="w-full p-4 sm:p-5 text-left border border-gray-200 rounded-lg hover:border-blue-400 hover:bg-blue-50 transition-all min-h-[60px] focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    <span className="font-medium text-blue-600 mr-3 text-base sm:text-lg">
                      {option.id}
                    </span>
                    <span className="text-sm sm:text-base leading-relaxed">
                      {option.text}
                    </span>
                  </button>
                ))}
              </div>

              {currentQuestion > 0 && (
                <Button
                  variant="outline"
                  onClick={() => setCurrentQuestion(currentQuestion - 1)}
                  className="mt-6 min-h-[48px] text-base"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Previous Question
                </Button>
              )}
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  if (step === 'results' && results) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 p-4 sm:p-6 lg:p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-4xl mx-auto"
        >
          <Card className="p-4 sm:p-6 lg:p-8">
            <CardContent>
              <div className="text-center mb-6 sm:mb-8">
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
                  🎉 {results.report.title}!
                </h1>
                <p className="text-base sm:text-lg text-gray-600 mb-6 leading-relaxed">
                  {results.report.description}
                </p>
              </div>

              <div className="grid gap-6 md:grid-cols-2 mb-6 sm:mb-8">
                <Card className="p-4 sm:p-6 bg-blue-50">
                  <h3 className="font-bold text-lg mb-3">📚 Learning Strategies for {childName}</h3>
                  <ul className="space-y-2">
                    {results.report.strategies.map((strategy: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <Star className="w-4 h-4 text-yellow-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{strategy}</span>
                      </li>
                    ))}
                  </ul>
                </Card>

                <Card className="p-4 sm:p-6 bg-green-50">
                  <h3 className="font-bold text-lg mb-3">✨ {childName}'s Strengths</h3>
                  <ul className="space-y-2">
                    {results.strengths.map((strength: string, index: number) => (
                      <li key={index} className="flex items-start">
                        <CheckCircle className="w-4 h-4 text-green-500 mr-2 mt-1 flex-shrink-0" />
                        <span className="text-sm sm:text-base">{strength}</span>
                      </li>
                    ))}
                  </ul>
                </Card>
              </div>

              <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
                <h3 className="font-bold text-lg sm:text-xl mb-4">🚀 Ready to Help {childName} Thrive?</h3>
                <p className="text-sm sm:text-base text-gray-700 mb-4 leading-relaxed">
                  Our literacy app is specifically designed for {results.primaryLearningStyle} learners like {childName}. 
                  Try it free for 7 days and see the difference!
                </p>
                <Button 
                  onClick={() => window.location.href = '/'}
                  className="w-full sm:w-auto bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 min-h-[48px] text-base"
                >
                  Try Our App Free for 7 Days
                </Button>
              </div>

              <div className="text-center text-xs sm:text-sm text-gray-500 space-y-2">
                <p>A detailed report has been sent to {parentEmail}</p>
                <p>Share this assessment with your child's teachers for better classroom support!</p>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className="text-gray-600 text-sm sm:text-base px-4">
          {isSubmitting ? 'Generating your personalized report...' : 'Loading...'}
        </p>
      </div>
    </div>
  )
}