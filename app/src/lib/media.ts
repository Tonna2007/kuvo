import { Alert, Linking } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { API_URL } from './config';
import { getAccessToken } from './session';

export type MediaKind = 'image' | 'video' | 'voice' | 'document';

export type PickedMedia = {
  uri: string;
  mime: string;
  kind: MediaKind;
  name?: string;
  size?: number;
};

export function absMedia(path?: string | null): string | null {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://') || path.startsWith('file:') || path.startsWith('content:')) {
    return path;
  }
  if (path.startsWith('/')) return `${API_URL}${path}`;
  return path;
}

export function openMedia(uri: string) {
  void Linking.openURL(uri).catch(() =>
    Alert.alert('Media', 'Could not open this file on the phone.'),
  );
}

async function fromPicker(
  result: ImagePicker.ImagePickerResult,
  fallback: MediaKind,
): Promise<PickedMedia | null> {
  if (result.canceled || !result.assets[0]?.uri) return null;
  const asset = result.assets[0];
  const mime = asset.mimeType || (fallback === 'video' ? 'video/mp4' : 'image/jpeg');
  const kind: MediaKind = mime.startsWith('video') ? 'video' : 'image';
  return { uri: asset.uri, mime, kind, name: asset.fileName ?? undefined, size: asset.fileSize };
}

export async function pickFromGallery(): Promise<string | null> {
  const picked = await pickPhoto();
  return picked?.uri ?? null;
}

export async function pickPhoto(): Promise<PickedMedia | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Photos', 'Allow photo access to set a picture or share in chat.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  return fromPicker(result, 'image');
}

export async function takePhoto(): Promise<string | null> {
  const perm = await ImagePicker.requestCameraPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Camera', 'Allow camera access to take a photo.');
    return null;
  }
  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ['images'],
    quality: 0.8,
    allowsEditing: true,
    aspect: [1, 1],
  });
  const picked = await fromPicker(result, 'image');
  return picked?.uri ?? null;
}

export async function pickFromGalleryFree(): Promise<string | null> {
  const picked = await pickGistImage();
  return picked?.uri ?? null;
}

export async function pickGistImage(): Promise<PickedMedia | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Photos', 'Allow photo access to share a picture.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images'],
    quality: 0.85,
  });
  return fromPicker(result, 'image');
}

export async function pickGistVideo(): Promise<PickedMedia | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Videos', 'Allow media access to share a video.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['videos'],
    quality: 0.8,
    videoMaxDuration: 30,
  });
  return fromPicker(result, 'video');
}

export async function pickChatMedia(): Promise<PickedMedia | null> {
  const perm = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (!perm.granted) {
    Alert.alert('Media', 'Allow photo and video access to share in chat.');
    return null;
  }
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ['images', 'videos'],
    quality: 0.8,
    videoMaxDuration: 30,
  });
  return fromPicker(result, 'image');
}

export async function pickDocument(): Promise<PickedMedia | null> {
  Alert.alert('Documents', 'Use Photos in the attach sheet for now — a file picker needs a native module that was crashing this APK.');
  return null;
}

export async function uploadMedia(localUri: string, mime = 'image/jpeg'): Promise<string> {
  const token = await getAccessToken();
  const ext = mime.includes('png')
    ? 'png'
    : mime.includes('webp')
      ? 'webp'
      : mime.includes('mp4') || mime.includes('quicktime')
        ? 'mp4'
        : mime.includes('m4a') || mime.includes('aac') || mime.includes('audio')
          ? 'm4a'
          : 'jpg';
  const form = new FormData();
  form.append('file', {
    uri: localUri,
    name: `upload-${Date.now()}.${ext}`,
    type: mime,
  } as unknown as Blob);
  const res = await fetch(`${API_URL}/v1/media`, {
    method: 'POST',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined,
    body: form,
  });
  const raw = await res.text();
  let data: { url?: string; error?: { message?: string } } = {};
  try {
    data = raw ? (JSON.parse(raw) as { url?: string; error?: { message?: string } }) : {};
  } catch {
    throw new Error(`Upload failed (${res.status}). Is the API running on ${API_URL}?`);
  }
  if (!res.ok || !data.url) {
    throw new Error(data.error?.message || `Could not upload media (${res.status})`);
  }
  return absMedia(data.url) || data.url;
}
