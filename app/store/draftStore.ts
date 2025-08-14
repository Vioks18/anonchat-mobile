import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageAsync } from '../lib/storage/mmkv';

// Limit drafts to avoid unbounded growth
const MAX_DRAFTS = 20;

type DraftState = {
  drafts: Record<string, string>; // chatId -> text
  setDraft: (chatId: string, text: string) => void;
  getDraft: (chatId: string) => string;
  clearDraft: (chatId: string) => void;
};

export const useDraftStore = create<DraftState>()(
  persist(
    (set, get) => ({
      drafts: {},
      setDraft: (chatId, text) => {
        const next = { ...get().drafts, [chatId]: text };
        // eviction policy: keep last MAX_DRAFTS keys by insertion order
        const keys = Object.keys(next);
        if (keys.length > MAX_DRAFTS) {
          const toDelete = keys.slice(0, keys.length - MAX_DRAFTS);
          for (const k of toDelete) delete next[k];
        }
        set({ drafts: next });
      },
      getDraft: (chatId) => get().drafts[chatId] ?? '',
      clearDraft: (chatId) => {
        const next = { ...get().drafts };
        delete next[chatId];
        set({ drafts: next });
      },
    }),
    {
      name: 'drafts.v1',
      storage: createJSONStorage(() => storageAsync),
      version: 1,
    }
  )
);
