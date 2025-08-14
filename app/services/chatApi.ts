import {
  addDoc,
  arrayUnion,
  collection,
  doc,
  DocumentData,
  DocumentSnapshot,
  getDoc,
  getDocs,
  onSnapshot,
  orderBy,
  query,
  QuerySnapshot,
  runTransaction,
  serverTimestamp,
  updateDoc,
  where,
  writeBatch
} from 'firebase/firestore';
import {
  Chat,
  ChatListItem,
  FirestoreChat,
  FirestoreMessage,
  FirestoreUnreadInfo,
  Message
} from '../types/chat';
import { timestampToNumber } from '../utils/time';
import { db } from './firebase';

// Коллекция для уникальных имен пользователей
const USERS_COLLECTION = 'users';
const USERNAMES_COLLECTION = 'usernames';

// Зарезервированные имена пользователей
const RESERVED_USERNAMES = [
  'admin', 'support', 'system', 'anonymous', 'me', 'you',
  'root', 'moderator', 'bot', 'help', 'info', 'contact'
];

// Regex для валидации имени пользователя
const USERNAME_REGEX = /^[a-z0-9_]{3,20}$/;

/**
 * Нормализует имя пользователя
 * @param name - исходное имя пользователя
 * @returns нормализованное имя в нижнем регистре
 * @throws Error если имя невалидно
 * 
 * Примеры:
 * normalizeUsername('@John') -> 'john'
 * normalizeUsername('User_123') -> 'user_123'
 * normalizeUsername('  Admin  ') -> Error: Reserved username
 */
export const normalizeUsername = (name: string): string => {
  // Удаляем пробелы и символ @ в начале
  const trimmed = name.trim().replace(/^@+/, '');
  
  // Приводим к нижнему регистру
  const normalized = trimmed.toLowerCase();
  
  // Проверяем длину
  if (normalized.length < 3 || normalized.length > 20) {
    throw new Error('Username must be between 3 and 20 characters');
  }
  
  // Проверяем regex
  if (!USERNAME_REGEX.test(normalized)) {
    throw new Error('Username can only contain lowercase letters, numbers, and underscores');
  }
  
  // Проверяем зарезервированные имена
  if (RESERVED_USERNAMES.includes(normalized)) {
    throw new Error('Username is reserved');
  }
  
  return normalized;
};

// Кэш сообщений в памяти
const messageCache = new Map<string, Message[]>();

// Конвертация Firestore Message в Message
const convertFirestoreMessage = (doc: DocumentSnapshot<DocumentData>, id: string): Message => {
  const data = doc.data() as FirestoreMessage;
  return {
    id,
    chatId: data.chatId,
    senderId: data.senderId,
    text: data.text,
    type: data.type,
    createdAt: timestampToNumber(data.createdAt),
    deletedFor: data.deletedFor,
    deletedForAll: data.deletedForAll,
    reactions: data.reactions
  };
};

// Конвертация Firestore Chat в Chat
const convertFirestoreChat = (doc: DocumentSnapshot<DocumentData>, id: string): Chat => {
  const data = doc.data() as FirestoreChat;
  return {
    id,
    members: data.members,
    lastMessage: data.lastMessage ? {
      text: data.lastMessage.text,
      ts: timestampToNumber(data.lastMessage.ts),
      senderId: data.lastMessage.senderId,
      type: data.lastMessage.type
    } : undefined,
    updatedAt: timestampToNumber(data.updatedAt)
  };
};

/**
 * Проверяет доступность имени пользователя
 * @param name - имя пользователя для проверки
 * @returns true если имя доступно, false если занято
 * 
 * Примеры:
 * isUsernameAvailable('john') -> true/false
 * isUsernameAvailable('@john') -> true/false (нормализуется)
 */
export const isUsernameAvailable = async (name: string): Promise<boolean> => {
  try {
    const normalized = normalizeUsername(name);
    
    // Запрос к коллекции users по uniqueName
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('uniqueName', '==', normalized), where('uid', '!=', ''));
    const snapshot = await getDocs(q);
    
    return snapshot.empty;
  } catch (error) {
    if (__DEV__) console.error('Error checking username availability:', error);
    return false;
  }
};

// Проверка уникальности имени пользователя (legacy)
export const checkUsernameAvailability = async (username: string): Promise<boolean> => {
  return isUsernameAvailable(username);
};

/**
 * Устанавливает уникальное имя пользователя
 * @param uid - ID пользователя
 * @param name - новое имя пользователя
 * @throws Error если имя невалидно или уже занято
 * 
 * Использует Firestore транзакцию для атомарности
 */
