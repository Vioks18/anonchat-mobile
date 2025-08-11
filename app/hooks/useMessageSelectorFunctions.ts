import { Message } from '../types/message';

/**
 * Функции селекторов для работы с сообщениями
 */

export interface MessageSelectorFunctions {
  getMessageById: (id: string) => Message | undefined;
  getMessagesBySender: (sender: "me" | "other") => Message[];
  getMessagesByStatus: (status: Message["status"]) => Message[];
  getMessageCount: () => number;
  getLatestMessage: () => Message | undefined;
}

export const createMessageSelectorFunctions = (
  get: any
): MessageSelectorFunctions => ({
  getMessageById: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        if (__DEV__) console.warn('getMessageById: Невалидный ID');
        return undefined;
      }

      const state = get();
      return state.messages.find((msg: Message) => msg.id === id);
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
      return state.messages.filter((msg: Message) => msg.sender === sender);
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
      return state.messages.filter((msg: Message) => msg.status === status);
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
});
