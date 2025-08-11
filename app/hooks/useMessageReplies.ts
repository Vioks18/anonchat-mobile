import { Message } from '../types/message';

/**
 * Методы для работы с ответами на сообщения
 */

export interface MessageReplyMethods {
  addReply: (parentId: string, text: string) => void;
  setReplyDraft: (message: Message | null) => void;
}

export const createMessageReplyMethods = (
  set: any,
  get: any
): MessageReplyMethods => ({
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
      set((state: any) => ({ messages: [...state.messages, newMessage] }));
      // эмулируем статусы как в addMessage
      setTimeout(() => {
        set((state: any) => ({
          messages: state.messages.map((m: Message) => (m.id === newMessage.id ? { ...m, status: 'sent' } : m)),
        }));
        setTimeout(() => {
          set((state: any) => ({
            messages: state.messages.map((m: Message) => (m.id === newMessage.id ? { ...m, status: 'delivered' } : m)),
          }));
          setTimeout(() => {
            set((state: any) => ({
              messages: state.messages.map((m: Message) => (m.id === newMessage.id ? { ...m, status: 'read' } : m)),
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
});
