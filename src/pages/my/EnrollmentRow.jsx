import { categoryStyle } from '../../lib/categoryTheme.js';
import { formatDateTime, formatWeekly } from '../../lib/format.js';

// שורה אחת ברשימת ההרשמות. במצב מנהלת מוצג גם שם המשתתפת.
export default function EnrollmentRow({ enrollment, showParticipant, onCancel }) {
  const isActive = enrollment.status === 'Active';
  const enrolledOn = formatDateTime(enrollment.enrolledAtUtc);

  return (
    <li className={`enrollment-row${isActive ? '' : ' is-cancelled'}`} style={categoryStyle(enrollment.courseCategoryId)}>
      <span className="enrollment-icon" aria-hidden="true"><span /></span>

      <div className="enrollment-main">
        <h2 className="enrollment-title">{enrollment.courseTitle}</h2>
        <p className="enrollment-meta">
          {showParticipant && <strong className="enrollment-participant">{enrollment.participantName}</strong>}
          <span>{enrollment.courseCategoryName}</span>
          <span>{formatWeekly(enrollment.courseDayOfWeek, enrollment.courseStartTime)}</span>
          <span>{enrollment.courseLocation}</span>
          <span>{showParticipant ? 'נרשמה' : 'נרשמת'} ב-{enrolledOn}</span>
        </p>
      </div>

      <span className={`status-pill ${isActive ? 'is-active' : 'is-cancelled'}`}>{isActive ? 'רשומה' : 'בוטלה'}</span>

      {isActive && (
        <button type="button" className="btn btn-danger-ghost" onClick={() => onCancel(enrollment)}>
          ביטול הרשמה
          <span className="visually-hidden"> ל{enrollment.courseTitle}</span>
        </button>
      )}
    </li>
  );
}

export function EnrollmentRowSkeleton() {
  return (
    <li className="enrollment-row is-skeleton" aria-hidden="true">
      <span className="skeleton enrollment-icon" />
      <div className="enrollment-main">
        <span className="skeleton skeleton-title" />
        <span className="skeleton skeleton-line short" />
      </div>
    </li>
  );
}
