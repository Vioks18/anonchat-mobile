import { useCallback } from 'react';
import { ChatAction, Message } from '../types/chat.types';

// Безопасная диспетчеризация
export const useSafeDispatch = (dispatch: React.Dispatch<ChatAction>, onError?: (error: Error) => void) => {
  return useCallback((action: ChatAction) => {
    try {
      dispatch(action);
    } catch (error) {
      if (__DEV__) console.error('ChatLogicProvider: Dispatch error', error);
      onError?.(error as Error);
    }
  }, [dispatch, onError]);
};

// Хуки для действий
export const useChatActions = (
  safeDispatch: (action: ChatAction) => void,
  replyTo: Message | null,
  onError?: (error: Error) => void
) => {
  const addMessage = useCallback((text: string) => {
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: "me",
        timestamp: Date.now(),
        status: "sending",
        reactions: [],
        replyTo: replyTo || undefined,
      };

      safeDispatch({ type: 'ADD_MESSAGE', payload: newMessage });
      safeDispatch({ type: 'SET_REPLY_TO', payload: null });

      // Имитация отправки
      setTimeout(() => {
        safeDispatch({ 
          type: 'UPDATE_MESSAGE_STATUS', 
          payload: { id: newMessage.id, status: 'sent' } 
        });
        setTimeout(() => {
          safeDispatch({ 
            type: 'UPDATE_MESSAGE_STATUS', 
            payload: { id: newMessage.id, status: 'delivered' } 
          });
          setTimeout(() => {
            safeDispatch({ 
              type: 'UPDATE_MESSAGE_STATUS', 
              payload: { id: newMessage.id, status: 'read' } 
            });
          }, 1000);
        }, 500);
      }, 1000);
    } catch (error) {
      if (__DEV__) console.error('ChatLogicProvider: addMessage error', error);
      onError?.(error as Error);
    }
  }, [replyTo, safeDispatch, onError]);

  const addReaction = useCallback((messageId: string, reaction: string) => {
    safeDispatch({ type: 'ADD_REACTION', payload: { messageId, reaction } });
  }, [safeDispatch]);

  const removeReaction = useCallback((messageId: string, reaction: string) => {
    safeDispatch({ type: 'REMOVE_REACTION', payload: { messageId, reaction } });
  }, [safeDispatch]);

  const deleteMessage = useCallback((messageId: string) => {
    safeDispatch({ type: 'DELETE_MESSAGE', payload: messageId });
  }, [safeDispatch]);

  const setSearchQuery = useCallback((query: string) => {
    safeDispatch({ type: 'SET_SEARCH_QUERY', payload: query });
  }, [safeDispatch]);

  const setShowReactions = useCallback((messageId: string | null) => {
    safeDispatch({ type: 'SET_SHOW_REACTIONS', payload: messageId });
  }, [safeDispatch]);

  const setSelectedMessages = useCallback((messages: Set<string>) => {
    safeDispatch({ type: 'SET_SELECTED_MESSAGES', payload: messages });
  }, [safeDispatch]);

  const setReplyTo = useCallback((message: Message | null) => {
    safeDispatch({ type: 'SET_REPLY_TO', payload: message });
  }, [safeDispatch]);

  const setShowDeleteOptions = useCallback((show: boolean) => {
    safeDispatch({ type: 'SET_SHOW_DELETE_OPTIONS', payload: show });
  }, [safeDispatch]);

  const setShowMenu = useCallback((show: boolean) => {
    safeDispatch({ type: 'SET_SHOW_MENU', payload: show });
  }, [safeDispatch]);

  const setCurrentTheme = useCallback((theme: string) => {
    safeDispatch({ type: 'SET_CURRENT_THEME', payload: theme });
  }, [safeDispatch]);

  return {
    addMessage,
    addReaction,
    removeReaction,
    deleteMessage,
    setSearchQuery,
    setShowReactions,
    setSelectedMessages,
    setReplyTo,
    setShowDeleteOptions,
    setShowMenu,
    setCurrentTheme,
  };
};
