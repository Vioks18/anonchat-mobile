import { useState, useEffect } from 'react';
import { signInAnonymously as firebaseSignInAnonymously, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';
import { auth } from '../services/firebase';
import { User } from '../types/chat';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
      if (firebaseUser) {
        // Пользователь авторизован
        const userData: User = {
          uid: firebaseUser.uid,
          displayName: firebaseUser.displayName || undefined,
          avatarURL: firebaseUser.photoURL || undefined,
          createdAt: firebaseUser.metadata.creationTime 
            ? new Date(firebaseUser.metadata.creationTime).getTime() 
            : Date.now()
        };
        setUser(userData);
        if (__DEV__) console.log('🔐 User authenticated:', userData.uid);
      } else {
        // Пользователь не авторизован
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signInAnonymously = async (): Promise<User> => {
    try {
      setLoading(true);
      const result = await firebaseSignInAnonymously(auth);
      const userData: User = {
        uid: result.user.uid,
        displayName: result.user.displayName || undefined,
        avatarURL: result.user.photoURL || undefined,
        createdAt: result.user.metadata.creationTime 
          ? new Date(result.user.metadata.creationTime).getTime() 
          : Date.now()
      };
      setUser(userData);
      if (__DEV__) console.log('🔐 Anonymous sign-in successful:', userData.uid);
      return userData;
    } catch (error) {
      if (__DEV__) console.error('🔐 Anonymous sign-in failed:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    signInAnonymously
  };
};
