import React, { useEffect, useState } from 'react'
import { Router, Route, Switch, Link, useLocation } from 'wouter'
import { accessibility, preferences, storage } from '@/lib/utils'
import { Button } from '@/components/ui/Button'
import { Card, CardContent } from '@/components/ui/Card'
import { Brain, Heart, Settings, CheckCircle, Target, Users, ChevronDown } from 'lucide-react'
import EnhancedCalmCorner from '@/components/EnhancedCalmCorner'
import { SettingsModal } from '@/components/SettingsModal'
import { useAnalytics } from './hooks/useAnalytics'
import { useCurrentUserId } from '@/lib/auth-utils'

// NEW: Import auth providers and components
import { ParentAuthProvider } from './contexts/ParentAuthContext'
import { ChildAuthProvider, useChildAuth } from './contexts/ChildAuthContext'
import { AuthGate } from './components/auth/AuthGate'
import { ParentDashboard } from './components/parent/ParentDashboard'
import { ChildLogin } from './components/auth/ChildLogin'
import { ParentSignup } from './components/auth/ParentSignup'
import { ParentLogin } from './components/auth/ParentLogin'
import ChildDashboard from './components/child/ChildDashboard'
import { TeacherAuthProvider } from './contexts/TeacherAuthContext'
import { TeacherLogin } from './components/auth/TeacherLogin'
import { TeacherDashboard } from './components/teacher/TeacherDashboard'
import { TeacherAuthGuard } from './components/auth/TeacherAuthGuard'
import { OnboardingSystem } from '@/components/onboarding/OnboardingSystem'

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
import NotFoundPage from './pages/NotFoundPage'
import StorySelectionPage from './pages/StorySelectionPage'
import SentenceThemeSelectionPage from './pages/SentenceThemeSelectionPage'
import { PhonicsWorksheetGenerator } from './pages/teacher/PhonicsWorksheetGenerator'
import { SightWordsWorksheetGenerator } from './pages/teacher/SightWordsWorksheetGenerator'
import MoodBasedWorksheetGenerator from './pages/teacher/MoodBasedWorksheetGenerator'
import { GenDashboard } from './pages/GenDashboard'
import { PaymentSuccessPage } from './pages/payment/PaymentSuccessPage'

// Import Zustand store
import { useSessionStore } from '@/stores/sessionStore'

// Accessibility preference types
type AccessibilityMode = 'default' | 'adhd' | 'dyslexia' | 'autism'
type FontSize = 'default' | 'large' | 'extra-large'

// Professional Footer Component - Mobile Responsive
const Footer = () => (
  <footer className="bg-page-section-bg border-t border-gray-100 py-2 sm:py-4 lg:py-8 flex-shrink-0">
    <div className="max-w-6xl mx-auto px-3 sm:px-4 lg:px-6">
      <div className="flex flex-col sm:flex-row items-center justify-between gap-2 sm:gap-4">
        {/* Main credentials - responsive layout */}
        <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 sm:gap-4 lg:gap-6 text-xs sm:text-sm text-gray-500">
          <span className="flex items-center gap-1 sm:gap-2">
            <Brain className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Neurodivergent Designed</span>
            <span className="sm:hidden">ND Designed</span>
          </span>
      `SI5`      <span className="flex items-center gap-1 sm:gap-2">
            <Target className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Evidence-Based</span>
            <span className="sm:hidden">Evidence-Based</span>
          </span>
          <span className="flex items-center gap-1 sm:gap-2">
            <Users className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">Accessibility First</span>
            <span className="sm:hidden">Accessible</span>
          </span>
        </div>
        
        {/* Links - stacked on mobile */}
        <div className="flex items-center gap-3 sm:gap-4 text-xs sm:text-sm text-gray-500">
          <Link href="/privacy" className="hover:text-gray-700 transition-colors min-h-[44px] flex items-center">Privacy</Link>
          <Link href="/support" className="hover:text-gray-700 transition-colors min-h-[44px] flex items-center">Support</Link>
          <Link href="/about" className="hover:text-gray-700 transition-colors min-h-[44px] flex items-center">About</Link>
        </div>
      </div>
      
      {/* Bottom text - responsive sizing */}
      <div className="text-center text-xs sm:text-sm text-gray-400 mt-1 sm:mt-2">
        Built for neurodivergent learners | UDL Aligned | Research-Based Design
      </div>
    </div>
  </footer>
)

