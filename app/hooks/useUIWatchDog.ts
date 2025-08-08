import { useCallback, useEffect, useRef, useState } from 'react';
import { FlatList, Keyboard } from 'react-native';

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
}

export const useUIWatchDog = ({
  flatListRef,
  messageCount,
  keyboardHeight,
  inputFocused,
  onScrollToEnd
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
      console.error('useUIWatchDog: Ошибка установки статуса', error);
    }
  }, []);

  // Проверка scrollToEnd
  const checkScrollToEnd = useCallback(() => {
    try {
      if (!flatListRef.current) {
        if (__DEV__) console.warn('useUIWatchDog: flatListRef.current отсутствует');
        return;
      }

      const startTime = Date.now();
      
      // Запоминаем текущую позицию скролла
      const currentOffset = lastScrollYRef.current;
      
      // Вызываем scrollToEnd
      onScrollToEnd?.();
      
      // Проверяем результат через 100ms
      setTimeout(() => {
        try {
          const endTime = Date.now();
          const duration = endTime - startTime;
          
          if (duration > 100) {
            if (__DEV__) console.warn(`📡 scrollToEnd не сработал через ${duration}ms`);
            safeSetStatus(prev => ({ ...prev, scrollToEndWorking: false }));
          } else {
            safeSetStatus(prev => ({ ...prev, scrollToEndWorking: true }));
          }
        } catch (error) {
          console.error('useUIWatchDog: Ошибка проверки scrollToEnd', error);
        }
      }, 100);
    } catch (error) {
      console.error('useUIWatchDog: Ошибка checkScrollToEnd', error);
    }
  }, [flatListRef, onScrollToEnd, safeSetStatus]);

  // Проверка клавиатуры
  const checkKeyboard = useCallback(() => {
    try {
if (__DEV__) // console.log('useUIWatchDog: Проверка клавиатуры', keyboardHeight);
    } catch (error) {
      console.error('useUIWatchDog: Ошибка проверки клавиатуры', error);
    }
  }, [keyboardHeight]);

  // Проверка количества сообщений (только при изменении)
  const checkMessageCount = useCallback(() => {
    try {
      const now = Date.now();
      // Логируем только если количество изменилось или прошло больше 5 секунд
      if (messageCount !== lastMessageCountRef.current || (now - lastLogTimeRef.current > 5000)) {
        if (__DEV__ && messageCount === 0) {
if (__DEV__) console.warn(`🔍 Пустой FlatList (сообщений: ${messageCount})`);
        }
        lastMessageCountRef.current = messageCount;
        lastLogTimeRef.current = now;
      }
    } catch (error) {
      console.error('useUIWatchDog: Ошибка checkMessageCount', error);
    }
  }, [messageCount]);

  // Проверка застревания скролла
  const checkScrollStuck = useCallback(() => {
    try {
      if (lastScrollYRef.current === status.lastScrollY && messageCount > 0) {
        if (__DEV__) console.warn(`💤 scrollY не изменился после добавления сообщения`);
        safeSetStatus(prev => ({ ...prev, scrollStuck: true }));
      } else {
        safeSetStatus(prev => ({ ...prev, scrollStuck: false }));
      }
    } catch (error) {
      console.error('useUIWatchDog: Ошибка checkScrollStuck', error);
    }
  }, [messageCount, status.lastScrollY, safeSetStatus]);

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
      console.error('useUIWatchDog: Ошибка обновления статуса', error);
    }
  }, [keyboardHeight, inputFocused, messageCount, status.keyboardHeight, status.inputFocused, status.messageCount, status.lastScrollY, safeSetStatus]);

  // Мониторинг клавиатуры
  useEffect(() => {
    let keyboardDidShowListener: any = null;
    let keyboardDidHideListener: any = null;

    try {
      keyboardDidShowListener = Keyboard.addListener('keyboardDidShow', () => {
        try {
          keyboardShowTimeRef.current = Date.now();
          // Вызываем checkKeyboard напрямую без зависимости
          if (keyboardHeight > 0 && !inputFocused) {
            if (__DEV__) console.warn(`⚠️ TextInput не был в фокусе при keyboardDidShow (высота: ${keyboardHeight})`);
            setStatus(prev => ({ ...prev, keyboardIssue: true }));
          } else if (keyboardHeight === 0 && keyboardShowTimeRef.current > 0) {
            if (__DEV__) console.warn(`🔇 клавиатура открыта, но высота = 0`);
            setStatus(prev => ({ ...prev, keyboardIssue: true }));
          } else {
            setStatus(prev => ({ ...prev, keyboardIssue: false }));
          }
        } catch (error) {
          console.error('useUIWatchDog: Ошибка обработки keyboardDidShow', error);
        }
      });

      keyboardDidHideListener = Keyboard.addListener('keyboardDidHide', () => {
        try {
          keyboardShowTimeRef.current = 0;
          setStatus(prev => ({ ...prev, keyboardIssue: false }));
        } catch (error) {
          console.error('useUIWatchDog: Ошибка обработки keyboardDidHide', error);
        }
      });

if (__DEV__) // console.log('useUIWatchDog: Слушатели клавиатуры добавлены');
    } catch (error) {
      console.error('useUIWatchDog: Ошибка добавления слушателей клавиатуры', error);
    }

    return () => {
      try {
        keyboardDidShowListener?.remove();
        keyboardDidHideListener?.remove();
if (__DEV__) // console.log('useUIWatchDog: Слушатели клавиатуры удалены');
      } catch (error) {
        console.error('useUIWatchDog: Ошибка удаления слушателей клавиатуры', error);
      }
    };
  }, [keyboardHeight, inputFocused]); // Убираем функции из зависимостей

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
if (__DEV__) // console.log('useUIWatchDog: Проверка scrollToEnd');
      }
    } catch (error) {
      console.error('useUIWatchDog: Ошибка проверки сообщений', error);
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
      console.error('useUIWatchDog: Ошибка обновления позиции скролла', error);
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
      console.error('useUIWatchDog: Ошибка принудительной проверки', error);
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