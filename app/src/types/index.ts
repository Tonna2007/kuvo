export type AvatarTone = 'green' | 'gold' | 'dark';

export type ChatKind = 'direct' | 'group';

export type MessageKind = 'text' | 'voice' | 'image' | 'video' | 'document';

export type SheetKey =
  | 'chat-menu'
  | 'convo-menu'
  | 'group-menu'
  | 'gist-menu'
  | 'attach'
  | 'photo-picker';

export interface Campus {
  id: string;
  name: string;
  city: string;
  initials: string;
}

export interface ChatMember {
  name: string;
  username: string;
  role: string;
  initials: string;
  avatarUri?: string | null;
  phone?: string;
}

export interface Chat {
  id: string;
  kind: ChatKind;
  name: string;
  preview: string;
  time: string;
  unread: number;
  initials: string;
  tone: AvatarTone;
  avatarUri?: string | null;
  myRole?: string;
  members?: string[];
  memberMeta?: ChatMember[];
  online?: boolean;
  secondaryInitials?: string;
  secondaryTone?: AvatarTone;
}

export interface Message {
  id: string;
  chatId: string;
  fromMe: boolean;
  senderName?: string;
  senderColor?: string;
  kind: MessageKind;
  text?: string;
  imageUri?: string;
  caption?: string;
  docName?: string;
  docSize?: string;
  voiceDuration?: string;
  seen?: boolean;
}

export interface Story {
  id: string;
  label: string;
  initials: string;
  tone?: AvatarTone;
  isYou?: boolean;
  mediaUri?: string;
  mediaKind?: string;
  text?: string;
}

export interface FeedPost {
  id: string;
  name: string;
  time: string;
  text: string;
  imageUri?: string;
  mediaKind?: 'image' | 'video' | 'voice';
  initials: string;
  tone: AvatarTone;
}

export interface CallLogItem {
  id: string;
  name: string;
  username: string;
  direction: 'in' | 'out';
  time: string;
}

export interface SettingItem {
  id: string;
  label: string;
  icon: SettingIcon;
}

export type SettingIcon =
  | 'account'
  | 'privacy'
  | 'data'
  | 'notifications'
  | 'appearance'
  | 'wallpaper'
  | 'language'
  | 'help'
  | 'invite';

export interface SheetItem {
  id: string;
  label: string;
  icon: SheetIcon;
  danger?: boolean;
}

export type SheetIcon =
  | 'group'
  | 'star'
  | 'settings'
  | 'contact'
  | 'mute'
  | 'trash'
  | 'exit'
  | 'photo'
  | 'camera'
  | 'doc'
  | 'pin'
  | 'lock'
  | 'archive';

export interface SheetDefinition {
  title: string;
  items: SheetItem[];
}

export type CountryCode = '+234' | '+233';

export type ThemeMode = 'light' | 'dark' | 'system';

export interface NotificationPrefs {
  messages: boolean;
  groups: boolean;
  preview: boolean;
  sound: boolean;
  vibrate: boolean;
}

export interface UserProfile {
  name: string;
  username: string;
  about: string;
  phone: string;
  countryCode: CountryCode;
  campus: Campus | null;
  verified: boolean;
  schoolEmail: string;
  twoStep: boolean;
  lowDataMode: boolean;
  autoDownloadPhotos: boolean;
  autoDownloadDocuments: boolean;
  showLastSeen: boolean;
  readReceipts: boolean;
  showCampusBadge: boolean;
  notifications: NotificationPrefs;
  themeMode: ThemeMode;
  themeColor: string;
  wallpaper: string;
  blockedCount: number;
  avatarUri: string | null;
}
