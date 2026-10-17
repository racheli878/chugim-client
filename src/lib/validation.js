// בדיקות טפסים בצד הלקוח — משקפות את החוקים של השרת, כדי לתת משוב מיידי.
// השרת עדיין בודק בעצמו; שגיאות שמגיעות ממנו מוצגות באותם שדות.

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const required = (message) => (value) => (String(value ?? '').trim() ? null : message);

export const email = (message = 'כתובת המייל לא נראית תקינה') => (value) =>
  !value || EMAIL_PATTERN.test(String(value).trim()) ? null : message;

export const minLength = (min, message) => (value) =>
  !value || String(value).length >= min ? null : message;

export const maxLength = (max, message) => (value) =>
  !value || String(value).trim().length <= max ? null : message;

export const matches = (otherField, message) => (value, values) =>
  value === values[otherField] ? null : message;

/** בונה פונקציית בדיקה מתוך { שדה: [בדיקות] }. לכל שדה מוחזרת השגיאה הראשונה בלבד. */
export function validateWith(schema) {
  return (values) => {
    const errors = {};
    for (const [name, checks] of Object.entries(schema)) {
      for (const check of checks) {
        const message = check(values[name], values);
        if (message) {
          errors[name] = message;
          break;
        }
      }
    }
    return errors;
  };
}
