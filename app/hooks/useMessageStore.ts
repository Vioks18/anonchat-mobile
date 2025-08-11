import { create } from 'zustand';
import {
  INITIAL_MESSAGES,
  MAX_MESSAGE_LENGTH
} from '../constants/messageConstants';
import { Message } from '../types/message';
import { generateId, splitLongMessage, validateMessage } from '../utils/messageValidation';
import { createMessageDeletionMethods } from './useMessageDeletion';
import { createMessageReactionMethods } from './useMessageReactions';
import { createMessageReplyMethods } from './useMessageReplies';
import { createMessageSelectionMethods } from './useMessageSelection';
import { createMessageSelectorFunctions } from './useMessageSelectorFunctions';

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
  // Методы для удаления сообщений
  deleteForMe: (ids: string[], userId?: string) => void;
  deleteForAll: (ids: string[]) => void;
  requestDeleteForAll: (ids: string[]) => void;
  // Методы для мульти-выбора
  enterSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  pruneSelection: () => void;
  isSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  removeSelectedMessages: () => void;
  reset: () => void;
  // Селекторы для оптимизации
  getMessageById: (id: string) => Message | undefined;
  getMessagesBySender: (sender: "me" | "other") => Message[];
  getMessagesByStatus: (status: Message["status"]) => Message[];
  getMessageCount: () => number;
  getLatestMessage: () => Message | undefined;
}

// Инициализируем с пустым массивом

export const useMessageStore = create<MessageStore>((set, get) => ({
  messages: INITIAL_MESSAGES,
  replyDraft: null,
  selectedIds: new Set(),
  
  addMessage: (text: string) => {
    try {
      if (!validateMessage(text)) {
        return;
      }
      
      // Получаем текущий replyDraft
      const currentReplyDraft = get().replyDraft;
      
      // Разбиваем длинные сообщения на части
      const messageParts = splitLongMessage(text, MAX_MESSAGE_LENGTH);
      
      // Добавляем каждую часть как отдельное сообщение
      messageParts.forEach((part, index) => {
        const newMessage: Message = {
          id: generateId(),
          text: part,
          sender: "me",
          timestamp: Date.now() + index * 100, // Небольшая задержка между частями
          status: "sending",
          // Добавляем ссылку на родительское сообщение, если есть replyDraft
          ...(currentReplyDraft && { replyTo: currentReplyDraft }),
        };
        
        set((state) => ({
          messages: [...state.messages, newMessage]
        }));
        
        // Очищаем replyDraft после создания сообщения
        if (currentReplyDraft) {
          set((state) => ({ replyDraft: null }));
        }
        
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
  




  ...createMessageDeletionMethods(set, get),
  ...createMessageSelectionMethods(set, get),
  ...createMessageReactionMethods(set, get),
  ...createMessageReplyMethods(set, get),
  ...createMessageSelectorFunctions(get),

  reset: () => {
    try {
      set({ messages: INITIAL_MESSAGES, selectedIds: new Set() });
  
    } catch (error) {
      if (__DEV__) console.error('reset: Ошибка сброса store', error);
    }
  },


}));

// Default export для Expo Router
export default useMessageStore; 