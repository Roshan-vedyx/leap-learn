import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Accessibility utility functions for neurodivergent users
export const accessibility = {
  // Check if user prefers reduced motion
  prefersReducedMotion: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-reduced-motion: reduce)').matches
  },

  // Check if user prefers high contrast
  prefersHighContrast: (): boolean => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(prefers-contrast: high)').matches
  },

  // Get user's preferred color scheme
  getColorScheme: (): 'light' | 'dark' | 'no-preference' => {
    if (typeof window === 'undefined') return 'no-preference'
    
    if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
      return 'dark'
    }
    if (window.matchMedia('(prefers-color-scheme: light)').matches) {
      return 'light'
    }
    return 'no-preference'
  },

  // Generate accessible focus styles
  getFocusRing: (color: string = 'ring-ring'): string => {
    return `focus-visible:outline-none focus-visible:ring-2 focus-visible:${color} focus-visible:ring-offset-2`
  },

  // Generate minimum touch target size
  getTouchTarget: (size: 'small' | 'default' | 'large' = 'default'): string => {
    const sizes = {
      small: 'min-h-[44px] min-w-[44px]',
      default: 'min-h-[48px] min-w-[48px]',
      large: 'min-h-[56px] min-w-[56px]'
    }
    return sizes[size]
  }
}

// Enhanced Audio utilities for Web Speech API with TTS support

