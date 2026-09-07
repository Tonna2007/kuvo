import { colors as lightBase } from './colors';

export type ColorTokens = { [K in keyof typeof lightBase]: string };

export type ThemeMode = 'light' | 'dark' | 'system';

export const BRAND_SWATCHES = [
  { hex: '#145C38', green: '#145C38', greenDark: '#0B3D26', greenDarker: '#072A1A' },
  { hex: '#1E5FA8', green: '#1E5FA8', greenDark: '#123D6E', greenDarker: '#0A2749' },
  { hex: '#B24D3E', green: '#B24D3E', greenDark: '#7A3128', greenDarker: '#501F1A' },
  { hex: '#6B4FA0', green: '#6B4FA0', greenDark: '#4A3670', greenDarker: '#2E2148' },
  { hex: '#1E8A8A', green: '#1E8A8A', greenDark: '#145E5E', greenDarker: '#0C3D3D' },
  { hex: '#A84E7C', green: '#A84E7C', greenDark: '#723656', greenDarker: '#4A2338' },
] as const;

export const WALLPAPERS = [
  '#FFFFFF',
  '#0B3D26',
  '#F1F5F1',
  '#E3A857',
  '#145C38',
  '#1E5FA8',
  '#F6E6C9',
  '#B24D3E',
  '#6B4FA0',
] as const;

export const WALLPAPER_DESIGNS: {
  id: string;
  label: string;
  color?: string;
  source?: number;
}[] = [
  { id: 'plain', label: 'Plain light', color: '#FFFFFF' },
  { id: 'forest', label: 'Forest', source: require('../../assets/wallpapers/forest.jpg') },
  { id: 'kente', label: 'Gold cloth', source: require('../../assets/wallpapers/kente.jpg') },
  { id: 'night', label: 'Campus night', source: require('../../assets/wallpapers/night.jpg') },
  { id: 'notebook', label: 'Notebook', source: require('../../assets/wallpapers/notebook.jpg') },
  { id: 'midnight', label: 'Midnight', source: require('../../assets/wallpapers/midnight.jpg') },
  { id: 'courtyard', label: 'Courtyard', source: require('../../assets/wallpapers/courtyard.jpg') },
];

export function wallpaperImage(value?: string | null): number | { uri: string } | null {
  if (!value) return null;
  const design = WALLPAPER_DESIGNS.find((item) => item.id === value);
  if (design?.source) return design.source;
  if (value.startsWith('http') || value.startsWith('file:') || value.startsWith('content:')) {
    return { uri: value };
  }
  return null;
}

export function wallpaperColor(value?: string | null): string | null {
  if (!value) return null;
  const design = WALLPAPER_DESIGNS.find((item) => item.id === value);
  if (design?.color) return design.color;
  if (value.startsWith('#')) return value;
  return null;
}

const LIGHT_SURFACE = {
  surface: '#FFFFFF',
  card: '#F1F5F1',
  border: '#E4E4DE',
  textDark: '#1E1E1C',
  textMuted: '#5B5D57',
  bubble: '#F1F1ED',
  composer: '#F5F5F2',
} as const;

function darkSurface(brand: (typeof BRAND_SWATCHES)[number]) {
  return {
    surface: brand.greenDarker,
    card: brand.greenDark,
    border: brand.green,
    textDark: '#EEF1EC',
    textMuted: '#C5D4CC',
    bubble: brand.greenDark,
    composer: brand.greenDark,
  };
}

export function resolveColors(input: {
  mode: ThemeMode;
  themeColor: string;
  systemDark: boolean;
}): ColorTokens {
  const isDark = input.mode === 'dark' || (input.mode === 'system' && input.systemDark);
  const brand = BRAND_SWATCHES.find((item) => item.hex === input.themeColor) ?? BRAND_SWATCHES[0];
  const surface = isDark ? darkSurface(brand) : LIGHT_SURFACE;

  return {
    ...lightBase,
    green: brand.green,
    greenDark: brand.greenDark,
    greenDarker: brand.greenDarker,
    ...surface,
    pillBg: isDark ? brand.greenDark : '#DFF2E7',
    pillText: isDark ? '#E8F6EE' : brand.greenDark,
  };
}
