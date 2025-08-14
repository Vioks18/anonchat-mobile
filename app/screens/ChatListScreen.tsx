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
import { useAuth } from '../hooks/useAuth';
import { RootStackParamList } from '../navigation';
import { createOrGetDM } from '../services/chatApi';
import { findUserByUsername } from '../services/usernames';
import { ChatListItem } from '../types/chat';

const ROW_HEIGHT = 76;

type ChatListNavigationProp = StackNavigationProp<RootStackParamList, 'ChatList'>;

const ChatListScreen: React.FC = () => {
  const navigation = useNavigation<ChatListNavigationProp>();
  const { user } = useAuth();
  const [showSearch, setShowSearch] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [searchUsername, setSearchUsername] = useState('');
  const [creatingChat, setCreatingChat] = useState(false);
  const [minRefreshTime, setMinRefreshTime] = useState(false);
  
  const flatListRef = useRef<FlatList>(null);
  const hasAnimatedRef = useRef(false);

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

  // Обработка нажатия на чат
  const handleChatPress = useCallback(async (item: ChatListItem) => {
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
    
    // Минимальное время показа спиннера (300ms)
    const elapsed = Date.now() - startTime;
    if (elapsed < 300) {
      setTimeout(() => setMinRefreshTime(false), 300 - elapsed);
    } else {
      setMinRefreshTime(false);
    }
  }, [refreshChats]);

  // Рендер элемента списка
  const renderChatItem = useCallback(({ item }: { item: ChatListItem }) => (
    <ChatCard item={item} onPress={handleChatPress} />
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

  // Отложенная анимация первого рендера
  useEffect(() => {
    if (!loading && !hasAnimatedRef.current) {
      InteractionManager.runAfterInteractions(() => {
        hasAnimatedRef.current = true;
        LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      });
    }
  }, [loading]);

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
    <View style={styles.container}>
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
        data={chats}
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
