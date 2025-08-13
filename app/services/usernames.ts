import {
  collection,
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  writeBatch
} from 'firebase/firestore';
import { db } from './firebase';
import {
  UsernameValidationError,
  UsernameAvailability,
  UsernameClaimResult,
  UsernameData
} from '../types/username';

// Reserved usernames that cannot be claimed
const RESERVED_USERNAMES = [
  'admin', 'support', 'help', 'moderator', 'system', 'anon', 
  'me', 'you', 'null', 'root', 'owner'
];

// Validation regex: letters, numbers, underscores, 3-20 chars, no leading underscore
const USERNAME_REGEX = /^[a-zA-Z0-9][a-zA-Z0-9_]{2,19}$/;

/**
 * Normalizes a username input into ID and display parts
 * @param input - Raw username input (may include @)
 * @returns Object with lowercase ID and display-preserving display name
 */
export const normalizeHandle = (input: string): { id: string; display: string } => {
  // Remove leading @ and trim
  const trimmed = input.trim().replace(/^@+/, '');
  
  // ID is lowercase for uniqueness
  const id = trimmed.toLowerCase();
  
  // Display preserves original case (after trim)
  const display = trimmed;
  
  return { id, display };
};

/**
 * Validates a username input
 * @param input - Raw username input
 * @returns Validation result
 */
export const validateHandle = (input: string): { ok: true } | { ok: false; reason: UsernameValidationError } => {
  if (!input || input.trim().length === 0) {
    return { ok: false, reason: 'empty' };
  }

  const { id } = normalizeHandle(input);
  
  // Check length
  if (id.length < 3) {
    return { ok: false, reason: 'too_short' };
  }
  
  if (id.length > 20) {
    return { ok: false, reason: 'too_long' };
  }
  
  // Check regex (includes no leading underscore check)
  if (!USERNAME_REGEX.test(id)) {
    return { ok: false, reason: 'invalid_chars' };
  }
  
  // Check reserved names
  if (RESERVED_USERNAMES.includes(id)) {
    return { ok: false, reason: 'reserved_name' };
  }
  
  return { ok: true };
};

/**
 * Checks if a username is available
 * @param handleInput - Raw username input
 * @returns Availability status
 */
export const checkUsernameAvailable = async (handleInput: string): Promise<UsernameAvailability> => {
  try {
    // Validate first
    const validation = validateHandle(handleInput);
    if (!validation.ok) {
      return { available: false, reason: 'reserved' };
    }
    
    const { id } = normalizeHandle(handleInput);
    
    // Check if reserved
    if (RESERVED_USERNAMES.includes(id)) {
      return { available: false, reason: 'reserved' };
    }
    
    // Check if already exists
    const usernameDoc = await getDoc(doc(db, 'usernames', id));
    
    if (usernameDoc.exists()) {
      return { available: false, reason: 'taken' };
    }
    
    return { available: true };
  } catch (error) {
    if (__DEV__) console.error('Error checking username availability:', error);
    return { available: false, reason: 'taken' };
  }
};

/**
 * Claims a username for a user
 * @param handleInput - Raw username input
 * @param uid - User's Firebase UID
 * @returns Claim result
 */
export const claimUsername = async (handleInput: string, uid: string): Promise<UsernameClaimResult> => {
  try {
    // Validate input
    const validation = validateHandle(handleInput);
    if (!validation.ok) {
      return { success: false, reason: 'invalid' };
    }
    
    const { id, display } = normalizeHandle(handleInput);
    
    // Check if reserved
    if (RESERVED_USERNAMES.includes(id)) {
      return { success: false, reason: 'reserved' };
    }
    
    // Use transaction for atomic claim
    const result = await runTransaction(db, async (transaction) => {
      // Check if username already exists
      const usernameRef = doc(db, 'usernames', id);
      const usernameDoc = await transaction.get(usernameRef);
      
      if (usernameDoc.exists()) {
        throw new Error('ALREADY_EXISTS');
      }
      
      // Create username document
      const usernameData: UsernameData = {
        uid,
        display,
        createdAt: serverTimestamp()
      };
      
      transaction.set(usernameRef, usernameData);
      
      // Update user document
      const userRef = doc(db, 'users', uid);
      transaction.set(userRef, {
        username: `@${display}`,
        username_lc: id
      }, { merge: true });
      
      return { username: `@${display}`, display };
    });
    
    return { success: true, ...result };
  } catch (error) {
    if (__DEV__) console.error('Error claiming username:', error);
    
    if (error instanceof Error && error.message === 'ALREADY_EXISTS') {
      return { success: false, reason: 'taken' };
    }
    
    return { success: false, reason: 'network_error' };
  }
};

/**
 * Suggests a random username based on UID
 * @param uid - User's Firebase UID
 * @returns Suggested username
 */
export const suggestRandomHandle = (uid: string): string => {
  const prefix = 'anon';
  const uidPart = uid.slice(0, 4);
  const randomPart = Math.floor(Math.random() * 900) + 100; // 3 digits
  return `${prefix}_${uidPart}${randomPart}`;
};

/**
 * Gets user profile data
 * @param uid - User's Firebase UID
 * @returns User profile or null if not found
 */
export const getUserProfile = async (uid: string) => {
  try {
    const userDoc = await getDoc(doc(db, 'users', uid));
    if (userDoc.exists()) {
      return userDoc.data();
    }
    return null;
  } catch (error) {
    if (__DEV__) console.error('Error getting user profile:', error);
    return null;
  }
};
