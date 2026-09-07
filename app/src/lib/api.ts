import type { Campus, Chat, FeedPost, Message, Story, UserProfile } from '../types';
import { API_URL } from './config';
import { absMedia } from './media';
import { clearTokens, getAccessToken, getRefreshToken, saveTokens } from './session';
import { initialsFromName } from './format';

type ApiError = { error?: { code?: string; message?: string } };

class ApiRequestError extends Error {
  constructor(message: string, readonly status?: number) {
    super(message);
  }
}

async function request<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const access = await getAccessToken();
  const headers: Record<string, string> = {
    Accept: 'application/json',
    ...(init.body ? { 'Content-Type': 'application/json' } : {}),
    ...(init.headers as Record<string, string> | undefined),
  };
  if (access) headers.Authorization = `Bearer ${access}`;

  const res = await fetch(`${API_URL}${path}`, { ...init, headers });
  if (res.status === 401 && retry && !path.startsWith('/v1/auth/')) {
    const ok = await refreshSession();
    if (ok) return request<T>(path, init, false);
  }
  const text = await res.text();
  const data = text ? JSON.parse(text) : {};
  if (!res.ok) {
    const err = data as ApiError;
    throw new ApiRequestError(err.error?.message || `HTTP ${res.status}`, res.status);
  }
  return data as T;
}

async function refreshSession(): Promise<boolean> {
  const refresh = await getRefreshToken();
  if (!refresh) return false;
  try {
    const data = await request<{ access_token: string; refresh_token: string }>(
      '/v1/auth/refresh',
      { method: 'POST', body: JSON.stringify({ refresh_token: refresh }) },
      false,
    );
    await saveTokens(data.access_token, data.refresh_token);
    return true;
  } catch (error) {
    if (error instanceof ApiRequestError && error.status === 401) await clearTokens();
    return false;
  }
}

export type ApiMe = {
  id: string;
  phone_e164: string;
  profile: {
    full_name: string;
    username: string | null;
    about: string;
    avatar_key: string | null;
    campus_id: string | null;
    verified: string;
    school_email: string;
    two_step_enabled: boolean;
    low_data_mode: boolean;
    auto_download_photos: boolean;
    auto_download_documents: boolean;
    show_last_seen: boolean;
    read_receipts: boolean;
    show_campus_badge: boolean;
    notifications: UserProfile['notifications'];
    theme_mode: UserProfile['themeMode'];
    theme_color: string;
    wallpaper: string;
  };
  campus?: { id: string; name: string; city: string; country: string; initials: string };
};

export type ApiCampus = {
  id: string;
  name: string;
  city: string;
  country: string;
  initials: string;
  status: string;
};

export type ApiConv = {
  id: string;
  kind: 'direct' | 'group';
  title: string;
  preview: string;
  unread: number;
  updated_at: string;
  avatar_url?: string;
  members: {
    name: string;
    username: string;
    initials: string;
    role: string;
    avatar_url?: string;
    phone?: string;
    me?: boolean;
  }[];
};

export type ApiMsg = {
  id: string;
  conversation_id: string;
  sender_name: string;
  kind: Message['kind'];
  text: string;
  created_at: string;
  from_me: boolean;
  seen?: boolean;
};

export type ApiGist = {
  id: string;
  name: string;
  text: string;
  image_url?: string;
  media_kind?: 'image' | 'video' | 'voice' | string;
  initials: string;
  created_at: string;
};

export function mapCampus(c: ApiCampus): Campus {
  const country = c.country === 'GH' ? 'Ghana' : 'Nigeria';
  return { id: c.id, name: c.name, city: `${c.city}, ${country}`, initials: c.initials };
}

export function mapMe(me: ApiMe): Partial<UserProfile> {
  const e164 = me.phone_e164 || '';
  const countryCode = e164.startsWith('+233') ? '+233' : '+234';
  const local = e164.replace(/^\+\d{3}/, '');
  return {
    name: me.profile.full_name,
    username: me.profile.username || '',
    about: me.profile.about,
    phone: local,
    countryCode,
    campus: me.campus
      ? {
          id: me.campus.id,
          name: me.campus.name,
          city: `${me.campus.city}, ${me.campus.country === 'GH' ? 'Ghana' : 'Nigeria'}`,
          initials: me.campus.initials,
        }
      : null,
    verified: me.profile.verified === 'verified',
    schoolEmail: me.profile.school_email,
    twoStep: me.profile.two_step_enabled,
    lowDataMode: me.profile.low_data_mode,
    autoDownloadPhotos: me.profile.auto_download_photos,
    autoDownloadDocuments: me.profile.auto_download_documents,
    showLastSeen: me.profile.show_last_seen,
    readReceipts: me.profile.read_receipts,
    showCampusBadge: me.profile.show_campus_badge,
    notifications: me.profile.notifications,
    themeMode: me.profile.theme_mode,
    themeColor: me.profile.theme_color,
    wallpaper: me.profile.wallpaper,
    avatarUri: absMedia(me.profile.avatar_key),
  };
}

