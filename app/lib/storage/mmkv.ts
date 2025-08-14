// Unified storage with MMKV primary and AsyncStorage fallback.
// Works in Expo Dev Client (requires native build for MMKV) and gracefully
// downgrades if MMKV native module is not available.


let MMKV: typeof import('react-native-mmkv').MMKV | undefined;
try {
  // optional require to avoid runtime crash if native not linked yet
  MMKV = require('react-native-mmkv').MMKV;
} catch (_e) {
  MMKV = undefined;
}

let AsyncStorage: typeof import('@react-native-async-storage/async-storage').default | undefined;
try {
  AsyncStorage = require('@react-native-async-storage/async-storage').default;
} catch (_e) {
  AsyncStorage = undefined;
}

const mmkv = MMKV ? new MMKV({ id: 'anonchat', encryptionKey: undefined }) : undefined;

type KV = {
  getString: (k: string) => string | null;
  set: (k: string, v: string) => void;
  delete: (k: string) => void;
};

const kv: KV = mmkv
  ? {
      getString: (k) => mmkv!.getString(k) ?? null,
      set: (k, v) => mmkv!.set(k, v),
      delete: (k) => mmkv!.delete(k),
    }
  : {
      getString: (k) => {
        if (!AsyncStorage) return null;
        // synchronous shim not possible; consumers should use async adapter
        // This branch is only used by the async adapter below.
        return null;
      },
      set: (_k, _v) => {},
      delete: (_k) => {},
    };

// Async-like adapter (to use with Zustand persist or legacy async code)
export const storageAsync = {
  getItem: async (key: string): Promise<string | null> => {
    if (mmkv) return kv.getString(key);
    if (AsyncStorage) return AsyncStorage.getItem(key);
    return null;
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (mmkv) return kv.set(key, value);
    if (AsyncStorage) return AsyncStorage.setItem(key, value);
  },
  removeItem: async (key: string): Promise<void> => {
    if (mmkv) return kv.delete(key);
    if (AsyncStorage) return AsyncStorage.removeItem(key);
  },
};

// Tiny JSON helpers (safe)
export const json = {
  get<T>(key: string): T | null {
    const raw = mmkv ? kv.getString(key) : null;
    if (!raw) return null;
    try { return JSON.parse(raw) as T; } catch { return null; }
  },
  set(key: string, val: unknown) {
    try { kv.set(key, JSON.stringify(val)); } catch {}
  },
  del(key: string) { kv.delete(key); },
};

export const hasMMKV = !!mmkv;
export const storageVendor = hasMMKV ? 'mmkv' : (AsyncStorage ? 'async-storage' : 'none');

// Safe console log for debugging
if (__DEV__) {
  console.log(`📱 Storage vendor: ${storageVendor}`);
}
