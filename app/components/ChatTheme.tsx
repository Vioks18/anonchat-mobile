import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { THEMES } from '../constants/themes';

interface ChatThemeContextType {
  // Текущая тема
  currentTheme: string;
  setCurrentTheme: (theme: string) => void;
  
  // Данные текущей темы
  currentThemeData: any;
  
  // Безопасные обработчики
  safeSetCurrentTheme: (theme: string) => void;
  
  // Создание themedStyles
  createThemedStyles: (keyboardHeight: number) => any;
}

const ChatThemeContext = createContext<ChatThemeContextType | undefined>(undefined);

export const useChatTheme = () => {
  const context = useContext(ChatThemeContext);
  if (!context) {
    throw new Error('useChatTheme должен использоваться внутри ChatThemeProvider');
  }
  return context;
};

interface ChatThemeProviderProps {
  children: React.ReactNode;
}

export const ChatThemeProvider: React.FC<ChatThemeProviderProps> = React.memo(({ children }) => {
  // Состояние темы
  const [currentTheme, setCurrentTheme] = React.useState("dark");

  // Данные текущей темы - мемоизированы
  const currentThemeData = useMemo(() => {
    try {
      return THEMES[currentTheme as keyof typeof THEMES] || THEMES.dark;
    } catch (error) {
      console.error('ChatTheme: Ошибка получения темы', error);
      return THEMES.dark;
    }
  }, [currentTheme]);

  // Безопасное изменение темы
  const safeSetCurrentTheme = useCallback((theme: string) => {
    try {
      if (typeof theme !== 'string') {
        console.warn('ChatTheme: Невалидный тип темы', typeof theme);
        return;
      }
      
      if (!THEMES[theme as keyof typeof THEMES]) {
        console.warn('ChatTheme: Неизвестная тема', theme);
        return;
      }
      
      setCurrentTheme(theme);
    } catch (error) {
      console.error('ChatTheme: Ошибка изменения темы', error);
    }
  }, []);

  // Создание themedStyles - мемоизировано
  const createThemedStyles = useCallback((keyboardHeight: number) => {
    try {
      return {
        safe: { backgroundColor: currentThemeData.bg },
        header: { backgroundColor: currentThemeData.headerBg },
        headerText: { color: currentThemeData.text },
        bubbleMe: { backgroundColor: currentThemeData.accent },
        bubbleOther: { backgroundColor: currentThemeData.bubbleOther },
        bubbleText: { color: currentThemeData.text },
        timestamp: { color: currentThemeData.text },
        statusDelivered: { color: currentThemeData.text },
        statusRead: { color: currentThemeData.accent },
        inputContainer: { backgroundColor: currentThemeData.inputBg, marginBottom: keyboardHeight },
        input: { color: currentThemeData.text, backgroundColor: currentThemeData.inputBg },
        sendButton: { backgroundColor: currentThemeData.accent },
      };
    } catch (error) {
      console.error('ChatTheme: Ошибка создания стилей', error);
      return {
        safe: { backgroundColor: THEMES.dark.bg },
        header: { backgroundColor: THEMES.dark.headerBg },
        headerText: { color: THEMES.dark.text },
        bubbleMe: { backgroundColor: THEMES.dark.accent },
        bubbleOther: { backgroundColor: THEMES.dark.bubbleOther },
        bubbleText: { color: THEMES.dark.text },
        timestamp: { color: THEMES.dark.text },
        statusDelivered: { color: THEMES.dark.text },
        statusRead: { color: THEMES.dark.accent },
        inputContainer: { backgroundColor: THEMES.dark.inputBg, marginBottom: keyboardHeight },
        input: { color: THEMES.dark.text, backgroundColor: THEMES.dark.inputBg },
        sendButton: { backgroundColor: THEMES.dark.accent },
      };
    }
  }, [currentThemeData]);

  // Мемоизированное значение контекста
  const contextValue = useMemo(() => {
    try {
      return {
        currentTheme,
        setCurrentTheme,
        currentThemeData,
        safeSetCurrentTheme,
        createThemedStyles,
      };
    } catch (error) {
      console.error('ChatTheme: Ошибка создания контекста', error);
      return {
        currentTheme: 'dark',
        setCurrentTheme: () => {},
        currentThemeData: THEMES.dark,
        safeSetCurrentTheme: () => {},
        createThemedStyles: () => ({}),
      };
    }
  }, [currentTheme, currentThemeData, safeSetCurrentTheme, createThemedStyles]);

  try {
    return (
      <ChatThemeContext.Provider value={contextValue}>
        {children}
      </ChatThemeContext.Provider>
    );
  } catch (error) {
    console.error('ChatTheme: Критическая ошибка рендеринга', error);
    return <>{children}</>;
  }
});

ChatThemeProvider.displayName = 'ChatThemeProvider';
