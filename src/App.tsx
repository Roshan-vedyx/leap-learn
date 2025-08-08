import React, { useEffect, useState } from 'react'
import { Router, Route, Switch, Link } from 'wouter'
import { accessibility, preferences } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CalmCornerModal } from '@/components/ui/Modal'

// Import page components
import BrainCheckPage from './pages/BrainCheckPage'
import StoryPage from './pages/StoryPage'
import CreatePage from './pages/CreatePage'
import CelebratePage from './pages/CelebratePage'
import NotFoundPage from './pages/NotFoundPage'

// Accessibility preference types
type AccessibilityMode = 'default' | 'adhd' | 'dyslexia' | 'autism'
type FontSize = 'default' | 'large' | 'extra-large'

function App() {
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('default')
  const [fontSize, setFontSize] = useState<FontSize>('default')
  const [showCalmCorner, setShowCalmCorner] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Load preferences on app start
  useEffect(() => {
    const savedMode = preferences.getAccessibilityMode()
    const savedFontSize = preferences.getFontSize()
    const prefersReducedMotion = accessibility.prefersReducedMotion()

    setAccessibilityMode(savedMode)
    setFontSize(savedFontSize)
    setReducedMotion(prefersReducedMotion)

    // Apply preferences to document
    preferences.setAccessibilityMode(savedMode)
    preferences.setFontSize(savedFontSize)

    // Apply reduced motion preference
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms')
      document.documentElement.style.setProperty('--transition-duration', '0.01ms')
    }
  }, [])

  // Handle accessibility mode change
  const handleAccessibilityModeChange = (mode: AccessibilityMode) => {
    setAccessibilityMode(mode)
    preferences.setAccessibilityMode(mode)
  }

  // Handle font size change
  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size)
    preferences.setFontSize(size)
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Skip Navigation Link for Keyboard Users */}
      <a href="#main-content" className="skip-link">
        Skip to main content
      </a>

      {/* Global Navigation */}
      <nav className="bg-card border-b border-border p-4" role="navigation" aria-label="Main navigation">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          {/* Logo/Home Link */}
          <Link href="/">
            <Button variant="ghost" className="text-2xl font-bold">
              Vedyx Leap
            </Button>
          </Link>

          {/* Navigation Actions */}
          <div className="flex items-center gap-4">
            {/* Calm Corner Button - Always Accessible */}
            <Button
              variant="calm"
              onClick={() => setShowCalmCorner(true)}
              aria-label="Open calm corner for emotional regulation"
              className="no-print"
            >
              🕊️ Calm Corner
            </Button>

            {/* Accessibility Settings */}
            <div className="flex items-center gap-2">
              <label htmlFor="accessibility-mode" className="sr-only">
                Choose accessibility mode
              </label>
              <select
                id="accessibility-mode"
                value={accessibilityMode}
                onChange={(e) => handleAccessibilityModeChange(e.target.value as AccessibilityMode)}
                className="rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
              >
                <option value="default">Default</option>
                <option value="adhd">ADHD Mode</option>
                <option value="dyslexia">Dyslexia Mode</option>
                <option value="autism">Autism Mode</option>
              </select>

              <label htmlFor="font-size" className="sr-only">
                Choose font size
              </label>
              <select
                id="font-size"
                value={fontSize}
                onChange={(e) => handleFontSizeChange(e.target.value as FontSize)}
                className="rounded-md border-2 border-input bg-background px-3 py-2 text-sm"
              >
                <option value="default">Default Size</option>
                <option value="large">Large Text</option>
                <option value="extra-large">Extra Large Text</option>
              </select>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area */}
      <main id="main-content" className="flex-1">
        <Router>
          <Switch>
            {/* Default route - Brain Check-in */}
            <Route path="/">
              <BrainCheckPage />
            </Route>

            {/* Brain Check-in page */}
            <Route path="/brain-check">
              <BrainCheckPage />
            </Route>

            {/* Story reading page with optional story ID */}
            <Route path="/story/:storyId?">
              {(params) => <StoryPage storyId={params.storyId} />}
            </Route>

            {/* Creative response page */}
            <Route path="/create">
              <CreatePage />
            </Route>

            {/* Celebration page */}
            <Route path="/celebrate">
              <CelebratePage />
            </Route>

            {/* 404 Not Found - catch all other routes */}
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </Router>
      </main>

      {/* Calm Corner Modal */}
      <CalmCornerModal
        open={showCalmCorner}
        onOpenChange={setShowCalmCorner}
        onBreathingExercise={() => {
          // TODO: Implement breathing exercise
          console.log('Starting breathing exercise')
          setShowCalmCorner(false)
        }}
        onCalmMusic={() => {
          // TODO: Implement calm music
          console.log('Playing calm music')
          setShowCalmCorner(false)
        }}
        onSafeSpace={() => {
          // TODO: Implement safe space visualization
          console.log('Opening safe space')
          setShowCalmCorner(false)
        }}
      />

      {/* Screen Reader Announcements */}
      <div 
        className="sr-only" 
        aria-live="polite" 
        aria-atomic="true"
        id="accessibility-announcements"
      >
        {/* Screen reader announcements will be inserted here dynamically */}
      </div>

      {/* Dynamic CSS for accessibility modes */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* ADHD Mode Styles */
          .adhd-mode {
            --background: 0 0% 0%;
            --foreground: 0 0% 100%;
            --primary: 142 100% 50%;
            --secondary: 0 82% 63%;
            --border: 0 0% 100%;
            --input: 0 0% 100%;
            --ring: 60 100% 50%;
            --card: 0 0% 5%;
          }

          .adhd-mode * {
            border-color: white !important;
          }

          .adhd-mode input, .adhd-mode select, .adhd-mode textarea {
            background-color: black !important;
            color: white !important;
            border-color: white !important;
          }

          /* Dyslexia Mode Styles */
          .dyslexia-mode {
            font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important;
            letter-spacing: 0.05em;
            word-spacing: 0.16em;
            line-height: 1.8;
            --background: 44 87% 94%;
            --foreground: 36 100% 12%;
            --card: 44 100% 97%;
          }

          .dyslexia-mode *, .dyslexia-mode *::before, .dyslexia-mode *::after {
            font-family: 'OpenDyslexic', 'Comic Sans MS', cursive !important;
          }

          /* Autism Mode Styles */
          .autism-mode {
            --background: 152 68% 92%;
            --card: 210 17% 98%;
            --primary: 209 100% 57%;
            --secondary: 77 100% 57%;
          }

          /* Font Size Overrides */
          .font-large {
            font-size: 1.125rem !important;
          }

          .font-large h1 { font-size: 2.5rem !important; }
          .font-large h2 { font-size: 2rem !important; }
          .font-large h3 { font-size: 1.75rem !important; }
          .font-large p, .font-large span, .font-large div { font-size: 1.25rem !important; }
          .font-large button { font-size: 1.125rem !important; }

          .font-extra-large {
            font-size: 1.25rem !important;
          }

          .font-extra-large h1 { font-size: 3rem !important; }
          .font-extra-large h2 { font-size: 2.5rem !important; }
          .font-extra-large h3 { font-size: 2rem !important; }
          .font-extra-large p, .font-extra-large span, .font-extra-large div { font-size: 1.5rem !important; }
          .font-extra-large button { font-size: 1.25rem !important; }

          /* Reduced Motion Overrides */
          ${reducedMotion ? `
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
              scroll-behavior: auto !important;
            }
          ` : ''}
        `
      }} />
    </div>
  )
}

export default App