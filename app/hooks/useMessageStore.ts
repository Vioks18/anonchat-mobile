import React from 'react';
import { create } from 'zustand';
import { Message } from '../types/message';

interface MessageStore {
  messages: Message[];
  replyDraft: Message | null;
  selectedIds: Set<string>; // Единый источник правды для выбора
  addMessage: (text: string) => void;
  addBotMessage: (text: string) => void;
  updateMessage: (id: string, partial: Partial<Message>) => void;
  removeMessage: (id: string) => void;
  addReaction: (messageId: string, reaction: string) => void;
  removeReaction: (messageId: string, reaction: string) => void;
  addReply: (parentId: string, text: string) => void;
  setReplyDraft: (message: Message | null) => void;
  // Методы для мульти-выбора
  enterSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  pruneSelection: () => void;
  isSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  removeSelectedMessages: () => void;
  deleteForMe: (ids: string[], userId?: string) => void;
  deleteForAll: (ids: string[]) => void;
  requestDeleteForAll: (ids: string[]) => Promise<void>;
  reset: () => void;
  // Селекторы для оптимизации
  getMessageById: (id: string) => Message | undefined;
  getMessagesBySender: (sender: "me" | "other") => Message[];
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
    if (__DEV__) console.error('validateMessage: Ошибка валидации', error);
    return false;
  }
};

// Безопасная генерация ID
const generateId = (): string => {
  try {
    return Date.now().toString() + '_' + Math.random().toString(36).substr(2, 9);
  } catch (error) {
    if (__DEV__) console.error('generateId: Ошибка генерации ID', error);
    return Date.now().toString();
  }
};

