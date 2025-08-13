import { doc, onSnapshot } from 'firebase/firestore';
import { useEffect, useState } from 'react';
import { db } from '../services/firebase';
import { UserProfile } from '../types/username';
import { useAuth } from './useAuth';

export const useAuthUserProfile = (): UserProfile => {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile>({
    uid: user?.uid || '',
    loading: true
  });

  useEffect(() => {
    if (!user?.uid) {
      setProfile({
        uid: '',
        loading: false
      });
      return;
    }

    // Add timeout to prevent infinite loading
    const timeoutId = setTimeout(() => {
      setProfile({
        uid: user.uid,
        loading: false
      });
    }, 5000); // 5 second timeout

    // Listen to user document changes
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
        clearTimeout(timeoutId);
        if (doc.exists()) {
          const data = doc.data();
          setProfile({
            uid: user.uid,
            username: data.username,
            username_lc: data.username_lc,
            loading: false
          });
        } else {
          // User document doesn't exist yet
          setProfile({
            uid: user.uid,
            loading: false
          });
        }
      },
      (error) => {
        clearTimeout(timeoutId);
        if (__DEV__) console.error('Error listening to user profile:', error);
        setProfile({
          uid: user.uid,
          loading: false
        });
      }
    );

    return () => {
      clearTimeout(timeoutId);
      unsubscribe();
    };
  }, [user?.uid]);

  return profile;
};
