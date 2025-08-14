import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import { storageAsync } from '../lib/storage/mmkv';

export type AvatarEntry = {
  uid: string;                // user id (or chatId for group later)
  url?: string | null;        // explicit (from profile) if any
  resolvedUrl?: string | null;// chosen final URL
  source?: 'explicit'|'gravatar'|'none';
  initials: string;           // computed initials
  color: string;              // hex from palette
  updatedAt: number;          // ms
  resolvedAt?: number;        // when URL was resolved
  failCount?: number;         // consecutive failures
  lastErrorAt?: number;       // ts of last load error
};

type State = {
  byId: Record<string, AvatarEntry>;
  order: string[];            // LRU order, most recent at end
  retryToken: number;         // increments to trigger re-renders/retries
  upsert: (entry: AvatarEntry) => void;
  get: (id: string) => AvatarEntry | undefined;
  primeMany: (entries: AvatarEntry[]) => void; // prewarm list
  clearOld: (limit?: number) => void;
  bumpRetryToken: () => void;
  resetFails: (uid: string) => void;
  markFail: (uid: string) => void;
};

const MAX = 500;

export const useAvatarCache = create<State>()(
  persist(
    (set, get) => ({
      byId: {},
      order: [],
      retryToken: 0,
      upsert: (entry) => {
        const state = get();
        const existing = state.byId[entry.uid];
        const byId = { 
          ...state.byId, 
          [entry.uid]: {
            ...existing,
            ...entry,
            // Preserve resolvedUrl unless explicitly provided
            resolvedUrl: entry.resolvedUrl ?? existing?.resolvedUrl,
            resolvedAt: entry.resolvedAt ?? existing?.resolvedAt,
            source: entry.source ?? existing?.source,
          }
        };
        const order = state.order.filter((x) => x !== entry.uid);
        order.push(entry.uid);
        while (order.length > MAX) {
          const victim = order.shift()!;
          delete byId[victim];
        }
        set({ byId, order });
      },
      get: (id) => get().byId[id],
      bumpRetryToken: () => {
        set({ retryToken: get().retryToken + 1 });
      },
      resetFails: (uid) => {
        const state = get();
        const entry = state.byId[uid];
        if (entry) {
          const byId = { ...state.byId, [uid]: { ...entry, failCount: 0, lastErrorAt: undefined } };
          set({ byId });
        }
      },
      markFail: (uid) => {
        const state = get();
        const entry = state.byId[uid];
        if (entry) {
          const failCount = (entry.failCount ?? 0) + 1;
          const byId = { ...state.byId, [uid]: { ...entry, failCount, lastErrorAt: Date.now() } };
          set({ byId });
        }
      },
      primeMany: (entries) => {
        const now = Date.now();
        entries.forEach(e => get().upsert({ ...e, updatedAt: e.updatedAt ?? now }));
      },
      clearOld: (limit = MAX) => {
        const state = get();
        const byId = { ...state.byId };
        let order = [...state.order];

        while (order.length > limit) {
          const victim = order.shift()!;
          delete byId[victim];
        }
        set({ byId, order });
      },
    }),
    {
      name: 'avatar.cache.v1',
      storage: createJSONStorage(() => storageAsync),
      version: 1,
      partialize: (s) => ({ byId: s.byId, order: s.order, retryToken: s.retryToken }),
    }
  )
);
