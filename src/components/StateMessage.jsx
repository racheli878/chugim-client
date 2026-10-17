// מצב ריק / שגיאה ברשימות: נקודות קטנות, כותרת, הסבר ופעולה.
export default function StateMessage({ tone = 'empty', title, children, action }) {
  return (
    <div className={`state-message state-${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <span className="state-dots" aria-hidden="true">
        <span /><span /><span />
      </span>
      <h2 className="state-title">{title}</h2>
      {children && <p className="state-text">{children}</p>}
      {action}
    </div>
  );
}
