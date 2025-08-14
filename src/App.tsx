import React, { useEffect, useState } from 'react'
import { Router, Route, Switch, Link } from 'wouter'
import { accessibility, preferences, storage } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { useLocation } from 'wouter'
import { Brain, Heart, Settings, CheckCircle, Target, Users, ChevronDown } from 'lucide-react'
// CHANGE THIS LINE - import EnhancedCalmCorner instead of CalmCorner
import EnhancedCalmCorner from '@/components/EnhancedCalmCorner'

import type { TtsAccent } from './types'

// Import page components
import BrainCheckPage from './pages/BrainCheckPage'
import PracticeReadingPage from './pages/PracticeReadingPage'
import WordInterestSelectionPage from './pages/WordInterestSelectionPage'
import WordBuildingGamePage from './pages/WordBuildingGamePage'
import SentenceBuildingPage from './pages/SentenceBuildingPage'
import StoryPage from './pages/StoryPage'
import CreatePage from './pages/CreatePage'
import CelebratePage from './pages/CelebratePage'
import InterestSelectionPage from './pages/InterestSelectionPage'
import TodayIWantToPage from './pages/TodayIWantToPage'
import StoryGenerationPage from './pages/StoryGenerationPage'
import NotFoundPage from './pages/NotFoundPage'

// Import Zustand store
import { useSessionStore } from '@/stores/sessionStore'

// Accessibility preference types
type AccessibilityMode = 'default' | 'adhd' | 'dyslexia' | 'autism'
type FontSize = 'default' | 'large' | 'extra-large'

// Professional Footer Component
const Footer = () => (
  <footer className="bg-page-section-bg border-t border-gray-100 py-4">
    <div className="max-w-6xl mx-auto px-6">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-6 text-sm text-gray-500">
          <span className="flex items-center gap-2">
            <Brain className="w-4 h-4" />
            Neurodivergent Designed
          </span>
          <span className="flex items-center gap-2">
            <Target className="w-4 h-4" />
            Evidence-Based
          </span>
          <span className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            Accessibility First
          </span>
        </div>
        
        <div className="flex items-center gap-4 text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-700 transition-colors">Privacy</Link>
          <Link href="/support" className="hover:text-gray-700 transition-colors">Support</Link>
          <Link href="/about" className="hover:text-gray-700 transition-colors">About</Link>
        </div>
      </div>
      
      <div className="text-center text-sm text-gray-400 mt-2">
        Built for neurodivergent learners | UDL Aligned | Research-Based Design
      </div>
    </div>
  </footer>
)

