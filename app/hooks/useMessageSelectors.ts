import React from 'react';
import { Message } from '../types/message';
import { useMessageStore } from './useMessageStore';

/**
 * Хук для оптимизированного доступа к данным сообщений
 */
export const useMessageSelectors = () => {
  try {
    const store = useMessageStore();
    
    // Мемоизированные селекторы для сложных операций
    const memoizedSelectors = React.useMemo(() => ({
      getMessageById: (id: string) => store.getMessageById(id),
      getMessagesBySender: (sender: "me" | "other") => store.getMessagesBySender(sender),
      getMessagesByStatus: (status: Message["status"]) => store.getMessagesByStatus(status),
      getMessageCount: () => store.getMessageCount(),
      getLatestMessage: () => store.getLatestMessage(),
    }), [store]);
    
    return memoizedSelectors;
  } catch (error) {
    if (__DEV__) console.error('useMessageSelectors: Ошибка создания селекторов', error);
    return {
      getMessageById: () => undefined,
      getMessagesBySender: () => [],
      getMessagesByStatus: () => [],
      getMessageCount: () => 0,
      getLatestMessage: () => undefined,
    };
  }
};
