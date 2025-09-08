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

  // Get available voices with retry logic for mobile
  getVoices: (): SpeechSynthesisVoice[] => {
    if (!audio.isSpeechSynthesisSupported()) return []
    
    // Mobile fix: Force voices to load
    const voices = speechSynthesis.getVoices()
    if (voices.length === 0) {
      // Trigger voice loading on mobile
      speechSynthesis.speak(new SpeechSynthesisUtterance(''))
      speechSynthesis.cancel()
      return speechSynthesis.getVoices()
    }
    return voices
  },

  // Wait for voices to load (critical for mobile)
  waitForVoices: (): Promise<SpeechSynthesisVoice[]> => {
    return new Promise((resolve) => {
      const voices = audio.getVoices()
      if (voices.length > 0) {
        resolve(voices)
        return
      }
      
      // Wait for voices to load
      const onVoicesChanged = () => {
        const loadedVoices = audio.getVoices()
        if (loadedVoices.length > 0) {
          speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
          resolve(loadedVoices)
        }
      }
      
      speechSynthesis.addEventListener('voiceschanged', onVoicesChanged)
      
      // Fallback timeout
      setTimeout(() => {
        speechSynthesis.removeEventListener('voiceschanged', onVoicesChanged)
        resolve(audio.getVoices())
      }, 3000)
    })
  },

  // Hardcoded voice mapping with fallbacks
  getHardcodedVoice: (accent: TtsAccent): string[] => {
    const voiceMap = {
      'GB': [
        'Google UK English Female',
        'Microsoft Hazel - English (Great Britain)', 
        'Karen',
        'Daniel'
      ],
      'US': [
        'Google US English',
        'Microsoft Zira - English (United States)',
        'Alex',
        'Samantha'
      ],
      'IN': [
        'Microsoft Heera - English (India)',
        'Google हिन्दी',
        'Veena'
      ]
    }
    return voiceMap[accent] || voiceMap['GB']
  },

  // FIXED: Better voice selection with async loading
  getBestVoiceForAccent: async (accent: TtsAccent): Promise<SpeechSynthesisVoice | null> => {
    const voices = await audio.waitForVoices()
    const targetVoiceNames = audio.getHardcodedVoice(accent)
    
    // Try each target voice in order
    for (const voiceName of targetVoiceNames) {
      const voice = voices.find(v => v.name === voiceName)
      if (voice) {
        console.log(`✅ Found ${accent} voice: ${voice.name}`)
        return voice
      }
    }
    
    // Fallback based on language
    const langMap = { 'GB': 'en-GB', 'US': 'en-US', 'IN': 'en-IN' }
    const targetLang = langMap[accent]
    
    const langVoice = voices.find(v => v.lang === targetLang)
    if (langVoice) {
      console.log(`⚠️ Using fallback ${accent} voice: ${langVoice.name}`)
      return langVoice
    }
    
    // Final fallback to any English voice
    const englishVoice = voices.find(v => v.lang.startsWith('en'))
    console.log(`⚠️ Using English fallback: ${englishVoice?.name || 'default'}`)
    return englishVoice || null
  },

  // FIXED: Simplified speak function with proper accent handling
  speak: async (
    text: string, 
    options: {
      rate?: number
      pitch?: number
      volume?: number
      voice?: SpeechSynthesisVoice
      accent?: TtsAccent
    } = {}
  ): Promise<void> => {
    return new Promise(async (resolve, reject) => {
      if (!audio.isSpeechSynthesisSupported()) {
        reject(new Error('Speech synthesis not supported'))
        return
      }

      try {
        // Get saved accent if not provided
        const accent = options.accent || storage.get('tts-accent', 'GB') as TtsAccent
        console.log(`🎤 Speaking with accent: ${accent}`)
        
        // Get the correct voice for accent
        const voice = options.voice || await audio.getBestVoiceForAccent(accent)
        
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = options.rate ?? 0.8
        utterance.pitch = options.pitch ?? 0.9
        utterance.volume = options.volume ?? 0.8
        
        // Set voice and language
        if (voice) {
          utterance.voice = voice
          utterance.lang = voice.lang
          console.log(`🗣️ Using voice: ${voice.name} (${voice.lang})`)
        } else {
          // Fallback language setting
          const langMap = { 'GB': 'en-GB', 'US': 'en-US', 'IN': 'en-IN' }
          utterance.lang = langMap[accent] || 'en-GB'
          console.log(`⚠️ No voice found, using lang: ${utterance.lang}`)
        }

        utterance.onend = () => {
          console.log(`✅ TTS completed: "${text.substring(0, 50)}..."`)
          resolve()
        }
        
        utterance.onerror = (event) => {
          console.error('TTS error:', event)
          resolve() // Don't reject, just continue
        }

        // Cancel any existing speech
        speechSynthesis.cancel()
        
        // Small delay for mobile compatibility
        setTimeout(() => {
          speechSynthesis.speak(utterance)
        }, 100)
        
      } catch (error) {
        console.error('TTS setup error:', error)
        resolve()
      }
    })
  },

  // Simple stop function
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

