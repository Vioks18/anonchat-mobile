import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  InteractionManager,
  LayoutAnimation,
  Modal,
  Platform,
  RefreshControl,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  UIManager,
  View
} from 'react-native';
import ChatCard from '../components/chat/ChatCard';
import { AI_CONFIG } from '../config/ai';
import { useChats } from '../hooks/chat/useChats';
import { useAppFocus } from '../hooks/useAppFocus';
import { useAuth } from '../hooks/useAuth';
import {
  AVATAR_URL_TTL_MS,
  BATCH_HIGHLIGHT_DEBOUNCE_MS,
  LIST_BIG_DIFF_DISABLE_ANIM_THRESHOLD,
  LIST_INCREMENT_EVERY_MS,
  LIST_INCREMENT_STEP,
  LIST_INITIAL_RENDER,
  LIST_LAYOUT_ANIM_MS,
  PREFETCH_FIRST_N,
  RETRY_ON_APP_FOCUS,
  RETRY_ON_PULL_REFRESH
} from '../lib/avatar/config';
import { prefetchMany } from '../lib/avatar/prefetch';
import { resolveAvatarURL } from '../lib/avatar/resolve';
import { RootStackParamList } from '../navigation';
import { createOrGetDM } from '../services/chatApi';
import { findUserByUsername } from '../services/usernames';
import { useAvatarCache } from '../store/avatarCacheStore';
import { usePreferencesStore } from '../store/preferencesStore';
import { useUiPerfStore } from '../store/uiPerfStore';
import { ChatListItem } from '../types/chat';
import { afterInteractions, debounceMs } from '../utils/schedule';

const ROW_HEIGHT = 76;

