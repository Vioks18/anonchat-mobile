import { useCallback } from 'react';
import { useMessageHandlers } from './useMessageHandlers';

/**
 * Хук для оберток обработчиков сообщений
 */
export const useChatHandlerWrappers = (
  selectedMessageId: string | null,
  setSelectedMessageId: (id: string | null) => void,
  selectedMessages: Set<string>
) => {
  // Используем извлеченные обработчики сообщений
  const messageHandlers = useMessageHandlers();
  
  // Создаем обертки для совместимости с существующим API
  const handleReply = useCallback(() => {
    messageHandlers.handleReply(selectedMessageId, setSelectedMessageId);
  }, [messageHandlers, selectedMessageId, setSelectedMessageId]);
  
  const handleCopy = useCallback(async () => {
    await messageHandlers.handleCopy(selectedMessageId, setSelectedMessageId);
  }, [messageHandlers, selectedMessageId, setSelectedMessageId]);
  
  const handleForward = useCallback(() => {
    messageHandlers.handleForward(setSelectedMessageId);
  }, [messageHandlers, setSelectedMessageId]);
  
  const handleDelete = useCallback(() => {
    messageHandlers.handleDelete(selectedMessageId, setSelectedMessageId);
  }, [messageHandlers, selectedMessageId, setSelectedMessageId]);
  
  const handleCopySelected = useCallback(async () => {
    await messageHandlers.handleCopySelected(selectedMessages);
  }, [messageHandlers, selectedMessages]);
  
  const handleDeleteSelected = useCallback(() => {
    messageHandlers.handleDeleteSelected(selectedMessages);
  }, [messageHandlers, selectedMessages]);

  return {
    handleReply,
    handleCopy,
    handleForward,
    handleDelete,
    handleCopySelected,
    handleDeleteSelected,
  };
};
