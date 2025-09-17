import { useEffect, useCallback } from 'react'
import { useMoodDetection } from './useMoodDetection'

export const useGlobalBehaviorDetection = () => {
  const { trackClick } = useMoodDetection()

  // Track ALL clicks anywhere on the page
  const handleGlobalClick = useCallback((event: MouseEvent) => {
    console.log('🌍 GLOBAL CLICK detected on:', event.target)
    trackClick('global_page_click')
  }, [trackClick])

  useEffect(() => {
    // Add global event listener to document
    document.addEventListener('click', handleGlobalClick, true) // true = capture phase
    
    return () => {
      document.removeEventListener('click', handleGlobalClick, true)
    }
  }, [handleGlobalClick])

  return {}
}