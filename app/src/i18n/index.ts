import { en } from './en';
import { pcm } from './pcm';

export type LocaleCode = 'en' | 'pcm';

export const LOCALES: { code: LocaleCode; label: string; native: string }[] = [
  { code: 'en', label: 'English', native: 'English' },
  { code: 'pcm', label: 'Nigerian Pidgin', native: 'Naija Pidgin' },
];

const packs: Record<string, Record<string, string>> = {
  en,
  pcm,
};

let current: LocaleCode = 'en';

export function setLocale(code: string) {
  current = (packs[code] ? code : 'en') as LocaleCode;
}

export function getLocale() {
  return current;
}

export function t(key: string, vars?: Record<string, string>) {
  const table = packs[current] || packs.en;
  let out = table[key] || packs.en[key] || key;
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      out = out.split(`{${k}}`).join(v);
    }
  }
  return out;
}
