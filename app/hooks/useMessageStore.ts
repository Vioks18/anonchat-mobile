import { create } from 'zustand';

// Сохраняем существующую структуру сообщений
interface Message {
  id: string;
  text: string;
  sender: "me" | "other";
  timestamp: number;
  status?: "sending" | "sent" | "delivered" | "error";
  reactions?: string[];
  replyTo?: string;
  editedAt?: number;
  deletedAt?: number;
}

interface MessageStore {
  messages: Message[];
  addMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  updateMessage: (id: string, partial: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  addReaction: (messageId: string, reaction: string) => void;
  reset: () => void;
  // Селекторы для оптимизации
  getMessageById: (id: string) => Message | undefined;
  getMessagesBySender: (sender: "me" | "other") => Message[];
  getMessagesWithReactions: () => Message[];
  getMessagesByStatus: (status: Message["status"]) => Message[];
  getMessageCount: () => number;
  getLatestMessage: () => Message | undefined;
}

// Инициализируем с пустым массивом сообщений
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
  
  addMessage: (text: string) => {
    try {
      if (!validateMessage(text)) {
        console.warn('addMessage: Невалидный текст сообщения');
        return;
      }

      const newMessage: Message = {
        id: generateId(),
        text: text.trim(),
        sender: "me",
        timestamp: Date.now(),
        status: "sent", // Сразу "sent" для простоты
      };
      
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
      
      console.log('addMessage: Сообщение добавлено', newMessage.id);
    } catch (error) {
      console.error('addMessage: Ошибка добавления сообщения', error);
    }
  },

  addBotMessage: (text: string) => {
    try {
      if (!validateMessage(text)) {
        console.warn('addBotMessage: Невалидный текст сообщения');
        return;
      }

      const newMessage: Message = {
        id: `bot_${generateId()}`,
        text: text.trim(),
        sender: "other",
        timestamp: Date.now(),
        status: "sent",
      };
      
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
      
      console.log('addBotMessage: Сообщение бота добавлено', newMessage.id);
    } catch (error) {
      console.error('addBotMessage: Ошибка добавления сообщения бота', error);
    }
  },
  
  updateMessage: (id: string, partial: Partial<Message>) => {
    try {
      if (!id || typeof id !== 'string') {
        console.warn('updateMessage: Невалидный ID сообщения');
        return;
      }

      set((state) => ({
        messages: state.messages.map(msg => 
          msg.id === id ? { ...msg, ...partial } : msg
        )
      }));
      
      console.log('updateMessage: Сообщение обновлено', id);
    } catch (error) {
      console.error('updateMessage: Ошибка обновления сообщения', error);
    }
  },
  
  removeMessage: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        console.warn('removeMessage: Невалидный ID сообщения');
        return;
      }

      set((state) => ({
        messages: state.messages.filter(msg => msg.id !== id)
      }));
      
      console.log('removeMessage: Сообщение удалено', id);
    } catch (error) {
      console.error('removeMessage: Ошибка удаления сообщения', error);
    }
  },
  
  addReaction: (messageId: string, reaction: string) => {
    try {
      if (!messageId || typeof messageId !== 'string') {
        console.warn('addReaction: Невалидный ID сообщения');
        return;
      }

      if (!reaction || typeof reaction !== 'string') {
        console.warn('addReaction: Невалидная реакция');
        return;
      }

      set((state) => ({
        messages: state.messages.map(msg => {
          if (msg.id === messageId) {
            const reactions = msg.reactions || [];
            const newReactions = reactions.includes(reaction) 
              ? reactions.filter(r => r !== reaction)
              : [...reactions, reaction];
            return { ...msg, reactions: newReactions };
          }
          return msg;
        })
      }));
      
      console.log('addReaction: Реакция добавлена', messageId, reaction);
    } catch (error) {
      console.error('addReaction: Ошибка добавления реакции', error);
    }
  },
  
  reset: () => {
    try {
      set({ messages: initialMessages });
      console.log('reset: Store сброшен');
    } catch (error) {
      console.error('reset: Ошибка сброса store', error);
    }
  },

  // Оптимизированные селекторы с обработкой ошибок
  getMessageById: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        console.warn('getMessageById: Невалидный ID');
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
        console.warn('getMessagesBySender: Невалидный отправитель');
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
      if (status && !["sending", "sent", "delivered", "error"].includes(status)) {
        console.warn('getMessagesByStatus: Невалидный статус');
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
      if (state.messages.length === 0) return undefined;
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
    
    return {
      // Мемоизированные селекторы
      getMessageById: (id: string) => store.getMessageById(id),
      getMessagesBySender: (sender: "me" | "other") => store.getMessagesBySender(sender),
      getMessagesWithReactions: () => store.getMessagesWithReactions(),
      getMessagesByStatus: (status: Message["status"]) => store.getMessagesByStatus(status),
      getMessageCount: () => store.getMessageCount(),
      getLatestMessage: () => store.getLatestMessage(),
    };
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