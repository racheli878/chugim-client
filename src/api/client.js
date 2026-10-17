// שכבת התקשורת היחידה מול השרת: מוסיפה את ה-token, ומתרגמת כל תשובת שגיאה
// (ProblemDetails מהשרת) ל-ApiError אחיד שהמסכים יודעים להציג.

const API_URL = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');

let getToken = () => null;
let onUnauthorized = () => {};

/** נקרא מ-AuthProvider: מאיפה לקחת את ה-token ומה לעשות כשהוא פג. */
export function configureApi({ tokenGetter, unauthorizedHandler }) {
  getToken = tokenGetter;
  onUnauthorized = unauthorizedHandler;
}

export class ApiError extends Error {
  constructor({ status, message, correlationId, fieldErrors = {} }) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.correlationId = correlationId;
    this.fieldErrors = fieldErrors;
  }

  get isConflict() {
    return this.status === 409;
  }
}

const DEFAULT_MESSAGES = {
  0: 'אין חיבור לשרת. כדאי לבדוק את החיבור ולנסות שוב.',
  400: 'משהו בפרטים לא תקין. כדאי לבדוק ולנסות שוב.',
  401: 'צריך להתחבר כדי להמשיך.',
  403: 'אין לך הרשאה לפעולה הזו.',
  404: 'לא מצאנו את מה שחיפשת.',
  409: 'משהו השתנה בינתיים. כדאי לרענן ולנסות שוב.',
  429: 'היו יותר מדי ניסיונות. כדאי לחכות דקה ולנסות שוב.',
  500: 'משהו השתבש אצלנו. כדאי לנסות שוב בעוד רגע.'
};

export async function apiRequest(path, { method = 'GET', body, query, signal } = {}) {
  const url = new URL(API_URL + path, window.location.origin);
  Object.entries(query ?? {}).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') url.searchParams.set(key, value);
  });

  const headers = { Accept: 'application/json' };
  if (body !== undefined) headers['Content-Type'] = 'application/json';
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;

  let response;
  try {
    response = await fetch(url, {
      method,
      headers,
      body: body === undefined ? undefined : JSON.stringify(body),
      signal
    });
  } catch (error) {
    if (error.name === 'AbortError') throw error;
    throw new ApiError({ status: 0, message: DEFAULT_MESSAGES[0] });
  }

  if (response.status === 204) return null;

  const isJson = response.headers.get('content-type')?.includes('json');
  const data = isJson ? await response.json().catch(() => null) : null;

  if (response.ok) return data;

  // token שפג או נדחה באמצע שימוש — מנתקים. (בהתחברות עצמה אין token, ולכן לא מנתקים.)
  if (response.status === 401 && token) onUnauthorized();

  throw toApiError(response, data);
}

function toApiError(response, data) {
  const status = response.status;
  const fieldErrors = normalizeFieldErrors(data?.errors);
  const hasFieldErrors = Object.keys(fieldErrors).length > 0;

  return new ApiError({
    status,
    message: data?.detail
      ?? (hasFieldErrors ? DEFAULT_MESSAGES[400] : DEFAULT_MESSAGES[status] ?? DEFAULT_MESSAGES[500]),
    correlationId: data?.correlationId ?? response.headers.get('X-Correlation-ID') ?? undefined,
    fieldErrors
  });
}

// ולידציה של ASP.NET מחזירה { "Email": ["..."] } — הופכים ל-{ email: "..." } כמו שמות השדות בטפסים.
function normalizeFieldErrors(errors) {
  if (!errors) return {};
  return Object.fromEntries(
    Object.entries(errors).map(([key, messages]) => {
      const name = key.replace(/^\$\./, '');
      return [name.charAt(0).toLowerCase() + name.slice(1), messages?.[0] ?? ''];
    })
  );
}

/** טקסט להצגה למשתמשת. בשגיאת שרת מוסיפים את מזהה הבקשה, כדי שאפשר יהיה לאתר אותה בלוג. */
export function describeError(error) {
  if (!(error instanceof ApiError)) return DEFAULT_MESSAGES[500];
  if (error.status >= 500 && error.correlationId) return `${error.message} (מזהה תקלה: ${error.correlationId})`;
  return error.message;
}
