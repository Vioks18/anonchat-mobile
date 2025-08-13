// Firebase Timestamp
export interface FirestoreTimestamp {
  seconds: number;
  nanoseconds: number;
}

// Пользователь
export interface User {
  uid: string;
  displayName?: string;
  avatarURL?: string;
  createdAt: number;
}

// Сообщение
export interface Message {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: 'text';
  createdAt: number;
  deletedFor?: string[];
  deletedForAll?: boolean;
  reactions?: { [emoji: string]: string[] };
}

// Чат
export interface Chat {
  id: string;
  members: string[];
  lastMessage?: {
    text: string;
    ts: number;
    senderId: string;
    type: 'text';
  };
  updatedAt: number;
}

// Элемент списка чатов
export interface ChatListItem {
  chatId: string;
  title: string;
  avatar?: string;
  lastMessageText?: string;
  lastMessageTs?: number;
  unreadCount: number;
}

// Непрочитанные сообщения
export interface UnreadInfo {
  chatId: string;
  unreadCount: number;
  lastReadAt: number;
}

// Firebase документы
export interface FirestoreMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  type: 'text';
  createdAt: FirestoreTimestamp;
  deletedFor?: string[];
  deletedForAll?: boolean;
  reactions?: { [emoji: string]: string[] };
}

export interface FirestoreChat {
  members: string[];
  lastMessage?: {
    text: string;
    ts: FirestoreTimestamp;
    senderId: string;
    type: 'text';
  };
  updatedAt: FirestoreTimestamp;
}

export interface FirestoreUnreadInfo {
  chatId: string;
  unreadCount: number;
  lastReadAt: FirestoreTimestamp;
}

