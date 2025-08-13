import { signInAnonymously as firebaseSignInAnonymously, User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useEffect, useState } from 'react';
import { auth } from '../services/firebase';
import { User } from '../types/chat';

export const useAuth = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [hasAttemptedAutoSignIn, setHasAttemptedAutoSignIn] = useState(false);



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
        setLoading(false);
      } else if (!hasAttemptedAutoSignIn) {
        // Пользователь не авторизован - автоматически входим анонимно (только один раз)
        setHasAttemptedAutoSignIn(true);
        if (__DEV__) console.log('🔐 No user found, signing in anonymously...');
        try {
          await signInAnonymously();
        } catch (error) {
          if (__DEV__) console.error('🔐 Auto sign-in failed:', error);
          setUser(null);
          setLoading(false);
        }
      } else {
        // Уже пытались войти, но не получилось
        setUser(null);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, [hasAttemptedAutoSignIn]);

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
