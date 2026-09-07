import { Platform } from 'react-native';

const ACCESS = 'kuvo.access';
const REFRESH = 'kuvo.refresh';

type Store = {
  get: (k: string) => Promise<string | null>;
  set: (k: string, v: string) => Promise<void>;
  del: (k: string) => Promise<void>;
};

const mem = new Map<string, string>();

const memoryStore: Store = {
  get: async (k) => mem.get(k) ?? null,
  set: async (k, v) => {
    mem.set(k, v);
  },
  del: async (k) => {
    mem.delete(k);
  },
};

const webStore: Store = {
  get: async (k) => (typeof localStorage === 'undefined' ? null : localStorage.getItem(k)),
  set: async (k, v) => {
    if (typeof localStorage !== 'undefined') localStorage.setItem(k, v);
  },
  del: async (k) => {
    if (typeof localStorage !== 'undefined') localStorage.removeItem(k);
  },
};

async function nativeStore(): Promise<Store> {
  if (Platform.OS === 'web') return webStore;
  try {
    const SecureStore = await import('expo-secure-store');
    return {
      get: (k) => SecureStore.getItemAsync(k),
      set: (k, v) => SecureStore.setItemAsync(k, v),
      del: (k) => SecureStore.deleteItemAsync(k),
    };
  } catch {
    return memoryStore;
  }
}

let storePromise: Promise<Store> | null = null;
function store() {
  if (!storePromise) storePromise = nativeStore();
  return storePromise;
}

export async function getAccessToken() {
  return (await store()).get(ACCESS);
}

export async function getRefreshToken() {
  return (await store()).get(REFRESH);
}

export async function saveTokens(access: string, refresh: string) {
  const s = await store();
  await s.set(ACCESS, access);
  await s.set(REFRESH, refresh);
}

export async function clearTokens() {
  const s = await store();
  await s.del(ACCESS);
  await s.del(REFRESH);
}
