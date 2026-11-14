import jalaali from 'jalaali-js';

export function toPersianDigits(input: string | number | null | undefined): string {
  if (input === null || input === undefined) return '';
  const str = String(input);
  const persian = ['۰', '۱', '۲', '۳', '۴', '۵', '۶', '۷', '۸', '۹'];
  const latin = ['0', '1', '2', '3', '4', '5', '6', '7', '8', '9'];
  return str.replace(/[0-9]/g, (w) => persian[latin.indexOf(w)]);
}

export function toLatinDigits(str: string): string {
  const map: Record<string, string> = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9',
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };
  return str.replace(/[۰-۹٠-٩]/g, (char) => map[char] || char);
}

export function toJalali(dateStr: string | Date | null | undefined): string {
  if (!dateStr) return '';
  const d = typeof dateStr === 'string' ? new Date(dateStr) : dateStr;
  if (isNaN(d.getTime())) return String(dateStr);

  const { jy, jm, jd } = jalaali.toJalaali(d.getFullYear(), d.getMonth() + 1, d.getDate());
  return `${jy}/${String(jm).padStart(2, '0')}/${String(jd).padStart(2, '0')}`;
}

export function toJalaliPersian(dateStr: string | Date | null | undefined): string {
  return toPersianDigits(toJalali(dateStr));
}

const PERSIAN_MONTH_NAMES = [
  'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
  'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
];

export function getCurrentJalaliMonthName(date: Date = new Date()): string {
  const { jy, jm } = jalaali.toJalaali(date.getFullYear(), date.getMonth() + 1, date.getDate());
  const monthName = PERSIAN_MONTH_NAMES[jm - 1] || '';
  return `${monthName} ${toPersianDigits(jy)}`;
}
