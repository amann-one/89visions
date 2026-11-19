const DAY_MS = 24 * 60 * 60 * 1000;

/** Today at local midnight, as a Date. */
function startOfToday(): Date {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), now.getDate());
}

/** `2026-08-14` -> `14.08.2026` */
export function formatDate(isoDate: string | null | undefined): string {
  if (!isoDate) {
    return '';
  }
  const [year, month, day] = isoDate.slice(0, 10).split('-');
  if (!year || !month || !day) {
    return isoDate;
  }
  return `${day}.${month}.${year}`;
}

/** `14.08.2026` (also accepts `14.8.26`) -> `2026-08-14` */
export function parseGermanDate(input: string): string | null {
  const match = input.trim().match(/^(\d{1,2})[.\s/-](\d{1,2})[.\s/-](\d{2,4})$/);
  if (!match) {
    return null;
  }
  const day = Number(match[1]);
  const month = Number(match[2]);
  const rawYear = Number(match[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  const date = new Date(year, month - 1, day);
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) {
    return null;
  }
  return `${year}-${String(month).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
}

export function isoDateToGermanInput(isoDate: string | null): string {
  return formatDate(isoDate);
}

/** Whole days between today and the given date. Negative means in the past. */
export function daysUntil(isoDate: string): number {
  const [year, month, day] = isoDate.slice(0, 10).split('-').map(Number);
  const target = new Date(year, month - 1, day);
  return Math.round((target.getTime() - startOfToday().getTime()) / DAY_MS);
}

export function countdownLabel(isoDate: string | null): string | null {
  if (!isoDate) {
    return null;
  }
  const days = daysUntil(isoDate);
  if (days === 0) {
    return 'Heute';
  }
  if (days === 1) {
    return 'Morgen';
  }
  if (days === -1) {
    return 'Gestern';
  }
  if (days > 1) {
    return `in ${days} Tagen`;
  }
  return `vor ${Math.abs(days)} Tagen`;
}

export function formatEuro(value: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    maximumFractionDigits: 0,
  }).format(value);
}

export function formatYear(isoDate: string | null): string {
  return isoDate ? isoDate.slice(0, 4) : 'Ohne Datum';
}
