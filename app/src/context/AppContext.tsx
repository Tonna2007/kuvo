import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { Alert } from 'react-native';
import { chats as seedChats } from '../data/chats';
import { campuses as seedCampuses } from '../data/campuses';
import { demoProfile, emptyProfile } from '../data/demo';
import { posts as seedPosts } from '../data/gist';
import { messages as seedMessages } from '../data/messages';
import { sheets } from '../data/sheets';
import { stories as seedStories } from '../data/gist';
import { api, mapCampus, mapConv, mapGist, mapMe, mapMsg, mapStory } from '../lib/api';
import { API_URL } from '../lib/config';
import { clearTokens, getAccessToken, saveTokens } from '../lib/session';
import { initialsFromName, usernameFromName } from '../lib/format';
import {
  navigateToContact,
  navigateToGroupInfo,
  navigateToNewChat,
  navigateToNewGroup,
  navigateToProfile,
  navigateToSetting,
  navigationRef,
} from '../navigation/ref';
import { pickChatMedia, pickDocument, pickFromGallery, pickFromGalleryFree, pickGistVideo, takePhoto, uploadMedia, type MediaKind } from '../lib/media';
import type {
  CallLogItem,
  Campus,
  Chat,
  CountryCode,
  FeedPost,
  Message,
  MessageKind,
  SheetItem,
  SheetKey,
  Story,
  UserProfile,
} from '../types';
import { loadPrefs, savePrefs, type Prefs } from '../lib/prefs';
import { setLocale } from '../i18n';

type OpenSheetOptions = {
  title?: string;
  chatId?: string;
};

type SendInput = {
  chatId: string;
  kind?: MessageKind;
  text?: string;
  imageUri?: string;
  caption?: string;
  docName?: string;
  docSize?: string;
  voiceDuration?: string;
};

type AppContextValue = {
  profile: UserProfile;
  chats: Chat[];
  messages: Message[];
  stories: Story[];
  posts: FeedPost[];
  campusList: Campus[];
  sheet: {
    key: SheetKey;
    title: string;
    items: SheetItem[];
    chatId?: string;
  } | null;
  patchProfile: (patch: Partial<UserProfile>) => void;
  setPhone: (phone: string) => void;
  setCountryCode: (code: CountryCode) => void;
  setName: (name: string) => void;
  setCampus: (campus: Campus) => void;
  setVerified: (verified: boolean) => void;
  toggleLowDataMode: () => void;
  loadDemoProfile: () => void;
  addCampus: (input: { name: string; city: string; country: 'GH' | 'NG' }) => Campus;
  createGroup: (input: { name: string; memberNames: string[]; avatarUri?: string | null }) => Promise<Chat>;
  startDirect: (username: string) => Promise<Chat>;
  muteChat: (chatId: string) => void;
  exitGroup: (chatId: string) => void;
  sendMessage: (input: SendInput) => void;
  markRead: (chatId: string) => void;
  clearChat: (chatId: string) => void;
  postGist: (text: string, imageUri?: string | null, mediaKind?: MediaKind) => Promise<void>;
  signOut: () => Promise<void>;
  language: string;
  setLanguage: (code: string) => void;
  appWallpaper: string;
  chatWallpapers: Record<string, string>;
  setAppWallpaper: (hex: string) => void;
  setChatWallpaper: (chatId: string, hex: string) => void;
  setChatAvatar: (chatId: string, avatarUri: string | null) => void;
  callLog: CallLogItem[];
  ringUser: (username: string, name: string) => Promise<void>;
  hangupCall: (username: string) => void;
  openSheet: (key: SheetKey, options?: OpenSheetOptions) => void;
  closeSheet: () => void;
  handleSheetItem: (itemId: string) => void;
  demoMode: boolean;
  requestOtp: (sms?: boolean) => Promise<void>;
  verifyOtp: (code: string) => Promise<void>;
  hydrate: () => Promise<Partial<UserProfile> | null>;
  reloadInbox: () => Promise<void>;
  loadCampuses: () => Promise<void>;
};

const AppContext = createContext<AppContextValue | null>(null);

