import React from 'react';
import { create } from 'zustand';
import { Message } from '../types/message';

interface MessageStore {
  messages: Message[];
  selectedMessages: string[]; // Новое состояние для мульти-выбора
  addMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  updateMessage: (id: string, partial: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  addReaction: (messageId: string, reaction: string) => void;
  removeReaction: (messageId: string, reaction: string) => void;
  // Методы для мульти-выбора
  toggleMessageSelection: (messageId: string) => void;
  clearMessageSelection: () => void;
  selectAllMessages: () => void;
  removeSelectedMessages: () => void;
  reset: () => void;
  // Селекторы для оптимизации
  getMessageById: (id: string) => Message | undefined;
  getMessagesBySender: (sender: "me" | "other") => Message[];
  getMessagesWithReactions: () => Message[];
  getMessagesByStatus: (status: Message["status"]) => Message[];
  getMessageCount: () => number;
  getLatestMessage: () => Message | undefined;
}

// Инициализируем с пустым массивом
const initialMessages: Message[] = [];

// Безопасная валидация сообщения
const validateMessage = (text: string): boolean => {
  try {
    return typeof text === 'string' && text.trim().length > 0;
  } catch (error) {
    console.error('validateMessage: Ошибка валидации', error);
    return false;
  }
};

// Безопасная генерация ID
const generateId = (): string => {
  try {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  } catch (error) {
    console.error('generateId: Ошибка генерации ID', error);
    return Date.now().toString();
  }
};

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: initialMessages,
  selectedMessages: [],
  
  addMessage: (text: string) => {
    try {
      const newMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: "me",
        timestamp: Date.now(),
        status: "sending",
        reactions: [],
      };
      
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
      
      // Имитация отправки
      setTimeout(() => {
        set((state) => ({
          messages: state.messages.map((msg) =>
            msg.id === newMessage.id ? { ...msg, status: "sent" } : msg
          )
        }));
        
        setTimeout(() => {
          set((state) => ({
            messages: state.messages.map((msg) =>
              msg.id === newMessage.id ? { ...msg, status: "delivered" } : msg
            )
          }));
          
          setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((msg) =>
                msg.id === newMessage.id ? { ...msg, status: "read" } : msg
              )
            }));
          }, 1000);
        }, 500);
      }, 1000);
      
      if (__DEV__) { /* console.log('useMessageStore: Сообщение добавлено', text); */ }
    } catch (error) {
      console.error('useMessageStore: Ошибка добавления сообщения', error);
    }
  },

  addBotMessage: (text: string) => {
    try {
      if (!validateMessage(text)) {
if (__DEV__) console.warn('addBotMessage: Невалидный текст сообщения');
        return;
      }

      const newMessage: Message = {
        id: `bot_${generateId()}`,
        text: text.trim(),
        sender: "other",
        timestamp: Date.now(),
        status: "sent",
        reactions: [],
      };
      
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
      
      if (__DEV__) { /* console.log('addBotMessage: Сообщение бота добавлено', newMessage.id); */ }
    } catch (error) {
      console.error('addBotMessage: Ошибка добавления сообщения бота', error);
    }
  },
  
  updateMessage: (id: string, partial: Partial<Message>) => {
    try {
      if (!id || typeof id !== 'string') {
if (__DEV__) console.warn('updateMessage: Невалидный ID сообщения');
        return;
      }

      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === id ? { ...msg, ...partial } : msg
        )
      }));
      
      if (__DEV__) { /* console.log('updateMessage: Сообщение обновлено', id); */ }
    } catch (error) {
      console.error('updateMessage: Ошибка обновления сообщения', error);
    }
  },
  
  removeMessage: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
