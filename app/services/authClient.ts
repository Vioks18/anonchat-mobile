import {
  createUserWithEmailAndPassword,
  User as FirebaseUser,
  sendPasswordResetEmail,
  signInWithEmailAndPassword
} from 'firebase/auth';
import { doc, getDoc, serverTimestamp, setDoc } from 'firebase/firestore';
import { AuthUser, LoginData, SignUpData } from '../types/auth';
import { auth, db } from './firebase';

const USERS_COLLECTION = 'users';
const USERNAMES_COLLECTION = 'usernames';

// Normalize username: trim, lowercase, remove @ prefix, collapse spaces/underscores
function normalizeUsername(username: string): string {
  return username
    .trim()
    .toLowerCase()
    .replace(/^@/, '') // Remove @ prefix if present
    .replace(/[^a-z0-9_]/g, '') // Remove invalid characters
    .replace(/[_]+/g, '_') // Collapse multiple underscores
    .replace(/^_+|_+$/g, ''); // Remove leading/trailing underscores
}

// Format username for display (add @)
export function formatUsernameForDisplay(username: string): string {
  if (!username) return '';
  return username.startsWith('@') ? username : `@${username}`;
}

// Validate username format and reserved words
function validateUsername(username: string): { isValid: boolean; error?: string } {
  if (username.length < 3) {
    return { isValid: false, error: 'Username должен содержать минимум 3 символа' };
  }
  
  if (username.length > 20) {
    return { isValid: false, error: 'Username должен содержать максимум 20 символов' };
  }
  
  if (!/^[a-z0-9_]{3,20}$/.test(username)) {
    return { isValid: false, error: 'Username может содержать только буквы, цифры и подчеркивания' };
  }
  
  const RESERVED_WORDS = new Set([
    'admin', 'support', 'system', 'api', 'null', 'me', 'you', 'test', 'demo',
    'info', 'help', 'contact', 'about', 'terms', 'privacy', 'settings',
    'login', 'logout', 'register', 'signup', 'signin', 'auth', 'user',
    'anonymous', 'guest', 'bot', 'robot', 'auto', 'service', 'official'
  ]);
  
  if (RESERVED_WORDS.has(username)) {
    return { isValid: false, error: 'Этот username зарезервирован и не может быть использован' };
  }
  
  return { isValid: true };
}

// Check if username is available (read-only check)
export async function isUsernameAvailable(username: string): Promise<boolean> {
  const normalized = normalizeUsername(username);
  
  if (__DEV__) {
    console.log('🔍 Username availability check:', {
      original: username,
      normalized: normalized
    });
  }
  
  // Validate username format
  const validation = validateUsername(normalized);
  if (!validation.isValid) {
    if (__DEV__) {
      console.log('❌ Username validation failed:', validation.error);
    }
    return false;
  }
  
  try {
    const usernameRef = doc(db, USERNAMES_COLLECTION, normalized);
    const docSnap = await getDoc(usernameRef);
    const exists = docSnap.exists();
    
    if (__DEV__) {
      console.log('🔍 Username exists in database:', exists);
    }
    
    return !exists;
  } catch (error) {
    console.error('Error checking username availability:', error);
    return false;
  }
}

// Main registration function - simplified without transactions
export async function signUpWithEmail(data: SignUpData): Promise<AuthUser> {
  const { email, password, username } = data;
  
  // Normalize and validate username
  const normalizedUsername = normalizeUsername(username);
  const validation = validateUsername(normalizedUsername);
  
  if (!validation.isValid) {
    throw new Error(validation.error!);
  }
  
  // Check username availability first
  const isAvailable = await isUsernameAvailable(username);
  if (!isAvailable) {
    throw new Error('Этот username уже занят');
  }
  
  // Create Firebase Auth user
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  try {
    if (__DEV__) console.log('🔐 Auth user created:', firebaseUser.uid);
    
    // Create username document first
    const usernameRef = doc(db, USERNAMES_COLLECTION, normalizedUsername);
    await setDoc(usernameRef, {
      uid: firebaseUser.uid,
      createdAt: serverTimestamp()
    });
    
    if (__DEV__) console.log('✅ Username document created:', normalizedUsername);
    
    // Create user document
    const userRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
    await setDoc(userRef, {
      uid: firebaseUser.uid,
      email: email,
      username: normalizedUsername,
      createdAt: serverTimestamp(),
      avatarURL: null
    });
    
    if (__DEV__) console.log('✅ User document created:', firebaseUser.uid);
    
    // Return user data
    const userData: AuthUser = {
      uid: firebaseUser.uid,
      email: firebaseUser.email!,
      username: normalizedUsername,
      createdAt: new Date(),
      avatarURL: null
    };
    
    return userData;
  } catch (error) {
    if (__DEV__) console.error('❌ Error during registration:', error);
    
    // If anything fails, delete the Firebase Auth user
    await firebaseUser.delete();
    
    // Check if it's a username collision error
    if (error instanceof Error && error.message.includes('already exists')) {
      throw new Error('Этот username уже занят');
    }
    
    throw new Error(error instanceof Error ? error.message : 'Ошибка при создании аккаунта');
  }
}

// Sign in function - load user data from Firestore
export async function signInWithEmail(data: LoginData): Promise<AuthUser> {
  const { email, password } = data;
  
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const firebaseUser = userCredential.user;
  
  if (__DEV__) console.log('🔐 User signed in:', firebaseUser.uid);
  
  // Get user data from Firestore
  const userRef = doc(db, USERS_COLLECTION, firebaseUser.uid);
  const userDoc = await getDoc(userRef);
  
  if (!userDoc.exists()) {
    if (__DEV__) console.error('❌ User profile not found in Firestore:', firebaseUser.uid);
    throw new Error('Профиль пользователя не найден. Попробуйте зарегистрироваться заново.');
  }
  
  const userData = userDoc.data();
  
  if (__DEV__) console.log('✅ User profile loaded:', userData);
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    username: userData.username,
    displayName: userData.displayName,
    avatarColorIndex: userData.avatarColorIndex,
    createdAt: userData.createdAt?.toDate(),
    avatarURL: userData.avatarURL
  };
}

// Send password reset email
export async function sendResetEmail(email: string): Promise<void> {
  await sendPasswordResetEmail(auth, email);
}

// Get user profile from Firestore
export async function getUserProfile(uid: string): Promise<AuthUser | null> {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (!userDoc.exists()) {
      return null;
    }
    
    const userData = userDoc.data();
    
    return {
      uid: userData.uid,
      email: userData.email,
      username: userData.username, // Stored without @
      displayName: userData.displayName,
      avatarColorIndex: userData.avatarColorIndex,
      createdAt: userData.createdAt?.toDate(),
      avatarURL: userData.avatarURL
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

// Update user profile (for future use)
export async function updateUserProfile(uid: string, updates: Partial<AuthUser>): Promise<void> {
  const userRef = doc(db, USERS_COLLECTION, uid);
  
  // Remove fields that shouldn't be updated
  const { uid: _, email: __, createdAt: ___, ...safeUpdates } = updates;
  
  await setDoc(userRef, safeUpdates, { merge: true });
}

// Map Firebase user to AuthUser (for backward compatibility)
export function mapFirebaseUser(firebaseUser: FirebaseUser): AuthUser {
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email!,
    username: undefined, // Will be loaded from Firestore
    createdAt: firebaseUser.metadata.creationTime ? new Date(firebaseUser.metadata.creationTime) : undefined,
    avatarURL: firebaseUser.photoURL
  };
}
