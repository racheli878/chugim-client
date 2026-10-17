import { useId } from 'react';

const CONTROL_CLASS = { input: 'input', select: 'select', textarea: 'textarea' };

/**
 * שדה טופס נגיש: תווית, פקד, רמז ושגיאה — מחוברים זה לזה ב-id.
 * as: 'input' | 'select' | 'textarea' · ltr: לשדות כמו מייל וסיסמה · adornment: כפתור בתוך השדה.
 */
export default function Field({ label, hint, error, invalid, as: Control = 'input', ltr, adornment, children, ...props }) {
  const id = useId();
  const hintId = `${id}-hint`;
  const errorId = `${id}-error`;
  const showHint = hint && !error;
  const describedBy = [showHint && hintId, error && errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className="field">
      <label htmlFor={id} className="field-label">{label}</label>
      <div className={`field-control${adornment ? ' has-adornment' : ''}`}>
        <Control
          id={id}
          className={`${CONTROL_CLASS[Control]}${ltr ? ' input-ltr' : ''}`}
          aria-invalid={error || invalid ? true : undefined}
          aria-describedby={describedBy}
          {...props}
        >
          {children}
        </Control>
        {adornment}
      </div>
      {showHint && <span id={hintId} className="field-hint">{hint}</span>}
      {error && <span id={errorId} className="field-error">{error}</span>}
    </div>
  );
}
