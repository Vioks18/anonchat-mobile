import { useMemo } from 'react';
import { ChatState } from '../types/chat.types';

// Мемоизированные селекторы
export const useChatSelectors = (state: ChatState) => {
  const filteredMessages = useMemo(() => {
    if (!state.searchQuery.trim()) {
      return state.messages;
    }
    
    const query = state.searchQuery.toLowerCase();
    return state.messages.filter(message => 
      message.text.toLowerCase().includes(query)
    );
  }, [state.messages, state.searchQuery]);

  const messageCount = useMemo(() => {
    return state.messages.length;
  }, [state.messages]);

  const hasSelectedMessages = useMemo(() => {
    return state.selectedMessages.size > 0;
  }, [state.selectedMessages]);

  const hasReactions = useMemo(() => {
    return state.messages.some(message => message.reactions.length > 0);
  }, [state.messages]);

  return {
    filteredMessages,
    messageCount,
    hasSelectedMessages,
    hasReactions,
  };
};
