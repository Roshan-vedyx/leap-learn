import React from 'react'
import { useLocation } from 'wouter'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card'
import { Button } from '@/components/ui/Button'

const NotFoundPage: React.FC = () => {
  const [, setLocation] = useLocation()

  const handleGoHome = () => {
    setLocation('/')
  }

  const handleGoToStories = () => {
    setLocation('/story')
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-autism-calm-lavender to-autism-calm-mint p-4">
      <div className="max-w-2xl mx-auto py-16">
        {/* Main 404 Message */}
        <Card className="mb-8 bg-autism-neutral border-autism-primary border-2 text-center">
          <CardHeader>
            <div className="text-8xl mb-4">🗺️</div>
            <CardTitle className="text-4xl md:text-5xl text-autism-primary mb-4">
              Oops! Page Not Found
            </CardTitle>
          </CardHeader>
          <CardContent className="pb-8">
            <p className="text-xl text-autism-primary/80 leading-relaxed mb-6">
              It looks like you've wandered off the reading path! 
              Don't worry - even the best explorers get lost sometimes.
            </p>
            <p className="text-lg text-autism-primary/70 leading-relaxed">
              Let's get you back to somewhere fun and familiar.
            </p>
          </CardContent>
        </Card>

        {/* Helpful Navigation */}
        <Card className="mb-8 bg-autism-calm-mint border-autism-secondary border-2">
          <CardHeader>
            <CardTitle className="text-2xl text-autism-primary text-center">
              🧭 Where would you like to go?
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 gap-4">
              <Button
                variant="celebration"
                size="comfortable"
                onClick={handleGoHome}
                className="w-full text-lg justify-start"
              >
                🏠 Take me to the Brain Check-in
              </Button>
              
              <Button
                variant="calm"
                size="comfortable"
                onClick={handleGoToStories}
                className="w-full text-lg justify-start"
              >
                📚 Go straight to Stories
              </Button>
              
              <Button
                variant="outline"
                size="comfortable"
                onClick={() => window.history.back()}
                className="w-full text-lg justify-start"
              >
                ↩️ Go back to where I was
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Encouraging Message */}
        <Card className="bg-white/90 border-autism-primary">
          <CardContent className="p-6 text-center">
            <h3 className="text-xl font-semibold text-autism-primary mb-3">
              💡 Did you know?
            </h3>
            <p className="text-autism-primary/80 leading-relaxed">
              Getting lost is actually a great way to discover new things! 
              Some of the best adventures happen when we take unexpected paths. 
              You're always welcome to explore anywhere in Vedyx Leap.
            </p>
          </CardContent>
        </Card>

        {/* Accessibility Information */}
        <div className="sr-only">
          <p>
            This page could not be found. You can return to the home page to start a brain check-in, 
            go directly to stories, or use your browser's back button to return to the previous page.
          </p>
        </div>
      </div>
    </div>
  )
}

export default NotFoundPage