// src/pages/TodayIWantToPage.tsx
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
        setLocation('/practice-reading'); // or /story depending on your flow
        break;
      case 'numbers':
        setLocation('/math-activities'); // Future math section
        break;
      case 'easy-wins':
        setLocation('/gentle-activities'); // Future gentle section
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
    <div className="min-h-screen bg-gradient-to-b from-indigo-50 via-white to-green-50 p-4 sm:p-6 flex flex-col">
      {/* Header with settings */}
      <div className="flex justify-between items-center mb-6 sm:mb-8">
        <h1 className="text-xl sm:text-2xl lg:text-3xl font-bold text-autism-primary">
          Today I Want To...
        </h1>
        <Button 
          onClick={handleSettings}
          variant="ghost"
          size="comfortable"
          className="p-2 sm:p-3 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
          aria-label="Accessibility settings"
        >
          <Settings className="w-5 h-5 sm:w-6 sm:h-6 text-gray-600" />
        </Button>
      </div>

      {/* Main choices container */}
      <div className="flex-1 flex flex-col justify-center max-w-4xl mx-auto w-full space-y-4 sm:space-y-6">
        
        {/* Practice Reading Button */}
        <Card
          className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-4 border-transparent hover:border-green-300 focus-within:border-green-400 cursor-pointer"
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
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="bg-green-100 rounded-full p-3 sm:p-4 group-hover:bg-green-200 transition-colors">
                <BookOpen className="w-8 h-8 sm:w-12 sm:h-12 text-green-600" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-autism-primary mb-1 sm:mb-2">Practice Reading</h2>
                <p className="text-base sm:text-lg text-autism-primary/70">Stories and word building</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Work with Numbers Button */}
        <Card
          className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-4 border-transparent hover:border-purple-300 focus-within:border-purple-400 cursor-pointer"
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
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="bg-purple-100 rounded-full p-3 sm:p-4 group-hover:bg-purple-200 transition-colors">
                <Calculator className="w-8 h-8 sm:w-12 sm:h-12 text-purple-600" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-autism-primary mb-1 sm:mb-2">Work with Numbers</h2>
                <p className="text-base sm:text-lg text-autism-primary/70">Math activities and games</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Easy Wins Today Button */}
        <Card
          className="group bg-white rounded-xl sm:rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 border-4 border-transparent hover:border-pink-300 focus-within:border-pink-400 cursor-pointer"
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
          <CardContent className="p-6 sm:p-8">
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-6">
              <div className="bg-pink-100 rounded-full p-3 sm:p-4 group-hover:bg-pink-200 transition-colors">
                <Heart className="w-8 h-8 sm:w-12 sm:h-12 text-pink-600" />
              </div>
              <div className="text-center sm:text-left">
                <h2 className="text-2xl sm:text-3xl font-bold text-autism-primary mb-1 sm:mb-2">Easy Wins Today</h2>
                <p className="text-base sm:text-lg text-autism-primary/70">Gentle activities for any kind of day</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Optional encouraging message at bottom */}
      <div className="text-center mt-6 sm:mt-8 px-4">
        <p className="text-base sm:text-lg text-autism-primary/70">
          You know what's best for your brain today! 🧠✨
        </p>
      </div>
    </div>
  );
};

export default TodayIWantToPage;