export const setUsername = async (uid: string, name: string): Promise<void> => {
  const normalized = normalizeUsername(name);
  
  await runTransaction(db, async (transaction) => {
    // Проверяем, не занято ли имя другим пользователем
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('uniqueName', '==', normalized), where('uid', '!=', uid));
    const snapshot = await getDocs(q);
    
    if (!snapshot.empty) {
      throw new Error('Username already taken');
    }
    
    // Обновляем документ пользователя
    const userRef = doc(db, USERS_COLLECTION, uid);
    transaction.update(userRef, {
      uniqueName: normalized,
      displayName: name.trim(),
      updatedAt: serverTimestamp()
    });
  });
};

// Сохранение уникального имени пользователя (legacy)
export const saveUsername = async (uid: string, username: string): Promise<boolean> => {
  try {
    await setUsername(uid, username);
    return true;
  } catch (error) {
    if (__DEV__) console.error('Error saving username:', error);
    throw error;
  }
};

/**
 * Находит пользователя по имени
 * @param name - имя пользователя (с @ или без)
 * @returns User объект или null если не найден
 * 
 * Примеры:
 * findUserByUsername('@john') -> User | null
 * findUserByUsername('JOHN') -> User | null (case-insensitive)
 */
export const findUserByUsername = async (name: string): Promise<any | null> => {
  try {
    const normalized = normalizeUsername(name);
    
    // Запрос к коллекции users по uniqueName
    const usersRef = collection(db, USERS_COLLECTION);
    const q = query(usersRef, where('uniqueName', '==', normalized), where('uid', '!=', ''));
    const snapshot = await getDocs(q);
    
    if (snapshot.empty) {
      return null;
    }
    
    // Возвращаем первого найденного пользователя
    const userDoc = snapshot.docs[0];
    return {
      uid: userDoc.id,
      ...userDoc.data()
    };
  } catch (error) {
    if (__DEV__) console.error('Error finding user by username:', error);
    return null;
  }
};

// Получение имени пользователя по UID (legacy)
export const getUsernameByUid = async (uid: string): Promise<string | null> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData.displayName || userData.uniqueName || null;
    }
    return null;
  } catch (error) {
    if (__DEV__) console.error('Error getting username by UID:', error);
    return null;
  }
};

/**
 * Генерирует временное имя пользователя
 * @param uid - ID пользователя
 * @returns временное имя в формате user-{uid.slice(0,6)}
 */
const generateTempUsername = (uid: string): string => {
  const prefix = 'user';
  const suffix = uid.slice(0, 6);
  return `${prefix}-${suffix}`;
};

/**
 * Устанавливает временное имя пользователя если его нет
 * @param uid - ID пользователя
 */
const ensureTempUsername = async (uid: string): Promise<void> => {
  try {
    const userRef = doc(db, USERS_COLLECTION, uid);
    const userDoc = await getDoc(userRef);
    
    if (userDoc.exists()) {
      const userData = userDoc.data();
      if (!userData.uniqueName) {
        // Пытаемся установить временное имя
        const tempName = generateTempUsername(uid);
        
        // Проверяем доступность
        const isAvailable = await isUsernameAvailable(tempName);
        if (isAvailable) {
          await setUsername(uid, tempName);
        } else {
          // Добавляем случайный суффикс
          const randomSuffix = Math.random().toString(36).substring(2, 6);
          const fallbackName = `${tempName}-${randomSuffix}`;
          await setUsername(uid, fallbackName);
        }
      }
    }
  } catch (error) {
    if (__DEV__) console.error('Error ensuring temp username:', error);
  }
};

// Анонимная авторизация
export const ensureAnonSignIn = async (): Promise<any> => {
  // Эта функция будет вызвана из useAuth
  return null;
};

