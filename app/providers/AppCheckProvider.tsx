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
        await initializeAppCheckService();
        setIsInitialized(true);
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

  // Всегда показываем приложение, App Check не критичен
  return <>{children}</>;
};

// Default export для Expo Router
export default AppCheckProvider;
