import { useCallback } from 'react';
import { ErrorSeverity } from '../utils/errorBoundary';

/**
 * Хук для безопасного выполнения функций с обработкой ошибок
 */
export const useSafeExecute = (
  addError: (error: Error, component: string, severity: ErrorSeverity) => void,
  onError?: (error: Error) => void,
  setHasCriticalError?: (hasError: boolean) => void,
  setErrorMessage?: (message: string) => void
) => {
  // Улучшенная безопасная обработка ошибок
  const safeExecute = useCallback((fn: () => void, errorMessage: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM) => {
    try {
      fn();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      addError(errorObj, 'ChatCore', severity);
      
      // Проверяем на критические ошибки
      if (severity === ErrorSeverity.CRITICAL || errorObj.message.includes('critical')) {
        setHasCriticalError?.(true);
        setErrorMessage?.(errorObj.message);
      }
      
      onError?.(errorObj);
    }
  }, [onError, addError, setHasCriticalError, setErrorMessage]);

  return {
    safeExecute,
  };
};