// Создание или получение DM
export const createOrGetDM = async (currentUid: string, otherUid: string): Promise<string> => {
  try {
    // Проверяем, существует ли уже чат между этими пользователями
    const chatsRef = collection(db, 'chats');
    const q = query(
      chatsRef,
      where('members', 'array-contains', currentUid)
    );
    
    const querySnapshot = await getDocs(q);
    let existingChatId: string | null = null;
    
    querySnapshot.forEach((doc: DocumentSnapshot<DocumentData>) => {
      const chat = doc.data() as FirestoreChat;
      if (chat.members.includes(otherUid) && chat.members.length === 2) {
        existingChatId = doc.id;
      }
    });
    
    if (existingChatId) {
      return existingChatId;
    }
    
    // Создаем новый чат
    const newChat: FirestoreChat = {
      members: [currentUid, otherUid],
      updatedAt: serverTimestamp() as any
    };
    
    const chatRef = await addDoc(chatsRef, newChat);
    
    // Создаем записи в userChats для обоих пользователей
    const batch = writeBatch(db);
    
    batch.set(doc(db, 'userChats', currentUid, 'items', chatRef.id), {
      chatId: chatRef.id,
      unreadCount: 0,
      lastReadAt: serverTimestamp()
    });
    
    batch.set(doc(db, 'userChats', otherUid, 'items', chatRef.id), {
      chatId: chatRef.id,
      unreadCount: 0,
      lastReadAt: serverTimestamp()
    });
    
    await batch.commit();
    
    return chatRef.id;
  } catch (error) {
    if (__DEV__) console.error('Error creating/getting DM:', error);
    throw error;
  }
};

// Прослушивание чатов
export const listenChats = (
  uid: string, 
  callback: (chats: ChatListItem[]) => void
): (() => void) => {
  if (__DEV__) console.log('🔍 Starting to listen chats for user:', uid);
  
  const userChatsRef = collection(db, 'userChats', uid, 'items');
  
  return onSnapshot(userChatsRef, async (snapshot: QuerySnapshot<DocumentData>) => {
    if (__DEV__) console.log('📱 Received chats snapshot, changes:', snapshot.docChanges().length);
    
    const chatItems: ChatListItem[] = [];
    
    for (const change of snapshot.docChanges()) {
      if (change.type === 'added' || change.type === 'modified') {
        try {
          const unreadData = change.doc.data() as FirestoreUnreadInfo;
          const chatId = change.doc.id;
          
          if (__DEV__) console.log('📱 Processing chat:', chatId, 'unread:', unreadData.unreadCount);
          
          // Получаем данные чата
          const chatDoc = await getDoc(doc(db, 'chats', chatId));
          if (chatDoc.exists()) {
            const chat = convertFirestoreChat(chatDoc, chatId);
            
            // Определяем название чата (для DM это будет UID другого пользователя)
            const otherMember = chat.members.find(member => member !== uid);
            const title = otherMember || 'Unknown User';
            
            chatItems.push({
              chatId,
              title,
              lastMessageText: chat.lastMessage?.text,
              lastMessageTs: chat.lastMessage?.ts,
              unreadCount: unreadData.unreadCount
            });
            
            if (__DEV__) console.log('✅ Added chat to list:', title);
          } else {
            if (__DEV__) console.warn('⚠️ Chat document not found:', chatId);
          }
        } catch (error) {
          if (__DEV__) console.error('❌ Error processing chat change:', error);
        }
      }
    }
    
    // Сортируем по времени последнего сообщения
    chatItems.sort((a, b) => (b.lastMessageTs || 0) - (a.lastMessageTs || 0));
    
    if (__DEV__) console.log('📱 Final chat list:', chatItems.length, 'chats');
    
    callback(chatItems);
  }, (error) => {
    if (__DEV__) console.error('❌ Error listening chats:', error);
    // Вызываем callback с пустым массивом при ошибке
    callback([]);
  });
};

// Прослушивание сообщений
export const listenMessages = (
  chatId: string,
  currentUid: string,
  callback: (messages: Message[]) => void
): (() => void) => {
  const messagesRef = collection(db, 'chats', chatId, 'messages');
  const q = query(messagesRef, orderBy('createdAt', 'asc'));
  
  return onSnapshot(q, (snapshot: QuerySnapshot<DocumentData>) => {
    const messages: Message[] = [];
    
    snapshot.forEach((doc: DocumentSnapshot<DocumentData>) => {
      const message = convertFirestoreMessage(doc, doc.id);
      
      // Фильтруем удаленные сообщения
      if (message.deletedForAll || message.deletedFor?.includes(currentUid)) {
        return;
      }
      
      messages.push(message);
    });
    
    // Обновляем кэш
    messageCache.set(chatId, messages);
    
    callback(messages);
  });
};

