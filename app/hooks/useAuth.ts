import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { mapFirebaseUser } from '../services/authApi';
import { auth } from '../services/firebase';
import { AuthState, User } from '../types/user';

export const useAuth = (): AuthState => {
  const [user, setUser] = useState<User | null>(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      try {
        if (firebaseUser) {
          // User is signed in
          const userData = await mapFirebaseUser(firebaseUser);
          setUser(userData);
          if (__DEV__) console.log('🔐 User authenticated:', userData.uid);
        } else {
          // User is signed out
          setUser(null);
          if (__DEV__) console.log('🔐 User signed out');
        }
      } catch (error) {
        if (__DEV__) console.error('🔐 Auth state change error:', error);
        setError(error instanceof Error ? error.message : 'Authentication error');
        setUser(null);
      } finally {
        setInitializing(false);
      }
    });

    return unsubscribe;
  }, []);

  return {
    user,
    initializing,
    error
  };
};
