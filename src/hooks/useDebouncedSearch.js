import { useEffect, useState } from 'react';
import { useDebouncedValue } from './useDebouncedValue.js';

/**
 * תיבת חיפוש שמחוברת לערך "רשמי" (למשל ?q= בכתובת):
 * מקלידים חופשי, ו-commit נקרא רק כשמפסיקים להקליד. אם הערך הרשמי השתנה מבחוץ — התיבה מתעדכנת.
 */
export function useDebouncedSearch(committed, commit) {
  const [text, setText] = useState(committed);
  const debounced = useDebouncedValue(text.trim());

  useEffect(() => {
    if (debounced !== committed) commit(debounced);
  }, [debounced]); // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    setText((current) => (current.trim() === committed ? current : committed));
  }, [committed]);

  return [text, setText];
}
