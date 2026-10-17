import { useEffect, useState } from 'react';

// מחזיר את הערך רק אחרי שהפסיקו לשנות אותו — כדי לא לשלוח בקשה על כל אות בחיפוש.
export function useDebouncedValue(value, delayMs = 350) {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delayMs);
    return () => clearTimeout(timer);
  }, [value, delayMs]);
  return debounced;
}