export const audio = {
  // Check if speech synthesis is supported
  isSpeechSynthesisSupported: (): boolean => {
    return typeof window !== 'undefined' && 'speechSynthesis' in window
  },

  // Get available voices
  getVoices: (): SpeechSynthesisVoice[] => {
    if (!audio.isSpeechSynthesisSupported()) return []
    return speechSynthesis.getVoices()
  },

  // Original working getChildVoices
  getChildVoices: (): SpeechSynthesisVoice[] => {
    const voices = audio.getVoices()
    return voices.filter(voice => 
      voice.name.toLowerCase().includes('child') ||
      voice.name.toLowerCase().includes('kid') ||
      voice.name.toLowerCase().includes('young') ||
      voice.name.toLowerCase().includes('female') ||
      (voice.name.toLowerCase().includes('female') && voice.lang.startsWith('en'))
    )
  },

  // FIXED: Actually filter voices by accent
  getVoicesForAccent: (accent: 'US' | 'GB' | 'IN'): SpeechSynthesisVoice[] => {
    const allVoices = audio.getVoices()
    
    // Get all English voices first
    const englishVoices = allVoices.filter(voice => 
      voice.lang.toLowerCase().startsWith('en')
    )
    
    // Define clearer language patterns for each accent
    let accentVoices: SpeechSynthesisVoice[] = []
    
    if (accent === 'US') {
      accentVoices = englishVoices.filter(voice => {
        const lang = voice.lang.toLowerCase()
        const name = voice.name.toLowerCase()
        return lang.includes('en-us') || 
               lang.includes('en_us') ||
               name.includes('us ') ||
               name.includes('american') ||
               (!lang.includes('gb') && !lang.includes('uk') && !lang.includes('in') && lang.startsWith('en'))
      })
    } else if (accent === 'GB') {
      accentVoices = englishVoices.filter(voice => {
        const lang = voice.lang.toLowerCase()
        const name = voice.name.toLowerCase()
        return lang.includes('en-gb') || 
               lang.includes('en-uk') ||
               lang.includes('en_gb') ||
               name.includes('uk ') ||
               name.includes('british') ||
               name.includes('daniel') ||
               name.includes('kate')
      })
    } else if (accent === 'IN') {
      accentVoices = englishVoices.filter(voice => {
        const lang = voice.lang.toLowerCase()
        const name = voice.name.toLowerCase()
        return lang.includes('en-in') || 
               lang.includes('hi-in') ||
               lang.includes('en_in') ||
               name.includes('indian') ||
               name.includes('rishi')
      })
    }
    
    // If we found accent-specific voices, return them
    // Otherwise return all English voices as fallback
    return accentVoices.length > 0 ? accentVoices : englishVoices
  },

  // Get the best voice for accent with your original quality preferences
  getBestVoiceForAccent: (accent: 'US' | 'GB' | 'IN'): SpeechSynthesisVoice | null => {
    const accentVoices = audio.getVoicesForAccent(accent)
    
    if (accentVoices.length === 0) return null
    
    // Apply your original child-friendly filtering to the accent voices
    const friendlyVoices = accentVoices.filter(voice => {
      const name = voice.name.toLowerCase()
      return name.includes('female') ||
             name.includes('child') ||
             name.includes('kid') ||
             name.includes('young') ||
             name.includes('natural') ||
             name.includes('premium') ||
             name.includes('enhanced')
    })
    
    // If we found friendly voices in this accent, use the first one
    if (friendlyVoices.length > 0) {
      return friendlyVoices[0]
    }
    
    // Otherwise, use the first voice from this accent
    return accentVoices[0]
  },

  // Updated speak function that ACTUALLY uses the accent
  speak: async (
    text: string, 
    options: {
      rate?: number
      pitch?: number
      volume?: number
      voice?: SpeechSynthesisVoice
      lang?: string
      accent?: 'US' | 'GB' | 'IN'
    } = {}
  ): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audio.isSpeechSynthesisSupported()) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      
      // Your original working settings
      utterance.rate = options.rate ?? 0.8
      utterance.pitch = options.pitch ?? 1
      utterance.volume = options.volume ?? 0.8
      utterance.lang = options.lang ?? 'en-US'
      
      // FIXED: Actually use the accent to select voice
      if (options.voice) {
        utterance.voice = options.voice
      } else if (options.accent) {
        const accentVoice = audio.getBestVoiceForAccent(options.accent)
        if (accentVoice) {
          utterance.voice = accentVoice
          console.log(`🎤 Using ${options.accent} voice: ${accentVoice.name}`)
        } else {
          console.log(`⚠️ No ${options.accent} voice found, using default`)
        }
      } else {
        // Fallback to your original method
        const childVoices = audio.getChildVoices()
        if (childVoices.length > 0) {
          utterance.voice = childVoices[0]
        }
      }

      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(event.error)

      speechSynthesis.speak(utterance)
    })
  },

  // Original speakSimple
  speakSimple: async (text: string, options: any = {}): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!audio.isSpeechSynthesisSupported()) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      const utterance = new SpeechSynthesisUtterance(text)
      Object.assign(utterance, options)
      utterance.onend = () => resolve()
      utterance.onerror = (event) => reject(event)
      speechSynthesis.speak(utterance)
    })
  },

  // Original stop
  stop: (): void => {
    if (audio.isSpeechSynthesisSupported()) {
      speechSynthesis.cancel()
    }
  }
}

// Local storage utilities with error handling
export const storage = {
  // Get item from localStorage with fallback
  get: <T>(key: string, fallback: T): T => {
    try {
      if (typeof window === 'undefined') return fallback
      const item = localStorage.getItem(key)
      return item ? JSON.parse(item) : fallback
    } catch {
      return fallback
    }
  },

  // Set item in localStorage
  set: <T>(key: string, value: T): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.setItem(key, JSON.stringify(value))
      return true
    } catch {
      return false
    }
  },

  // Remove item from localStorage
  remove: (key: string): boolean => {
    try {
      if (typeof window === 'undefined') return false
      localStorage.removeItem(key)
      return true
    } catch {
      return false
    }
  }
}

