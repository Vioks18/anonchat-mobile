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

  // Простая анимация клавиатуры без сложных вычислений
  useEffect(() => {
    Animated.timing(keyboardAnimation, {
      toValue: keyboardHeight,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [keyboardHeight, keyboardAnimation]);

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

  // Обработка клавиатуры для Android с защитой
  useEffect(() => {
    let keyboardDidShowListener: any;
    let keyboardDidHideListener: any;

    try {
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', (e) => {
        safeExecute(() => {
          setKeyboardHeight(e.endCoordinates.height);
        }, 'keyboardDidShow', ErrorSeverity.LOW);
      });

      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        safeExecute(() => {
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
  }, [safeExecute, addError, setKeyboardHeight]);

  return {
    keyboardHeight,
    keyboardAnimation,
    watchDogStatus,
    updateScrollPosition: (scrollY?: number) => updateScrollPosition(scrollY || 0),
    forceCheck,
  };
};

export default useKeyboardGlue;