export function mapConv(c: ApiConv): Chat {
  const names = c.members.map((m) => m.name);
  const other = c.members.find((m) => !m.me) || c.members[0];
  const me = c.members.find((m) => m.me);
  const face = c.kind === 'direct' ? other : undefined;
  return {
    id: c.id,
    kind: c.kind,
    name: c.title || other?.name || names.filter(Boolean)[0] || 'Chat',
    preview: c.preview || 'No messages',
    time: '',
    unread: c.unread,
    initials:
      c.kind === 'group'
        ? initialsFromName(c.title || 'GR')
        : face?.initials || initialsFromName(c.title || 'CH'),
    tone: c.kind === 'group' ? 'gold' : 'green',
    avatarUri: c.kind === 'group' ? absMedia(c.avatar_url) : absMedia(face?.avatar_url),
    myRole: me?.role,
    members: names,
    memberMeta: c.members.map((m) => ({
      name: m.name,
      username: m.username,
      role: m.role,
      initials: m.initials,
      avatarUri: absMedia(m.avatar_url),
      phone: m.phone,
    })),
    secondaryInitials: c.members[1]?.initials,
    secondaryTone: 'green',
  };
}

export function mapMsg(m: ApiMsg): Message {
  const kind = m.kind || 'text';
  const raw = m.text || '';
  if (kind === 'image') {
    const [uriLine, ...caption] = raw.split('\n');
    return {
      id: m.id,
      chatId: m.conversation_id,
      fromMe: m.from_me,
      senderName: m.sender_name,
      kind,
      imageUri: absMedia(uriLine) ?? uriLine,
      caption: caption.join('\n') || undefined,
      text: caption.join('\n') || undefined,
      seen: !!m.seen,
    };
  }
  if (kind === 'video') {
    return {
      id: m.id,
      chatId: m.conversation_id,
      fromMe: m.from_me,
      senderName: m.sender_name,
      kind,
      imageUri: absMedia(raw.split('\n')[0]) ?? raw,
      caption: raw.split('\n').slice(1).join('\n') || undefined,
      seen: !!m.seen,
    };
  }
  if (kind === 'voice') {
    const uri = absMedia(raw.split('\n')[0]) ?? raw;
    const dur = raw.includes('|') ? raw.split('|')[1] : raw.replace(/^Voice note\s*/i, '') || '0:01';
    return {
      id: m.id,
      chatId: m.conversation_id,
      fromMe: m.from_me,
      senderName: m.sender_name,
      kind,
      imageUri: uri.startsWith('http') || uri.startsWith('/') || uri.startsWith('file:') ? uri : undefined,
      voiceDuration: dur.replace(/^VOICE\|/i, ''),
      text: raw,
      seen: !!m.seen,
    };
  }
  if (kind === 'document') {
    const [uri, name, size] = raw.split('\n');
    return {
      id: m.id,
      chatId: m.conversation_id,
      fromMe: m.from_me,
      senderName: m.sender_name,
      kind,
      imageUri: absMedia(uri) ?? uri,
      docName: name || 'Document',
      docSize: size || undefined,
      seen: !!m.seen,
    };
  }
  return {
    id: m.id,
    chatId: m.conversation_id,
    fromMe: m.from_me,
    senderName: m.sender_name,
    kind,
    text: raw,
    seen: !!m.seen,
  };
}

export function mapGist(p: ApiGist): FeedPost {
  return {
    id: p.id,
    name: p.name,
    time: 'now',
    text: p.text,
    imageUri: absMedia(p.image_url) ?? undefined,
    mediaKind: p.media_kind === 'video' || p.media_kind === 'voice' ? p.media_kind : p.image_url ? 'image' : undefined,
    initials: p.initials,
    tone: 'green',
  };
}

