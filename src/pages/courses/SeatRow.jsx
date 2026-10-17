// שורת המושבים: עיגול לכל מקום. צבעוני = תפוס, ריק = פנוי, כתום = המקום האחרון.
// בחוג גדול (מעל 20 מקומות — יותר משתי שורות בכרטיס צר) מוצג פס מילוי עם מספרים במקום עיגולים.

const MAX_DOTS = 20;

export default function SeatRow({ capacity, taken, highlightNewest }) {
  const free = Math.max(capacity - taken, 0);
  const label = `${taken} מתוך ${capacity} מקומות תפוסים`;

  if (capacity > MAX_DOTS) {
    return (
      <div className="seat-summary">
        <div className="seat-bar" role="img" aria-label={label}>
          <span style={{ width: `${Math.min(100, (taken / capacity) * 100)}%` }} />
        </div>
        <span className="seat-summary-text" aria-hidden="true">{taken} מתוך {capacity} תפוסים</span>
      </div>
    );
  }

  return (
    <div className="seat-row" role="img" aria-label={label}>
      {Array.from({ length: capacity }, (_, i) => {
        const isTaken = i < taken;
        const classes = ['seat'];
        if (isTaken) classes.push('is-taken');
        if (!isTaken && free === 1) classes.push('is-last');
        if (highlightNewest && i === taken - 1) classes.push('is-new');
        return <span key={i} className={classes.join(' ')} />;
      })}
    </div>
  );
}
