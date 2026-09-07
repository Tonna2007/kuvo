import type { SheetDefinition, SheetKey } from '../types';

export const sheets: Record<SheetKey, SheetDefinition> = {
  'chat-menu': {
    title: 'Chats',
    items: [
      { id: 'new-chat', label: 'New chat', icon: 'contact' },
      { id: 'new-group', label: 'New group', icon: 'group' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
  'convo-menu': {
    title: 'Chat',
    items: [
      { id: 'view-contact', label: 'View contact', icon: 'contact' },
      { id: 'wallpaper', label: 'Chat wallpaper', icon: 'photo' },
      { id: 'mute', label: 'Mute notifications', icon: 'mute' },
      { id: 'clear', label: 'Clear chat', icon: 'trash', danger: true },
      { id: 'block', label: 'Block contact', icon: 'trash', danger: true },
    ],
  },
  'group-menu': {
    title: 'Group',
    items: [
      { id: 'group-info', label: 'Group info', icon: 'group' },
      { id: 'wallpaper', label: 'Chat wallpaper', icon: 'photo' },
      { id: 'mute', label: 'Mute notifications', icon: 'mute' },
      { id: 'clear', label: 'Clear chat', icon: 'trash', danger: true },
      { id: 'exit', label: 'Exit group', icon: 'exit', danger: true },
    ],
  },
  'gist-menu': {
    title: 'Gist',
    items: [
      { id: 'privacy', label: 'Privacy', icon: 'lock' },
      { id: 'archive', label: 'Archive', icon: 'archive' },
      { id: 'settings', label: 'Settings', icon: 'settings' },
    ],
  },
  attach: {
    title: 'Share',
    items: [
      { id: 'photo', label: 'Photo', icon: 'photo' },
      { id: 'video', label: 'Video', icon: 'photo' },
      { id: 'camera', label: 'Camera', icon: 'camera' },
      { id: 'doc', label: 'Document', icon: 'doc' },
      { id: 'location', label: 'Location', icon: 'pin' },
      { id: 'contact', label: 'Contact', icon: 'contact' },
    ],
  },
  'photo-picker': {
    title: 'Profile photo',
    items: [
      { id: 'take-photo', label: 'Take photo', icon: 'camera' },
      { id: 'choose-gallery', label: 'Choose from gallery', icon: 'photo' },
      { id: 'remove-photo', label: 'Remove photo', icon: 'trash', danger: true },
    ],
  },
};
