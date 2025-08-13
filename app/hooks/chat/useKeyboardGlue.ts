// Extracted verbatim from ChatCore.tsx on 2025-08-11 (lines 286-401)
import { useCallback, useEffect, useRef, useState } from 'react';
import { Animated, Keyboard } from 'react-native';
import { useUIWatchDog } from '../../hooks/useUIWatchDog';
import { ErrorSeverity, useErrorMonitor } from '../../utils/errorBoundary';

interface UseKeyboardGlueProps {
  flatListRef: React.RefObject<any>;
  messageCount: number;
  inputFocused: boolean;
  onError?: (error: Error) => void;
}

interface UseKeyboardGlueReturn {
  keyboardHeight: number;
  keyboardAnimation: Animated.Value;
  watchDogStatus: any;
  updateScrollPosition: (scrollY?: number) => void;
  forceCheck: () => void;
}

const useKeyboardGlue = ({
  flatListRef,
  messageCount,
  inputFocused,
  onError,
}: UseKeyboardGlueProps): UseKeyboardGlueReturn => {
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const keyboardAnimation = useRef(new Animated.Value(0)).current;
  
  const { addError } = useErrorMonitor();

  // Убираем синхронизацию - пусть анимация работает независимо
  // useEffect(() => {
  //   keyboardAnimation.setValue(keyboardHeight);
  // }, [keyboardHeight, keyboardAnimation]);

  // WatchDog для мониторинга UI с защитой
  const watchDogResult = useUIWatchDog({
    flatListRef,
    messageCount,
    keyboardHeight,
    inputFocused,
    onScrollToEnd: () => {
      try {
        // Прокрутка теперь обрабатывается в ChatListWithReactions
      } catch (error) {
        addError(error instanceof Error ? error : new Error(String(error)), 'ChatCore', ErrorSeverity.LOW);
      }
    },
  });

  const { status: watchDogStatus, updateScrollPosition, forceCheck } = watchDogResult;

  // Улучшенная безопасная обработка ошибок
  const safeExecute = useCallback((fn: () => void, errorMessage: string, severity: ErrorSeverity = ErrorSeverity.MEDIUM) => {
    try {
      fn();
    } catch (error) {
      const errorObj = error instanceof Error ? error : new Error(String(error));
      addError(errorObj, 'ChatCore', severity);
      
      onError?.(errorObj);
    }
  }, [onError, addError]);

  // Простое синхронное решение для Android
  useEffect(() => {
    let keyboardDidShowListener: any;
    let keyboardDidHideListener: any;

    try {
      // Основные события клавиатуры - СИНХРОННО
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
        if (__DEV__) console.log('🎹 Keyboard Did Show:', e.endCoordinates.height);
        safeExecute(() => {
          // Синхронное движение - без анимации
          keyboardAnimation.setValue(e.endCoordinates.height);
          setKeyboardHeight(e.endCoordinates.height);
        }, 'keyboardDidShow', ErrorSeverity.LOW);
      });

      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        if (__DEV__) console.log('🎹 Keyboard Did Hide');
        safeExecute(() => {
          // Синхронное скрытие - без анимации
          keyboardAnimation.setValue(0);
          setKeyboardHeight(0);
        }, 'keyboardDidHide', ErrorSeverity.LOW);
      });
    } catch (error) {
      addError(error instanceof Error ? error : new Error(String(error)), 'ChatCore', ErrorSeverity.MEDIUM);
    }

    return () => {
      try {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
      } catch (error) {
        addError(error instanceof Error ? error : new Error(String(error)), 'ChatCore', ErrorSeverity.LOW);
      }
    };
  }, [safeExecute, addError, keyboardAnimation]);

  return {
    keyboardHeight,
    keyboardAnimation,
    watchDogStatus,
    updateScrollPosition: (scrollY?: number) => updateScrollPosition(scrollY || 0),
    forceCheck,
  };
};

export default useKeyboardGlue;
