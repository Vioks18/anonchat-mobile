import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import { ChatListItem } from '../../types/chat';
import { listenChats, markChatRead } from '../../services/chatApi';
import { AI_CONFIG } from '../../config/ai';

interface UseChatsOptions {
  userId: string;
  onError?: (error: Error) => void;
}

export const useChats = ({ userId, onError }: UseChatsOptions) => {
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [filteredChats, setFilteredChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const unsubscribeRef = useRef<(() => void) | null>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const allChatsRef = useRef<ChatListItem[]>([]);

  // Создаем AI чат
  const createAIChat = useCallback((): ChatListItem => ({
    chatId: 'ai-assistant',
    title: '🤖 AI Ассистент',
    lastMessageText: 'Нажмите чтобы начать общение с AI',
    lastMessageTs: Date.now(),
    unreadCount: 0
  }), []);

  // Фильтрация чатов
  const filterChats = useCallback((allChats: ChatListItem[], query: string) => {
    if (!query.trim()) {
      return allChats;
    }

    const lowerQuery = query.toLowerCase();
    return allChats.filter(chat => 
      chat.title.toLowerCase().includes(lowerQuery) ||
      (chat.lastMessageText && chat.lastMessageText.toLowerCase().includes(lowerQuery))
    );
  }, []);

  // Обновление отфильтрованных чатов
  const updateFilteredChats = useCallback((allChats: ChatListItem[], query: string) => {
    const filtered = filterChats(allChats, query);
    setFilteredChats(filtered);
  }, [filterChats]);

  // Обработка поиска с debounce
  const handleSearch = useCallback((query: string) => {
    setSearchQuery(query);
    
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    searchTimeoutRef.current = setTimeout(() => {
      updateFilteredChats(allChatsRef.current, query);
    }, 250);
  }, [updateFilteredChats]);

  // Обработка новых чатов
  const handleChatsUpdate = useCallback((newChats: ChatListItem[]) => {
    // Добавляем AI чат в начало если настроен
    const chatsWithAI = AI_CONFIG.isAIConfigured 
      ? [createAIChat(), ...newChats]
      : newChats;

    allChatsRef.current = chatsWithAI;
    
    // Используем InteractionManager для предотвращения джиттера
    InteractionManager.runAfterInteractions(() => {
      setChats(chatsWithAI);
      updateFilteredChats(chatsWithAI, searchQuery);
      setLoading(false);
      setRefreshing(false);
    });
  }, [createAIChat, searchQuery, updateFilteredChats]);

  // Подписка на чаты
  const subscribeToChats = useCallback(() => {
    if (!userId) return;

    try {
      unsubscribeRef.current = listenChats(userId, handleChatsUpdate);
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
      setLoading(false);
    }
  }, [userId, handleChatsUpdate, onError]);

  // Отписка от чатов
  const unsubscribeFromChats = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
  }, []);

  // Обновление чатов
  const refreshChats = useCallback(async () => {
    setRefreshing(true);
    unsubscribeFromChats();
    subscribeToChats();
  }, [unsubscribeFromChats, subscribeToChats]);

  // Отметить чат как прочитанный
  const markAsRead = useCallback(async (chatId: string) => {
    try {
      await markChatRead(chatId, userId);
    } catch (error) {
      if (onError && error instanceof Error) {
        onError(error);
      }
    }
  }, [userId, onError]);

  // Очистка при размонтировании
  useEffect(() => {
    return () => {
      unsubscribeFromChats();
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [unsubscribeFromChats]);

  // Подписка при фокусе экрана
  useFocusEffect(
    useCallback(() => {
      subscribeToChats();
      return unsubscribeFromChats;
    }, [subscribeToChats, unsubscribeFromChats])
  );

  return {
    chats: filteredChats,
    loading,
    refreshing,
    searchQuery,
    handleSearch,
    refreshChats,
    markAsRead,
  };
};