function App() {
  const [accessibilityMode, setAccessibilityMode] = useState<AccessibilityMode>('default')
  const [fontSize, setFontSize] = useState<FontSize>('default')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [location, setLocation] = useLocation()

  // Zustand store for session management
  const { getSessionProgress, toggleCalmCorner, isInCalmCorner } = useSessionStore()
  const [ttsAccent, setTtsAccent] = useState<TtsAccent>(() => 
    storage.get('tts-accent', 'US') as TtsAccent
  )

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

  const handleTtsAccentChange = (newAccent: TtsAccent) => {
    setTtsAccent(newAccent)
    storage.set('tts-accent', newAccent)
  }

  // FIXED: Handle calm corner toggle - simplified to just use toggleCalmCorner
  const handleCalmCornerToggle = () => {
    toggleCalmCorner()
  }

  // Get current session progress for navigation display
  const sessionProgress = getSessionProgress()

  return (
    <div className="page-container">
      {/* Skip Navigation Link for Keyboard Users */}
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded">
        Skip to main content
      </a>

      {/* Professional Header - Redesigned */}
      <nav className="bg-white border-b border-gray-200 shadow-gentle flex-shrink-0" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center justify-between">
            {/* Logo Section - Enhanced */}
            <div className="flex items-center gap-4">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity group">
                <img 
                  src="/logo_xl.png" 
                  alt="Vedyx Leap - Stories that match your brilliant brain" 
                  className="h-16 w-auto md:h-20 lg:h-24 object-contain"
                />
              </Link>
              
              {/* Tagline and Credibility */}
              <div className="hidden md:flex flex-col gap-1">
                
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1 bg-sage-green/10 px-2 py-1 rounded-full">
                    <CheckCircle className="w-3 h-3 text-sage-green" />
                    <span className="text-xs font-medium text-sage-green">UDL Aligned</span>
                  </div>
                  <div className="flex items-center gap-1 bg-deep-ocean-blue/10 px-2 py-1 rounded-full">
                    <Brain className="w-3 h-3 text-deep-ocean-blue" />
                    <span className="text-xs font-medium text-deep-ocean-blue">Neurodivergent Designed</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Session Progress - Center positioned for desktop */}
            {sessionProgress.step > 0 && (
              <div className="hidden xl:flex items-center gap-3 bg-gray-50 px-4 py-2 rounded-lg">
                <span className="text-sm font-medium text-warm-charcoal">
                  Session Progress
                </span>
                <div className="w-32 bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-deep-ocean-blue h-2.5 rounded-full transition-all duration-500 shadow-sm"
                    style={{ width: `${sessionProgress.progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-deep-ocean-blue">
                  {sessionProgress.step}/{sessionProgress.totalSteps}
                </span>
              </div>
            )}

            {/* Right Actions - Refined */}
            <div className="flex items-center gap-3">
              {/* Calm Corner - Enhanced */}
              <Button 
                variant="outline" 
                size="comfortable" 
                onClick={handleCalmCornerToggle}
                className={`
                  border-2 border-soft-lavender/40 text-soft-lavender bg-soft-lavender/5 
                  hover:bg-soft-lavender/15 hover:border-soft-lavender/60 
                  font-medium shadow-soft transition-all duration-200
                  ${isInCalmCorner ? 'ring-2 ring-deep-ocean-blue bg-soft-lavender/20' : ''}
                `}
                aria-label="Open calm corner for emotional regulation"
              >
                <Heart className="w-4 h-4 mr-2" />
                <span className="hidden sm:inline">Calm Corner</span>
                <span className="sm:hidden">Calm</span>
              </Button>
              
              {/* Accessibility Settings - Styled as professional controls */}
              <div className="hidden sm:flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <div className="relative">
                    <label htmlFor="accessibility-mode" className="sr-only">
                      Choose accessibility mode for your neurodivergent needs
                    </label>
                    <select
                      id="accessibility-mode"
                      value={accessibilityMode}
                      onChange={(e) => handleAccessibilityModeChange(e.target.value as AccessibilityMode)}
                      className="
                        rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
                        min-w-[110px] font-primary cursor-pointer
                        hover:border-deep-ocean-blue/50 focus:border-deep-ocean-blue 
                        focus:ring-2 focus:ring-deep-ocean-blue/20 transition-all
                        appearance-none pr-8
                      "
                      aria-describedby="accessibility-mode-help"
                    >
                      <option value="none">Screen Mode</option>
                      <option value="adhd">ADHD</option>
                      <option value="dyslexia">Dyslexia</option>
                      <option value="autism">Autism</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>

                  {/* NEW: TTS Accent Dropdown */}
                  <div className="relative">
                    <label htmlFor="tts-accent" className="sr-only">
                      Choose voice accent for text-to-speech reading
                    </label>
                    <select
                      id="tts-accent"
                      value={ttsAccent}
                      onChange={(e) => handleTtsAccentChange(e.target.value as TtsAccent)}
                      className="
                        rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
                        min-w-[80px] font-primary cursor-pointer
                        hover:border-deep-ocean-blue/50 focus:border-deep-ocean-blue 
                        focus:ring-2 focus:ring-deep-ocean-blue/20 transition-all
                        appearance-none pr-8
                      "
                      aria-describedby="tts-accent-help"
                      title="Choose voice accent for reading aloud"
                    >
                      <option value="none">Switch Accent</option>
                      <option value="US">🇺🇸 US</option>
                      <option value="GB">🇬🇧 UK</option>
                      <option value="IN">🇮🇳 India</option>
                    </select>
                    <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                  </div>
                </div>
              </div>

              {/* Settings Button - Professional */}
              <Button 
                variant="ghost" 
                size="icon" 
                className="
                  text-warm-charcoal hover:text-deep-ocean-blue 
                  hover:bg-gray-100 rounded-lg p-2
                  transition-all duration-200
                "
              >
                <Settings className="w-5 h-5" />
                <span className="sr-only">Settings</span>
              </Button>
            </div>
          </div>

          {/* Mobile Session Progress & Credentials */}
          <div className="mt-4 space-y-3">
            {/* Mobile Session Progress */}
            {sessionProgress.step > 0 && (
              <div className="xl:hidden flex items-center gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-warm-charcoal">
                  Progress
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-deep-ocean-blue h-2 rounded-full transition-all duration-500"
                    style={{ width: `${sessionProgress.progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-deep-ocean-blue">
                  {sessionProgress.step}/{sessionProgress.totalSteps}
                </span>
              </div>
            )}

            {/* Mobile Credentials */}
            <div className="md:hidden flex flex-wrap items-center justify-center gap-2">
              <div className="flex items-center gap-1 bg-sage-green/10 px-2 py-1 rounded-full">
                <CheckCircle className="w-3 h-3 text-sage-green" />
                <span className="text-xs font-medium text-sage-green">UDL Aligned</span>
              </div>
              <div className="flex items-center gap-1 bg-deep-ocean-blue/10 px-2 py-1 rounded-full">
                <Brain className="w-3 h-3 text-deep-ocean-blue" />
                <span className="text-xs font-medium text-deep-ocean-blue">Neurodivergent Designed</span>
              </div>
              <div className="flex items-center gap-1 bg-cool-mint/10 px-2 py-1 rounded-full">
                <Target className="w-3 h-3 text-cool-mint" />
                <span className="text-xs font-medium text-cool-mint">Evidence-Based</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content Area - Now uses content-area class for flex: 1 */}
      <main id="main-content" className="content-area">
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

            {/* Practice Reading Route */}
            <Route path="/practice-reading">
              <PracticeReadingPage />
            </Route>

            {/* Word Building Routes */}
            <Route path="/word-building">
              <WordInterestSelectionPage />
            </Route>
            <Route path="/word-building/:theme">
              {(params) => <WordBuildingGamePage theme={params.theme} />}
            </Route>
            <Route path="/sentence-building/:theme">
              {(params) => <SentenceBuildingPage theme={params.theme} />}
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

            {/* Today I Want To page */}
            <Route path="/today-i-want-to">
              <TodayIWantToPage />
            </Route>

            <Route path="/story-generate">
              <StoryGenerationPage />
            </Route>

            {/* Math activities placeholder */}
            <Route path="/math-activities">
              <div className="container">
                <div className="viewport-header">
                  <div className="text-6xl mb-4">🔢</div>
                  <h1 className="text-3xl font-bold mb-4 text-header-primary">Math Adventures Coming Soon!</h1>
                  <p className="text-lg mb-6 text-body-text">We're building awesome number activities for you.</p>
                  <Button onClick={() => setLocation('/today-i-want-to')} className="bg-deep-ocean-blue hover:bg-deep-ocean-blue/90">
                    Back to Today I Want To
                  </Button>
                </div>
              </div>
            </Route>

            {/* Gentle activities placeholder */}
            <Route path="/gentle-activities">
              <div className="container">
                <div className="viewport-header">
                  <div className="text-6xl mb-4">🌸</div>
                  <h1 className="text-3xl font-bold mb-4 text-header-primary">Gentle Activities Coming Soon!</h1>
                  <p className="text-lg mb-6 text-body-text">We're creating peaceful, calming activities for you.</p>
                  <Button onClick={() => setLocation('/today-i-want-to')} className="bg-deep-ocean-blue hover:bg-deep-ocean-blue/90">
                    Back to Today I Want To
                  </Button>
                </div>
              </div>
            </Route>

            {/* 404 Not Found - catch all other routes */}
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </Router>
      </main>

      {/* Professional Footer - Now inside the page-container */}
      <Footer />

      {/* FIXED: Use EnhancedCalmCorner instead of CalmCorner */}
      <EnhancedCalmCorner />

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
        <div id="tts-accent-help">
          Choose the voice accent for text-to-speech reading. All voices are optimized to be calm and slow for better comprehension.
        </div>
      </div>

      {/* Updated Dynamic CSS for Professional Design */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Skip Link Styles */
          .skip-link {
            position: absolute;
            top: -40px;
            left: 6px;
            background: var(--deep-ocean-blue);
            color: white;
            padding: 8px 12px;
            text-decoration: none;
            border-radius: 8px;
            z-index: 1000;
            font-weight: 500;
            box-shadow: var(--shadow-md);
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

          .adhd-mode nav {
            background-color: black !important;
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
            --background: var(--autism-calm-mint);
            --card: var(--autism-neutral);
            --primary: var(--autism-primary);
            --secondary: var(--autism-secondary);
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

          /* Professional Focus Management */
          :focus-visible {
            outline: 2px solid var(--deep-ocean-blue);
            outline-offset: 2px;
            border-radius: 6px;
          }

          /* Professional Color Utilities */
          .text-deep-ocean-blue { color: var(--deep-ocean-blue); }
          .text-sage-green { color: var(--sage-green); }
          .text-warm-charcoal { color: var(--warm-charcoal); }
          .text-soft-lavender { color: var(--soft-lavender); }
          .text-header-primary { color: var(--header-primary); }
          .text-body-text { color: var(--body-text); }

          .bg-deep-ocean-blue { background-color: var(--deep-ocean-blue); }
          .bg-sage-green { background-color: var(--sage-green); }
          .bg-page-section-bg { background-color: var(--page-section-bg); }

          .border-deep-ocean-blue { border-color: var(--deep-ocean-blue); }
          .border-soft-lavender { border-color: var(--soft-lavender); }

          /* Shadow utilities */
          .shadow-soft { box-shadow: var(--shadow-sm); }
          .shadow-gentle { box-shadow: var(--shadow-md); }

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