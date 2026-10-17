import { useCallback, useEffect, useState } from 'react';
import { enrollmentsApi } from '../../api/endpoints.js';

// אילו חוגים המשתתפת כבר רשומה אליהם — כדי להציג "את בפנים!" במקום "הירשמי".
// (50 = גודל העמוד המקסימלי בשרת; משתתפת לא מחזיקה יותר הרשמות מזה.)
export function useEnrolledCourseIds(enabled) {
  const [ids, setIds] = useState(() => new Set());

  const refresh = useCallback(async () => {
    if (!enabled) return new Set();
    try {
      const page = await enrollmentsApi.list({ page: 1, pageSize: 50 });
      const active = new Set(page.items.filter((e) => e.status === 'Active').map((e) => e.courseId));
      setIds(active);
      return active;
    } catch {
      return null; // לא קריטי: במקרה הגרוע הכפתור יוצג, והשרת יחזיר "את כבר רשומה".
    }
  }, [enabled]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const add = useCallback((courseId) => setIds((current) => new Set(current).add(courseId)), []);

  return { ids, refresh, add };
}
