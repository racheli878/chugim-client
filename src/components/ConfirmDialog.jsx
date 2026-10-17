import { useId } from 'react';
import Modal from './Modal.jsx';

// חלון אישור. כפתור הביטול מקבל פוקוס ראשון — כך Enter בטעות לא מבצע כלום.
// tone: 'danger' לפעולה הרסנית (מחיקה, ביטול) · 'primary' לאישור רגיל (הרשמה עם הסתייגות).
export default function ConfirmDialog({
  open, title, children, confirmLabel, cancelLabel = 'ביטול', tone = 'danger', busy = false, onConfirm, onCancel
}) {
  const titleId = useId();

  return (
    <Modal open={open} onClose={onCancel} labelledBy={titleId} busy={busy}>
      <div className="dialog-body">
        <h2 id={titleId} className="dialog-title">{title}</h2>
        {children && <p className="dialog-text">{children}</p>}
        <div className="dialog-actions">
          <button type="button" className={`btn btn-${tone}`} disabled={busy} aria-busy={busy || undefined} onClick={onConfirm}>
            {busy && <span className="spinner" aria-hidden="true" />}
            {confirmLabel}
          </button>
          <button type="button" className="btn btn-ghost" disabled={busy} onClick={onCancel} data-autofocus>
            {cancelLabel}
          </button>
        </div>
      </div>
    </Modal>
  );
}