function ProgressWrapper() {
  const { childSession } = useChildAuth()
  
  if (!childSession) {
    return (
      <div className="text-center p-8">
        <p>Please log in to view your progress.</p>
        <Button onClick={() => setLocation('/')}>Go to Login</Button>
      </div>
    )
  }
  
  return (
    <ChildDashboard 
      childId={childSession.childId}
      username={childSession.username}
    />
  )
}

// Main App Content Component (extracted to work within auth providers)
function AppContent() {  
  const [fontSize, setFontSize] = useState<FontSize>('default')
  const [reducedMotion, setReducedMotion] = useState(false)
  const [location, setLocation] = useLocation()
  const [showSettings, setShowSettings] = useState(false)
  const [siennaEnabled, setSiennaEnabled] = useState(false)
  
  const userId = useCurrentUserId()
  useAnalytics(userId)

  // Zustand store for session management
  const { getSessionProgress, toggleCalmCorner, isInCalmCorner } = useSessionStore()
  const [ttsAccent, setTtsAccent] = useState<TtsAccent>(() => 
    storage.get('tts-accent', 'GB') as TtsAccent
  )

  // Load Sienna preference on mount (add to existing useEffect or create new one)
  useEffect(() => {
    const loadSiennaIfEnabled = () => {
      const savedSienna = localStorage.getItem('sienna-enabled')
      if (savedSienna === 'true') {
        // Only load Sienna if it's not already loaded
        if (!document.querySelector('script[src*="sienna"]')) {
          const script = document.createElement('script')
          script.src = 'https://website-widgets.pages.dev/dist/sienna.min.js'
          script.defer = true
          script.onload = () => {
            console.log('✅ Sienna loaded and ready')
            document.body.classList.add('sienna-enabled')
          }
          document.head.appendChild(script)
        } else {
          document.body.classList.add('sienna-enabled')
        }
      }
    }
  
    loadSiennaIfEnabled()
  }, [])

  // Load preferences on app start
  useEffect(() => {
    const savedFontSize = preferences.getFontSize()
    const prefersReducedMotion = accessibility.prefersReducedMotion()

    setFontSize(savedFontSize)
    setReducedMotion(prefersReducedMotion)

    // Apply font size preference to document
    preferences.setFontSize(savedFontSize)

    // Apply font size class to document body
    document.body.className = `font-${savedFontSize}`

    // Apply reduced motion preference
    if (prefersReducedMotion) {
      document.documentElement.style.setProperty('--animation-duration', '0.01ms')
      document.documentElement.style.setProperty('--transition-duration', '0.01ms')
    }
  }, [])

  // Handle font size change
  const handleFontSizeChange = (size: FontSize) => {
    setFontSize(size)
    preferences.setFontSize(size)
    
    // Update body class (only font size now)
    document.body.className = `font-${size}`
    
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
      <a href="#main-content" className="skip-link sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded min-h-[44px] flex items-center">
        Skip to main content
      </a>

      {/* Professional Header - Mobile-First Responsive */}
      <nav className="bg-white border-b border-gray-200 shadow-gentle flex-shrink-0" role="navigation" aria-label="Main navigation">
        <div className="max-w-7xl mx-auto px-3 sm:px-4 md:px-6 py-3 sm:py-4 md:py-6">
          <div className="flex items-center justify-between">
            {/* Logo Section - Mobile Optimized */}
            <div className="flex items-center gap-2 sm:gap-4">
              <Link href="/" className="flex items-center hover:opacity-90 transition-opacity group min-h-[44px]">
                <img 
                  src="/logo_xl.png" 
                  alt="Vedyx Leap - Stories that match your brilliant brain" 
                  className="h-10 w-auto sm:h-12 md:h-16 lg:h-20 xl:h-24 object-contain"
                />
              </Link>
              
              {/* Desktop-only tagline and credentials */}
              <div className="hidden xl:flex flex-col gap-1">
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

            {/* Session Progress - Center positioned for desktop only */}
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

            {/* Right Side - Calm Corner + Desktop Controls */}
            <div className="flex items-center gap-2 sm:gap-3">
              {/* Calm Corner - Enhanced for touch */}
              <Button 
                variant="outline" 
                size="comfortable" 
                onClick={handleCalmCornerToggle}
                className={`
                  min-h-[44px] min-w-[44px] px-3 sm:px-4
                  border-2 border-soft-lavender/40 text-soft-lavender bg-soft-lavender/5 
                  hover:bg-soft-lavender/15 hover:border-soft-lavender/60 
                  font-medium shadow-soft transition-all duration-200
                  ${isInCalmCorner ? 
                    'ring-2 ring-deep-ocean-blue bg-soft-lavender/20' : ''
                  }
                `}
                aria-label="Open calm corner for emotional regulation"
                aria-pressed={isInCalmCorner}
              >
                <Heart className="w-4 h-4 sm:w-5 sm:h-5" />
                <span className="hidden sm:inline ml-2">Calm Corner</span>
                <span className="sm:hidden">Calm</span>
              </Button>
              
              {/* TTS Accent Settings - Desktop Only */}
              <div className="hidden lg:flex items-center space-x-3">
                <span className="text-sm font-medium text-warm-charcoal">Change Accent:</span>
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
                      min-w-[100px] min-h-[44px] font-primary cursor-pointer
                      hover:border-deep-ocean-blue/50 focus:border-deep-ocean-blue 
                      focus:ring-2 focus:ring-deep-ocean-blue/20 transition-all
                      appearance-none pr-8
                    "
                    aria-describedby="tts-accent-help"
                    title="Choose voice accent for reading aloud"
                  >
                    <option value="" disabled hidden>Choose Accent</option>
                    <option value="US">🇺🇸 US</option>
                    <option value="GB">🇬🇧 UK</option>
                    <option value="IN">🇮🇳 India</option>
                  </select>
                  <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
                </div>
              </div>

              {/* Settings Button - Always visible */}
              <Button 
                variant="ghost" 
                size="icon" 
                onClick={() => setShowSettings(true)}
                className="
                  min-h-[44px] min-w-[44px] p-2
                  text-warm-charcoal hover:text-deep-ocean-blue 
                  hover:bg-gray-100 rounded-lg
                  transition-all duration-200
                "
                aria-label="Open accessibility settings"
              >
                <Settings className="w-5 h-5" />
              </Button>
            </div>
          </div>

          {/* Mobile/Tablet Section - MOVED OUTSIDE of flex container */}
          <div className="mt-3 sm:mt-4 space-y-3 sm:space-y-4">
            {/* Session Progress - Mobile */}
            {sessionProgress.step > 0 && (
              <div className="xl:hidden flex items-center gap-2 sm:gap-3 bg-gray-50 px-3 py-2 rounded-lg">
                <span className="text-sm font-medium text-warm-charcoal min-w-0 flex-shrink-0">
                  Progress
                </span>
                <div className="flex-1 bg-gray-200 rounded-full h-2 min-w-0">
                  <div 
                    className="bg-deep-ocean-blue h-2 rounded-full transition-all duration-500"
                    style={{ width: `${sessionProgress.progressPercent}%` }}
                  />
                </div>
                <span className="text-sm font-semibold text-deep-ocean-blue flex-shrink-0">
                  {sessionProgress.step}/{sessionProgress.totalSteps}
                </span>
              </div>
            )}

            {/* Mobile TTS Accent Only */}
            <div className="lg:hidden">
              <span className="text-sm font-medium text-warm-charcoal mb-2 block">Change Accent:</span>
              <div className="relative">
                <label htmlFor="mobile-tts-accent" className="sr-only">
                  Choose voice accent for text-to-speech reading
                </label>
                <select
                  id="mobile-tts-accent"
                  value={ttsAccent}
                  onChange={(e) => handleTtsAccentChange(e.target.value as TtsAccent)}
                  className="
                    w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm 
                    min-h-[44px] font-primary cursor-pointer
                    hover:border-deep-ocean-blue/50 focus:border-deep-ocean-blue 
                    focus:ring-2 focus:ring-deep-ocean-blue/20 transition-all
                    appearance-none pr-8
                  "
                  aria-describedby="tts-accent-help"
                  title="Choose voice accent for reading aloud"
                >
                  <option value="" disabled hidden>Choose Accent</option>
                  <option value="US">🇺🇸 US Voice</option>
                  <option value="GB">🇬🇧 UK Voice</option>
                  <option value="IN">🇮🇳 India Voice</option>
                </select>
                <ChevronDown className="w-4 h-4 absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
              </div>
            </div>

            {/* Mobile/Tablet Credentials - Responsive badges */}
            <div className="hidden md:flex lg:hidden flex-wrap items-center justify-center gap-1.5 sm:gap-2">
              <div className="flex items-center gap-1 bg-sage-green/10 px-2 py-1 rounded-full min-h-[32px]">
                <CheckCircle className="w-3 h-3 text-sage-green" />
                <span className="text-xs font-medium text-sage-green">UDL Aligned</span>
              </div>
              <div className="flex items-center gap-1 bg-deep-ocean-blue/10 px-2 py-1 rounded-full min-h-[32px]">
                <Brain className="w-3 h-3 text-deep-ocean-blue" />
                <span className="text-xs font-medium text-deep-ocean-blue">Neurodivergent Designed</span>
              </div>
              <div className="flex items-center gap-1 bg-cool-mint/10 px-2 py-1 rounded-full min-h-[32px]">
                <Target className="w-3 h-3 text-cool-mint" />
                <span className="text-xs font-medium text-cool-mint">Evidence-Based</span>
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* NEW: Add this after your nav but before Router */}
      <OnboardingSystem 
        onTtsAccentChange={handleTtsAccentChange}
        onShowSettings={() => setShowSettings(true)}
        calmCornerActive={isInCalmCorner}
        onCalmCornerToggle={handleCalmCornerToggle}
        speakText={async (text: string, accent: TtsAccent) => {
          const { audio } = await import('@/lib/utils')
          return audio.speak(text, { accent, rate: 0.8, pitch: 0.9, volume: 0.8 })
        }}
      />

      {/* Main Content Area - Responsive container */}
      <main id="main-content" className="content-area">
        <Router>
          <Switch>
            {/* Public routes - no auth needed */}
            <Route path="/">
              <BrainCheckPage />
            </Route>

            {/* Brain Check-in page - Public */}
            <Route path="/brain-check">
              <BrainCheckPage />
            </Route>

            {/* Protected routes - require child auth */}
            <Route path="/practice-reading">
              <AuthGate requireChild>
                <PracticeReadingPage />
              </AuthGate>
            </Route>

            {/* Word Building Routes - Protected */}
            <Route path="/word-building">
              <AuthGate requireChild>
                <WordInterestSelectionPage />
              </AuthGate>
            </Route>
            <Route path="/word-building/:theme">
              <AuthGate requireChild>
                {(params) => <WordBuildingGamePage theme={params.theme} />}
              </AuthGate>
            </Route>
            <Route path="/sentence-building">
              <AuthGate requireChild>
                <SentenceThemeSelectionPage />
              </AuthGate>
            </Route>
            <Route path="/sentence-building/:theme">
              <AuthGate requireChild>
                {(params) => <SentenceBuildingPage theme={params.theme} />}
              </AuthGate>
            </Route>
            
            {/* Story reading page with optional story ID - Protected */}
            <Route path="/story/:interest/:storyId">
              <AuthGate requireChild>
                {(params) => <StoryPage interest={params.interest} storyName={params.storyId} />}
              </AuthGate>
            </Route>

            {/* Creative response page - Protected */}
            <Route path="/create">
              <AuthGate requireChild>
                <CreatePage />
              </AuthGate>
            </Route>

            {/* Celebration page - Protected */}
            <Route path="/celebrate">
              <AuthGate requireChild>
                <CelebratePage />
              </AuthGate>
            </Route>

            {/* Interest Selection page - Protected */}
            <Route path="/interests">
              <AuthGate requireChild>
                <InterestSelectionPage />
              </AuthGate>
            </Route>

            {/* Today I Want To page - Protected */}
            <Route path="/today-i-want-to">
              <AuthGate requireChild>
                <TodayIWantToPage />
              </AuthGate>
            </Route>

            <Route path="/stories/:interest">
              <AuthGate requireChild>
                {(params) => <StorySelectionPage interest={params.interest} />}
              </AuthGate>
            </Route>

            <Route path="/parent-signup">
              <ParentSignup />
            </Route>
            <Route path="/parent">
              <AuthGate requireParent>
                <ParentDashboard />
              </AuthGate>
            </Route>
            
            {/* Parent login - separate route for existing users */}
            <Route path="/parent-login">
              <ParentLogin />
            </Route>

            {/* Progress Dashboard - Protected route for children */}
            <Route path="/progress">
              <AuthGate requireChild>
                <ProgressWrapper />
              </AuthGate>
            </Route>

            {/* Math activities placeholder - Protected */}
            <Route path="/math-activities">
              <AuthGate requireChild>
                <div className="container px-4 sm:px-6">
                  <div className="viewport-header text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🔢</div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-header-primary">Math Adventures Coming Soon!</h1>
                    <p className="text-base sm:text-lg mb-6 text-body-text max-w-md mx-auto">We're building awesome number activities for you.</p>
                    <Button 
                      onClick={() => setLocation('/today-i-want-to')} 
                      className="bg-deep-ocean-blue hover:bg-deep-ocean-blue/90 min-h-[44px] px-6"
                    >
                      Back to Today I Want To
                    </Button>
                  </div>
                </div>
              </AuthGate>
            </Route>

            {/* Gentle activities placeholder - Protected */}
            <Route path="/gentle-activities">
              <AuthGate requireChild>
                <div className="container px-4 sm:px-6">
                  <div className="viewport-header text-center py-8 sm:py-12">
                    <div className="text-4xl sm:text-5xl md:text-6xl mb-4">🌸</div>
                    <h1 className="text-xl sm:text-2xl md:text-3xl font-bold mb-4 text-header-primary">Gentle Activities Coming Soon!</h1>
                    <p className="text-base sm:text-lg mb-6 text-body-text max-w-md mx-auto">We're creating peaceful, calming activities for you.</p>
                    <Button 
                      onClick={() => setLocation('/today-i-want-to')} 
                      className="bg-deep-ocean-blue hover:bg-deep-ocean-blue/90 min-h-[44px] px-6"
                    >
                      Back to Today I Want To
                    </Button>
                  </div>
                </div>
              </AuthGate>
            </Route>

            {/* 404 Not Found - catch all other routes */}
            <Route>
              <NotFoundPage />
            </Route>
          </Switch>
        </Router>
      </main>

      {/* Professional Footer - Mobile Responsive */}
      <Footer />

      {/* FIXED: Use EnhancedCalmCorner instead of CalmCorner */}
      <EnhancedCalmCorner />

      {/* Settings Modal */}
      <SettingsModal 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
        ttsAccent={ttsAccent}
        onTtsAccentChange={handleTtsAccentChange}
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
        <div id="tts-accent-help">
          Choose the voice accent for text-to-speech reading. All voices are optimized to be calm and slow for better comprehension.
        </div>
      </div>

      {/* Dynamic Styles for Accessibility and Animations */}
      <style dangerouslySetInnerHTML={{
        __html: `
          /* Accessibility Motion Preferences */
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

// Teacher App - Completely separate from student interface
function TeacherApp() {
  return (
    <TeacherAuthProvider>
      <Router>
      <Route path="/teacher" exact>
          <TeacherLogin />
        </Route>
        <Route path="/dashboard">
          <GenDashboard />
        </Route>
        <Route path="/payment-success">
          <TeacherAuthGuard>
            <PaymentSuccessPage />
          </TeacherAuthGuard>
        </Route>
        <Route path="/skill-builder">
          <TeacherAuthGuard>
            <TeacherDashboard />
          </TeacherAuthGuard>
        </Route>
        <Route path="/teacher/worksheets/phonics">
          <TeacherAuthGuard>
            <PhonicsWorksheetGenerator />
          </TeacherAuthGuard>
        </Route>
        <Route path="/teacher/worksheets/sight-words">
          <TeacherAuthGuard>
            <SightWordsWorksheetGenerator />
          </TeacherAuthGuard>
        </Route>
        {/* NEW: Mood-Based Generator - Now Protected */}
        <Route path="/teacher/worksheet-generator">
          <TeacherAuthGuard>
            <MoodBasedWorksheetGenerator />
          </TeacherAuthGuard>
        </Route>
        <Route path="/worksheet-generator">
          <TeacherAuthGuard>
            <MoodBasedWorksheetGenerator />
          </TeacherAuthGuard>
        </Route>
        
      </Router>
    </TeacherAuthProvider>
  )
}

// Main App Component with Auth Providers
function App() {
  const [location] = useLocation()
  
  // Route teacher pages to separate app
  if (location.startsWith('/teacher') || location === '/worksheet-generator' || location === '/dashboard' || location === '/payment-success' || location === '/skill-builder') {
    return <TeacherApp />
  }
  
  // Student/parent app
  return (
    <ParentAuthProvider>
      <ChildAuthProvider>
        <div className="min-h-screen bg-page-bg text-page-text">
          <AppContent />
        </div>
      </ChildAuthProvider>
    </ParentAuthProvider>
  )
}

export default App