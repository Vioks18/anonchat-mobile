import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useEffect, useRef, useState } from 'react';
import { InteractionManager } from 'react-native';
import { AI_CONFIG } from '../../config/ai';
import { listenChats, markChatRead } from '../../services/chatApi';
import { ChatListItem } from '../../types/chat';

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
  const isSubscribedRef = useRef(false); // Флаг для предотвращения множественных подписок

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
    if (__DEV__) console.log('📱 Received chats update:', newChats.length, 'chats');
    
    // Добавляем AI чат в начало если настроен
    const chatsWithAI = AI_CONFIG.isAIConfigured 
      ? [createAIChat(), ...newChats]
      : newChats;

    if (__DEV__) console.log('🤖 Final chats with AI:', chatsWithAI.length, 'chats');

    allChatsRef.current = chatsWithAI;
    
    // Используем InteractionManager для предотвращения джиттера
    InteractionManager.runAfterInteractions(() => {
      setChats(chatsWithAI);
      updateFilteredChats(chatsWithAI, searchQuery);
      setLoading(false);
      setRefreshing(false);
      if (__DEV__) console.log('✅ Chats state updated, loading:', false);
    });
  }, [createAIChat, searchQuery, updateFilteredChats]);

  // Подписка на чаты
  const subscribeToChats = useCallback(() => {
    if (!userId) {
      if (__DEV__) console.log('❌ Cannot subscribe to chats: no userId');
      return;
    }

    // Проверяем, не подписаны ли уже
    if (isSubscribedRef.current) {
      if (__DEV__) console.log('⚠️ Already subscribed to chats, skipping');
      return;
    }

    // Отписываемся от предыдущей подписки
    if (unsubscribeRef.current) {
      if (__DEV__) console.log('🔄 Unsubscribing from previous chat subscription');
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }

    if (__DEV__) console.log('🔍 Subscribing to chats for user:', userId);
    setLoading(true);
    isSubscribedRef.current = true;

    try {
      unsubscribeRef.current = listenChats(userId, handleChatsUpdate);
      if (__DEV__) console.log('✅ Successfully subscribed to chats');
    } catch (error) {
      if (__DEV__) console.error('❌ Error subscribing to chats:', error);
      isSubscribedRef.current = false;
      if (onError && error instanceof Error) {
        onError(error);
      }
      setLoading(false);
    }
  }, [userId, handleChatsUpdate, onError]);

  // Отписка от чатов
  const unsubscribeFromChats = useCallback(() => {
    if (unsubscribeRef.current) {
      if (__DEV__) console.log('🔌 Unsubscribing from chats');
      unsubscribeRef.current();
      unsubscribeRef.current = null;
    }
    isSubscribedRef.current = false;
  }, []);

  // Обновление чатов
  const refreshChats = useCallback(async () => {
    setRefreshing(true);
    subscribeToChats(); // subscribeToChats уже отписывается внутри
  }, [subscribeToChats]);

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

  // Подписка при фокусе экрана - исправляем утечку памяти
  useFocusEffect(
    useCallback(() => {
      // Подписываемся только если userId изменился
      if (userId) {
        subscribeToChats();
      }
      
      // Возвращаем функцию отписки
      return () => {
        unsubscribeFromChats();
      };
    }, [userId]) // Убираем subscribeToChats и unsubscribeFromChats из зависимостей
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