type ChatListNavigationProp = StackNavigationProp<RootStackParamList, 'ChatList'>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListNavigationProp>();
  const { user } = useAuth();
  const themeVersion = useUiPerfStore(s => s.themeVersion);
  const reducedMotion = useUiPerfStore(s => s.reducedMotion);
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const [minRefreshTime, setMinRefreshTime] = useState(false);
  const [visibleCount, setVisibleCount] = useState(LIST_INITIAL_RENDER);
  
  const flatListRef = useRef<FlatList>(null);
  const hasAnimatedRef = useRef(false);
  const prevChatsRef = useRef<ChatListItem[]>([]);
  const pendingUnreadRows = useRef(new Set<string>()).current;
  const highlightRowsRef = useRef<Set<string>>(new Set());

  // Включаем LayoutAnimation для Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      UIManager.setLayoutAnimationEnabledExperimental?.(true);
    }
  }, []);

  const {
    chats,
    loading,
    refreshing,
    searchQuery,
    handleSearch,
    refreshChats,
    markAsRead,
  } = useChats({
    userId: user?.uid || '',
    onError: (error) => {
      Alert.alert('Ошибка', error.message);
    },
  });

  // Retry triggers for avatar loading
  const bumpRetryToken = useAvatarCache(s => s.bumpRetryToken);
  
  if (RETRY_ON_APP_FOCUS) {
    useAppFocus(() => bumpRetryToken());
  }

  // Incremental mount logic
  useEffect(() => {
    if (!chats) return;
    
    // Reset visible count on new data
    setVisibleCount(LIST_INITIAL_RENDER);
    
    // Schedule increments
    const increment = () => {
      setVisibleCount(prev => {
        const next = Math.min(prev + LIST_INCREMENT_STEP, chats.length);
        if (next < chats.length) {
          setTimeout(increment, LIST_INCREMENT_EVERY_MS);
        }
        return next;
      });
    };
    
    if (chats.length > LIST_INITIAL_RENDER) {
      setTimeout(increment, LIST_INCREMENT_EVERY_MS);
    }
  }, [chats?.length]);

  // Batched unread highlight logic
  const triggerHighlight = useCallback(
    debounceMs(() => {
      const rowsToHighlight = new Set(pendingUnreadRows);
      pendingUnreadRows.clear();
      highlightRowsRef.current = rowsToHighlight;
      
      // Force re-render of affected rows
      if (rowsToHighlight.size > 0) {
        // Small delay to ensure state update
        setTimeout(() => {
          highlightRowsRef.current.clear();
        }, 100);
      }
    }, BATCH_HIGHLIGHT_DEBOUNCE_MS),
    [pendingUnreadRows]
  );

  // Detect unread changes and queue highlights
  useEffect(() => {
    if (!chats) return;
    
    const prevChats = prevChatsRef.current;
    chats.forEach((chat, index) => {
      const prevChat = prevChats[index];
      if (prevChat && prevChat.unreadCount === 0 && chat.unreadCount > 0) {
        pendingUnreadRows.add(chat.chatId);
      }
    });
    
    if (pendingUnreadRows.size > 0) {
      triggerHighlight();
    }
    
    prevChatsRef.current = chats;
  }, [chats, triggerHighlight]);

  // Prewarm avatar cache with URL resolution and prefetch
  const prime = useAvatarCache(s => s.primeMany);
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!chats || chats.length === 0) return;
      const now = Date.now();
      const cache = useAvatarCache.getState(); // sync MMKV
      const urls: string[] = [];
      
      for (const c of chats.slice(0, 100)) {
        const id = c.chatId;
        const cached = cache.byId[id];
        
        if (cached?.resolvedUrl && cached.resolvedAt && (now - cached.resolvedAt) < AVATAR_URL_TTL_MS) {
          urls.push(cached.resolvedUrl);
          continue;
        }
        
        const { url, source } = await resolveAvatarURL({
          userId: id,
          avatarURL: c.avatar ?? null,
          email: null, // email not available in chat list
        });
        
        if (cancelled) return;
        if (url) urls.push(url);
        
        cache.upsert({
          uid: id,
          url: c.avatar ?? null,
          resolvedUrl: url ?? null,
          source: source,
          initials: cache.byId[id]?.initials ?? c.title?.[0]?.toUpperCase() ?? '?',
          color: cache.byId[id]?.color ?? '#4F46E5',
          updatedAt: now,
          resolvedAt: now,
        });
      }
      
      await prefetchMany(urls, PREFETCH_FIRST_N);
    })();
    
    return () => { cancelled = true; };
  }, [chats]);

  // Обработка нажатия на чат
  const handleChatPress = useCallback(async (item: ChatListItem) => {
    // Сохраняем последний открытый чат
    usePreferencesStore.getState().setLastOpenChatId(item.chatId);
    
    // Отмечаем как прочитанный
    await markAsRead(item.chatId);
    
    // Навигация к чату
    navigation.navigate('Chat', {
      chatId: item.chatId,
      title: item.title,
    });
  }, [navigation, markAsRead]);

  // Создание нового чата
  const handleCreateChat = useCallback(async () => {
    if (!searchUsername.trim() || !user?.uid) {
      Alert.alert('Ошибка', 'Введите username пользователя');
      return;
    }

    try {
      setCreatingChat(true);
      
      // Ищем пользователя по username
      const targetUser = await findUserByUsername(searchUsername.trim());
      if (!targetUser) {
        Alert.alert('Ошибка', 'Пользователь не найден');
        return;
      }

      // Создаем или получаем DM
      const chatId = await createOrGetDM(user.uid, targetUser.uid);
      
      // Закрываем модал и очищаем поле
      setShowCreateModal(false);
      setSearchUsername('');
      
      // Навигация к созданному чату
      navigation.navigate('Chat', {
        chatId,
        title: targetUser.displayName || targetUser.username || 'Пользователь',
      });
    } catch (error) {
      Alert.alert('Ошибка', error instanceof Error ? error.message : 'Не удалось создать чат');
    } finally {
      setCreatingChat(false);
    }
  }, [searchUsername, user?.uid, navigation]);

  // Переключение поиска с анимацией
  const toggleSearch = useCallback(() => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setShowSearch(!showSearch);
  }, [showSearch]);

  // Улучшенный pull-to-refresh с минимальным временем
  const handleRefresh = useCallback(async () => {
    const startTime = Date.now();
    setMinRefreshTime(true);
    
    await refreshChats();
    
    // Bump retry token for avatar retries
    if (RETRY_ON_PULL_REFRESH) {
      bumpRetryToken();
    }
    
    // Минимальное время показа спиннера (300ms)
    const elapsed = Date.now() - startTime;
    if (elapsed < 300) {
      setTimeout(() => setMinRefreshTime(false), 300 - elapsed);
    } else {
      setMinRefreshTime(false);
    }
  }, [refreshChats, bumpRetryToken]);

  // Рендер элемента списка
  const renderChatItem = useCallback(({ item }: { item: ChatListItem }) => (
    <ChatCard 
      item={item} 
      onPress={handleChatPress} 
      shouldHighlight={highlightRowsRef.current.has(item.chatId)}
    />
  ), [handleChatPress]);

  // Получение layout для оптимизации
  const getItemLayout = useCallback((data: any, index: number) => ({
    length: ROW_HEIGHT,
    offset: ROW_HEIGHT * index,
    index,
  }), []);

  // Ключ для элементов списка
  const keyExtractor = useCallback((item: ChatListItem) => item.chatId, []);

  // Пустое состояние
  const renderEmptyState = useCallback(() => (
    <View style={styles.emptyContainer}>
      <Text style={styles.emptyTitle}>Нет чатов</Text>
      <Text style={styles.emptyText}>
        Нажмите + чтобы создать новый чат
      </Text>
    </View>
  ), []);

  // Batched list updates with smart animation
  useEffect(() => {
    if (!chats) return;
    
    const prevChats = prevChatsRef.current;
    const currentChats = chats;
    
    // Compute cheap diff size
    const lengthDiff = Math.abs(currentChats.length - prevChats.length);
    const idDiff = currentChats.slice(0, 10).filter((chat, i) => 
      prevChats[i]?.chatId !== chat.chatId
    ).length;
    const totalDiff = lengthDiff + idDiff;
    
    if (totalDiff <= LIST_BIG_DIFF_DISABLE_ANIM_THRESHOLD && !reducedMotion) {
      // Small diff: animate smoothly
      LayoutAnimation.configureNext({
        duration: LIST_LAYOUT_ANIM_MS,
        create: { type: 'easeInEaseOut', property: 'opacity' },
        update: { type: 'easeInEaseOut' },
        delete: { type: 'easeInEaseOut', property: 'opacity' },
      });
    } else if (totalDiff > LIST_BIG_DIFF_DISABLE_ANIM_THRESHOLD) {
      // Big diff: skip animation to prevent jank
      afterInteractions(() => {
        // State update happens in useChats, this is just for animation control
      });
    }
    
    prevChatsRef.current = currentChats;
  }, [chats, reducedMotion]);

  // Отложенная анимация первого рендера
  useEffect(() => {
    if (!loading && !hasAnimatedRef.current) {
      InteractionManager.runAfterInteractions(() => {
        hasAnimatedRef.current = true;
        if (!reducedMotion) {
          LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
        }
      });
    }
  }, [loading, reducedMotion]);

  // Состояние загрузки
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6c5ce7" />
        <Text style={styles.loadingText}>Загрузка чатов...</Text>
      </View>
    );
  }

  return (
    <View 
      style={styles.container}
      key={`chat-list-theme-${themeVersion}`}
    >
      {/* Верхняя панель */}
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <Text style={styles.headerTitle}>AnonChat</Text>
          {user?.username && (
            <Text style={styles.headerSubtitle}>{user.username}</Text>
          )}
        </View>
        
        <View style={styles.headerActions}>
          {AI_CONFIG.isAIConfigured && (
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => navigation.navigate('Chat', {
                chatId: 'ai-assistant',
                title: '🤖 AI Ассистент'
              })}
            >
              <Ionicons name="sparkles" size={20} color="#6c5ce7" />
            </TouchableOpacity>
          )}
          
          <TouchableOpacity
            style={styles.headerButton}
            onPress={toggleSearch}
          >
            <Ionicons 
              name={showSearch ? "close" : "search"} 
              size={20} 
              color="#fff" 
            />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.headerButton}
            onPress={() => navigation.navigate('Profile')}
          >
            <Ionicons name="person" size={20} color="#fff" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Поиск */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Поиск чатов..."
            placeholderTextColor="#888"
            value={searchQuery}
            onChangeText={handleSearch}
            autoCapitalize="none"
            autoCorrect={false}
          />
        </View>
      )}

      {/* Список чатов */}
      <FlatList
        ref={flatListRef}
        data={chats?.slice(0, visibleCount)}
        renderItem={renderChatItem}
        keyExtractor={keyExtractor}
        getItemLayout={getItemLayout}
        style={styles.chatList}
        contentContainerStyle={[
          styles.chatListContent,
          chats.length === 0 && styles.emptyListContainer
        ]}
        ListEmptyComponent={renderEmptyState}
        refreshControl={
          <RefreshControl
            refreshing={refreshing || minRefreshTime}
            onRefresh={handleRefresh}
            tintColor="#6c5ce7"
            colors={["#6c5ce7"]}
          />
        }
        // Оптимизация производительности
        windowSize={10}
        maxToRenderPerBatch={12}
        initialNumToRender={12}
        removeClippedSubviews={true}
        updateCellsBatchingPeriod={16}
        onEndReachedThreshold={0.4}
      />

      {/* FAB для создания чата */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
        activeOpacity={0.8}
      >
        <Ionicons name="add" size={24} color="#fff" />
      </TouchableOpacity>

      {/* Модальное окно создания чата */}
      <Modal
        visible={showCreateModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowCreateModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Создать чат</Text>
            <Text style={styles.modalSubtitle}>
              Введите username пользователя для поиска
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="username пользователя"
              placeholderTextColor="#888"
              value={searchUsername}
              onChangeText={setSearchUsername}
              autoCapitalize="none"
              autoCorrect={false}
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setShowCreateModal(false);
                  setSearchUsername('');
                }}
              >
                <Text style={styles.cancelButtonText}>Отмена</Text>
              </TouchableOpacity>
              
              <TouchableOpacity
                style={[styles.modalButton, styles.createButton]}
                onPress={handleCreateChat}
                disabled={creatingChat}
              >
                <Text style={styles.createButtonText}>
                  {creatingChat ? 'Создание...' : 'Создать'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  headerLeft: {
    flex: 1,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#888',
    fontFamily: 'Poppins-Regular',
    marginTop: 2,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255,255,255,0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchContainer: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: '#1a1a2e',
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  searchInput: {
    height: 40,
    backgroundColor: '#2a2a3e',
    borderRadius: 20,
    paddingHorizontal: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
  chatList: {
    flex: 1,
    backgroundColor: '#1a1a2e',
  },
  chatListContent: {
    backgroundColor: '#1a1a2e',
  },
  emptyListContainer: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#1a1a2e',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins-Regular',
    marginTop: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 16,
    fontFamily: 'Poppins-Bold',
  },
  emptyText: {
    fontSize: 16,
    color: '#888',
    textAlign: 'center',
    marginTop: 8,
    fontFamily: 'Poppins-Regular',
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a3e',
    borderRadius: 16,
    padding: 24,
    width: '85%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    textAlign: 'center',
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  modalInput: {
    height: 48,
    backgroundColor: '#1a1a2e',
    borderRadius: 8,
    paddingHorizontal: 16,
    color: '#fff',
    fontSize: 16,
    marginBottom: 24,
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  modalButton: {
    flex: 1,
    height: 48,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  createButton: {
    backgroundColor: '#6c5ce7',
  },
  cancelButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
  createButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    fontFamily: 'Poppins-Bold',
  },
});

export default ChatListScreen;
