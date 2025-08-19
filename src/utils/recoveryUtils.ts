// src/utils/recoveryUtils.ts - NEW FILE
import { doc, updateDoc, getDoc } from 'firebase/firestore'
import { sendPasswordResetEmail } from 'firebase/auth'
import { db, auth } from '../config/firebase'
import bcrypt from 'bcryptjs'
import type { ChildProfile, RecoveryAttempts } from '../types/auth'

export class RecoveryManager {
  private static readonly COOLDOWN_MINUTES = 5
  private static readonly MAX_SESSION_ATTEMPTS = 3
  private static readonly MAX_FAILED_SESSIONS = 3

  /**
   * Check if child is in cooldown period
   */
  static isInCooldown(recovery: RecoveryAttempts): boolean {
    if (!recovery.isInCooldown || !recovery.lastCooldownStart) {
      return false
    }

    const cooldownMs = this.COOLDOWN_MINUTES * 60 * 1000
    const timeSinceCooldown = Date.now() - recovery.lastCooldownStart.getTime()
    
    return timeSinceCooldown < cooldownMs
  }

  /**
   * Get remaining cooldown time in seconds
   */
  static getCooldownRemaining(recovery: RecoveryAttempts): number {
    if (!this.isInCooldown(recovery)) return 0

    const cooldownMs = this.COOLDOWN_MINUTES * 60 * 1000
    const timeSinceCooldown = Date.now() - recovery.lastCooldownStart!.getTime()
    const remainingMs = cooldownMs - timeSinceCooldown

    return Math.ceil(remainingMs / 1000)
  }

  /**
   * Reset PIN for a child (used after successful recovery)
   */
  static async resetChildPin(childId: string, newPin: string): Promise<void> {
    const hashedPin = await bcrypt.hash(newPin, 10)
    
    // Reset recovery attempts when PIN is successfully reset
    const resetRecovery: RecoveryAttempts = {
      sessionAttempts: 0,
      lastSessionAttempt: new Date(),
      totalSessions: 0,
      isInCooldown: false,
      requiresParentReset: false
    }

    await updateDoc(doc(db, 'children', childId), {
      pinHash: hashedPin,
      recoveryAttempts: resetRecovery,
      lastActive: new Date()
    })
  }

  /**
   * Record a failed recovery attempt
   */
  static async recordFailedAttempt(childId: string): Promise<{
    shouldCooldown: boolean
    requiresParentReset: boolean
    newRecovery: RecoveryAttempts
  }> {
    const childDoc = await getDoc(doc(db, 'children', childId))
    if (!childDoc.exists()) {
      throw new Error('Child not found')
    }

    const child = childDoc.data() as ChildProfile
    const recovery = child.recoveryAttempts
    
    const newSessionAttempts = recovery.sessionAttempts + 1
    const shouldCooldown = newSessionAttempts >= this.MAX_SESSION_ATTEMPTS
    const newTotalSessions = recovery.totalSessions + (shouldCooldown ? 1 : 0)
    const requiresParentReset = newTotalSessions >= this.MAX_FAILED_SESSIONS

    const newRecovery: RecoveryAttempts = {
      sessionAttempts: shouldCooldown ? 0 : newSessionAttempts,
      lastSessionAttempt: new Date(),
      totalSessions: newTotalSessions,
      isInCooldown: shouldCooldown,
      lastCooldownStart: shouldCooldown ? new Date() : recovery.lastCooldownStart,
      requiresParentReset
    }

    await updateDoc(doc(db, 'children', childId), {
      recoveryAttempts: newRecovery
    })

    return { shouldCooldown, requiresParentReset, newRecovery }
  }

  /**
   * Send parent notification for PIN reset request
   */
  static async notifyParentForReset(childId: string): Promise<void> {
    const childDoc = await getDoc(doc(db, 'children', childId))
    if (!childDoc.exists()) {
      throw new Error('Child not found')
    }

    const child = childDoc.data() as ChildProfile
    
    // Get parent email
    const parentDoc = await getDoc(doc(db, 'parents', child.parentId))
    if (!parentDoc.exists()) {
      throw new Error('Parent not found')
    }

    const parent = parentDoc.data()
    
    // In a real implementation, you would send an email here
    // For now, we'll log it and could implement with Firebase Functions
    console.log('Parent notification needed:', {
      parentEmail: parent.email,
      childUsername: child.username,
      reason: 'PIN recovery assistance required'
    })

    // You could implement actual email sending with Firebase Functions:
    /*
    await fetch('/api/notify-parent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        parentEmail: parent.email,
        childUsername: child.username,
        childId,
        type: 'pin_reset_request'
      })
    })
    */
  }

  /**
   * Reset recovery state (admin/parent function)
   */
  static async resetRecoveryState(childId: string): Promise<void> {
    const resetRecovery: RecoveryAttempts = {
      sessionAttempts: 0,
      lastSessionAttempt: new Date(),
      totalSessions: 0,
      isInCooldown: false,
      requiresParentReset: false
    }

    await updateDoc(doc(db, 'children', childId), {
      recoveryAttempts: resetRecovery
    })
  }

  /**
   * Validate security question answer
   */
  static async validateSecurityAnswer(
    hashedAnswer: string, 
    userAnswer: string
  ): Promise<boolean> {
    try {
      const normalizedAnswer = userAnswer.toLowerCase().trim()
      return await bcrypt.compare(normalizedAnswer, hashedAnswer)
    } catch (err) {
      console.error('Error validating security answer:', err)
      return false
    }
  }

  /**
   * Send password reset email for parents
   */
  static async sendParentPasswordReset(email: string): Promise<void> {
    try {
      await sendPasswordResetEmail(auth, email)
    } catch (error: any) {
      console.error('Password reset error:', error)
      throw new Error(error.message || 'Failed to send password reset email')
    }
  }
}

/**
 * Format time remaining for display
 */
export const formatTimeRemaining = (seconds: number): string => {
  const minutes = Math.floor(seconds / 60)
  const remainingSeconds = seconds % 60
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
}

/**
 * Get friendly error messages for recovery
 */
export const getRecoveryErrorMessage = (error: string): string => {
  const errorMessages: Record<string, string> = {
    'child-not-found': 'We couldn\'t find that username. Please check your spelling.',
    'no-security-questions': 'No recovery questions were set up for this account. Please ask a grown-up for help.',
    'cooldown-active': 'Please wait a little while before trying again. You\'re doing great!',
    'parent-reset-required': 'We need a grown-up to help reset your PIN. Don\'t worry, this happens sometimes!',
    'network-error': 'Something went wrong with the internet. Please try again.',
    'validation-failed': 'That answer doesn\'t match what we have. Try thinking about it again!'
  }

  return errorMessages[error] || 'Something unexpected happened. Please try again or ask for help.'
}

/**
 * Generate child-friendly success messages
 */
export const getSuccessMessage = (context: 'recovery' | 'reset' | 'login'): string => {
  const messages = {
    recovery: 'Great job! 🌟 You can now create a new PIN.',
    reset: 'Your new PIN is ready! 🎉 Try logging in now.',
    login: 'Welcome back! Ready to learn something awesome? 🚀'
  }

  return messages[context]
}