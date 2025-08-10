// Custom React hook for speech with word highlighting
// Save as src/hooks/useSpeechHighlighting.ts

import { useState, useRef, useCallback, useEffect } from 'react'
import { cn, audio, accessibility } from '@/lib/utils'

interface UseSpeechHighlightingOptions {
  rate?: number
  pitch?: number
  volume?: number
  highlightClass?: string
  pauseBetweenWords?: number
  onWordStart?: (word: string, index: number) => void
  onWordEnd?: (word: string, index: number) => void
  onSpeechStart?: () => void
  onSpeechEnd?: () => void
  onError?: (error: any) => void
}

interface UseSpeechHighlightingReturn {
  isReading: boolean
  currentWordIndex: number
  speak: (text: string, elementId: string) => Promise<void>
  stop: () => void
  pause: () => void
  resume: () => void
  setVoice: (voice: SpeechSynthesisVoice | null) => void
  availableVoices: SpeechSynthesisVoice[]
  isSupported: boolean
}

export const useSpeechHighlighting = (
  options: UseSpeechHighlightingOptions = {}
): UseSpeechHighlightingReturn => {
  const [isReading, setIsReading] = useState(false)
  const [currentWordIndex, setCurrentWordIndex] = useState(-1)
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([])
  const [selectedVoice, setSelectedVoice] = useState<SpeechSynthesisVoice | null>(null)
  
  const currentSpeechRef = useRef<any>(null)
  const originalContentRef = useRef<string>('')
  const currentElementRef = useRef<string>('')

  // Check if speech synthesis is supported - use audio instead of audioEnhanced
  const isSupported = audio.isSpeechSynthesisSupported()

  // Load available voices
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = () => {
      const voices = audio.getVoices()
      setAvailableVoices(voices)
      
      // Auto-select child-friendly voice if available
      const childVoices = audio.getChildVoices()
      if (childVoices.length > 0 && !selectedVoice) {
        setSelectedVoice(childVoices[0])
      } else if (voices.length > 0 && !selectedVoice) {
        setSelectedVoice(voices[0])
      }
    }

    loadVoices()
    
    // Handle voices loading asynchronously
    if (speechSynthesis.onvoiceschanged !== undefined) {
      speechSynthesis.onvoiceschanged = loadVoices
    }

    return () => {
      if (speechSynthesis.onvoiceschanged !== undefined) {
        speechSynthesis.onvoiceschanged = null
      }
    }
  }, [isSupported, selectedVoice])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stop()
    }
  }, [])

  // Helper function to highlight words during speech
  const highlightWord = (elementId: string, wordIndex: number, highlight: boolean) => {
    const element = document.getElementById(elementId)
    if (!element) return

    const words = element.textContent?.split(/\s+/) || []
    if (wordIndex >= words.length) return

    if (highlight) {
      // Split text into words and wrap the current word with highlight
      const beforeWords = words.slice(0, wordIndex).join(' ')
      const currentWord = words[wordIndex]
      const afterWords = words.slice(wordIndex + 1).join(' ')
      
      const highlightClass = options.highlightClass || 'bg-autism-secondary text-white px-1 py-0.5 rounded transition-all duration-300'
      
      element.innerHTML = [
        beforeWords,
        `<span class="${highlightClass}">${currentWord}</span>`,
        afterWords
      ].filter(Boolean).join(' ')
    } else {
      // Reset to original content
      element.textContent = words.join(' ')
    }
  }

  const speak = useCallback(async (text: string, elementId: string) => {
    if (!isSupported) {
      console.warn('Speech synthesis not supported')
      return
    }

    // Stop any current speech
    stop()

    setIsReading(true)
    setCurrentWordIndex(-1)
    currentElementRef.current = elementId

    // Store original content for reset
    const element = document.getElementById(elementId)
    if (element) {
      originalContentRef.current = element.textContent || ''
    }

    try {
      options.onSpeechStart?.()

      // Use the existing audio.speak method with highlighting simulation
      const words = text.split(/\s+/)
      let currentIndex = 0

      const speakWord = async (word: string, index: number): Promise<void> => {
        return new Promise((resolve, reject) => {
          setCurrentWordIndex(index)
          options.onWordStart?.(word, index)
          
          // Highlight current word
          highlightWord(elementId, index, true)

          // Create utterance for single word
          const utterance = new SpeechSynthesisUtterance(word)
          utterance.voice = selectedVoice
          utterance.rate = options.rate ?? 0.8
          utterance.pitch = options.pitch ?? 1.1
          utterance.volume = options.volume ?? 0.8

          utterance.onend = () => {
            // Remove highlight
            setTimeout(() => {
              highlightWord(elementId, index, false)
              options.onWordEnd?.(word, index)
              resolve()
            }, options.pauseBetweenWords ?? 200)
          }

          utterance.onerror = (event) => {
            reject(event.error)
          }

          speechSynthesis.speak(utterance)
        })
      }

      // Speak words sequentially with highlighting
      for (let i = 0; i < words.length; i++) {
        if (!isReading) break // Check if stopped
        await speakWord(words[i], i)
      }

      options.onSpeechEnd?.()
    } catch (error) {
      console.error('Speech error:', error)
      options.onError?.(error)
    } finally {
      // Reset content
      const element = document.getElementById(elementId)
      if (element && originalContentRef.current) {
        element.textContent = originalContentRef.current
      }
      
      setIsReading(false)
      setCurrentWordIndex(-1)
      currentSpeechRef.current = null
    }
  }, [isSupported, selectedVoice, options])

  const stop = useCallback(() => {
    audio.stop()
    
    // Reset element content
    const element = document.getElementById(currentElementRef.current)
    if (element && originalContentRef.current) {
      element.textContent = originalContentRef.current
    }
    
    setIsReading(false)
    setCurrentWordIndex(-1)
    currentSpeechRef.current = null
  }, [])

  const pause = useCallback(() => {
    if (isSupported && speechSynthesis.speaking) {
      speechSynthesis.pause()
    }
  }, [isSupported])

  const resume = useCallback(() => {
    if (isSupported && speechSynthesis.paused) {
      speechSynthesis.resume()
    }
  }, [isSupported])

  const setVoice = useCallback((voice: SpeechSynthesisVoice | null) => {
    setSelectedVoice(voice)
  }, [])

  return {
    isReading,
    currentWordIndex,
    speak,
    stop,
    pause,
    resume,
    setVoice,
    availableVoices,
    isSupported
  }
}

