import React, { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { Keyboard } from 'react-native';

interface ChatKeyboardContextType {
  // Состояние клавиатуры
  keyboardHeight: number;
  setKeyboardHeight: (height: number) => void;
  
  // Безопасные обработчики
  safeSetKeyboardHeight: (height: number) => void;
  
  // Слушатели клавиатуры
  addKeyboardListeners: () => void;
  removeKeyboardListeners: () => void;
}

const ChatKeyboardContext = createContext<ChatKeyboardContextType | undefined>(undefined);

export const useChatKeyboard = () => {
  const context = useContext(ChatKeyboardContext);
  if (!context) {
    throw new Error('useChatKeyboard должен использоваться внутри ChatKeyboardProvider');
  }
  return context;
};

interface ChatKeyboardProviderProps {
  children: React.ReactNode;
}

export const ChatKeyboardProvider: React.FC<ChatKeyboardProviderProps> = React.memo(({ children }) => {
  // Состояние клавиатуры
  const [keyboardHeight, setKeyboardHeight] = React.useState(0);

  // Безопасное изменение высоты клавиатуры
  const safeSetKeyboardHeight = useCallback((height: number) => {
    try {
      if (typeof height !== 'number') {
        console.warn('ChatKeyboard: Невалидный тип высоты', typeof height);
        return;
      }
      
      if (height < 0) {
        console.warn('ChatKeyboard: Отрицательная высота клавиатуры', height);
        return;
      }
      
      setKeyboardHeight(height);
    } catch (error) {
      console.error('ChatKeyboard: Ошибка изменения высоты', error);
    }
  }, []);

  // Обработчики клавиатуры
  const handleKeyboardShow = useCallback((event: any) => {
    try {
      const height = event?.endCoordinates?.height || 0;
      safeSetKeyboardHeight(height);
    } catch (error) {
      console.error('ChatKeyboard: Ошибка показа клавиатуры', error);
    }
  }, [safeSetKeyboardHeight]);

  const handleKeyboardHide = useCallback(() => {
    try {
      safeSetKeyboardHeight(0);
    } catch (error) {
      console.error('ChatKeyboard: Ошибка скрытия клавиатуры', error);
    }
  }, [safeSetKeyboardHeight]);

  // Добавление слушателей клавиатуры
  const addKeyboardListeners = useCallback(() => {
    try {
      Keyboard.addListener('keyboardDidShow', handleKeyboardShow);
      Keyboard.addListener('keyboardDidHide', handleKeyboardHide);
    } catch (error) {
      console.error('ChatKeyboard: Ошибка добавления слушателей', error);
    }
  }, [handleKeyboardShow, handleKeyboardHide]);

  // Удаление слушателей клавиатуры
  const removeKeyboardListeners = useCallback(() => {
    try {
      Keyboard.removeAllListeners('keyboardDidShow');
      Keyboard.removeAllListeners('keyboardDidHide');
    } catch (error) {
      console.error('ChatKeyboard: Ошибка удаления слушателей', error);
    }
  }, []);

  // Автоматическое управление слушателями
  useEffect(() => {
    try {
      addKeyboardListeners();
      
      return () => {
        removeKeyboardListeners();
      };
    } catch (error) {
      console.error('ChatKeyboard: Ошибка управления слушателями', error);
    }
  }, [addKeyboardListeners, removeKeyboardListeners]);

  // Мемоизированное значение контекста
  const contextValue = useMemo(() => {
    try {
      return {
        keyboardHeight,
        setKeyboardHeight,
        safeSetKeyboardHeight,
        addKeyboardListeners,
        removeKeyboardListeners,
      };
    } catch (error) {
      console.error('ChatKeyboard: Ошибка создания контекста', error);
      return {
        keyboardHeight: 0,
        setKeyboardHeight: () => {},
        safeSetKeyboardHeight: () => {},
        addKeyboardListeners: () => {},
        removeKeyboardListeners: () => {},
      };
    }
  }, [keyboardHeight, safeSetKeyboardHeight, addKeyboardListeners, removeKeyboardListeners]);

  try {
    return (
      <ChatKeyboardContext.Provider value={contextValue}>
        {children}
      </ChatKeyboardContext.Provider>
    );
  } catch (error) {
    console.error('ChatKeyboard: Критическая ошибка рендеринга', error);
    return <>{children}</>;
  }
});

ChatKeyboardProvider.displayName = 'ChatKeyboardProvider';
