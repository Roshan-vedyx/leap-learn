// src/components/teacher/TeacherDashboard.tsx
import React from 'react'
import { 
  BookOpen, 
  Eye, 
  BookMarked, 
  Lightbulb, 
  PenTool, 
  LogOut,
  User,
  FileText,
  Download
} from 'lucide-react'
import { useTeacherAuth } from '../../contexts/TeacherAuthContext'
import { Button } from '../ui/Button'
import { Card } from '../ui/Card'

interface WorksheetOption {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
  comingSoon?: boolean
}

const worksheetOptions: WorksheetOption[] = [
  {
    id: 'phonics',
    title: 'Phonics Practice Worksheets',
    description: 'Generate worksheets for specific phonics patterns',
    icon: <BookOpen className="w-8 h-8" />,
    color: 'from-blue-500 to-blue-600'
  },
  {
    id: 'sight-words',
    title: 'Sight Words Practice',
    description: 'Create sight word worksheets and flashcards',
    icon: <Eye className="w-8 h-8" />,
    color: 'from-green-500 to-green-600'
  },
  {
    id: 'reading-comprehension',
    title: 'Reading Comprehension',
    description: 'Simple passages with questions',
    icon: <BookMarked className="w-8 h-8" />,
    color: 'from-purple-500 to-purple-600'
  },
  {
    id: 'vocabulary',
    title: 'Vocabulary Building',
    description: 'Word meaning and category activities',
    icon: <Lightbulb className="w-8 h-8" />,
    color: 'from-orange-500 to-orange-600'
  },
  {
    id: 'writing',
    title: 'Writing Practice',
    description: 'Sentence and story writing supports',
    icon: <PenTool className="w-8 h-8" />,
    color: 'from-red-500 to-red-600'
  }
]

export const TeacherDashboard: React.FC = () => {
  const { profile, signOut } = useTeacherAuth()

  const handleWorksheetClick = (optionId: string) => {
    // Navigate to worksheet generator for specific type
    window.location.href = `/teacher/worksheets/${optionId}`
  }

  const handleSignOut = async () => {
    try {
      await signOut()
      window.location.href = '/teacher'
    } catch (error) {
      console.error('Sign out error:', error)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-blue-100">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <BookOpen className="w-8 h-8 text-indigo-600 mr-3" />
              <div>
                <h1 className="text-xl font-bold text-gray-900">Vedyx Leap</h1>
                <p className="text-sm text-gray-600">Teacher Dashboard</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                {profile?.photoURL ? (
                  <img 
                    src={profile.photoURL} 
                    alt="Profile" 
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-indigo-600" />
                  </div>
                )}
                <span className="text-sm font-medium text-gray-700">
                  {profile?.displayName || 'Teacher'}
                </span>
              </div>
              
              <Button 
                onClick={handleSignOut}
                className="bg-gray-100 text-gray-700 hover:bg-gray-200 text-sm"
              >
                <LogOut className="w-4 h-4 mr-2" />
                Sign Out
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Welcome Section */}
        <div className="mb-8">
          <h2 className="text-3xl font-bold text-gray-900 mb-2">
            Welcome back, {profile?.displayName?.split(' ')[0] || 'Teacher'}!
          </h2>
          <p className="text-lg text-gray-600">
            Generate engaging, accessibility-friendly worksheets for your students
          </p>
        </div>

        {/* Worksheet Options Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          {worksheetOptions.map((option) => (
            <Card 
              key={option.id}
              className="group cursor-pointer transform transition-all duration-200 hover:scale-105 hover:shadow-lg"
              onClick={() => handleWorksheetClick(option.id)}
            >
              <div className="p-6">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-r ${option.color} flex items-center justify-center text-white mb-4 group-hover:scale-110 transition-transform duration-200`}>
                  {option.icon}
                </div>
                
                <h3 className="text-xl font-semibold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">
                  {option.title}
                </h3>
                
                <p className="text-gray-600 mb-4">
                  {option.description}
                </p>
                
                <div className="flex items-center text-indigo-600 font-medium">
                  <span>Generate Worksheets</span>
                  <FileText className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                </div>
                
                {option.comingSoon && (
                  <div className="absolute top-4 right-4 bg-yellow-100 text-yellow-800 text-xs font-medium px-2 py-1 rounded-full">
                    Coming Soon
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-indigo-600 mb-2">5</div>
            <div className="text-gray-600">Worksheet Types</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-green-600 mb-2">∞</div>
            <div className="text-gray-600">Worksheets Generated</div>
          </Card>
          
          <Card className="p-6 text-center">
            <div className="text-3xl font-bold text-purple-600 mb-2">100%</div>
            <div className="text-gray-600">Accessibility Friendly</div>
          </Card>
        </div>

        {/* Features Overview */}
        <Card className="p-8">
          <h3 className="text-2xl font-semibold text-gray-900 mb-6">
            What makes Vedyx Leap worksheets special?
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <BookOpen className="w-6 h-6 text-blue-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Research-Based</h4>
              <p className="text-sm text-gray-600">Built on proven literacy education methods</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Eye className="w-6 h-6 text-green-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Accessible Design</h4>
              <p className="text-sm text-gray-600">Neurodivergent-friendly layouts and fonts</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Download className="w-6 h-6 text-purple-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Instant PDFs</h4>
              <p className="text-sm text-gray-600">Download ready-to-print worksheets immediately</p>
            </div>
            
            <div className="text-center">
              <div className="w-12 h-12 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <Lightbulb className="w-6 h-6 text-orange-600" />
              </div>
              <h4 className="font-semibold text-gray-900 mb-2">Differentiated</h4>
              <p className="text-sm text-gray-600">Multiple difficulty levels for every learner</p>
            </div>
          </div>
        </Card>
      </main>
    </div>
  )
}