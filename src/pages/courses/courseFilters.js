// הסינון נשמר בכתובת הדף (?q=…&category=…) — אפשר לשתף קישור, ו"אחורה" בדפדפן עובד.

export const PAGE_SIZE = 9;

export const SORT_OPTIONS = {
  start: { label: 'מה מתחיל ראשון', sortBy: 'StartDate', descending: false },
  title: { label: 'שם החוג (א–ת)', sortBy: 'Title', descending: false },
  price: { label: 'מחיר: מהנמוך', sortBy: 'Price', descending: false },
  'price-desc': { label: 'מחיר: מהגבוה', sortBy: 'Price', descending: true },
  spots: { label: 'הכי הרבה מקום', sortBy: 'AvailableSpots', descending: true }
};

const DEFAULT_SORT = 'start';

export function readFilters(params) {
  const sort = params.get('sort');
  return {
    search: params.get('q') ?? '',
    categoryId: Number(params.get('category')) || null,
    onlyAvailable: params.get('spots') === '1',
    sort: sort in SORT_OPTIONS ? sort : DEFAULT_SORT,
    page: Math.max(1, Number(params.get('page')) || 1)
  };
}

const PARAM_OF = { search: 'q', categoryId: 'category', onlyAvailable: 'spots', sort: 'sort', page: 'page' };

/** מחזיר כתובת חדשה עם השינויים. כל שינוי שאינו מעבר עמוד מחזיר לעמוד 1. */
export function applyFilterChanges(params, changes) {
  const next = new URLSearchParams(params);
  if (!('page' in changes)) next.delete('page');

  for (const [key, value] of Object.entries(changes)) {
    const name = PARAM_OF[key];
    const isDefault = !value || (key === 'sort' && value === DEFAULT_SORT) || (key === 'page' && value === 1);
    if (isDefault) next.delete(name);
    else next.set(name, value === true ? '1' : String(value));
  }
  return next;
}

export const hasActiveFilters = (filters) =>
  Boolean(filters.search || filters.categoryId || filters.onlyAvailable);

/** פרמטרים לשרת (GET /api/courses). */
export function toApiQuery(filters) {
  const { sortBy, descending } = SORT_OPTIONS[filters.sort];
  return {
    search: filters.search || undefined,
    categoryId: filters.categoryId ?? undefined,
    hasAvailableSpots: filters.onlyAvailable || undefined,
    sortBy,
    descending: descending || undefined,
    page: filters.page,
    pageSize: PAGE_SIZE
  };
}
