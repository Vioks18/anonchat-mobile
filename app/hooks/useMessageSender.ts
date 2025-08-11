import { useCallback } from 'react';
import { ErrorSeverity } from '../utils/errorBoundary';

/**
 * Хук для логики отправки сообщений
 */
export const useMessageSender = (
  inputText: string,
  setInputText: (text: string) => void,
  addMessage: (text: string) => void,
  onSendMessage?: (text: string) => void,
  safeExecute?: (fn: () => void, errorMessage: string, severity?: ErrorSeverity) => void,
  setReplyDraft?: (message: any) => void
) => {
  // Безопасная отправка сообщения
  const handleSendMessage = useCallback(() => {
    if (!safeExecute) {
      // Fallback если safeExecute не передан
      if (inputText.trim() === "") return;

      // Проверяем, не является ли это командой DevBot
      if (inputText.trim().startsWith('/')) {
        // Команда DevBot - передаем внешней логике
        onSendMessage?.(inputText.trim());
        setInputText("");
        return;
      }

      // Используем addMessage из store
      addMessage(inputText.trim());
      setInputText("");
      
      // Уведомляем внешнюю логику
      onSendMessage?.(inputText.trim());
      return;
    }

    safeExecute(() => {
      if (inputText.trim() === "") return;

      // Проверяем, не является ли это командой DevBot
      if (inputText.trim().startsWith('/')) {
        // Команда DevBot - передаем внешней логике
        onSendMessage?.(inputText.trim());
        setInputText("");
        return;
      }

      // Используем addMessage из store
      addMessage(inputText.trim());
      setInputText("");
      
      // Уведомляем внешнюю логику
      onSendMessage?.(inputText.trim());
      
      // Безопасный скролл вниз (при inverted={true} это scrollToOffset)
      setTimeout(() => {
        safeExecute(() => {
          // flatListRef.current?.scrollToOffset({ offset: 0, animated: true }); // This line is removed
        }, 'scrollToEnd', ErrorSeverity.LOW);
      }, 100);
    }, 'sendMessage', ErrorSeverity.MEDIUM);
  }, [inputText, onSendMessage, safeExecute, addMessage, setInputText]);

  return {
    handleSendMessage,
  };
};
