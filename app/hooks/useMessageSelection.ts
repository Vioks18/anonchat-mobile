import { Message } from '../types/message';

/**
 * Методы для мульти-выбора сообщений
 */

export interface MessageSelectionMethods {
  enterSelection: (id: string) => void;
  toggleSelection: (id: string) => void;
  clearSelection: () => void;
  pruneSelection: () => void;
  isSelected: (id: string) => boolean;
  getSelectedCount: () => number;
  removeSelectedMessages: () => void;
}

export const createMessageSelectionMethods = (
  set: any,
  get: any
): MessageSelectionMethods => ({
  enterSelection: (id: string) => {
    try {
      if (!id || typeof id !== 'string') {
        if (__DEV__) console.warn('enterSelection: Невалидный ID для входа в выбор');
        return;
      }
      set((state: any) => {
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
      set((state: any) => {
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
      set((s: any) => {
        const ids = new Set(s.messages.map((m: Message) => m.id));
        const next = new Set<string>();
        s.selectedIds.forEach((id: string) => { 
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
      const newMessages = state.messages.filter((msg: Message) => !state.selectedIds.has(msg.id));
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
});
