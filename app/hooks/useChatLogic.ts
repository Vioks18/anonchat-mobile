import { useMemo } from 'react';
import { THEMES } from '../constants/themes';
import { Message } from '../types/message';
import { ErrorSeverity } from '../utils/errorBoundary';

/**
 * Хук для логики фильтрации сообщений и тем
 */
export const useChatLogic = (
  messages: Message[],
  searchQuery: string,
  currentTheme: string,
  addError: (error: Error, component: string, severity: ErrorSeverity) => void
) => {
  // Применение текущей темы с защитой
  const currentThemeData = useMemo(() => {
    try {
      return THEMES[currentTheme as keyof typeof THEMES] || THEMES.dark;
    } catch (error) {
      addError(error instanceof Error ? error : new Error(String(error)), 'ChatCore', ErrorSeverity.MEDIUM);
      return THEMES.dark;
    }
  }, [currentTheme, addError]);
  
  // Отфильтрованные сообщения с поиском и правильным порядком
  const filteredMessages = useMemo(() => {
    try {
      if (!Array.isArray(messages)) {
        addError(new Error('messages не является массивом'), 'ChatCore', ErrorSeverity.MEDIUM);
        return [];
      }

      let filtered = [...messages];

      // Применяем поиск если есть запрос
      if (searchQuery.trim().length > 0) {
        const query = searchQuery.toLowerCase().trim();
        filtered = filtered.filter(message => 
          message.text.toLowerCase().includes(query)
        );
      }

      // Возвращаем в обратном порядке для inverted FlatList
      return filtered.reverse();
    } catch (error) {
      addError(error instanceof Error ? error : new Error(String(error)), 'ChatCore', ErrorSeverity.HIGH);
      return [];
    }
  }, [messages, searchQuery, addError]);

  return {
    currentThemeData,
    filteredMessages,
  };
};
