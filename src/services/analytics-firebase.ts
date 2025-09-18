// src/services/analytics.ts
import { getAnalytics, logEvent, isSupported } from 'firebase/analytics'
import { app } from '../lib/firebase-config'

// Minimal config - easy to disable everything
const ANALYTICS_CONFIG = {
  enabled: true, // Set to false to disable all analytics
  firebase: true,
  console: true, // Log events to console for debugging
}

// Core event types - just 5 essential events
type AnalyticsEvent = 
  | 'session_start'
  | 'activity_start' 
  | 'struggle_moment'
  | 'success_moment'
  | 'session_end'

interface EventData {
  // Core context
  brain_state?: string
  app_section?: string
  activity_type?: string
  difficulty?: string
  
  // Learning metrics
  duration?: number
  attempts?: number
  success?: boolean
  
  // Accessibility context
  accessibility_mode?: string
  tts_used?: boolean
}

class MinimalAnalytics {
  private analytics: any = null
  private sessionId: string
  private sessionStartTime: number

  constructor() {
    this.sessionId = this.generateSessionId()
    this.sessionStartTime = Date.now()
    this.initFirebase()
  }

  private async initFirebase() {
    if (!ANALYTICS_CONFIG.enabled || !ANALYTICS_CONFIG.firebase) return
    
    try {
      const supported = await isSupported()
      if (supported) {
        this.analytics = getAnalytics(app)
        this.log('Analytics initialized')
      }
    } catch (error) {
      console.warn('Analytics init failed:', error)
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  }

  private log(message: string, data?: any) {
    if (ANALYTICS_CONFIG.console) {
      console.log(`📊 Analytics: ${message}`, data || '')
    }
  }

  // Main tracking method - this is all your components need to call
  track(event: AnalyticsEvent, data: EventData = {}) {
    if (!ANALYTICS_CONFIG.enabled) return

    const eventData = {
      ...data,
      session_id: this.sessionId,
      timestamp: Date.now(),
      session_duration: Date.now() - this.sessionStartTime
    }

    this.log(`Event: ${event}`, eventData)

    // Send to Firebase Analytics
    if (this.analytics && ANALYTICS_CONFIG.firebase) {
      try {
        logEvent(this.analytics, event, eventData)
      } catch (error) {
        console.warn('Firebase Analytics error:', error)
      }
    }

    // Future: Add GA4, Clarity, Sentry here
    // this.sendToGA4(event, eventData)
    // this.sendToClarity(event, eventData) 
    // this.sendToSentry(event, eventData)
  }

  // Convenience methods for common events
  sessionStart(brainState?: string, accessibilityMode?: string) {
    this.track('session_start', {
      brain_state: brainState,
      accessibility_mode: accessibilityMode
    })
  }

  activityStart(activityType: string, appSection: string, difficulty?: string) {
    this.track('activity_start', {
      activity_type: activityType,
      app_section: appSection,
      difficulty
    })
  }

  struggle(context: { attempts?: number; activity?: string; difficulty?: string }) {
    this.track('struggle_moment', {
      attempts: context.attempts,
      activity_type: context.activity,
      difficulty: context.difficulty
    })
  }

  success(context: { duration?: number; activity?: string; difficulty?: string }) {
    this.track('success_moment', {
      duration: context.duration,
      activity_type: context.activity,
      difficulty: context.difficulty,
      success: true
    })
  }

  sessionEnd(totalDuration?: number) {
    this.track('session_end', {
      duration: totalDuration || (Date.now() - this.sessionStartTime)
    })
  }
}

// Export singleton instance
export const analytics = new MinimalAnalytics()

// Export types for components that need them
export type { AnalyticsEvent, EventData }