// Helper hook for brain state adaptive highlighting
export const useAdaptiveHighlighting = (brainState: string) => {
  const getHighlightClass = useCallback(() => {
    switch (brainState) {
      case 'energetic':
      case 'excited':
        return 'bg-adhd-accent text-black px-2 py-1 rounded-lg font-bold animate-pulse'
      case 'overwhelmed':
      case 'tired':
        return 'bg-autism-calm-mint text-autism-primary px-1 py-0.5 rounded transition-all duration-500'
      case 'focused':
      case 'curious':
        return 'bg-dyslexia-bg text-dyslexia-text px-1 py-0.5 rounded border-2 border-autism-secondary'
      default:
        return 'bg-autism-secondary text-white px-1 py-0.5 rounded transition-all duration-300 transform scale-110'
    }
  }, [brainState])

  const getSpeechRate = useCallback(() => {
    switch (brainState) {
      case 'energetic':
      case 'excited':
        return 0.9 // Slightly faster for energetic users
      case 'overwhelmed':
      case 'tired':
        return 0.6 // Much slower for calm reading
      case 'focused':
      case 'curious':
        return 0.8 // Standard rate
      default:
        return 0.8
    }
  }, [brainState])

  const getPauseBetweenWords = useCallback(() => {
    switch (brainState) {
      case 'energetic':
      case 'excited':
        return 150 // Shorter pauses
      case 'overwhelmed':
      case 'tired':
        return 300 // Longer pauses for processing
      case 'focused':
      case 'curious':
        return 200 // Standard pauses
      default:
        return 200
    }
  }, [brainState])

  return {
    highlightClass: getHighlightClass(),
    speechRate: getSpeechRate(),
    pauseBetweenWords: getPauseBetweenWords()
  }
}