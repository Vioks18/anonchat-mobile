import React, { useEffect, useState } from 'react';
import { initializeAppCheckService } from '../services/appCheck';

interface AppCheckProviderProps {
  children: React.ReactNode;
}

export const AppCheckProvider: React.FC<AppCheckProviderProps> = ({ children }) => {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAppCheck = async () => {
      try {
        const appCheckInstance = await initializeAppCheckService();
        setIsInitialized(true);
        
        if (!appCheckInstance && __DEV__) {
          setError('App Check не удалось инициализировать');
        }
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Неизвестная ошибка App Check';
        setError(errorMessage);
        setIsInitialized(true); // Все равно продолжаем работу приложения
        
        if (__DEV__) {
          console.error('AppCheckProvider: Ошибка инициализации:', errorMessage);
        }
      }
    };

    initAppCheck();
  }, []);

  // Показываем ошибку только в режиме разработки
  if (error && __DEV__) {
    console.warn('App Check Error:', error);
  }

  // В продакшене всегда показываем приложение, даже если App Check не работает
  if (!isInitialized && __DEV__) {
    return null; // Можно показать загрузочный экран
  }

  return <>{children}</>;
};

// Default export для Expo Router
export default AppCheckProvider;
