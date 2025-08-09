import React, { createContext, useCallback, useContext, useMemo } from 'react';

interface ChatStateContextType {
  // Состояние ввода
  inputText: string;
  setInputText: (text: string) => void;
  
  // Состояние фокуса
  inputFocused: boolean;
  setInputFocused: (focused: boolean) => void;
  
  // Состояние меню
  showMenu: boolean;
  setShowMenu: (show: boolean) => void;
  
  // Состояние поиска
  isSearching: boolean;
  setIsSearching: (searching: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  
  // Состояние селектора тем
  showThemeSelector: boolean;
  setShowThemeSelector: (show: boolean) => void;
  
  // Безопасные обработчики
  safeSetInputText: (text: string) => void;
  safeSetInputFocused: (focused: boolean) => void;
  safeSetShowMenu: (show: boolean) => void;
  safeSetIsSearching: (searching: boolean) => void;
  safeSetSearchQuery: (query: string) => void;
  safeSetShowThemeSelector: (show: boolean) => void;
}

const ChatStateContext = createContext<ChatStateContextType | undefined>(undefined);

export const useChatState = () => {
  const context = useContext(ChatStateContext);
  if (!context) {
    throw new Error('useChatState должен использоваться внутри ChatStateProvider');
  }
  return context;
};

interface ChatStateProviderProps {
  children: React.ReactNode;
}

const ChatStateProviderInner: React.FC<ChatStateProviderProps> = React.memo(({ children }) => {
  // Состояние ввода
  const [inputText, setInputText] = React.useState("");
  const [inputFocused, setInputFocused] = React.useState(false);
  
  // Состояние меню
  const [showMenu, setShowMenu] = React.useState(false);
  
  // Состояние поиска
  const [isSearching, setIsSearching] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  
  // Состояние селектора тем
  const [showThemeSelector, setShowThemeSelector] = React.useState(false);

  // Безопасное изменение состояния ввода
  const safeSetInputText = useCallback((text: string) => {
    try {
      if (typeof text !== 'string') {
        if (__DEV__) console.warn('ChatState: Невалидный тип текста', typeof text);
        return;
      }
      setInputText(text);
    } catch (error) {
      if (__DEV__) console.error('ChatState: Ошибка изменения текста', error);
    }
  }, []);

  // Безопасное изменение фокуса
  const safeSetInputFocused = useCallback((focused: boolean) => {
    try {
      if (typeof focused !== 'boolean') {
        if (__DEV__) console.warn('ChatState: Невалидный тип фокуса', typeof focused);
        return;
      }
      setInputFocused(focused);
    } catch (error) {
      if (__DEV__) console.error('ChatState: Ошибка изменения фокуса', error);
    }
  }, []);

  // Безопасное изменение меню
  const safeSetShowMenu = useCallback((show: boolean) => {
    try {
      if (typeof show !== 'boolean') {
        if (__DEV__) console.warn('ChatState: Невалидный тип меню', typeof show);
        return;
      }
      setShowMenu(show);
    } catch (error) {
      if (__DEV__) console.error('ChatState: Ошибка изменения меню', error);
    }
  }, []);

  // Безопасное изменение поиска
  const safeSetIsSearching = useCallback((searching: boolean) => {
    try {
      if (typeof searching !== 'boolean') {
        if (__DEV__) console.warn('ChatState: Невалидный тип поиска', typeof searching);
        return;
      }
      setIsSearching(searching);
    } catch (error) {
      if (__DEV__) console.error('ChatState: Ошибка изменения поиска', error);
    }
  }, []);

  // Безопасное изменение поискового запроса
  const safeSetSearchQuery = useCallback((query: string) => {
    try {
      if (typeof query !== 'string') {
        if (__DEV__) console.warn('ChatState: Невалидный тип запроса', typeof query);
        return;
      }
      setSearchQuery(query);
    } catch (error) {
      if (__DEV__) console.error('ChatState: Ошибка изменения запроса', error);
    }
  }, []);

  // Безопасное изменение селектора тем
  const safeSetShowThemeSelector = useCallback((show: boolean) => {
    try {
      if (typeof show !== 'boolean') {
        if (__DEV__) console.warn('ChatState: Невалидный тип селектора тем', typeof show);
        return;
      }
      setShowThemeSelector(show);
    } catch (error) {
      if (__DEV__) console.error('ChatState: Ошибка изменения селектора тем', error);
    }
  }, []);

  // Мемоизированное значение контекста
  const contextValue = useMemo(() => {
    try {
      return {
        // Состояние
        inputText,
        setInputText,
        inputFocused,
        setInputFocused,
        showMenu,
        setShowMenu,
        isSearching,
        setIsSearching,
        searchQuery,
        setSearchQuery,
        showThemeSelector,
        setShowThemeSelector,
        
        // Безопасные обработчики
        safeSetInputText,
        safeSetInputFocused,
        safeSetShowMenu,
        safeSetIsSearching,
        safeSetSearchQuery,
        safeSetShowThemeSelector,
      };
    } catch (error) {
      if (__DEV__) console.error('ChatState: Ошибка создания контекста', error);
      return {
        inputText: '',
        setInputText: () => {},
        inputFocused: false,
        setInputFocused: () => {},
        showMenu: false,
        setShowMenu: () => {},
        isSearching: false,
        setIsSearching: () => {},
        searchQuery: '',
        setSearchQuery: () => {},
        showThemeSelector: false,
        setShowThemeSelector: () => {},
        safeSetInputText: () => {},
        safeSetInputFocused: () => {},
        safeSetShowMenu: () => {},
        safeSetIsSearching: () => {},
        safeSetSearchQuery: () => {},
        safeSetShowThemeSelector: () => {},
      };
    }
  }, [
    inputText,
    inputFocused,
    showMenu,
    isSearching,
    searchQuery,
    showThemeSelector,
    safeSetInputText,
    safeSetInputFocused,
    safeSetShowMenu,
    safeSetIsSearching,
    safeSetSearchQuery,
    safeSetShowThemeSelector,
  ]);

  try {
    return (
      <ChatStateContext.Provider value={contextValue}>
        {children}
      </ChatStateContext.Provider>
    );
  } catch (error) {
    if (__DEV__) console.error('ChatState: Критическая ошибка рендеринга', error);
    return <>{children}</>;
  }
});

ChatStateProviderInner.displayName = 'ChatStateProvider';

// Экспортируем как default для Expo Router
export default ChatStateProviderInner;

// Также экспортируем как named export для обратной совместимости
export const ChatStateProvider = ChatStateProviderInner;
