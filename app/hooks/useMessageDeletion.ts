import { Message } from '../types/message';

/**
 * Методы для удаления сообщений
 */

export interface MessageDeletionMethods {
  deleteForMe: (ids: string[], userId?: string) => void;
  deleteForAll: (ids: string[]) => void;
  requestDeleteForAll: (ids: string[]) => void;
}

export const createMessageDeletionMethods = (
  set: any,
  get: any
): MessageDeletionMethods => ({
  deleteForMe: (ids: string[], userId: string = "me") => {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        if (__DEV__) console.warn('deleteForMe: Невалидные ID сообщений');
        return;
      }

      set((state: any) => {
        const newMessages = state.messages.map((msg: Message) => {
          if (ids.includes(msg.id)) {
            return {
              ...msg,
              deletedFor: {
                ...msg.deletedFor,
                [userId]: true as const
              }
            };
          }
          return msg;
        });
        
        return { messages: newMessages };
      });
    } catch (error) {
      if (__DEV__) console.error('deleteForMe: Ошибка удаления для меня', error);
    }
  },

  deleteForAll: (ids: string[]) => {
    try {
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        if (__DEV__) console.warn('deleteForAll: Невалидные ID сообщений');
        return;
      }

      set((state: any) => {
        const newMessages = state.messages.map((msg: Message) => {
          if (ids.includes(msg.id)) {
            return {
              ...msg,
              deletedForAll: true,
              reactions: [] // Убираем реакции при удалении для всех
            };
          }
          return msg;
        });
        
        return { messages: newMessages };
      });
    } catch (error) {
      if (__DEV__) console.error('deleteForAll: Ошибка удаления для всех', error);
    }
  },

  requestDeleteForAll: (ids: string[]) => {
    try {
      // TODO: later call server; for now call deleteForAll immediately
      get().deleteForAll(ids);
    } catch (error) {
      if (__DEV__) console.error('requestDeleteForAll: Ошибка запроса удаления для всех', error);
    }
  },
});