export const api = {
  health: () => request<{ ok: boolean; store: string }>('/v1/health'),
  requestOtp: (country_code: string, phone: string, sms = false) =>
    request<{ ok: boolean; dev_otp?: string }>('/v1/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify({ country_code, phone, sms }),
    }),
  verifyOtp: (country_code: string, phone: string, code: string) =>
    request<{ access_token: string; refresh_token: string; user: ApiMe }>('/v1/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify({ country_code, phone, code }),
    }),
  me: () => request<ApiMe>('/v1/me'),
  patchMe: (body: Record<string, unknown>) =>
    request<ApiMe>('/v1/me', { method: 'PATCH', body: JSON.stringify(body) }),
  setCampus: (campus_id: string) =>
    request<ApiMe>('/v1/me/campus', { method: 'POST', body: JSON.stringify({ campus_id }) }),
  campuses: (q = '') =>
    request<{ campuses: ApiCampus[] }>(`/v1/campuses?q=${encodeURIComponent(q)}`),
  addCampus: (name: string, country: string, city: string) =>
    request<ApiCampus>('/v1/campuses/requests', {
      method: 'POST',
      body: JSON.stringify({ name, country, city }),
    }),
  conversations: () => request<{ conversations: ApiConv[] }>('/v1/conversations'),
  createDirect: (username: string) =>
    request<ApiConv>('/v1/conversations/direct', {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),
  createGroup: (title: string, members: string[], avatar_url = '') =>
    request<ApiConv>('/v1/conversations/groups', {
      method: 'POST',
      body: JSON.stringify({ title, members, avatar_url }),
    }),
  setGroupPhoto: (id: string, avatar_url: string) =>
    request<ApiConv>(`/v1/conversations/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ avatar_url }),
    }),
  messages: (id: string) => request<{ messages: ApiMsg[] }>(`/v1/conversations/${id}/messages`),
  sendMessage: (id: string, text: string, kind = 'text') =>
    request<ApiMsg>(`/v1/conversations/${id}/messages`, {
      method: 'POST',
      body: JSON.stringify({ text, kind }),
    }),
  markRead: (id: string) =>
    request(`/v1/conversations/${id}/read`, { method: 'POST', body: JSON.stringify({}) }),
  clearChat: (id: string) =>
    request(`/v1/conversations/${id}/clear`, { method: 'POST', body: JSON.stringify({}) }),
  leave: (id: string) =>
    request(`/v1/conversations/${id}/leave`, { method: 'POST', body: JSON.stringify({}) }),
  gist: () => request<{ posts: ApiGist[] }>('/v1/gist'),
  createGist: (text: string, image_url = '', media_kind = '') =>
    request<ApiGist>('/v1/gist', {
      method: 'POST',
      body: JSON.stringify({ text, image_url, media_kind }),
    }),
  startCall: (username: string, action = 'ring', call_id = '') =>
    request<{ call_id: string; peer_name: string; peer_id: string }>('/v1/calls', {
      method: 'POST',
      body: JSON.stringify({ username, action, call_id }),
    }),
  stories: () => request<{ stories: ApiStory[] }>('/v1/stories'),
  createStory: (text: string, media_url = '', media_kind = '') =>
    request<ApiStory>('/v1/stories', {
      method: 'POST',
      body: JSON.stringify({ text, media_url, media_kind }),
    }),
  renameGroup: (id: string, title: string) =>
    request<ApiConv>(`/v1/conversations/${id}`, { method: 'PATCH', body: JSON.stringify({ title }) }),
  addGroupMember: (id: string, username: string) =>
    request<ApiConv>(`/v1/conversations/${id}/members`, {
      method: 'POST',
      body: JSON.stringify({ username }),
    }),
  setGroupRole: (id: string, username: string, role: string) =>
    request<ApiConv>(`/v1/conversations/${id}/role`, {
      method: 'POST',
      body: JSON.stringify({ username, role }),
    }),
};

export type ApiStory = {
  id: string;
  name: string;
  initials: string;
  text: string;
  media_url?: string;
  media_kind?: string;
  is_you?: boolean;
  created_at?: string;
};

export function mapStory(s: ApiStory): Story {
  return {
    id: s.id,
    label: s.is_you ? 'You' : s.name,
    initials: s.initials || 'ST',
    tone: s.is_you ? 'gold' : 'green',
    isYou: !!s.is_you,
    mediaUri: absMedia(s.media_url) ?? undefined,
    mediaKind: s.media_kind,
    text: s.text,
  };
}
