// functions/src/firebase-admin.ts
import * as admin from 'firebase-admin'

// Initialize Firebase Admin (only once)
if (!admin.apps.length) {
  admin.initializeApp()
}

export const db = admin.firestore()
export const auth = admin.auth()
export { admin }