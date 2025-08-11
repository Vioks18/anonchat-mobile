import { Message } from '../types/message';

/**
 * Методы для работы с реакциями сообщений
 */

export interface MessageReactionMethods {
  addReaction: (messageId: string, reaction: string) => void;
  removeReaction: (messageId: string, reaction: string) => void;
}

export const createMessageReactionMethods = (
  set: any,
  get: any
): MessageReactionMethods => ({
  addReaction: (messageId: string, reaction: string) => {
    try {
      if (!messageId || typeof messageId !== 'string' || !reaction || typeof reaction !== 'string') {
        if (__DEV__) console.warn('addReaction: Невалидные параметры реакции');
        return;
      }

      set((state: any) => {
        const newMessages = state.messages.map((msg: Message) => {
          if (msg.id === messageId) {
            // Если уже есть такая реакция - убираем её (toggle)
            if (msg.reactions && msg.reactions.includes(reaction)) {
              return { ...msg, reactions: msg.reactions.filter((r: string) => r !== reaction) };
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

      set((state: any) => {
        const newMessages = state.messages.map((msg: Message) => 
          msg.id === messageId ? { ...msg, reactions: (msg.reactions || []).filter((r: string) => r !== reaction) } : msg
        );
        
        return { messages: newMessages };
      });
      
    } catch (error) {
      if (__DEV__) console.error('removeReaction: Ошибка удаления реакции', error);
    }
  },
});
