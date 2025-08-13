import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '../services/firebase';
import { useAuth } from './useAuth';
import { UserProfile } from '../types/username';

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

    // Listen to user document changes
    const userRef = doc(db, 'users', user.uid);
    const unsubscribe = onSnapshot(
      userRef,
      (doc) => {
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
        if (__DEV__) console.error('Error listening to user profile:', error);
        setProfile({
          uid: user.uid,
          loading: false
        });
      }
    );

    return unsubscribe;
  }, [user?.uid]);

  return profile;
};
