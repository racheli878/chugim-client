import { useEffect } from 'react';

// כותרת הלשונית לכל דף ("החוגים שלי · חוגים") — עוזרת בניווט בין לשוניות ולקוראי מסך.
export function usePageTitle(title) {
  useEffect(() => {
    document.title = title ? `${title} · חוגים` : 'חוגים';
  }, [title]);
}
