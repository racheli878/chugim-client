import { createContext, useCallback, useContext, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';

// הודעות קופצות קצרות ("יש! נרשמת…", "אוף, מישהי הקדימה אותך…").
// toast.success(title, message?, { action?: { label, to } })

const ToastContext = createContext(null);
const DURATION_MS = 6000;
const MAX_VISIBLE = 4;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);
  const nextId = useRef(1);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((t) => t.id !== id));
  }, []);

  const show = useCallback((type, title, message, options = {}) => {
    const id = nextId.current++;
    setToasts((current) => [...current, { id, type, title, message, action: options.action }].slice(-MAX_VISIBLE));
    setTimeout(() => dismiss(id), options.duration ?? DURATION_MS);
    return id;
  }, [dismiss]);

  // אובייקט יציב — רכיבים יכולים לשים אותו ב-dependencies בלי לולאות.
  const api = useMemo(() => ({
    success: (...args) => show('success', ...args),
    error: (...args) => show('error', ...args),
    warning: (...args) => show('warning', ...args),
    info: (...args) => show('info', ...args),
    dismiss
  }), [show, dismiss]);

  return (
    <ToastContext.Provider value={api}>
      {children}
      <div className="toast-region" aria-live="polite">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={`toast toast-${t.type}`}
            role={t.type === 'error' || t.type === 'warning' ? 'alert' : 'status'}
          >
            <span className="toast-dot" aria-hidden="true" />
            <div className="toast-body">
              <p className="toast-title">{t.title}</p>
              {(t.message || t.action) && (
                <p className="toast-message">
                  {t.message}
                  {t.action && (
                    <>
                      {' '}
                      <Link to={t.action.to} onClick={() => dismiss(t.id)}>{t.action.label}</Link>
                    </>
                  )}
                </p>
              )}
            </div>
            <button type="button" className="toast-close" aria-label="סגירת ההודעה" onClick={() => dismiss(t.id)}>
              ×
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  return useContext(ToastContext);
}