// Разбиение длинных сообщений на части
const splitLongMessage = (text: string, maxLength: number = 1000): string[] => {
  try {
    if (text.length <= maxLength) {
      return [text];
    }
    
    const parts: string[] = [];
    let currentPart = '';
    
    // Разбиваем по словам, чтобы не резать слова пополам
    const words = text.split(' ');
    
    for (const word of words) {
      // Если добавление слова превысит лимит, начинаем новую часть
      if ((currentPart + ' ' + word).trim().length > maxLength) {
        if (currentPart.trim()) {
          parts.push(currentPart.trim());
        }
        currentPart = word;
      } else {
        currentPart += (currentPart ? ' ' : '') + word;
      }
    }
    
    // Добавляем последнюю часть
    if (currentPart.trim()) {
      parts.push(currentPart.trim());
    }
    
    return parts;
  } catch (error) {
    if (__DEV__) console.error('splitLongMessage: Ошибка разбиения', error);
    return [text];
  }
};

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: initialMessages,
  replyDraft: null,
  selectedIds: new Set(),
  
  addMessage: (text: string) => {
    try {
      if (!validateMessage(text)) {
        return;
      }
      
      // Разбиваем длинные сообщения на части
      const messageParts = splitLongMessage(text, 1000);
      
      // Добавляем каждую часть как отдельное сообщение
      messageParts.forEach((part, index) => {
        const newMessage: Message = {
          id: generateId(),
          text: part,
          sender: "me",
          timestamp: Date.now() + index * 100, // Небольшая задержка между частями
          status: "sending",
        };
        
        set((state) => ({
          messages: [...state.messages, newMessage]
        }));
        
        // Имитация отправки для каждой части
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
        }, 1000 + index * 200); // Задержка между частями
      });

    } catch (error) {
      if (__DEV__) console.error('useMessageStore: Ошибка добавления сообщения', error);
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
      };
      
      set((state) => ({
        messages: [...state.messages, newMessage]
      }));
      

    } catch (error) {
      if (__DEV__) console.error('addBotMessage: Ошибка добавления сообщения бота', error);
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
      

    } catch (error) {
      if (__DEV__) console.error('updateMessage: Ошибка обновления сообщения', error);
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
      

    } catch (error) {
      if (__DEV__) console.error('removeMessage: Ошибка удаления сообщения', error);
    }
  },
  
  addReaction: (messageId: string, reaction: string) => {
    try {
      if (!messageId || typeof messageId !== 'string' || !reaction || typeof reaction !== 'string') {
        if (__DEV__) console.warn('addReaction: Невалидные параметры реакции');
        return;
      }

      set((state) => {
        const newMessages = state.messages.map(msg => {
          if (msg.id === messageId) {
            // Если уже есть такая реакция - убираем её (toggle)
            if (msg.reactions && msg.reactions.includes(reaction)) {
              return { ...msg, reactions: msg.reactions.filter(r => r !== reaction) };
            }
            // Иначе заменяем все реакции на новую (только одна реакция)
            return { ...msg, reactions: [reaction] };
          }
          return msg;
        });
        
        return { messages: newMessages };
      });
      
      
    } catch (error) {
      if (__DEV__) console.error('addReaction: Ошибка добавления реакции', error);
    }
  },

  removeReaction: (messageId: string, reaction: string) => {
    try {
      if (!messageId || typeof messageId !== 'string' || !reaction || typeof reaction !== 'string') {
        if (__DEV__) console.warn('removeReaction: Невалидные параметры реакции');
        return;
      }

      set((state) => {
        const newMessages = state.messages.map(msg => 
          msg.id === messageId ? { ...msg, reactions: (msg.reactions || []).filter((r: string) => r !== reaction) } : msg
        );
        
        return { messages: newMessages };
      });
      
      
    } catch (error) {
      if (__DEV__) console.error('removeReaction: Ошибка удаления реакции', error);
    }
  },

  addReply: (parentId: string, text: string) => {
    try {
      const parent = get().getMessageById(parentId);
      if (!parent) {
        if (__DEV__) console.warn('addReply: Родительское сообщение не найдено', parentId);
        return;
      }
      const newMessage: Message = {
        id: Date.now().toString(),
        text: text.trim(),
        sender: 'me',
        timestamp: Date.now(),
        status: 'sending',
        replyTo: parent,
      };
      set((state) => ({ messages: [...state.messages, newMessage] }));
      // эмулируем статусы как в addMessage
      setTimeout(() => {
        set((state) => ({
          messages: state.messages.map((m) => (m.id === newMessage.id ? { ...m, status: 'sent' } : m)),
        }));
        setTimeout(() => {
          set((state) => ({
            messages: state.messages.map((m) => (m.id === newMessage.id ? { ...m, status: 'delivered' } : m)),
          }));
          setTimeout(() => {
            set((state) => ({
              messages: state.messages.map((m) => (m.id === newMessage.id ? { ...m, status: 'read' } : m)),
            }));
          }, 1000);
        }, 500);
      }, 1000);
    } catch (error) {
      if (__DEV__) console.error('addReply: Ошибка создания ответа', error);
    }
  },

  setReplyDraft: (message: Message | null) => {
    try {
      set({ replyDraft: message });
    } catch (error) {
      if (__DEV__) console.error('setReplyDraft: Ошибка установки черновика ответа', error);
    }
  },
  
  enterSelection: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        if (__DEV__) console.warn('enterSelection: Невалидный ID для входа в выбор');
        return;
      }
      set((state) => {
        const newSelectedIds = new Set(state.selectedIds);
        newSelectedIds.add(id);
        return { selectedIds: newSelectedIds };
      });
    } catch (error) {
      if (__DEV__) console.error('enterSelection: Ошибка входа в выбор', error);
    }
  },

  toggleSelection: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        if (__DEV__) console.warn('toggleSelection: Невалидный ID для переключения выбора');
        return;
      }
      set((state) => {
        const newSelectedIds = new Set(state.selectedIds);
        if (newSelectedIds.has(id)) {
          newSelectedIds.delete(id);
        } else {
          newSelectedIds.add(id);
        }
        return { selectedIds: newSelectedIds };
      });
    } catch (error) {
      if (__DEV__) console.error('toggleSelection: Ошибка переключения выбора', error);
    }
  },

  clearSelection: () => {
    try {
      set({ selectedIds: new Set() });

    } catch (error) {
      if (__DEV__) console.error('clearSelection: Ошибка очистки выбора', error);
    }
  },

  pruneSelection: () => {
    try {
      set(s => {
        const ids = new Set(s.messages.map(m => m.id));
        const next = new Set<string>();
        s.selectedIds.forEach(id => { 
          if (ids.has(id)) next.add(id); 
        });
        return { selectedIds: next };
      });
    } catch (error) {
      if (__DEV__) console.error('pruneSelection: Ошибка очистки несуществующих ID', error);
    }
  },

  isSelected: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        if (__DEV__) console.warn('isSelected: Невалидный ID для проверки выбора');
        return false;
      }
      return get().selectedIds.has(id);
    } catch (error) {
      if (__DEV__) console.error('isSelected: Ошибка проверки выбора', error);
      return false;
    }
  },

  getSelectedCount: () => {
    try {
      return get().selectedIds.size;
    } catch (error) {
      if (__DEV__) console.error('getSelectedCount: Ошибка подсчета выбранных сообщений', error);
      return 0;
    }
  },

  removeSelectedMessages: () => {
    try {
      const state = get();
      const newMessages = state.messages.filter(msg => !state.selectedIds.has(msg.id));
      set({ 
        messages: newMessages,
        selectedIds: new Set() // Очищаем выбор после удаления
      });
      
      // Очищаем несуществующие ID из выбора
      get().pruneSelection();

    } catch (error) {
      if (__DEV__) console.error('removeSelectedMessages: Ошибка удаления выбранных сообщений', error);
    }
  },

  deleteForMe: (ids: string[], userId: string = "me") => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        if (__DEV__) console.warn('deleteForMe: Невалидный массив ID');
        return;
      }

      set((state) => ({
        messages: state.messages.map(msg => {
          if (ids.includes(msg.id)) {
            const deletedFor = msg.deletedFor ? { ...msg.deletedFor } : {};
            deletedFor[userId] = true;
            return { ...msg, deletedFor };
          }
          return msg;
        }),
        selectedIds: new Set() // Clear selection after deletion
      }));

    } catch (error) {
      if (__DEV__) console.error('deleteForMe: Ошибка удаления сообщений для меня', error);
    }
  },

  deleteForAll: (ids: string[]) => {
    try {
      if (!Array.isArray(ids) || ids.length === 0) {
        if (__DEV__) console.warn('deleteForAll: Невалидный массив ID');
        return;
      }

      set((state) => ({
        messages: state.messages.map(msg => {
          if (ids.includes(msg.id)) {
            return { 
              ...msg, 
              deletedForAll: true,
              reactions: undefined // Remove reactions for deleted messages
            };
          }
          return msg;
        }),
        selectedIds: new Set() // Clear selection after deletion
      }));

    } catch (error) {
      if (__DEV__) console.error('deleteForAll: Ошибка удаления сообщений для всех', error);
    }
  },

  requestDeleteForAll: async (ids: string[]) => {
    try {
      // TODO: later call server API here
      // await api.deleteMessages(ids);
      
      // For now, call deleteForAll immediately
      get().deleteForAll(ids);
      
      if (__DEV__) console.log('requestDeleteForAll: Сообщения удалены локально, позже добавить server call');
    } catch (error) {
      if (__DEV__) console.error('requestDeleteForAll: Ошибка запроса удаления на сервер', error);
      throw error;
    }
  },

  reset: () => {
    try {
      set({ messages: initialMessages, selectedIds: new Set() });
  
    } catch (error) {
      if (__DEV__) console.error('reset: Ошибка сброса store', error);
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
      if (__DEV__) console.error('getMessageById: Ошибка получения сообщения', error);
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
      if (__DEV__) console.error('getMessagesBySender: Ошибка получения сообщений', error);
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
      if (__DEV__) console.error('getMessagesByStatus: Ошибка получения сообщений по статусу', error);
      return [];
    }
  },

  getMessageCount: () => {
    try {
      const state = get();
      return state.messages.length;
    } catch (error) {
      if (__DEV__) console.error('getMessageCount: Ошибка подсчета сообщений', error);
      return 0;
    }
  },

  getLatestMessage: () => {
    try {
      const state = get();
      return state.messages[state.messages.length - 1];
    } catch (error) {
      if (__DEV__) console.error('getLatestMessage: Ошибка получения последнего сообщения', error);
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
      getMessagesByStatus: (status: Message["status"]) => store.getMessagesByStatus(status),
      getMessageCount: () => store.getMessageCount(),
      getLatestMessage: () => store.getLatestMessage(),
    }), [store]);
    
    return memoizedSelectors;
  } catch (error) {
    if (__DEV__) console.error('useMessageSelectors: Ошибка создания селекторов', error);
    return {
      getMessageById: () => undefined,
      getMessagesBySender: () => [],
      getMessagesByStatus: () => [],
      getMessageCount: () => 0,
      getLatestMessage: () => undefined,
    };
  }
}; 

// Default export для Expo Router
export default useMessageStore;
