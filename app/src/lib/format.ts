export function digitsOnly(value: string, max = 10): string {
  return value.replace(/\D/g, '').slice(0, max);
}

export function formatNgPhone(value: string): string {
  const digits = digitsOnly(value, 10);
  if (digits.length <= 3) return digits;
  if (digits.length <= 6) return `${digits.slice(0, 3)} ${digits.slice(3)}`;
  return `${digits.slice(0, 3)} ${digits.slice(3, 6)} ${digits.slice(6)}`;
}

export function displayPhone(phone: string, countryCode = '+234'): string {
  const digits = digitsOnly(phone, 10);
  return `${countryCode} ${formatNgPhone(digits)}`.trim();
}

export function usernameFromName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')
    .slice(0, 16);
  return slug || 'user';
}

export function initialsFromName(name: string): string {
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return 'Z';
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}
