import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList } from 'react-native';

interface UIWatchDogStatus {
  scrollToEndWorking: boolean;
  keyboardHeight: number;
  inputFocused: boolean;
  messageCount: number;
  lastScrollY: number;
  scrollStuck: boolean;
  keyboardIssue: boolean;
}

interface UIWatchDogProps {
  flatListRef: React.RefObject<FlatList | null>;
  messageCount: number;
  keyboardHeight: number;
  inputFocused: boolean;
  onScrollToEnd?: () => void;
  onKeyboardHeightChange?: (height: number) => void;
}

export const useUIWatchDog = ({
  flatListRef,
  messageCount,
  keyboardHeight,
  inputFocused,
  onScrollToEnd,
  onKeyboardHeightChange
}: UIWatchDogProps) => {
  const [status, setStatus] = useState<UIWatchDogStatus>({
    scrollToEndWorking: true,
    keyboardHeight: 0,
    inputFocused: false,
    messageCount: 0,
    lastScrollY: 0,
    scrollStuck: false,
    keyboardIssue: false,
  });

  const lastScrollYRef = useRef(0);
  const scrollTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const keyboardShowTimeRef = useRef<number>(0);
  const lastMessageCountRef = useRef(0);
  const lastLogTimeRef = useRef(0);

  // Безопасная установка статуса
  const safeSetStatus = useCallback((updater: (prev: UIWatchDogStatus) => UIWatchDogStatus) => {
    try {
      setStatus(updater);
    } catch (error) {
      if (__DEV__) console.error('useUIWatchDog: Ошибка установки статуса', error);
    }
  }, []);

  // Проверка scrollToEnd - отключена
  const checkScrollToEnd = useCallback(() => {
    // Отключено чтобы не было ложных предупреждений
  }, [flatListRef, onScrollToEnd, safeSetStatus]);

  // Проверка клавиатуры
  const checkKeyboard = useCallback(() => {
    try {
  
    } catch (error) {
      if (__DEV__) console.error('useUIWatchDog: Ошибка проверки клавиатуры', error);
    }
  }, [keyboardHeight]);

  // Проверка количества сообщений - отключена
  const checkMessageCount = useCallback(() => {
    // Отключено чтобы не было ложных предупреждений
  }, [messageCount]);

  // Проверка застревания скролла - отключена
  const checkScrollStuck = useCallback(() => {
    // Отключено чтобы не было ложных предупреждений
  }, []);

  // Обновление статуса (только при реальных изменениях)
  useEffect(() => {
    try {
      const newStatus = {
        keyboardHeight,
        inputFocused,
        messageCount,
        lastScrollY: lastScrollYRef.current,
      };
      
      // Проверяем, действительно ли что-то изменилось
      if (
        status.keyboardHeight !== keyboardHeight ||
        status.inputFocused !== inputFocused ||
        status.messageCount !== messageCount ||
        status.lastScrollY !== lastScrollYRef.current
      ) {
        safeSetStatus(prev => ({
          ...prev,
          ...newStatus,
        }));
      }
    } catch (error) {
      if (__DEV__) console.error('useUIWatchDog: Ошибка обновления статуса', error);
    }
  }, [keyboardHeight, inputFocused, messageCount, status.keyboardHeight, status.inputFocused, status.messageCount, status.lastScrollY, safeSetStatus]);

  // Мониторинг клавиатуры - отключен, ChatCore сам обрабатывает
  useEffect(() => {
    // Отключено чтобы ChatCore сам обрабатывал клавиатуру
  }, []);

  // Проверка при изменении количества сообщений
  useEffect(() => {
    try {
      // Вызываем функции напрямую без зависимостей
      const now = Date.now();
      if (messageCount !== lastMessageCountRef.current || (now - lastLogTimeRef.current > 5000)) {
        if (__DEV__ && messageCount === 0) {
if (__DEV__) console.warn(`🔍 Пустой FlatList (сообщений: ${messageCount})`);
        }
        lastMessageCountRef.current = messageCount;
        lastLogTimeRef.current = now;
      }

      if (lastScrollYRef.current === status.lastScrollY && messageCount > 0) {
        if (__DEV__) console.warn(`💤 scrollY не изменился после добавления сообщения`);
        setStatus(prev => ({ ...prev, scrollStuck: true }));
      } else {
        setStatus(prev => ({ ...prev, scrollStuck: false }));
      }
      
      // Проверяем scrollToEnd при добавлении сообщения
      if (messageCount > 0) {
        // Простая проверка без сложной логики
    
      }
    } catch (error) {
      if (__DEV__) console.error('useUIWatchDog: Ошибка проверки сообщений', error);
    }
  }, [messageCount, status.lastScrollY]); // Убираем функции из зависимостей

  // Функция для обновления позиции скролла
  const updateScrollPosition = useCallback((scrollY: number) => {
    try {
      if (typeof scrollY === 'number' && scrollY >= 0) {
        lastScrollYRef.current = scrollY;
      } else {
if (__DEV__) console.warn('useUIWatchDog: Невалидная позиция скролла', scrollY);
      }
    } catch (error) {
      if (__DEV__) console.error('useUIWatchDog: Ошибка обновления позиции скролла', error);
    }
  }, []);

  // Функция для принудительной проверки
  const forceCheck = useCallback(() => {
    try {
      if (__DEV__) console.warn('🔍 WatchDog: Принудительная проверка UI');
      checkScrollToEnd();
      checkKeyboard();
      checkMessageCount();
      checkScrollStuck();
    } catch (error) {
      if (__DEV__) console.error('useUIWatchDog: Ошибка принудительной проверки', error);
    }
  }, [checkScrollToEnd, checkKeyboard, checkMessageCount, checkScrollStuck]);

  return {
    status,
    updateScrollPosition,
    forceCheck,
  };
}; 

// Default export для Expo Router
export default useUIWatchDog; 