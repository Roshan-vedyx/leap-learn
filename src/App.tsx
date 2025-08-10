import React, { useEffect, useState } from 'react'
import { Router, Route, Switch, Link } from 'wouter'
import { accessibility, preferences } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { CalmCornerModal } from '@/components/ui/Modal'
import { Card, CardContent } from '@/components/ui/Card'
import { useLocation } from 'wouter'


// Import page components
import BrainCheckPage from './pages/BrainCheckPage'
import StoryPage from './pages/StoryPage'
import CreatePage from './pages/CreatePage'
import CelebratePage from './pages/CelebratePage'
import NotFoundPage from './pages/NotFoundPage'
import InterestSelectionPage from './pages/InterestSelectionPage'
import StoryGenerationPage from '@/pages/StoryGenerationPage'
import TodayIWantToPage from './pages/TodayIWantToPage'

// Import Zustand store
import { useSessionStore } from '@/stores/sessionStore'

// Accessibility preference types
type AccessibilityMode = 'default' | 'adhd' | 'dyslexia' | 'autism'
type FontSize = 'default' | 'large' | 'extra-large'

function App() {
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('default')
  const [fontSize, setFontSize] = useState<FontSize>('default')
  const [showCalmCorner, setShowCalmCorner] = useState(false)
  const [reducedMotion, setReducedMotion] = useState(false)

  // Zustand store for session management
  const { getSessionProgress, toggleCalmCorner, isInCalmCorner } = useSessionStore()

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

    // Apply accessibility classes to document body
    document.body.className = `${savedMode}-mode font-${savedFontSize}`

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
    
    // Update body class
    document.body.className = `${mode}-mode font-${fontSize}`
    
    // Announce change to screen readers
    const announcement = `Accessibility mode changed to ${mode === 'default' ? 'default' : mode + ' mode'}`
    announceToScreenReader(announcement)
  }

  // Handle font size change
  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size)
    preferences.setFontSize(size)
    
    // Update body class
    document.body.className = `${accessibilityMode}-mode font-${size}`
    
    // Announce change to screen readers
    const announcement = `Font size changed to ${size === 'default' ? 'default' : size}`
    announceToScreenReader(announcement)
  }

  // Helper function to announce to screen readers
  const announceToScreenReader = (message: string) => {
    const announcer = document.getElementById('accessibility-announcements')
    if (announcer) {
      announcer.textContent = message
      // Clear after a moment to allow for new announcements
      setTimeout(() => {
        announcer.textContent = ''
      }, 1000)
    }
  }

  // Handle calm corner toggle
  const handleCalmCornerToggle = () => {
    setShowCalmCorner(!showCalmCorner)
    toggleCalmCorner()
  }

  // Get current session progress for navigation display
  const sessionProgress = getSessionProgress()

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
              <span className="text-primary">Vedyx</span> Leap
            </Button>
          </Link>

          {/* Session Progress Indicator */}
          {sessionProgress.step > 0 && (
            <div className="hidden md:flex items-center gap-3">
              <span className="text-sm text-muted-foreground">
                Session Progress
              </span>
              <div className="w-32 bg-muted rounded-full h-2">
                <div 
                  className="bg-primary h-2 rounded-full transition-all duration-500"
                  style={{ width: `${sessionProgress.progressPercent}%` }}
                />
              </div>
              <span className="text-sm text-muted-foreground">
                {sessionProgress.step}/{sessionProgress.totalSteps}
              </span>
            </div>
          )}

          {/* Navigation Actions */}
          <div className="flex items-center gap-4">
            {/* Calm Corner Button - Always Accessible */}
            <Button
              variant="calm"
              onClick={handleCalmCornerToggle}
              aria-label="Open calm corner for emotional regulation"
              className={`no-print ${isInCalmCorner ? 'ring-2 ring-primary' : ''}`}
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
                className="rounded-md border-2 border-input bg-background px-3 py-2 text-sm min-w-[120px]"
                aria-describedby="accessibility-mode-help"
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
                className="rounded-md border-2 border-input bg-background px-3 py-2 text-sm min-w-[100px]"
                aria-describedby="font-size-help"
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

            {/* Interest Selection page */}
            <Route path="/interests">
              <InterestSelectionPage />
            </Route>

            {/* New: Today I Want To page */}
            <Route path="/today-i-want-to">
              <TodayIWantToPage />
            </Route>

            <Route path="/story-generate">
              <StoryGenerationPage />
            </Route>

            {/* Math activities placeholder (for future implementation) */}
            <Route path="/math-activities">
              <div className="min-h-screen bg-gradient-to-b from-purple-50 to-pink-50 p-4 flex items-center justify-center">
                <Card className="text-center p-8">
                  <CardContent>
                    <div className="text-6xl mb-4">🔢</div>
                    <h1 className="text-3xl font-bold mb-4">Math Adventures Coming Soon!</h1>
                    <p className="text-lg mb-6">We're building awesome number activities for you.</p>
                    <Button onClick={() => setLocation('/today-i-want-to')}>
                      Back to Today I Want To
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </Route>

            {/* Gentle activities placeholder (for future implementation) */}
            <Route path="/gentle-activities">
              <div className="min-h-screen bg-gradient-to-b from-green-50 to-blue-50 p-4 flex items-center justify-center">
                <Card className="text-center p-8">
                  <CardContent>
                    <div className="text-6xl mb-4">🌸</div>
                    <h1 className="text-3xl font-bold mb-4">Gentle Activities Coming Soon!</h1>
                    <p className="text-lg mb-6">We're creating peaceful, calming activities for you.</p>
                    <Button onClick={() => setLocation('/today-i-want-to')}>
                      Back to Today I Want To
                    </Button>
                  </CardContent>
                </Card>
              </div>
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
        onOpenChange={(open) => {
          setShowCalmCorner(open)
          if (!open && isInCalmCorner) {
            toggleCalmCorner()
          }
        }}
        onBreathingExercise={() => {
          // TODO: Implement breathing exercise
          console.log('Starting breathing exercise')
          announceToScreenReader('Starting breathing exercise')
        }}
        onCalmMusic={() => {
          // TODO: Implement calm music
          console.log('Playing calm music')
          announceToScreenReader('Playing calm music')
        }}
        onSafeSpace={() => {
          // TODO: Implement safe space visualization
          console.log('Opening safe space')
          announceToScreenReader('Opening safe space visualization')
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

      {/* Session Status for Screen Readers */}
      <div className="sr-only" aria-live="polite" id="session-status">
        {sessionProgress.step > 0 && (
          <span>
            Currently in learning session, step {sessionProgress.step} of {sessionProgress.totalSteps}
          </span>
        )}
      </div>

      {/* Hidden accessibility help text */}
      <div className="sr-only">
        <div id="accessibility-mode-help">
          Choose an accessibility mode that works best for your learning needs
        </div>
        <div id="font-size-help">
          Adjust text size for comfortable reading
        </div>
      </div>

      {/* Dynamic CSS for accessibility modes */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Skip Link Styles */
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--primary);
            color: white;
            padding: 8px;
            text-decoration: none;
            border-radius: 4px;
            z-index: 1000;
          }
          
          .skip-link:focus {
            top: 6px;
          }

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
            --muted: 0 0% 10%;
            --muted-foreground: 0 0% 80%;
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
            --muted: 44 50% 88%;
            --muted-foreground: 36 50% 40%;
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
            --muted: 152 40% 85%;
            --muted-foreground: 209 50% 30%;
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

          /* Focus Management */
          :focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
          }

          /* High Contrast for Better Accessibility */
          @media (prefers-contrast: high) {
            :root {
              --border: 0 0% 20%;
            }
          }
        `
      }} />
    </div>
  )
}

export default App