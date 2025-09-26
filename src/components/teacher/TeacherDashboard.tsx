// src/components/teacher/TeacherDashboard.tsx
import React from 'react'
import { 
  BookOpen, 
  Eye, 
  BookMarked, 
  Lightbulb, 
  PenTool,
  TrendingUp,
  Users,
  FileText,
  Download,
  ChevronRight,
  BarChart3,
  Clock,
  CheckCircle
} from 'lucide-react'
import { TeacherAppWrapper } from './TeacherAppWrapper'
import { Button } from '../ui/Button'

interface WorksheetOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  comingSoon?: boolean
  stats?: {
    totalGenerated?: number
    lastUsed?: string
  }
}

const worksheetOptions: WorksheetOption[] = [
  {
    id: 'phonics',
    title: 'Phonics Practice Worksheets',
    description: 'Generate targeted phonics pattern activities with multiple difficulty levels',
    icon: <BookOpen className="w-5 h-5" />,
    color: 'text-blue-600 bg-blue-50 border-blue-200',
    stats: { totalGenerated: 12, lastUsed: '2 days ago' }
  },
  {
    id: 'sight-words',
    title: 'Sight Words Practice',
    description: 'Create sight word worksheets and interactive flashcards',
    icon: <Eye className="w-5 h-5" />,
    color: 'text-emerald-600 bg-emerald-50 border-emerald-200',
    stats: { totalGenerated: 0, lastUsed: 'Never' }
  },
  {
    id: 'reading-comprehension',
    title: 'Reading Comprehension',
    description: 'Simple passages with targeted comprehension questions',
    icon: <BookMarked className="w-5 h-5" />,
    color: 'text-purple-600 bg-purple-50 border-purple-200',
    comingSoon: true
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary Building',
    description: 'Word meaning, categorization, and semantic activities',
    icon: <Lightbulb className="w-5 h-5" />,
    color: 'text-amber-600 bg-amber-50 border-amber-200',
    comingSoon: true
  },
  {
    id: 'writing',
    title: 'Writing Practice',
    description: 'Sentence construction and story writing supports',
    icon: <PenTool className="w-5 h-5" />,
    color: 'text-rose-600 bg-rose-50 border-rose-200',
    comingSoon: true
  }
]

export const TeacherDashboard: React.FC = () => {
    
    const handleWorksheetClick = (optionId: string) => {
        if (optionId === 'phonics') {
            window.location.href = '/teacher/worksheets/phonics'
        } else if (optionId === 'sight-words') {
            window.location.href = '/teacher/worksheets/sight-words'
        } else {
            // Show coming soon message for other worksheet types
            alert(`${optionId.replace('-', ' ')} worksheets are coming soon!`)
        }
    }

  return (
    <TeacherAppWrapper currentPage="dashboard">
      {/* Dashboard Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600 mt-1">
              Create and manage literacy worksheets for neurodivergent learners
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Clock className="w-4 h-4" />
            <span>Last updated: {new Date().toLocaleDateString()}</span>
          </div>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Worksheets Created</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">12</p>
            </div>
            <div className="bg-blue-50 p-3 rounded-lg">
              <FileText className="w-6 h-6 text-blue-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
            <span className="text-green-600">+3 this week</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Students Served</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">48</p>
            </div>
            <div className="bg-emerald-50 p-3 rounded-lg">
              <Users className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <span className="text-gray-500">Across 3 classes</span>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Downloads</p>
              <p className="text-2xl font-bold text-gray-900 mt-1">34</p>
            </div>
            <div className="bg-purple-50 p-3 rounded-lg">
              <Download className="w-6 h-6 text-purple-600" />
            </div>
          </div>
          <div className="flex items-center mt-2 text-sm">
            <BarChart3 className="w-4 h-4 text-gray-400 mr-1" />
            <span className="text-gray-500">Last 30 days</span>
          </div>
        </div>
      </div>

      {/* Worksheet Generator Tools */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Worksheet Generators</h2>
          <p className="text-gray-600 mt-1">
            Choose from research-based literacy activities designed for ages 11-14
          </p>
        </div>

        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {worksheetOptions.map((option) => (
              <div
                key={option.id}
                className={`group relative p-6 rounded-lg border-2 transition-all cursor-pointer hover:shadow-md ${
                  option.comingSoon
                    ? 'border-gray-200 bg-gray-50 opacity-60'
                    : `border-gray-200 hover:border-blue-300 bg-white hover:bg-blue-50/30`
                }`}
                onClick={() => !option.comingSoon && handleWorksheetClick(option.id)}
              >
                {/* Coming Soon Badge */}
                {option.comingSoon && (
                  <div className="absolute -top-2 -right-2 bg-amber-100 text-amber-800 text-xs font-medium px-2 py-1 rounded-full border border-amber-200">
                    Coming Soon
                  </div>
                )}

                <div className="flex items-start justify-between mb-4">
                  <div className={`p-3 rounded-lg ${option.color.split(' ').slice(1).join(' ')}`}>
                    <div className={option.color.split(' ')[0]}>
                      {option.icon}
                    </div>
                  </div>
                  {!option.comingSoon && (
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-blue-600 transition-colors" />
                  )}
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  {option.title}
                </h3>
                
                <p className="text-sm text-gray-600 mb-4 leading-relaxed">
                  {option.description}
                </p>

                {/* Stats for active tools */}
                {option.stats && !option.comingSoon && (
                  <div className="flex items-center justify-between text-xs text-gray-500 pt-3 border-t border-gray-100">
                    <span className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      {option.stats.totalGenerated} generated
                    </span>
                    <span>Used {option.stats.lastUsed}</span>
                  </div>
                )}

                {/* Action indicator */}
                {!option.comingSoon && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="w-full mt-4 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                  >
                    Generate Worksheet
                  </Button>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Quick Tips */}
      <div className="mt-8 bg-blue-50 rounded-lg border border-blue-200 p-6">
        <h3 className="text-base font-semibold text-blue-900 mb-3">
          💡 Teaching with Vedyx Leap
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">UDL Principles Built-In</p>
              <p className="text-blue-700">All worksheets follow Universal Design for Learning guidelines</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Neurodivergent-Friendly</p>
              <p className="text-blue-700">Designed specifically for ADHD, dyslexia, and autism support</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Evidence-Based Methods</p>
              <p className="text-blue-700">Grounded in phonics research and structured literacy approaches</p>
            </div>
          </div>
          <div className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="font-medium text-blue-900">Ready-to-Print</p>
              <p className="text-blue-700">Download high-quality PDFs instantly for classroom use</p>
            </div>
          </div>
        </div>
      </div>
    </TeacherAppWrapper>
  )
}