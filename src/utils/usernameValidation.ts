// src/utils/usernameValidation.ts
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../lib/firebase-config'

export const checkUsernameExists = async (username: string): Promise<boolean> => {
  try {
    const normalizedUsername = username.trim().toLowerCase()
    
    const q = query(
      collection(db, 'children'),
      where('username', '==', normalizedUsername)
    )
    
    const snapshot = await getDocs(q)
    return !snapshot.empty // true = exists (taken), false = available
  } catch (error) {
    console.error('Username check failed:', error)
    return true // Fail safe - assume taken if error
  }
}