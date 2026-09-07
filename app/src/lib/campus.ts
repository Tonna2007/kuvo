import type { Campus } from '../types';

function tokens(value: string): string[] {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

/** Rank a campus against a search string. Higher is better. 0 = no match. */
export function campusScore(campus: Campus, query: string): number {
  const q = query.trim().toLowerCase();
  const name = campus.name.toLowerCase();
  const city = campus.city.toLowerCase();
  const initials = campus.initials.toLowerCase();
  if (!q) return campus.id === 'kaaf' ? 2 : 1;

  if (name === q) return 100;
  if (name.startsWith(q)) return 90;
  if (initials === q || initials.startsWith(q)) return 85;

  const qTokens = tokens(q);
  const nameTokens = tokens(name);
  if (qTokens.length && qTokens.every((t) => nameTokens.some((w) => w.startsWith(t) || w.includes(t)))) {
    if (nameTokens[0]?.startsWith(qTokens[0])) return 80;
    return 65;
  }
  if (name.includes(q) || city.includes(q)) return 40;
  return 0;
}

export function rankCampuses(list: Campus[], query: string): Campus[] {
  const scored = list
    .map((campus) => ({ campus, score: campusScore(campus, query) }))
    .filter((item) => item.score > 0);
  scored.sort((a, b) => {
    if (b.score !== a.score) return b.score - a.score;
    if (a.campus.id === 'kaaf') return -1;
    if (b.campus.id === 'kaaf') return 1;
    return a.campus.name.localeCompare(b.campus.name);
  });
  return scored.map((item) => item.campus);
}