if (__DEV__) console.warn('removeMessage: Невалидный ID сообщения');
        return;
      }

      set((state) => ({
        messages: state.messages.filter(msg => msg.id !== id)
      }));
      
      if (__DEV__) { /* console.log('removeMessage: Сообщение удалено', id); */ }
    } catch (error) {
      console.error('removeMessage: Ошибка удаления сообщения', error);
    }
  },
  
  addReaction: (messageId: string, reaction: string) => {
    try {
      if (!messageId || typeof messageId !== 'string') {
if (__DEV__) console.warn('addReaction: Невалидный ID сообщения');
        return;
      }

      if (!reaction || typeof reaction !== 'string') {
if (__DEV__) console.warn('addReaction: Невалидная реакция');
        return;
      }

      set((state) => ({
        messages: state.messages.map(msg => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            
            // Проверяем, есть ли уже такая реакция
            const hasReaction = reactions.includes(reaction);
            
            if (hasReaction) {
              // Если реакция уже есть, убираем её (toggle)
              const newReactions = reactions.filter(r => r !== reaction);
              return { ...msg, reactions: newReactions };
            } else {
              // Если реакции нет, убираем ВСЕ старые реакции и добавляем новую
              // Один пользователь = одна реакция на сообщение
              return { ...msg, reactions: [reaction] };
            }
          }
          return msg;
        })
      }));
      
      if (__DEV__) console.log('addReaction: Реакция переключена', messageId, reaction);
    } catch (error) {
      console.error('addReaction: Ошибка добавления реакции', error);
    }
  },

  removeReaction: (messageId: string, reaction: string) => {
    try {
      if (!messageId || typeof messageId !== 'string') {
if (__DEV__) console.warn('removeReaction: Невалидный ID сообщения');
        return;
      }

      if (!reaction || typeof reaction !== 'string') {
if (__DEV__) console.warn('removeReaction: Невалидная реакция');
        return;
      }

      set((state) => ({
        messages: state.messages.map(msg => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            const newReactions = reactions.filter(r => r !== reaction);
            return { ...msg, reactions: newReactions };
          }
          return msg;
        })
      }));
      
      if (__DEV__) { /* console.log('removeReaction: Реакция удалена', messageId, reaction); */ }
    } catch (error) {
      console.error('removeReaction: Ошибка удаления реакции', error);
    }
  },
  
  toggleMessageSelection: (messageId: string) => {
    try {
      if (!messageId || typeof messageId !== 'string') {
if (__DEV__) console.warn('toggleMessageSelection: Невалидный ID сообщения');
        return;
      }

      set((state) => {
        const isSelected = state.selectedMessages.includes(messageId);
        const newSelectedMessages = isSelected
          ? state.selectedMessages.filter(id => id !== messageId)
          : [...state.selectedMessages, messageId];
        
        return { selectedMessages: newSelectedMessages };
      });
      
      if (__DEV__) console.log('toggleMessageSelection: Выбор переключен', messageId);
    } catch (error) {
      console.error('toggleMessageSelection: Ошибка переключения выбора', error);
    }
  },

  clearMessageSelection: () => {
    try {
      set({ selectedMessages: [] });
      if (__DEV__) console.log('clearMessageSelection: Выбор очищен');
    } catch (error) {
      console.error('clearMessageSelection: Ошибка очистки выбора', error);
    }
  },

  selectAllMessages: () => {
    try {
      const state = get();
      const allMessageIds = state.messages.map(msg => msg.id);
      set({ selectedMessages: allMessageIds });
      if (__DEV__) console.log('selectAllMessages: Выбраны все сообщения');
    } catch (error) {
      console.error('selectAllMessages: Ошибка выбора всех сообщений', error);
    }
  },

  removeSelectedMessages: () => {
    try {
      const state = get();
      const newMessages = state.messages.filter(msg => !state.selectedMessages.includes(msg.id));
      set({ 
        messages: newMessages,
        selectedMessages: [] // Очищаем выбор после удаления
      });
      if (__DEV__) console.log('removeSelectedMessages: Удалены выбранные сообщения');
    } catch (error) {
      console.error('removeSelectedMessages: Ошибка удаления выбранных сообщений', error);
    }
  },

  reset: () => {
    try {
      set({ messages: initialMessages, selectedMessages: [] });
if (__DEV__) console.log('reset: Store сброшен');
    } catch (error) {
      console.error('reset: Ошибка сброса store', error);
    }
  },

  // Оптимизированные селекторы с обработкой ошибок
  getMessageById: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
if (__DEV__) console.warn('getMessageById: Невалидный ID');
        return undefined;
      }

      const state = get();
      return state.messages.find(msg => msg.id === id);
    } catch (error) {
      console.error('getMessageById: Ошибка получения сообщения', error);
      return undefined;
    }
  },

  getMessagesBySender: (sender: "me" | "other") => {
    try {
      if (!sender || (sender !== "me" && sender !== "other")) {
if (__DEV__) console.warn('getMessagesBySender: Невалидный отправитель');
        return [];
      }

      const state = get();
      return state.messages.filter(msg => msg.sender === sender);
    } catch (error) {
      console.error('getMessagesBySender: Ошибка получения сообщений', error);
      return [];
    }
  },

  getMessagesWithReactions: () => {
    try {
      const state = get();
      return state.messages.filter(msg => msg.reactions && msg.reactions.length > 0);
    } catch (error) {
      console.error('getMessagesWithReactions: Ошибка получения сообщений с реакциями', error);
      return [];
    }
  },

  getMessagesByStatus: (status: Message["status"]) => {
    try {
      if (status && !["sending", "sent", "delivered", "read"].includes(status)) {
if (__DEV__) console.warn('getMessagesByStatus: Невалидный статус');
        return [];
      }

      const state = get();
      return state.messages.filter(msg => msg.status === status);
    } catch (error) {
      console.error('getMessagesByStatus: Ошибка получения сообщений по статусу', error);
      return [];
    }
  },

  getMessageCount: () => {
    try {
      const state = get();
      return state.messages.length;
    } catch (error) {
      console.error('getMessageCount: Ошибка подсчета сообщений', error);
      return 0;
    }
  },

  getLatestMessage: () => {
    try {
      const state = get();
      return state.messages[state.messages.length - 1];
    } catch (error) {
      console.error('getLatestMessage: Ошибка получения последнего сообщения', error);
      return undefined;
    }
  },
}));

// Хуки для оптимизированного доступа к данным
export const useMessageSelectors = () => {
  try {
    const store = useMessageStore();
    
    // Мемоизированные селекторы для сложных операций
    const memoizedSelectors = React.useMemo(() => ({
      getMessageById: (id: string) => store.getMessageById(id),
      getMessagesBySender: (sender: "me" | "other") => store.getMessagesBySender(sender),
      getMessagesWithReactions: () => store.getMessagesWithReactions(),
      getMessagesByStatus: (status: Message["status"]) => store.getMessagesByStatus(status),
      getMessageCount: () => store.getMessageCount(),
      getLatestMessage: () => store.getLatestMessage(),
    }), [store]);
    
    return memoizedSelectors;
  } catch (error) {
    console.error('useMessageSelectors: Ошибка создания селекторов', error);
    return {
      getMessageById: () => undefined,
      getMessagesBySender: () => [],
      getMessagesWithReactions: () => [],
      getMessagesByStatus: () => [],
      getMessageCount: () => 0,
      getLatestMessage: () => undefined,
    };
  }
}; 

// Default export для Expo Router
export default useMessageStore; 