function previewFor(message: Message): string {
  if (message.kind === 'voice') return `Voice note`;
  if (message.kind === 'video') return 'Video';
  if (message.kind === 'image') return message.caption || 'Photo';
  if (message.kind === 'document') return message.docName || 'Document';
  return message.text ?? '';
}

function campusInitials(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'UN';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [profile, setProfile] = useState<UserProfile>(emptyProfile);
  const [chats, setChats] = useState<Chat[]>(seedChats);
  const [messages, setMessages] = useState<Message[]>(seedMessages);
  const [campusList, setCampusList] = useState<Campus[]>(seedCampuses);
  const [sheet, setSheet] = useState<AppContextValue['sheet']>(null);
  const [demoMode, setDemoMode] = useState(false);
  const [posts, setPosts] = useState<FeedPost[]>(seedPosts);
  const [stories, setStories] = useState<Story[]>(seedStories);
  const [language, setLanguageState] = useState('en');
  const [appWallpaper, setAppWallpaperState] = useState('#FFFFFF');
  const [chatWallpapers, setChatWallpapers] = useState<Record<string, string>>({});
  const [callLog, setCallLog] = useState<CallLogItem[]>([]);
  const [prefsReady, setPrefsReady] = useState(false);

  useEffect(() => {
    void loadPrefs().then((p) => {
      setLanguageState(p.language);
      setLocale(p.language);
      setAppWallpaperState(p.appWallpaper);
      setChatWallpapers(p.chatWallpapers);
      setPrefsReady(true);
    });
  }, []);

  const persistPrefs = useCallback((next: Prefs) => {
    void savePrefs(next);
  }, []);

  const setLanguage = useCallback(
    (code: string) => {
      setLanguageState(code);
      setLocale(code);
      persistPrefs({ language: code, appWallpaper, chatWallpapers });
    },
    [appWallpaper, chatWallpapers, persistPrefs],
  );

  const setAppWallpaper = useCallback(
    (hex: string) => {
      setAppWallpaperState(hex);
      persistPrefs({ language, appWallpaper: hex, chatWallpapers });
    },
    [chatWallpapers, language, persistPrefs],
  );

  const setChatWallpaper = useCallback(
    (chatId: string, hex: string) => {
      setChatWallpapers((prev) => {
        const next = { ...prev, [chatId]: hex };
        persistPrefs({ language, appWallpaper, chatWallpapers: next });
        return next;
      });
    },
    [appWallpaper, language, persistPrefs],
  );

  const setChatAvatar = useCallback((chatId: string, avatarUri: string | null) => {
    setChats((prev) => prev.map((chat) => (chat.id === chatId ? { ...chat, avatarUri } : chat)));
    if (demoMode || !avatarUri) return;
    void api.setGroupPhoto(chatId, avatarUri).catch(() => undefined);
  }, [demoMode]);

  const ringUser = useCallback(async (username: string, name: string) => {
    setCallLog((prev) => [
      { id: `c-${Date.now()}`, name, username, direction: 'out', time: 'now' },
      ...prev,
    ]);
    if (demoMode) return;
    try {
      await api.startCall(username, 'ring');
    } catch {
      // ring UI still shows
    }
  }, [demoMode]);

  const hangupCall = useCallback(
    (username: string) => {
      if (!demoMode) void api.startCall(username, 'hangup').catch(() => undefined);
    },
    [demoMode],
  );

  void prefsReady;

  const loadCampuses = useCallback(async () => {
    const camps = await api.campuses();
    setCampusList(camps.campuses.map(mapCampus));
  }, []);

  const reloadInbox = useCallback(async () => {
    const [conv, gist, camps, st] = await Promise.all([
      api.conversations(),
      api.gist(),
      api.campuses(),
      api.stories().catch(() => ({ stories: [] })),
    ]);
    setChats(conv.conversations.map(mapConv));
    setPosts(gist.posts.map(mapGist));
    setCampusList(camps.campuses.map(mapCampus));
    if (st.stories?.length) setStories(st.stories.map(mapStory));
    const allMsgs: Message[] = [];
    await Promise.all(
      conv.conversations.map(async (c) => {
        const { messages: list } = await api.messages(c.id);
        allMsgs.push(...list.map(mapMsg));
      }),
    );
    setMessages(allMsgs);
  }, []);

  const hydrate = useCallback(async () => {
    try {
      const me = await api.me();
      setDemoMode(false);
      const mapped = mapMe(me);
      setProfile((prev) => ({ ...prev, ...mapped }));
      await reloadInbox();
      return mapped;
    } catch {
      return null;
    }
  }, [reloadInbox]);

  const requestOtp = useCallback(async (sms = false) => {
    await api.requestOtp(profile.countryCode, profile.phone, sms);
  }, [profile.countryCode, profile.phone]);

  const verifyOtp = useCallback(
    async (code: string) => {
      const data = await api.verifyOtp(profile.countryCode, profile.phone, code);
      await saveTokens(data.access_token, data.refresh_token);
      setDemoMode(false);
      setProfile((prev) => ({ ...prev, ...mapMe(data.user) }));
      try {
        await reloadInbox();
      } catch {
        setChats([]);
        setMessages([]);
      }
    },
    [profile.countryCode, profile.phone, reloadInbox],
  );

  const patchProfile = useCallback((patch: Partial<UserProfile>) => {
    setProfile((prev) => ({ ...prev, ...patch }));
    if (demoMode) return;
    const body: Record<string, unknown> = {};
    if (patch.name != null) body.full_name = patch.name;
    if (patch.username != null) body.username = patch.username;
    if (patch.about != null) body.about = patch.about;
    if (patch.lowDataMode != null) body.low_data_mode = patch.lowDataMode;
    if (patch.autoDownloadPhotos != null) body.auto_download_photos = patch.autoDownloadPhotos;
    if (patch.autoDownloadDocuments != null) body.auto_download_documents = patch.autoDownloadDocuments;
    if (patch.themeMode != null) body.theme_mode = patch.themeMode;
    if (patch.themeColor != null) body.theme_color = patch.themeColor;
    if (patch.wallpaper != null) body.wallpaper = patch.wallpaper;
    if (patch.showLastSeen != null) body.show_last_seen = patch.showLastSeen;
    if (patch.readReceipts != null) body.read_receipts = patch.readReceipts;
    if (patch.showCampusBadge != null) body.show_campus_badge = patch.showCampusBadge;
    if (patch.twoStep != null) body.two_step_enabled = patch.twoStep;
    if (patch.verified != null) body.verified = patch.verified ? 'verified' : 'unverified';
    if (patch.schoolEmail != null) body.school_email = patch.schoolEmail;
    if (patch.notifications != null) body.notifications = patch.notifications;
    if (patch.avatarUri !== undefined) body.avatar_key = patch.avatarUri || '';
    if (Object.keys(body).length === 0) return;
    void api.patchMe(body).then(() => {
      if (patch.avatarUri !== undefined) void reloadInbox();
    }).catch(() => undefined);
  }, [demoMode, reloadInbox]);

  const setPhone = useCallback((phone: string) => {
    setProfile((prev) => ({ ...prev, phone }));
  }, []);

  const setCountryCode = useCallback((countryCode: CountryCode) => {
    setProfile((prev) => ({ ...prev, countryCode }));
  }, []);

  const setName = useCallback((name: string) => {
    setProfile((prev) => ({
      ...prev,
      name,
      username: prev.username || usernameFromName(name),
    }));
  }, []);

  const setCampus = useCallback((campus: Campus) => {
    setProfile((prev) => ({ ...prev, campus }));
    if (!demoMode) void api.setCampus(campus.id).catch(() => undefined);
  }, [demoMode]);

  const setVerified = useCallback((verified: boolean) => {
    setProfile((prev) => ({ ...prev, verified }));
  }, []);

  const toggleLowDataMode = useCallback(() => {
    const next = !profile.lowDataMode;
    patchProfile({ lowDataMode: next });
  }, [patchProfile, profile.lowDataMode]);

  const loadDemoProfile = useCallback(() => {
    setDemoMode(true);
    setProfile(demoProfile);
    setChats(seedChats);
    setMessages(seedMessages);
    setPosts(seedPosts);
    setCampusList(seedCampuses);
    void clearTokens();
  }, []);

  const addCampus = useCallback((input: { name: string; city: string; country: 'GH' | 'NG' }) => {
    const local: Campus = {
      id: `user-${Date.now()}`,
      name: input.name.trim(),
      city: `${input.city.trim()}, ${input.country === 'GH' ? 'Ghana' : 'Nigeria'}`,
      initials: campusInitials(input.name),
    };
    setCampusList((prev) => [local, ...prev]);
    setProfile((prev) => ({ ...prev, campus: local }));
    if (!demoMode) {
      void api
        .addCampus(input.name.trim(), input.country, input.city.trim())
        .then((c) => {
          const mapped = mapCampus(c);
          setCampusList((prev) => [mapped, ...prev.filter((x) => x.id !== local.id)]);
          setProfile((prev) => ({ ...prev, campus: mapped }));
        })
        .catch(() => undefined);
    }
    return local;
  }, [demoMode]);

  const createGroup = useCallback(async (input: { name: string; memberNames: string[]; avatarUri?: string | null }) => {
    let photo = input.avatarUri ?? null;
    if (photo && !demoMode && !photo.startsWith('http')) {
      photo = await uploadMedia(photo).catch(() => photo);
    }
    if (!demoMode) {
      const mapped = mapConv(await api.createGroup(input.name.trim(), input.memberNames, photo || ''));
      if (photo) mapped.avatarUri = photo;
      setChats((prev) => [mapped, ...prev]);
      return mapped;
    }
    const members = [...input.memberNames, 'You'];
    const chat: Chat = {
      id: `group-${Date.now()}`,
      kind: 'group',
      name: input.name.trim(),
      preview: 'You created this group',
      time: 'now',
      unread: 0,
      initials: initialsFromName(input.name),
      tone: 'gold',
      avatarUri: photo,
      members,
      secondaryInitials: initialsFromName(members[0] ?? 'G'),
      secondaryTone: 'green',
    };
    setChats((prev) => [chat, ...prev]);
    return chat;
  }, [demoMode]);

  const startDirect = useCallback(
    async (username: string) => {
      const handle = username.replace(/^@/, '').trim() || 'me';
      if (!handle) throw new Error('Enter a username');
      if (demoMode) {
        const existing = chats.find(
          (chat) => chat.kind === 'direct' && chat.name.toLowerCase() === handle.toLowerCase(),
        );
        if (existing) return existing;
        const chat: Chat = {
          id: `dm-${Date.now()}`,
          kind: 'direct',
          name: handle,
          preview: 'Say hello',
          time: 'now',
          unread: 0,
          initials: initialsFromName(handle),
          tone: 'green',
        };
        setChats((prev) => [chat, ...prev]);
        return chat;
      }
      const mapped = mapConv(await api.createDirect(handle));
      setChats((prev) => [mapped, ...prev.filter((chat) => chat.id !== mapped.id)]);
      return mapped;
    },
    [chats, demoMode],
  );

  const muteChat = useCallback((chatId: string) => {
    Alert.alert('Muted', 'Notifications are off for this chat.');
    void chatId;
  }, []);

  const exitGroup = useCallback((chatId: string) => {
    setChats((prev) => prev.filter((chat) => chat.id !== chatId));
    if (!demoMode) void api.leave(chatId).catch(() => undefined);
  }, [demoMode]);

  const sendMessage = useCallback((input: SendInput) => {
    const kind = input.kind ?? 'text';
    const text =
      input.text ||
      input.caption ||
      (kind === 'image'
        ? 'Photo'
        : kind === 'video'
          ? 'Video'
          : kind === 'document'
            ? input.docName || 'Document'
            : kind === 'voice'
              ? 'Voice note'
              : '');
    const message: Message = {
      id: `m-${Date.now()}`,
      chatId: input.chatId,
      fromMe: true,
      kind,
      text: input.text,
      imageUri: input.imageUri,
      caption: input.caption,
      docName: input.docName,
      docSize: input.docSize,
      voiceDuration: input.voiceDuration,
    };
    setMessages((prev) => [...prev, message]);
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === input.chatId
          ? { ...chat, preview: `You: ${previewFor(message)}`, time: 'now', unread: 0 }
          : chat,
      ),
    );
    if (demoMode) return;
    void (async () => {
      let payload = text;
      let remoteUri = input.imageUri;
      if (input.imageUri && !input.imageUri.startsWith('http')) {
        try {
          remoteUri = await uploadMedia(
            input.imageUri,
            kind === 'video' ? 'video/mp4' : kind === 'voice' ? 'audio/mp4' : 'image/jpeg',
          );
          payload = remoteUri;
          if (kind === 'image' && input.caption) payload += `\n${input.caption}`;
          if (kind === 'document') payload += `\n${input.docName || 'Document'}\n${input.docSize || ''}`;
        } catch (err) {
          Alert.alert(
            'Media did not upload',
            err instanceof Error
              ? err.message
              : 'The phone could not reach the API on your PC. Keep the laptop awake, on the same Wi‑Fi, with go run ./cmd/api running.',
          );
          setMessages((prev) => prev.filter((item) => item.id !== message.id));
          return;
        }
      }
      if (!payload) return;
      try {
        const mapped = mapMsg(await api.sendMessage(input.chatId, payload, kind));
        setMessages((prev) => {
          const withoutDup = prev.filter((item) => item.id !== mapped.id);
          return withoutDup.map((item) =>
            item.id === message.id
              ? {
                  ...mapped,
                  imageUri: remoteUri || mapped.imageUri || input.imageUri,
                  caption: input.caption,
                  docName: input.docName,
                  docSize: input.docSize,
                  voiceDuration: input.voiceDuration,
                }
              : item,
          );
        });
      } catch {
        Alert.alert('Message not sent', 'Check that the API on your PC is running.');
      }
    })();
  }, [demoMode]);

  const markRead = useCallback((chatId: string) => {
    setChats((prev) =>
      prev.map((chat) => (chat.id === chatId ? { ...chat, unread: 0 } : chat)),
    );
    if (!demoMode) void api.markRead(chatId).catch(() => undefined);
  }, [demoMode]);

  const clearChat = useCallback((chatId: string) => {
    setMessages((prev) => prev.filter((message) => message.chatId !== chatId));
    setChats((prev) =>
      prev.map((chat) =>
        chat.id === chatId ? { ...chat, preview: 'No messages', time: '', unread: 0 } : chat,
      ),
    );
    if (!demoMode) void api.clearChat(chatId).catch(() => undefined);
  }, [demoMode]);

  const postGist = useCallback(
    async (text: string, imageUri?: string | null, mediaKind?: MediaKind) => {
      const trimmed = text.trim();
      if (!trimmed && !imageUri) return;
      const kind = mediaKind === 'document' ? 'image' : mediaKind || (imageUri ? 'image' : undefined);
      const local: FeedPost = {
        id: `g-${Date.now()}`,
        name: profile.name || 'You',
        time: 'now',
        text: trimmed,
        imageUri: imageUri ?? undefined,
        mediaKind: kind,
        initials: initialsFromName(profile.name || 'You'),
        tone: 'green',
      };
      setPosts((prev) => [local, ...prev]);
      if (demoMode) return;
      try {
        let remote = '';
        if (imageUri) {
          const mime =
            kind === 'video' ? 'video/mp4' : kind === 'voice' ? 'audio/mp4' : 'image/jpeg';
          remote = await uploadMedia(imageUri, mime);
        }
        const saved = mapGist(await api.createGist(trimmed, remote, kind || ''));
        setPosts((prev) => [saved, ...prev.filter((item) => item.id !== local.id)]);
      } catch {
        // keep the local post if upload/API is down
      }
    },
    [demoMode, profile.name],
  );

  const signOut = useCallback(async () => {
    await clearTokens();
    setDemoMode(false);
    setProfile(emptyProfile);
    setChats([]);
    setMessages([]);
    setPosts([]);
  }, []);

  useEffect(() => {
    if (demoMode) return;
    let socket: WebSocket | null = null;
    let cancelled = false;
    void (async () => {
      const token = await getAccessToken();
      if (!token || cancelled) return;
      const url = `${API_URL.replace(/^http/, 'ws')}/v1/ws?access_token=${encodeURIComponent(token)}`;
      socket = new WebSocket(url);
      socket.onmessage = (event) => {
        try {
          const data = JSON.parse(String(event.data)) as {
            t?: string;
            action?: string;
            from_name?: string;
            from_id?: string;
            conversation_id?: string;
            message?: Parameters<typeof mapMsg>[0];
          };
          if (data.t === 'read' && data.conversation_id) {
            setMessages((prev) =>
              prev.map((item) =>
                item.chatId === data.conversation_id && item.fromMe ? { ...item, seen: true } : item,
              ),
            );
            return;
          }
          if (data.t === 'call' && data.action === 'ring') {
            const peer = data.from_name || 'Kuvo user';
            setCallLog((prev) => [
              { id: `c-${Date.now()}`, name: peer, username: peer, direction: 'in', time: 'now' },
              ...prev,
            ]);
            if (navigationRef.isReady()) {
              navigationRef.navigate('Call', { username: peer, name: peer, direction: 'in' });
            }
            return;
          }
          if (data.t !== 'message' || !data.message) return;
          const mapped = mapMsg(data.message);
          setMessages((prev) => {
            if (prev.some((item) => item.id === mapped.id)) return prev;
            if (mapped.fromMe) {
              const idx = prev.findIndex(
                (item) =>
                  item.fromMe &&
                  item.chatId === mapped.chatId &&
                  item.id.startsWith('m-') &&
                  item.kind === mapped.kind,
              );
              if (idx >= 0) {
                const next = [...prev];
                next[idx] = { ...mapped, imageUri: prev[idx].imageUri || mapped.imageUri };
                return next;
              }
              return prev;
            }
            return [...prev, mapped];
          });
          setChats((prev) =>
            prev.map((chat) =>
              chat.id === mapped.chatId
                ? {
                    ...chat,
                    preview: mapped.fromMe ? `You: ${previewFor(mapped)}` : previewFor(mapped),
                    time: 'now',
                    unread: mapped.fromMe ? 0 : chat.unread + 1,
                  }
                : chat,
            ),
          );
        } catch {
          // ignore malformed frames
        }
      };
    })();
    return () => {
      cancelled = true;
      socket?.close();
    };
  }, [demoMode, profile.phone]);

  const closeSheet = useCallback(() => setSheet(null), []);

  const openSheet = useCallback((key: SheetKey, options?: OpenSheetOptions) => {
    const definition = sheets[key];
    setSheet({
      key,
      title: options?.title ?? definition.title,
      items: definition.items,
      chatId: options?.chatId,
    });
  }, []);

  const handleSheetItem = useCallback(
    (itemId: string) => {
      const current = sheet;
      closeSheet();
      if (!current) return;

      if (current.key === 'photo-picker') {
        if (itemId === 'remove-photo') {
          patchProfile({ avatarUri: null });
          return;
        }
        void (async () => {
          const uri = itemId === 'take-photo' ? await takePhoto() : await pickFromGallery();
          if (!uri) return;
          patchProfile({ avatarUri: uri });
          if (demoMode) return;
          try {
            const remote = await uploadMedia(uri);
            patchProfile({ avatarUri: remote });
          } catch {
            // keep the local photo
          }
        })();
        return;
      }

      if (current.key === 'attach' && current.chatId) {
        const chatId = current.chatId;
        if (itemId === 'photo' || itemId === 'camera' || itemId === 'video') {
          void (async () => {
            if (itemId === 'camera') {
              const uri = await takePhoto();
              if (uri) sendMessage({ chatId, kind: 'image', imageUri: uri });
              return;
            }
            if (itemId === 'video') {
              const picked = await pickGistVideo();
              if (picked) sendMessage({ chatId, kind: 'video', imageUri: picked.uri });
              return;
            }
            const picked = await pickChatMedia();
            if (picked) sendMessage({ chatId, kind: picked.kind === 'video' ? 'video' : 'image', imageUri: picked.uri });
          })();
          return;
        }
        if (itemId === 'doc') {
          void (async () => {
            const picked = await pickDocument();
            if (!picked) return;
            sendMessage({ chatId, kind: 'document', imageUri: picked.uri, docName: picked.name, docSize: picked.size ? `${Math.round(picked.size / 1024)} KB` : undefined });
          })();
          return;
        }
        if (itemId === 'location') {
          sendMessage({
            chatId,
            kind: 'text',
            text: '📍 Near campus · https://maps.google.com/?q=5.6037,-0.1870',
          });
          return;
        }
        if (itemId === 'contact') {
          sendMessage({ chatId, kind: 'text', text: '👤 Amara · +234 803 111 2244' });
        }
        return;
      }

      if (itemId === 'settings') {
        navigateToProfile();
        return;
      }
      if (itemId === 'privacy') {
        navigateToSetting('privacy');
        return;
      }
      if (itemId === 'wallpaper' && current.chatId) {
        if (navigationRef.isReady()) {
          navigationRef.navigate('Wallpaper', { chatId: current.chatId });
        }
        return;
      }
      if (itemId === 'new-chat') {
        navigateToNewChat();
        return;
      }
      if (itemId === 'new-group') {
        navigateToNewGroup();
        return;
      }
      if (itemId === 'group-info' && current.chatId) {
        navigateToGroupInfo(current.chatId);
        return;
      }
      if (itemId === 'view-contact' && current.chatId) {
        navigateToContact(current.chatId);
        return;
      }
      if (itemId === 'mute') {
        Alert.alert('Muted', 'Notifications are off for this chat.');
        return;
      }
      if (itemId === 'clear' && current.chatId) {
        Alert.alert('Clear chat', 'Remove all messages in this chat?', [
          { text: 'Cancel', style: 'cancel' },
          { text: 'Clear', style: 'destructive', onPress: () => clearChat(current.chatId!) },
        ]);
        return;
      }
      if (itemId === 'block') {
        Alert.alert('Blocked', 'You can unblock this contact from Privacy settings.');
        return;
      }
      if (itemId === 'exit' && current.chatId) {
        Alert.alert('Left group', 'You can still find it later from Groups.', [
          { text: 'OK', onPress: () => exitGroup(current.chatId!) },
        ]);
        return;
      }
      if (itemId === 'starred' || itemId === 'archive') {
        Alert.alert('Not in this build', 'Starred messages and archive ship in the next drop.');
      }
    },
    [clearChat, closeSheet, demoMode, exitGroup, patchProfile, sendMessage, sheet],
  );

  const value = useMemo<AppContextValue>(
    () => ({
      profile,
      chats,
      messages,
      stories,
      posts,
      campusList,
      sheet,
      patchProfile,
      setPhone,
      setCountryCode,
      setName,
      setCampus,
      setVerified,
      toggleLowDataMode,
      loadDemoProfile,
      addCampus,
      createGroup,
      startDirect,
      muteChat,
      exitGroup,
      sendMessage,
      markRead,
      clearChat,
      postGist,
      signOut,
      openSheet,
      closeSheet,
      handleSheetItem,
      demoMode,
      requestOtp,
      verifyOtp,
      hydrate,
      reloadInbox,
      loadCampuses,
      language,
      setLanguage,
      appWallpaper,
      chatWallpapers,
      setAppWallpaper,
      setChatWallpaper,
      setChatAvatar,
      callLog,
      ringUser,
      hangupCall,
    }),
    [
      profile,
      chats,
      messages,
      stories,
      posts,
      campusList,
      sheet,
      patchProfile,
      setPhone,
      setCountryCode,
      setName,
      setCampus,
      setVerified,
      toggleLowDataMode,
      loadDemoProfile,
      addCampus,
      createGroup,
      startDirect,
      muteChat,
      exitGroup,
      sendMessage,
      markRead,
      clearChat,
      postGist,
      signOut,
      openSheet,
      closeSheet,
      handleSheetItem,
      demoMode,
      requestOtp,
      verifyOtp,
      hydrate,
      reloadInbox,
      loadCampuses,
      language,
      setLanguage,
      appWallpaper,
      chatWallpapers,
      setAppWallpaper,
      setChatWallpaper,
      setChatAvatar,
      callLog,
      ringUser,
      hangupCall,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside AppProvider');
  }
  return context;
}


