import { toLatinDigits } from './jalali';

export function normalizePhone(raw: string): string {
  let cleaned = toLatinDigits(raw).replace(/[\s\-()+.]/g, '');

  if (cleaned.startsWith('09') && cleaned.length === 11) {
    cleaned = '98' + cleaned.slice(1);
  }

  return '+' + cleaned;
}

export function isValidIranianMobile(raw: string): boolean {
  try {
    const norm = normalizePhone(raw);
    return /^\+989[0-9]{9}$/.test(norm);
  } catch {
    return false;
  }
}
