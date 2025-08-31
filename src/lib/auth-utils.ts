// src/lib/auth-utils.ts
import { auth } from '@/lib/firebase-config'
import { useAuthState } from 'react-firebase-hooks/auth'

// Hook version - use this in components
export const useCurrentUserId = (): string | null => {
  const [user] = useAuthState(auth)
  return user?.uid || null
}

// Direct function version - use this outside components
export const getCurrentUserId = (): string | null => {
  return auth.currentUser?.uid || null
}