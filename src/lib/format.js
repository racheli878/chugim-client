// השרת שולח ערכים "טכניים" (Sunday, 16:30:00, 2026-11-01). כאן הם הופכים לעברית קריאה.

export const DAYS = [
  { value: 'Sunday', label: 'ראשון' },
  { value: 'Monday', label: 'שני' },
  { value: 'Tuesday', label: 'שלישי' },
  { value: 'Wednesday', label: 'רביעי' },
  { value: 'Thursday', label: 'חמישי' },
  { value: 'Friday', label: 'שישי' }
];

const DAY_LABELS = Object.fromEntries(DAYS.map((d) => [d.value, d.label]));

export const dayLabel = (day) => DAY_LABELS[day] ?? day;

export const formatTime = (time) => (time ?? '').slice(0, 5);

export const formatWeekly = (day, time) => `ימי ${dayLabel(day)}, ${formatTime(time)}`;

const dateFormatter = new Intl.DateTimeFormat('he-IL', { day: 'numeric', month: 'long' });
const priceFormatter = new Intl.NumberFormat('he-IL', { style: 'currency', currency: 'ILS', maximumFractionDigits: 0 });

/** "2026-11-01" → "1 בנובמבר". מפורק ידנית כדי שאזור הזמן לא יזיז את היום. */
export function formatDate(dateOnly) {
  if (!dateOnly) return '';
  const [year, month, day] = dateOnly.split('-').map(Number);
  return dateFormatter.format(new Date(year, month - 1, day));
}

/** זמן UTC מהשרת → תאריך מקומי. */
export const formatDateTime = (utc) => (utc ? dateFormatter.format(new Date(utc)) : '');

export const formatPrice = (price) => (Number(price) > 0 ? priceFormatter.format(price) : 'חינם');

/** התאריך של היום בפורמט של השרת ושל <input type="date">: "2026-10-17". */
export function todayIso() {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
}

/** "2026-11-01" עבר כבר? (השוואת מחרוזות עובדת בפורמט הזה) */
export const isPastDate = (dateOnly) => Boolean(dateOnly) && dateOnly < todayIso();

export const firstName = (fullName) => (fullName ?? '').trim().split(/\s+/)[0] ?? '';
