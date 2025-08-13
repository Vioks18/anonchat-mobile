import {
  createUserWithEmailAndPassword,
  EmailAuthProvider,
  User as FirebaseUser,
  linkWithCredential,
  sendPasswordResetEmail,
  signInWithEmailAndPassword,
  signOut
} from 'firebase/auth';
import {
  doc,
  getDoc,
  runTransaction,
  serverTimestamp,
  setDoc
} from 'firebase/firestore';
import { LoginData, RegisterData, User } from '../types/user';
import { normalizeHandle, validateUsername } from '../utils/username';
import { auth, db } from './firebase';

/**
 * Checks if a username is available
 * @param handle - Normalized username handle
 * @returns true if available, false if taken
 */
export const checkUsernameAvailable = async (handle: string): Promise<boolean> => {
  try {
    const validation = validateUsername(handle);
    if (!validation.isValid) {
      return false;
    }

    const normalizedHandle = normalizeHandle(handle);
    const usernameDoc = await getDoc(doc(db, 'usernames', normalizedHandle));
    
    return !usernameDoc.exists();
  } catch (error) {
    if (__DEV__) console.error('Error checking username availability:', error);
    return false;
  }
};

/**
 * Reserves a username using Firestore transaction
 * @param handle - Normalized username handle
 * @param uid - User's Firebase UID
 */
export const reserveUsernameTx = async (handle: string, uid: string): Promise<void> => {
  const normalizedHandle = normalizeHandle(handle);
  
  await runTransaction(db, async (transaction) => {
    // Check if username already exists
    const usernameRef = doc(db, 'usernames', normalizedHandle);
    const usernameDoc = await transaction.get(usernameRef);
    
    if (usernameDoc.exists()) {
      throw new Error('Username already taken');
    }
    
    // Reserve the username
    transaction.set(usernameRef, { uid });
    
    // Update user document with username
    const userRef = doc(db, 'users', uid);
    transaction.set(userRef, {
      username: `@${normalizedHandle}`,
      updatedAt: serverTimestamp()
    }, { merge: true });
  });
};

/**
 * Maps Firebase user to our User type
 */
export const mapFirebaseUser = async (firebaseUser: FirebaseUser): Promise<User> => {
  // Get user data from Firestore
  const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
  const userData = userDoc.exists() ? userDoc.data() : {};
  
  return {
    uid: firebaseUser.uid,
    email: firebaseUser.email || undefined,
    username: userData.username,
    displayName: userData.displayName || firebaseUser.displayName || undefined,
    avatarURL: userData.avatarURL || firebaseUser.photoURL || undefined,
         createdAt: userData.createdAt?.toMillis() || (firebaseUser.metadata.creationTime 
       ? new Date(firebaseUser.metadata.creationTime).getTime() 
       : Date.now()),
    updatedAt: userData.updatedAt?.toMillis()
  };
};

/**
 * Registers a new user with email, password, and username
 */
export const registerWithEmail = async (data: RegisterData): Promise<User> => {
  try {
    // Validate username
    const validation = validateUsername(data.username);
    if (!validation.isValid) {
      throw new Error(`Invalid username: ${validation.error}`);
    }

    // Check username availability
    const isAvailable = await checkUsernameAvailable(data.username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    // Create Firebase user
    const userCredential = await createUserWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    try {
      // Reserve username and create user document
      await reserveUsernameTx(data.username, userCredential.user.uid);
      
      // Create user document
      await setDoc(doc(db, 'users', userCredential.user.uid), {
        uid: userCredential.user.uid,
        email: data.email,
        username: `@${normalizeHandle(data.username)}`,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      return await mapFirebaseUser(userCredential.user);
    } catch (error) {
      // Rollback: delete the Firebase user if username reservation fails
      await userCredential.user.delete();
      throw error;
    }
  } catch (error) {
    if (__DEV__) console.error('Registration error:', error);
    throw error;
  }
};

/**
 * Links anonymous user to email/password account
 */
export const linkAnonToEmail = async (data: RegisterData): Promise<User> => {
  try {
    const currentUser = auth.currentUser;
    if (!currentUser || !currentUser.isAnonymous) {
      throw new Error('No anonymous user to link');
    }

    // Validate username
    const validation = validateUsername(data.username);
    if (!validation.isValid) {
      throw new Error(`Invalid username: ${validation.error}`);
    }

    // Check username availability
    const isAvailable = await checkUsernameAvailable(data.username);
    if (!isAvailable) {
      throw new Error('Username is already taken');
    }

    // Create credential
    const credential = EmailAuthProvider.credential(data.email, data.password);

    // Link anonymous user
    const userCredential = await linkWithCredential(currentUser, credential);

    // Reserve username and update user document
    await reserveUsernameTx(data.username, userCredential.user.uid);
    
    await setDoc(doc(db, 'users', userCredential.user.uid), {
      uid: userCredential.user.uid,
      email: data.email,
      username: `@${normalizeHandle(data.username)}`,
      updatedAt: serverTimestamp()
    }, { merge: true });

    return await mapFirebaseUser(userCredential.user);
  } catch (error) {
    if (__DEV__) console.error('Link anonymous user error:', error);
    throw error;
  }
};

/**
 * Signs in user with email and password
 */
export const loginWithEmail = async (data: LoginData): Promise<User> => {
  try {
    const userCredential = await signInWithEmailAndPassword(
      auth,
      data.email,
      data.password
    );

    return await mapFirebaseUser(userCredential.user);
  } catch (error) {
    if (__DEV__) console.error('Login error:', error);
    throw error;
  }
};

/**
 * Sends password reset email
 */
export const sendResetEmail = async (email: string): Promise<void> => {
  try {
    await sendPasswordResetEmail(auth, email);
  } catch (error) {
    if (__DEV__) console.error('Password reset error:', error);
    throw error;
  }
};

/**
 * Signs out current user
 */
export const logout = async (): Promise<void> => {
  try {
    await signOut(auth);
  } catch (error) {
    if (__DEV__) console.error('Logout error:', error);
    throw error;
  }
};
