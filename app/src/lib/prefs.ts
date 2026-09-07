const KEY = 'kuvo.prefs';

export type Prefs = {
  language: string;
  appWallpaper: string;
  chatWallpapers: Record<string, string>;
};

const defaults: Prefs = {
  language: 'en',
  appWallpaper: '#FFFFFF',
  chatWallpapers: {},
};

const mem = new Map<string, string>();

async function backend() {
  try {
    const SecureStore = await import('expo-secure-store');
    return {
      get: (k: string) => SecureStore.getItemAsync(k),
      set: (k: string, v: string) => SecureStore.setItemAsync(k, v),
    };
  } catch {
    return {
      get: async (k: string) => mem.get(k) ?? null,
      set: async (k: string, v: string) => {
        mem.set(k, v);
      },
    };
  }
}

export async function loadPrefs(): Promise<Prefs> {
  try {
    const raw = await (await backend()).get(KEY);
    if (!raw) return { ...defaults, chatWallpapers: {} };
    const parsed = JSON.parse(raw) as Partial<Prefs>;
    return {
      language: parsed.language || 'en',
      appWallpaper: parsed.appWallpaper || '#FFFFFF',
      chatWallpapers: parsed.chatWallpapers ?? {},
    };
  } catch {
    return { ...defaults, chatWallpapers: {} };
  }
}

export async function savePrefs(prefs: Prefs): Promise<void> {
  await (await backend()).set(KEY, JSON.stringify(prefs));
}
