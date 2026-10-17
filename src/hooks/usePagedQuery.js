import { useCallback, useEffect, useRef, useState } from 'react';

/**
 * טעינת רשימה מעומדת מהשרת — משותף לכל הרשימות באתר.
 * load(signal) נקרא מחדש בכל שינוי ב-key; בקשה קודמת שעוד לא חזרה מבוטלת (AbortController).
 * onPageOverflow(lastPage) — כשביקשו עמוד שכבר לא קיים (למשל אחרי מחיקה).
 */
export function usePagedQuery(load, key, { onPageOverflow } = {}) {
  const [state, setState] = useState({ status: 'loading', data: null, error: null });
  const [reloadKey, setReloadKey] = useState(0);

  // תמיד הגרסה העדכנית, בלי להפעיל את ה-effect מחדש על כל רינדור.
  const loadRef = useRef(load);
  const overflowRef = useRef(onPageOverflow);
  loadRef.current = load;
  overflowRef.current = onPageOverflow;

  useEffect(() => {
    const controller = new AbortController();
    setState((current) => ({ ...current, status: 'loading', error: null }));

    loadRef.current(controller.signal)
      .then((data) => {
        if (data.totalPages > 0 && data.page > data.totalPages && overflowRef.current) {
          overflowRef.current(data.totalPages);
          return;
        }
        setState({ status: 'ready', data, error: null });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setState((current) => ({ ...current, status: 'error', error }));
      });

    return () => controller.abort();
  }, [key, reloadKey]);

  const reload = useCallback(() => setReloadKey((k) => k + 1), []);

  /** מחליף פריט אחד ברשימה (למשל חוג שמספר המקומות בו התעדכן) בלי לטעון הכול מחדש. */
  const updateItem = useCallback(
    (item) =>
      setState((current) =>
        current.data
          ? { ...current, data: { ...current.data, items: current.data.items.map((i) => (i.id === item.id ? item : i)) } }
          : current
      ),
    []
  );

  return { ...state, isRefreshing: state.status === 'loading' && Boolean(state.data), reload, updateItem };
}
