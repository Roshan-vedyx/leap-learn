// src/components/teacher/TeacherDashboard.tsx
import React from 'react'
import { 
  BookOpen, 
  Eye, 
  BookMarked, 
  Lightbulb, 
  PenTool,
  FileText,
  ChevronRight,
  CheckCircle,
  ArrowLeft
} from 'lucide-react'
import { TeacherAppWrapper } from './TeacherAppWrapper'
import { Button } from '../ui/Button'
import { Link } from 'wouter'

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
      <div className="mb-4">
        <Link href="/dashboard">
          <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors">
            <ArrowLeft className="w-4 h-4" />
            <span className="font-medium">Back to Dashboard</span>
          </button>
        </Link>
      </div>
    
      {/* Worksheet Generator Tools */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6 border-b border-gray-200">
        <h2 className="text-lg font-semibold text-gray-900">Choose Your Skill</h2>
        <p className="text-gray-600 mt-1">
          Select a specific literacy skill to practice
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