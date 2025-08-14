import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageAsync } from '../lib/storage/mmkv';

type ThemeKey = 'system' | 'dark' | 'light' | 'ocean' | 'sunset' | 'forest' | 'purple' | 'neon';

type PreferencesState = {
  theme: ThemeKey;        // keep in sync with your THEMES keys
  lastOpenChatId: string | null;
  hasSeenIntro: boolean;
  setTheme: (t: ThemeKey) => void;
  setLastOpenChatId: (id: string | null) => void;
  setHasSeenIntro: (v: boolean) => void;
};

export const usePreferencesStore = create<PreferencesState>()(
  persist(
    (set) => ({
      theme: 'system',
      lastOpenChatId: null,
      hasSeenIntro: false,
      setTheme: (t) => set({ theme: t }),
      setLastOpenChatId: (id) => set({ lastOpenChatId: id }),
      setHasSeenIntro: (v) => set({ hasSeenIntro: v }),
    }),
    {
      name: 'prefs.v1',
      storage: createJSONStorage(() => storageAsync),
      version: 1,
      partialize: (s) => ({ theme: s.theme, lastOpenChatId: s.lastOpenChatId, hasSeenIntro: s.hasSeenIntro }),
    }
  )
);
