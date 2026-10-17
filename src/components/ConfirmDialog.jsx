import { useEffect, useId, useRef } from 'react';

// חלון אישור מודאלי, על בסיס <dialog> של הדפדפן: נועל את הפוקוס בפנים, Esc סוגר, והרקע לא לחיץ.
// כפתור הביטול מקבל פוקוס ראשון — כך Enter בטעות לא מוחק כלום.
export default function ConfirmDialog({
  open, title, children, confirmLabel, cancelLabel = 'ביטול', busy = false, onConfirm, onCancel
}) {
  const ref = useRef(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (open && !dialog.open) dialog.showModal();
    if (!open && dialog.open) dialog.close();
  }, [open]);

  const requestClose = () => {
    if (!busy) onCancel();
  };

  return (
    <dialog
      ref={ref}
      className="dialog"
      aria-labelledby={titleId}
      onCancel={(e) => {
        e.preventDefault();
        requestClose();
      }}
      onClick={(e) => {
        if (e.target === ref.current) requestClose(); // לחיצה על הרקע
      }}
    >
      <div className="dialog-body">
        <h2 id={titleId} className="dialog-title">{title}</h2>
        {children && <p className="dialog-text">{children}</p>}
        <div className="dialog-actions">
          <button type="button" className="btn btn-danger" disabled={busy} aria-busy={busy || undefined} onClick={onConfirm}>
            {busy && <span className="spinner" aria-hidden="true" />}
            {confirmLabel}
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={requestClose} autoFocus>
            {cancelLabel}
          </button>
        </div>
      </div>
    </dialog>
  );
}
