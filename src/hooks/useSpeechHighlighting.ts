// src/hooks/useSpeechHighlighting.ts
// FIXED: Uses single utterance with boundary events for smooth TTS + highlighting

import { useState, useRef, useCallback, useEffect } from 'react'
import { audio, storage } from '@/lib/utils'
import type { TtsAccent } from '@/types'

interface UseSpeechHighlightingOptions {
  rate?: number
  pitch?: number
  volume?: number
  highlightClass?: string
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
  
  const currentUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null)
  const originalContentRef = useRef<string>('')
  const currentElementRef = useRef<string>('')
  const wordsRef = useRef<string[]>([])
  const prevWordIndexRef = useRef(-1)

  // Check if speech synthesis is supported
  const isSupported = audio.isSpeechSynthesisSupported()

  // Load available voices
  useEffect(() => {
    if (!isSupported) return

    const loadVoices = async () => {
      const voices = await audio.waitForVoices()
      setAvailableVoices(voices)
      
      // Get current accent preference and select appropriate voice
      const savedAccent = storage.get('tts-accent', 'GB') as TtsAccent
      const bestVoice = await audio.getBestVoiceForAccent(savedAccent)
      
      if (bestVoice && !selectedVoice) {
        setSelectedVoice(bestVoice)
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
  
    if (!originalContentRef.current && element.textContent) {
      originalContentRef.current = element.textContent
    }
    // Use the stored original words instead of parsing current content
    const words = wordsRef.current
    if (wordIndex >= words.length || wordIndex < 0) return
  
    if (highlight) {
      // Split text into words and wrap the current word with highlight
      const beforeWords = words.slice(0, wordIndex).join(' ')
      const currentWord = words[wordIndex]
      const afterWords = words.slice(wordIndex + 1).join(' ')
      
      const highlightClass = options.highlightClass || 'bg-autism-secondary text-white px-1 py-0.5 rounded transition-all duration-300 transform scale-105'
      
      element.innerHTML = [
        beforeWords,
        `<span class="${highlightClass}">${currentWord}</span>`,
        afterWords
      ].filter(Boolean).join(' ')
    } else {
      // Reset to original content
      element.textContent = originalContentRef.current
    }
  }

  // NEW: Convert character index to word index
  const getWordIndexFromCharIndex = (charIndex: number, text: string): number => {
    const textUpToChar = text.substring(0, charIndex)
    const wordsUpToChar = textUpToChar.trim().split(/\s+/)
    return Math.max(0, wordsUpToChar.length - 1)
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
  
    // Get current accent preference
    const savedAccent = storage.get('tts-accent', 'GB') as TtsAccent
  
    // Store original content and words for reset
    const element = document.getElementById(elementId)
    if (element) {
      originalContentRef.current = element.textContent || ''
    }
    wordsRef.current = text.split(/\s+/)
  
    return new Promise<void>(async (resolve, reject) => {
      try {
        options.onSpeechStart?.()
    
        // Get voice asynchronously for mobile compatibility
        const bestVoice = await audio.getBestVoiceForAccent(savedAccent)
        
        // Create single utterance for smooth speech
        const utterance = new SpeechSynthesisUtterance(text)
        utterance.rate = options.rate ?? 0.8
        utterance.pitch = options.pitch ?? 0.9
        utterance.volume = options.volume ?? 0.8
        
        // Set voice and language
        if (bestVoice?.name) {
          utterance.voice = bestVoice
          utterance.lang = bestVoice.lang
        } else {
          const langMap = { 'GB': 'en-GB', 'US': 'en-US', 'IN': 'en-IN' }
          utterance.lang = langMap[savedAccent] || 'en-GB'
        }

        // CORE FIX: Use boundary events to track word positions
        utterance.onboundary = (event) => {
          if (event.name === 'word') {
            const wordIndex = getWordIndexFromCharIndex(event.charIndex || 0, text)
            
            // Clear previous highlight using ref
            if (prevWordIndexRef.current !== -1) {
              highlightWord(elementId, prevWordIndexRef.current, false)
              options.onWordEnd?.(wordsRef.current[prevWordIndexRef.current], prevWordIndexRef.current)
            }
            
            // Set new word highlight
            setCurrentWordIndex(wordIndex)
            prevWordIndexRef.current = wordIndex
            highlightWord(elementId, wordIndex, true)
            options.onWordStart?.(wordsRef.current[wordIndex], wordIndex)
          }
        }

        utterance.onend = () => {
          // Clear final highlight
          if (currentWordIndex !== -1) {
            highlightWord(elementId, currentWordIndex, false)
            options.onWordEnd?.(wordsRef.current[currentWordIndex], currentWordIndex)
          }
          
          // Reset content
          const element = document.getElementById(elementId)
          if (element && originalContentRef.current) {
            element.textContent = originalContentRef.current
          }
          
          // Reset state - don't call setIsReading, it's handled in the finally block
          setCurrentWordIndex(-1)
          currentUtteranceRef.current = null
          options.onSpeechEnd?.()
          setIsReading(false)
          resolve()
        }
        
        utterance.onerror = (event) => {
          console.error('TTS error:', event)
          
          // Reset on error
          const element = document.getElementById(elementId)
          if (element && originalContentRef.current) {
            element.textContent = originalContentRef.current
          }
          
          // Reset state - don't call setIsReading, it's handled in the catch block
          setCurrentWordIndex(-1)
          currentUtteranceRef.current = null
          options.onError?.(event)
          setIsReading(false)
          resolve() // Don't reject, just continue
        }

        // Store utterance reference
        currentUtteranceRef.current = utterance

        // Cancel any existing speech and start new one
        speechSynthesis.cancel()
        
        // Small delay for mobile compatibility
        setTimeout(() => {
          speechSynthesis.speak(utterance)
        }, 100)
        
      } catch (error) {
        console.error('Speech error:', error)
        
        // Reset content on error
        const element = document.getElementById(elementId)
        if (element && originalContentRef.current) {
          element.textContent = originalContentRef.current
        }
        
        setCurrentWordIndex(-1)
        currentUtteranceRef.current = null
        options.onError?.(error)
        resolve()
      } finally {
        
      }
    })
  }, [isSupported, options, currentWordIndex])

  const stop = useCallback(() => {
    speechSynthesis.cancel()
    
    // Reset element content
    const element = document.getElementById(currentElementRef.current)
    if (element && originalContentRef.current) {
      element.textContent = originalContentRef.current
    }
    
    setIsReading(false)
    setCurrentWordIndex(-1)
    currentUtteranceRef.current = null
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

// Keep the existing adaptive highlighting helper
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
        return 0.75
      case 'overwhelmed':
      case 'tired':
        return 0.5
      case 'focused':
      case 'curious':
        return 0.65
      default:
        return 0.65
    }
  }, [brainState])

  return {
    highlightClass: getHighlightClass(),
    speechRate: getSpeechRate()
  }
}