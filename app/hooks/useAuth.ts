import AsyncStorage from '@react-native-async-storage/async-storage';
import { User as FirebaseUser, onAuthStateChanged } from 'firebase/auth';
import { useCallback, useEffect, useState } from 'react';
import { getUserProfile } from '../services/auth';
import { auth } from '../services/firebase';
import { AuthStatus, AuthUser } from '../types/auth';

const AUTH_STORAGE_KEY = 'auth_user';

export const useAuth = () => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [error, setError] = useState<string | null>(null);

  // Сохранение пользователя в AsyncStorage
  const saveUserToStorage = useCallback(async (userData: AuthUser | null) => {
    try {
      if (userData) {
        await AsyncStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(userData));
      } else {
        await AsyncStorage.removeItem(AUTH_STORAGE_KEY);
      }
    } catch (error) {
      if (__DEV__) console.error('Error saving user to storage:', error);
    }
  }, []);

  // Загрузка пользователя из AsyncStorage
  const loadUserFromStorage = useCallback(async () => {
    try {
      const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
      if (storedUser) {
        const userData = JSON.parse(storedUser) as AuthUser;
        setUser(userData);
        setStatus('signedIn');
        if (__DEV__) console.log('📱 User loaded from storage:', userData.uid);
      }
    } catch (error) {
      if (__DEV__) console.error('Error loading user from storage:', error);
    }
  }, []);

  // Функция для принудительного обновления состояния
  const refreshAuthState = useCallback(async () => {
    const currentUser = auth.currentUser;
    if (currentUser) {
      try {
        const userProfile = await getUserProfile(currentUser.uid);
        if (userProfile) {
          setUser(userProfile);
          setStatus('signedIn');
          await saveUserToStorage(userProfile);
          if (__DEV__) console.log('🔄 Auth state refreshed:', userProfile.uid);
        } else {
          setUser(null);
          setStatus('signedOut');
          await saveUserToStorage(null);
        }
      } catch (error) {
        if (__DEV__) console.error('🔄 Error refreshing auth state:', error);
        setUser(null);
        setStatus('signedOut');
        await saveUserToStorage(null);
      }
    } else {
      setUser(null);
      setStatus('signedOut');
      await saveUserToStorage(null);
    }
  }, [saveUserToStorage]);

  useEffect(() => {
    // Сначала загружаем из storage
    loadUserFromStorage();

    // Добавляем небольшую задержку для Firebase Auth инициализации
    const timeoutId = setTimeout(() => {
      const unsubscribe = onAuthStateChanged(auth, async (firebaseUser: FirebaseUser | null) => {
        try {
          if (firebaseUser) {
            // User is signed in - load full profile from Firestore
            const userProfile = await getUserProfile(firebaseUser.uid);
            
            if (userProfile) {
              setUser(userProfile);
              setStatus('signedIn');
              await saveUserToStorage(userProfile);
              if (__DEV__) console.log('🔐 User authenticated:', userProfile.uid, 'username:', userProfile.username);
            } else {
              // User exists in Auth but no profile in Firestore
              if (__DEV__) console.warn('⚠️ User authenticated but no profile found in Firestore');
              // Не выходим из системы, если пользователь есть в storage
              const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
              if (!storedUser) {
                setUser(null);
                setStatus('signedOut');
                await saveUserToStorage(null);
              }
            }
          } else {
            // User is signed out - проверяем storage
            const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
            if (storedUser) {
              // Пользователь есть в storage, но не в Firebase Auth
              // Это может быть временная проблема с persistence
              if (__DEV__) console.log('⚠️ User in storage but not in Firebase Auth - keeping user signed in');
              // Не выходим из системы, но нужно восстановить Firebase Auth
              try {
                const userData = JSON.parse(storedUser) as AuthUser;
                // Попробуем восстановить сессию Firebase Auth
                if (__DEV__) console.log('🔄 Attempting to restore Firebase Auth session');
                // Здесь можно добавить логику восстановления сессии
              } catch (error) {
                if (__DEV__) console.error('❌ Error restoring Firebase Auth session:', error);
              }
            } else {
              // Пользователя нет нигде - выходим
              setUser(null);
              setStatus('signedOut');
              await saveUserToStorage(null);
              if (__DEV__) console.log('🔐 User signed out');
            }
          }
        } catch (error) {
          if (__DEV__) console.error('🔐 Auth state change error:', error);
          setError(error instanceof Error ? error.message : 'Authentication error');
          // Не выходим из системы при ошибке, если пользователь есть в storage
          const storedUser = await AsyncStorage.getItem(AUTH_STORAGE_KEY);
          if (!storedUser) {
            setUser(null);
            setStatus('signedOut');
            await saveUserToStorage(null);
          }
        } finally {
          setStatus(prev => prev === 'loading' ? 'signedOut' : prev);
        }
      });

      return unsubscribe;
    }, 1000); // Задержка 1 секунда

    return () => {
      clearTimeout(timeoutId);
    };
  }, [saveUserToStorage, loadUserFromStorage]);

  return {
    user,
    status,
    error,
    refreshAuthState
  };
};
