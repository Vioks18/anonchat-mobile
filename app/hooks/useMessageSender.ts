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
  // Оптимизированная отправка сообщения
  const handleSendMessage = useCallback(() => {
    const trimmedText = inputText.trim();
    if (trimmedText === "") return;

    // Быстрая проверка на команду DevBot
    if (trimmedText.startsWith('/')) {
      onSendMessage?.(trimmedText);
      setInputText("");
      return;
    }

    // Оптимизированная отправка без задержек
    if (!safeExecute) {
      // Fallback если safeExecute не передан
      addMessage(trimmedText);
      setInputText("");
      onSendMessage?.(trimmedText);
      return;
    }

    safeExecute(() => {
      // Быстрая отправка сообщения
      addMessage(trimmedText);
      setInputText("");
      onSendMessage?.(trimmedText);
      
      // Убираем задержку скролла - теперь это обрабатывается в ChatListWithReactions
    }, 'sendMessage', ErrorSeverity.MEDIUM);
  }, [inputText, onSendMessage, safeExecute, addMessage, setInputText]);

  return {
    handleSendMessage,
  };
};
