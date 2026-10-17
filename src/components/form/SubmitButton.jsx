// כפתור שליחה שמראה מחוון טעינה וחוסם לחיצה כפולה.
export default function SubmitButton({ submitting, children, busyText, className = 'btn btn-primary btn-lg btn-block' }) {
  return (
    <button type="submit" className={className} disabled={submitting} aria-busy={submitting || undefined}>
      {submitting && <span className="spinner" aria-hidden="true" />}
      {submitting ? busyText ?? children : children}
    </button>
  );
}