// User preference utilities
export const preferences = {
  // Get accessibility mode preference
  getAccessibilityMode: (): 'default' | 'adhd' | 'dyslexia' | 'autism' => {
    return storage.get('accessibility-mode', 'default')
  },

  // Set accessibility mode preference
  setAccessibilityMode: (mode: 'default' | 'adhd' | 'dyslexia' | 'autism'): void => {
    storage.set('accessibility-mode', mode)
    
    // Apply mode to document
    const body = document.body
    body.classList.remove('adhd-mode', 'dyslexia-mode', 'autism-mode')
    
    if (mode !== 'default') {
      body.classList.add(`${mode}-mode`)
    }
  },

  // Get font size preference
  getFontSize: (): 'default' | 'large' | 'extra-large' => {
    return storage.get('font-size', 'default')
  },

  // Set font size preference
  setFontSize: (size: 'default' | 'large' | 'extra-large'): void => {
    storage.set('font-size', size)
    
    const root = document.documentElement
    root.classList.remove('font-large', 'font-extra-large')
    
    if (size !== 'default') {
      root.classList.add(`font-${size}`)
    }
  },

  // Get audio preferences
  getAudioPreferences: () => {
    return storage.get('audio-preferences', {
      enabled: true,
      rate: 0.8,
      pitch: 1,
      volume: 0.8,
      voiceName: ''
    })
  },

  // Set audio preferences
  setAudioPreferences: (prefs: {
    enabled?: boolean
    rate?: number
    pitch?: number
    volume?: number
    voiceName?: string
  }): void => {
    const current = preferences.getAudioPreferences()
    storage.set('audio-preferences', { ...current, ...prefs })
  }
}

// Validation utilities
export const validation = {
  // Check if string is not empty
  isNotEmpty: (value: string): boolean => {
    return value.trim().length > 0
  },

  // Check if email is valid (basic)
  isValidEmail: (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  },

  // Check if password meets basic requirements
  isValidPassword: (password: string): boolean => {
    return password.length >= 8
  }
}

// Emotion regulation utilities
export const emotion = {
  // Breathing exercise timer
  breathingExercise: (
    pattern: '4-7-8' | '4-4-4' | 'box',
    onInhale: () => void,
    onHold: () => void,
    onExhale: () => void,
    onComplete: () => void
  ): { start: () => void, stop: () => void } => {
    let timeouts: NodeJS.Timeout[] = []
    
    const patterns = {
      '4-7-8': { inhale: 4000, hold: 7000, exhale: 8000 },
      '4-4-4': { inhale: 4000, hold: 4000, exhale: 4000 },
      'box': { inhale: 4000, hold: 4000, exhale: 4000, pause: 4000 }
    }
    
    const selected = patterns[pattern]
    
    const start = () => {
      // Inhale
      onInhale()
      timeouts.push(setTimeout(() => {
        // Hold
        onHold()
        timeouts.push(setTimeout(() => {
          // Exhale
          onExhale()
          timeouts.push(setTimeout(() => {
            onComplete()
          }, selected.exhale))
        }, selected.hold))
      }, selected.inhale))
    }
    
    const stop = () => {
      timeouts.forEach(clearTimeout)
      timeouts = []
    }
    
    return { start, stop }
  },

  // Get calming colors based on mood
  getCalmingColors: (mood: 'anxious' | 'hyperactive' | 'sad' | 'angry' | 'neutral') => {
    const colors = {
      anxious: ['bg-autism-calm-mint', 'text-autism-primary'],
      hyperactive: ['bg-autism-calm-sage', 'text-autism-primary'],
      sad: ['bg-autism-calm-sky', 'text-autism-primary'],
      angry: ['bg-autism-calm-lavender', 'text-autism-primary'],
      neutral: ['bg-autism-neutral', 'text-autism-primary']
    }
    return colors[mood]
  }
}

// Format utilities
export const format = {
  // Format time for display
  time: (seconds: number): string => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
  },

  // Format percentage
  percentage: (value: number, total: number): string => {
    return `${Math.round((value / total) * 100)}%`
  },

  // Truncate text with ellipsis
  truncate: (text: string, maxLength: number): string => {
    if (text.length <= maxLength) return text
    return text.slice(0, maxLength - 3) + '...'
  }
}