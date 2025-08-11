import * as Clipboard from 'expo-clipboard';
import { useCallback } from 'react';
import { useMessageStore } from './useMessageStore';

/**
 * Хук для обработки действий с сообщениями
 */
export const useMessageHandlers = () => {
  // Получаем методы из store
  const getMessageById = useMessageStore((s) => s?.getMessageById || (() => undefined));
  const removeMessage = useMessageStore((s) => s?.removeMessage || (() => {}));
  const setReplyDraft = useMessageStore((s) => s?.setReplyDraft || (() => {}));
  const clearSelection = useMessageStore((s) => s?.clearSelection || (() => {}));

  // Обработчик ответа на сообщение
  const handleReply = useCallback((selectedMessageId: string | null, setSelectedMessageId: (id: string | null) => void) => {
    if (selectedMessageId) {
      const message = getMessageById(selectedMessageId);
      
      if (message) {
        setReplyDraft(message);
        setSelectedMessageId(null);
        clearSelection(); // Закрываем меню реакций
      }
    }
  }, [getMessageById, setReplyDraft, clearSelection]);

  // Обработчик копирования сообщения
  const handleCopy = useCallback(async (selectedMessageId: string | null, setSelectedMessageId: (id: string | null) => void) => {
    if (selectedMessageId) {
      const message = getMessageById(selectedMessageId);
      if (message) {
        try {
          await Clipboard.setStringAsync(message.text);
          setSelectedMessageId(null);
        } catch (error) {
          if (__DEV__) console.warn('Ошибка копирования:', error);
        }
      }
    }
  }, [getMessageById]);

  // Обработчик пересылки сообщения
  const handleForward = useCallback((setSelectedMessageId: (id: string | null) => void) => {
    if (__DEV__) console.warn('Forward: TODO - пока не реализовано');
    setSelectedMessageId(null);
  }, []);

  // Обработчик удаления сообщения
  const handleDelete = useCallback((selectedMessageId: string | null, setSelectedMessageId: (id: string | null) => void) => {
    if (selectedMessageId) {
      removeMessage(selectedMessageId);
      setSelectedMessageId(null);
      clearSelection(); // Закрываем меню реакций
    }
  }, [removeMessage, clearSelection]);

  // Обработчик копирования множественных сообщений
  const handleCopySelected = useCallback(async (selectedMessages: Set<string>) => {
    const selectedTexts = Array.from(selectedMessages).map(id => {
      const message = getMessageById(id);
      return message?.text || '';
    }).filter(text => text.length > 0);
    
    if (selectedTexts.length > 0) {
      try {
        await Clipboard.setStringAsync(selectedTexts.join('\n\n'));
        // Очищаем выбор после копирования
        clearSelection(); // Закрываем меню реакций
      } catch (error) {
        if (__DEV__) console.warn('Ошибка копирования множественных сообщений:', error);
      }
    }
  }, [getMessageById, clearSelection]);

  // Обработчик удаления множественных сообщений
  const handleDeleteSelected = useCallback((selectedMessages: Set<string>) => {
    // Удаляем только свои сообщения
    const myMessages = Array.from(selectedMessages).filter(id => {
      const message = getMessageById(id);
      return message?.sender === 'me';
    });
    
    myMessages.forEach(id => {
      removeMessage(id);
    });
    
    // Очищаем выбор после удаления
    clearSelection(); // Закрываем меню реакций
  }, [getMessageById, removeMessage, clearSelection]);

  return {
    handleReply,
    handleCopy,
    handleForward,
    handleDelete,
    handleCopySelected,
    handleDeleteSelected,
  };
};
