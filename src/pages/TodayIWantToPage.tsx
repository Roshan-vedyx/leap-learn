// src/pages/TodayIWantToPage.tsx - Viewport Optimized & Responsive
import React from 'react';
import { useLocation } from 'wouter';
import { BookOpen, Calculator, Heart, Settings } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';

const TodayIWantToPage: React.FC = () => {
  const [, setLocation] = useLocation();

  const handleChoice = (choice: 'reading' | 'numbers' | 'easy-wins') => {
    console.log(`User selected: ${choice}`);
    
    // Store the user's choice for content customization
    localStorage.setItem('today-choice', choice);
    
    // Navigate based on choice
    switch(choice) {
      case 'reading':
        setLocation('/practice-reading');
        break;
      case 'numbers':
        setLocation('/math-activities');
        break;
      case 'easy-wins':
        setLocation('/gentle-activities');
        break;
      default:
        setLocation('/interests');
    }
  };

  const handleSettings = () => {
    console.log('Opening accessibility settings');
    // Your settings modal/page logic - could integrate with existing calm corner
  };

  return (
    <div className="page-container bg-gradient-to-b from-indigo-50 via-white to-green-50">
      <div className="container">
        <div className="content-area">
          
          {/* Header with settings - Reduced top spacing */}
          <div className="flex justify-between items-center pt-2 pb-3 md:pb-4">
            <h1 className="text-lg sm:text-xl md:text-2xl lg:text-3xl font-bold text-autism-primary">
              Today I Want To...
            </h1>
            <Button 
              onClick={handleSettings}
              variant="ghost"
              size="comfortable"
              className="p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow flex-shrink-0"
              aria-label="Accessibility settings"
            >
              <Settings className="w-4 h-4 sm:w-5 sm:h-5 md:w-6 md:h-6 text-gray-600" />
            </Button>
          </div>

          {/* Main choices container - Viewport optimized */}
          <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full space-y-2 md:space-y-3">
            
            {/* Practice Reading Card */}
            <Card
              className="group bg-white rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 border-4 border-transparent hover:border-green-300 focus-within:border-green-400 cursor-pointer"
              onClick={() => handleChoice('reading')}
              role="button"
              tabIndex={0}
              aria-label="Practice Reading - Stories and word building activities"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChoice('reading');
                }
              }}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6">
                  <div className="bg-green-100 rounded-full p-2 md:p-3 group-hover:bg-green-200 transition-colors flex-shrink-0">
                    <BookOpen className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-green-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-autism-primary mb-1">
                      Practice Reading
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-autism-primary/70">
                      Stories and word building
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Work with Numbers Card */}
            <Card
              className="group bg-white rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 border-4 border-transparent hover:border-purple-300 focus-within:border-purple-400 cursor-pointer"
              onClick={() => handleChoice('numbers')}
              role="button"
              tabIndex={0}
              aria-label="Work with Numbers - Math activities and number games"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChoice('numbers');
                }
              }}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6">
                  <div className="bg-purple-100 rounded-full p-2 md:p-3 group-hover:bg-purple-200 transition-colors flex-shrink-0">
                    <Calculator className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-purple-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-autism-primary mb-1">
                      Work with Numbers
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-autism-primary/70">
                      Math activities and games
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Easy Wins Today Card */}
            <Card
              className="group bg-white rounded-lg md:rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-102 border-4 border-transparent hover:border-pink-300 focus-within:border-pink-400 cursor-pointer"
              onClick={() => handleChoice('easy-wins')}
              role="button"
              tabIndex={0}
              aria-label="Easy Wins Today - Gentle, calming activities for tough days"
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  handleChoice('easy-wins');
                }
              }}
            >
              <CardContent className="p-3 md:p-4">
                <div className="flex flex-col sm:flex-row items-center justify-center space-y-2 sm:space-y-0 sm:space-x-4 md:space-x-6">
                  <div className="bg-pink-100 rounded-full p-2 md:p-3 group-hover:bg-pink-200 transition-colors flex-shrink-0">
                    <Heart className="w-6 h-6 sm:w-8 sm:h-8 md:w-10 md:h-10 text-pink-600" />
                  </div>
                  <div className="text-center sm:text-left">
                    <h2 className="text-lg sm:text-xl md:text-2xl font-bold text-autism-primary mb-1">
                      Easy Wins Today
                    </h2>
                    <p className="text-sm sm:text-base md:text-lg text-autism-primary/70">
                      Gentle activities for any kind of day
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Footer message - Compact */}
          <div className="text-center pt-3 pb-2">
            <p className="text-sm sm:text-base md:text-lg text-autism-primary/70">
              You know what's best for your brain today! 🧠✨
            </p>
          </div>

        </div>
      </div>

      {/* Accessibility Information */}
      <div className="sr-only">
        <p>
          Choose what type of activity you'd like to do today. You can select practice reading, 
          work with numbers, or easy wins for gentle activities. Click or press Enter on any 
          option to continue to that activity type.
        </p>
      </div>
    </div>
  );
};

export default TodayIWantToPage;