import React, { createContext, ReactNode, useContext, useMemo, useReducer } from 'react';
import { useChatActions, useSafeDispatch } from './hooks/useChatActions';
import { useChatSelectors } from './hooks/useChatSelectors';
import { chatReducer, initialState } from './reducers/chatReducer';
import { ChatAction, ChatState, Message } from './types/chat.types';

// Контекст
interface ChatLogicContextType {
  state: ChatState;
  dispatch: React.Dispatch<ChatAction>;
  // Безопасные действия
  addMessage: (text: string) => void;
  addReaction: (messageId: string, reaction: string) => void;
  removeReaction: (messageId: string, reaction: string) => void;
  deleteMessage: (messageId: string) => void;
  setSearchQuery: (query: string) => void;
  setShowReactions: (messageId: string | null) => void;
  setSelectedMessages: (messages: Set<string>) => void;
  setReplyTo: (message: Message | null) => void;
  setShowDeleteOptions: (show: boolean) => void;
  setShowMenu: (show: boolean) => void;
  setCurrentTheme: (theme: string) => void;
  // Мемоизированные селекторы
  filteredMessages: Message[];
  messageCount: number;
  hasSelectedMessages: boolean;
  hasReactions: boolean;
}

const ChatLogicContext = createContext<ChatLogicContextType | undefined>(undefined);

// Провайдер
interface ChatLogicProviderProps {
  children: ReactNode;
  onError?: (error: Error) => void;
}

export const ChatLogicProvider: React.FC<ChatLogicProviderProps> = ({ 
  children, 
  onError 
}) => {
  const [state, dispatch] = useReducer(chatReducer, initialState);

  // Безопасная диспетчеризация
  const safeDispatch = useSafeDispatch(dispatch, onError);

  // Селекторы
  const selectors = useChatSelectors(state);

  // Действия
  const actions = useChatActions(safeDispatch, state.replyTo, onError);

  // Мемоизированный контекст
  const contextValue = useMemo<ChatLogicContextType>(() => ({
    state,
    dispatch: safeDispatch,
    ...actions,
    ...selectors,
  }), [
    state,
    safeDispatch,
    actions,
    selectors,
  ]);

  return (
    <ChatLogicContext.Provider value={contextValue}>
      {children}
    </ChatLogicContext.Provider>
  );
};

// Хук для использования контекста
export const useChatLogic = () => {
  const context = useContext(ChatLogicContext);
  if (context === undefined) {
    throw new Error('useChatLogic must be used within a ChatLogicProvider');
  }
  return context;
}; 

// Default export для Expo Router
export default ChatLogicProvider; 