// Отправка сообщения
export const sendMessage = async (
  chatId: string, 
  text: string, 
  senderId: string
): Promise<void> => {
  try {
    const batch = writeBatch(db);
    
    // Добавляем сообщение
    const messageRef = doc(collection(db, 'chats', chatId, 'messages'));
    const message: FirestoreMessage = {
      id: messageRef.id,
      chatId,
      senderId,
      text,
      type: 'text',
      createdAt: serverTimestamp() as any
    };
    
    batch.set(messageRef, message);
    
    // Обновляем последнее сообщение в чате
    const chatRef = doc(db, 'chats', chatId);
    batch.update(chatRef, {
      lastMessage: {
        text,
        ts: serverTimestamp(),
        senderId,
        type: 'text'
      },
      updatedAt: serverTimestamp()
    });
    
    // Увеличиваем счетчик непрочитанных для других участников
    const chatDoc = await getDoc(chatRef);
    if (chatDoc.exists()) {
      const chat = chatDoc.data() as FirestoreChat;
      const otherMembers = chat.members.filter(member => member !== senderId);
      
      for (const memberId of otherMembers) {
        const userChatRef = doc(db, 'userChats', memberId, 'items', chatId);
        batch.update(userChatRef, {
          unreadCount: increment(1)
        });
      }
    }
    
    await batch.commit();
  } catch (error) {
    if (__DEV__) console.error('Error sending message:', error);
    throw error;
  }
};

// Отметить чат как прочитанный
export const markChatRead = async (chatId: string, uid: string): Promise<void> => {
  try {
    const userChatRef = doc(db, 'userChats', uid, 'items', chatId);
    await updateDoc(userChatRef, {
      unreadCount: 0,
      lastReadAt: serverTimestamp()
    });
  } catch (error) {
    if (__DEV__) console.error('Error marking chat as read:', error);
    throw error;
  }
};

// Удалить сообщение для себя
export const deleteForMe = async (
  chatId: string, 
  messageId: string, 
  uid: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    await updateDoc(messageRef, {
      deletedFor: arrayUnion(uid)
    });
  } catch (error) {
    if (__DEV__) console.error('Error deleting message for me:', error);
    throw error;
  }
};

// Удалить сообщение для всех
export const deleteForAll = async (
  chatId: string, 
  messageId: string, 
  uid: string
): Promise<void> => {
  try {
    const messageRef = doc(db, 'chats', chatId, 'messages', messageId);
    const messageDoc = await getDoc(messageRef);
    
    if (!messageDoc.exists()) {
      throw new Error('Message not found');
    }
    
    const message = messageDoc.data() as FirestoreMessage;
    
    // Проверяем, что пользователь является отправителем
    if (message.senderId !== uid) {
      throw new Error('Only message sender can delete for all');
    }
    
    // Проверяем, что прошло не более 2 часов
    const messageTime = timestampToNumber(message.createdAt);
    const twoHoursAgo = Date.now() - 2 * 60 * 60 * 1000;
    
    if (messageTime < twoHoursAgo) {
      throw new Error('Message is too old to delete for all');
    }
    
    await updateDoc(messageRef, {
      deletedForAll: true
    });
  } catch (error) {
    if (__DEV__) console.error('Error deleting message for all:', error);
    throw error;
  }
};

// Вспомогательная функция для increment
const increment = (n: number) => {
  return { __increment: n };
};

/*
=== USERNAME SYSTEM USAGE EXAMPLES ===

// 1. Нормализация имени
try {
  const normalized = normalizeUsername('@John_Doe123');
  console.log(normalized); // 'john_doe123'
} catch (error) {
  console.error('Invalid username:', error.message);
}

// 2. Проверка доступности
const isAvailable = await isUsernameAvailable('john');
if (isAvailable) {
  console.log('Username is available');
} else {
  console.log('Username is taken');
}

// 3. Установка имени пользователя
try {
  await setUsername(userId, 'john_doe');
  console.log('Username set successfully');
} catch (error) {
  console.error('Failed to set username:', error.message);
}

// 4. Поиск пользователя
const user = await findUserByUsername('@john_doe');
if (user) {
  console.log('Found user:', user.displayName);
} else {
  console.log('User not found');
}

// 5. Получение имени по UID
const username = await getUsernameByUid(userId);
console.log('Username:', username);

=== VALIDATION RULES ===
- Length: 3-20 characters
- Characters: a-z, 0-9, underscore only
- Case-insensitive storage
- Reserved words: admin, support, system, etc.
- No leading/trailing spaces
- @ symbol is automatically removed

=== FIREBASE STRUCTURE ===
users/{uid}:
  - uniqueName: string (normalized)
  - displayName: string (original)
  - createdAt: timestamp
  - updatedAt: timestamp
*/


