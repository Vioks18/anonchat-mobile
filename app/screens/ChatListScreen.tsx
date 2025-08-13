import { Ionicons } from '@expo/vector-icons';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  Alert,
  FlatList,
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import { useAuth } from '../hooks/useAuth';
import {
  createOrGetDM,
  getUsernameByUid,
  listenChats,
  saveUsername
} from '../services/chatApi';
import { isFirebaseConfigured } from '../services/firebase';
import { findUserByUsername } from '../services/usernames';
import { ChatListItem } from '../types/chat';
import { formatChatTime } from '../utils/time';

interface ChatListScreenProps {
  navigation: any;
}

const ChatListScreen: React.FC<ChatListScreenProps> = ({ navigation }) => {
  const { user } = useAuth();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNameModal, setShowNameModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [otherUid, setOtherUid] = useState('');
  const [searchUsername, setSearchUsername] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [checkingName, setCheckingName] = useState(false);
  const [nameError, setNameError] = useState('');

  useEffect(() => {
    if (!isFirebaseConfigured()) {
      Alert.alert(
        'Backend не настроен',
        'Пожалуйста, настройте Firebase в app/services/firebase.ts'
      );
      return;
    }
  }, []);

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = listenChats(user.uid, (chatList) => {
      setChats(chatList);
      setLoading(false);
    });

    // Загружаем отображаемое имя пользователя
    const loadDisplayName = async () => {
      try {
        const savedUsername = await getUsernameByUid(user.uid);
        if (savedUsername) {
          setDisplayName(savedUsername);
        }
      } catch (error) {
        if (__DEV__) console.error('Error loading display name:', error);
      }
    };

    loadDisplayName();
    return unsubscribe;
  }, [user?.uid]);

  const handleSaveDisplayName = async () => {
    if (!user?.uid || !displayName.trim()) {
      Alert.alert('Ошибка', 'Введите отображаемое имя');
      return;
    }

    try {
      setCheckingName(true);
      setNameError('');

      // Сохраняем отображаемое имя (не уникальное)
      await saveUsername(user.uid, displayName.trim());
      setShowNameModal(false);
      Alert.alert('Успех', 'Отображаемое имя сохранено!');
    } catch (error) {
      if (__DEV__) console.error('Error saving display name:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить имя');
    } finally {
      setCheckingName(false);
    }
  };

  const handleCreateChat = async () => {
    if (!user?.uid || !searchUsername.trim()) {
      Alert.alert('Ошибка', 'Введите @username пользователя');
      return;
    }

    try {
      setLoading(true);
      
      // Ищем пользователя по @username
      const foundUser = await findUserByUsername(searchUsername.trim());
      if (!foundUser) {
        Alert.alert('Ошибка', 'Пользователь с таким @username не найден');
        return;
      }

      const chatId = await createOrGetDM(user.uid, foundUser.uid);
      setShowCreateModal(false);
      setSearchUsername('');
      
      // Переходим к чату
      router.push({
        pathname: '/chat',
        params: {
          chatId,
          title: foundUser.displayName || foundUser.username || foundUser.uid
        }
      });
    } catch (error) {
      if (__DEV__) console.error('Error creating chat:', error);
      Alert.alert('Ошибка', 'Не удалось создать чат');
    } finally {
      setLoading(false);
    }
  };

  const renderChatItem = ({ item }: { item: ChatListItem }) => (
    <TouchableOpacity
      style={styles.chatItem}
      onPress={() => router.push({
        pathname: '/chat',
        params: {
          chatId: item.chatId,
          title: item.title
        }
      })}
    >
      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {item.title.charAt(0).toUpperCase()}
        </Text>
      </View>
      
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.chatTitle}>{item.title}</Text>
          {item.lastMessageTs && (
            <Text style={styles.chatTime}>
              {formatChatTime(item.lastMessageTs)}
            </Text>
          )}
        </View>
        
        <View style={styles.chatFooter}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessageText || 'Нет сообщений'}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadText}>
                {item.unreadCount > 99 ? '99+' : item.unreadCount}
              </Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (!isFirebaseConfigured()) {
    return (
      <View style={styles.container}>
        <View style={styles.errorContainer}>
          <Ionicons name="warning-outline" size={48} color="#ff6b6b" />
          <Text style={styles.errorTitle}>Backend не настроен</Text>
          <Text style={styles.errorText}>
            Пожалуйста, настройте Firebase в app/services/firebase.ts
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
             <View style={styles.header}>
         <Text style={styles.headerTitle}>AnonChat</Text>
         <TouchableOpacity onPress={() => setShowNameModal(true)}>
           <Text style={styles.headerSubtitle}>
             {displayName ? `Имя: ${displayName}` : (user ? 'Нажмите для ввода имени' : 'Загрузка...')}
           </Text>
         </TouchableOpacity>
       </View>

      {loading ? (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Загрузка чатов...</Text>
        </View>
      ) : chats.length === 0 ? (
        <View style={styles.emptyContainer}>
          <Ionicons name="chatbubbles-outline" size={64} color="#666" />
          <Text style={styles.emptyTitle}>Нет чатов</Text>
          <Text style={styles.emptyText}>
            Нажмите + чтобы создать новый чат
          </Text>
        </View>
      ) : (
        <FlatList
          data={chats}
          renderItem={renderChatItem}
          keyExtractor={(item) => item.chatId}
          style={styles.chatList}
        />
      )}

      {/* FAB для создания чата */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => setShowCreateModal(true)}
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
              Введите @username пользователя для поиска
            </Text>
            
            <TextInput
              style={styles.modalInput}
              placeholder="@username пользователя"
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
                disabled={loading}
              >
                <Text style={styles.createButtonText}>
                  {loading ? 'Создание...' : 'Создать'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
                 </View>
       </Modal>

       {/* Модальное окно ввода имени */}
       <Modal
         visible={showNameModal}
         transparent
         animationType="slide"
         onRequestClose={() => setShowNameModal(false)}
       >
         <View style={styles.modalOverlay}>
           <View style={styles.modalContent}>
             <Text style={styles.modalTitle}>Введите имя</Text>
             <Text style={styles.modalSubtitle}>
               Как вас будут видеть другие пользователи
             </Text>
             
             <TextInput
               style={styles.modalInput}
               placeholder="Ваше отображаемое имя"
               value={displayName}
               onChangeText={(text) => {
                 setDisplayName(text);
                 setNameError('');
               }}
               autoCapitalize="words"
               autoCorrect={false}
             />
             
             {nameError ? (
               <Text style={styles.modalErrorText}>{nameError}</Text>
             ) : null}
             
             <View style={styles.modalButtons}>
               <TouchableOpacity
                 style={[styles.modalButton, styles.cancelButton]}
                 onPress={() => {
                   setShowNameModal(false);
                   setDisplayName('');
                 }}
               >
                 <Text style={styles.cancelButtonText}>Отмена</Text>
               </TouchableOpacity>
               
               <TouchableOpacity
                 style={[styles.modalButton, styles.createButton]}
                 onPress={handleSaveDisplayName}
                 disabled={checkingName}
               >
                 <Text style={styles.createButtonText}>
                   {checkingName ? 'Проверка...' : 'Сохранить'}
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
    paddingTop: 40,
    paddingHorizontal: 20,
    paddingBottom: 12,
    backgroundColor: '#16213e',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
    fontFamily: 'Poppins-Regular',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#888',
    fontFamily: 'Poppins-Regular',
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
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  errorTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#ff6b6b',
    marginTop: 16,
    fontFamily: 'Poppins-Bold',
  },
     errorText: {
     fontSize: 16,
     color: '#888',
     textAlign: 'center',
     marginTop: 8,
     fontFamily: 'Poppins-Regular',
   },
   modalErrorText: {
     fontSize: 14,
     color: '#ff6b6b',
     marginBottom: 16,
     textAlign: 'center',
     fontFamily: 'Poppins-Regular',
   },
  chatList: {
    flex: 1,
  },
  chatItem: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#2a2a3e',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  avatarText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  chatInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  chatTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  chatTime: {
    fontSize: 12,
    color: '#888',
    fontFamily: 'Poppins-Regular',
  },
  chatFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#888',
    marginRight: 8,
    fontFamily: 'Poppins-Regular',
  },
  unreadBadge: {
    backgroundColor: '#6c5ce7',
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  unreadText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
    fontFamily: 'Poppins-Bold',
  },
  fab: {
    position: 'absolute',
    bottom: 30,
    right: 30,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#6c5ce7',
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: '#6c5ce7',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#1a1a2e',
    borderRadius: 16,
    padding: 24,
    width: '80%',
    maxWidth: 400,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 8,
    fontFamily: 'Poppins-Bold',
  },
  modalSubtitle: {
    fontSize: 14,
    color: '#888',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  modalInput: {
    backgroundColor: '#2a2a3e',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    color: '#fff',
    marginBottom: 20,
    fontFamily: 'Poppins-Regular',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  modalButton: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  cancelButton: {
    backgroundColor: '#444',
  },
  createButton: {
    backgroundColor: '#6c5ce7',
  },
  cancelButtonText: {
    fontSize: 16,
    color: '#fff',
    fontFamily: 'Poppins-Regular',
  },
     createButtonText: {
     fontSize: 16,
     fontWeight: 'bold',
     color: '#fff',
     fontFamily: 'Poppins-Bold',
   },

});

export default ChatListScreen;
