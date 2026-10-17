import { useEffect, useRef } from 'react';

/**
 * חלון מודאלי על בסיס <dialog>: הדפדפן נועל את הפוקוס בפנים, ו-Esc / לחיצה על הרקע סוגרים.
 * התוכן נבנה מחדש בכל פתיחה — כך טופס תמיד מתחיל נקי.
 * busy: בזמן שמירה אי אפשר לסגור.
 * הפוקוס הראשון: האלמנט שמסומן data-autofocus (ה-autoFocus של React לא עובד בתוך dialog שעוד לא נפתח).
 */
export default function Modal({ open, onClose, labelledBy, busy = false, size = 'sm', children }) {
  const ref = useRef(null);
  const pressedOnBackdrop = useRef(false);

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) {
      dialog.showModal();
      dialog.querySelector('[data-autofocus]')?.focus();
    }
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestClose = () => {
    if (!busy) onClose();
  };

  return (
    <dialog
      ref={ref}
      className={`dialog dialog-${size}`}
      aria-labelledby={labelledBy}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      // סוגרים רק אם גם הלחיצה וגם השחרור היו על הרקע (ולא גרירה מתוך שדה החוצה).
      onMouseDown={(e) => { pressedOnBackdrop.current = e.target === ref.current; }}
      onClick={(e) => {
        if (pressedOnBackdrop.current && e.target === ref.current) requestClose();
      }}
    >
      {open && children}
    </dialog>
  );
}
