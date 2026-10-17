// הודעת שגיאה כללית לטופס (לא שייכת לשדה מסוים). children — קישור המשך אופציונלי.
export default function FormAlert({ message, children }) {
  if (!message) return null;
  return (
    <div className="form-alert" role="alert">
      <span className="form-alert-dot" aria-hidden="true" />
      <p>
        {message}
        {children && <> {children}</>}
      </p>
    </div>
  );
}
