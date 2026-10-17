import Icon from '../../components/Icon.jsx';
import { categoryStyle } from '../../lib/categoryTheme.js';
import { formatDate, formatWeekly } from '../../lib/format.js';

function seatsState(course) {
  if (course.availableSpots <= 0) return 'full';
  return course.availableSpots === 1 ? 'last' : 'open';
}

// טבלת החוגים של המנהלת. בטלפון כל שורה הופכת לכרטיס (data-label מציג את שם העמודה).
export default function AdminCourseTable({ courses, busy, onParticipants, onEdit, onDelete }) {
  return (
    <div className={`table-wrap${busy ? ' is-refreshing' : ''}`} aria-busy={busy || undefined}>
      <table className="admin-table">
        <caption className="visually-hidden">רשימת החוגים</caption>
        <thead>
          <tr>
            <th scope="col">חוג</th>
            <th scope="col">מתי</th>
            <th scope="col">מקומות</th>
            <th scope="col"><span className="visually-hidden">פעולות</span></th>
          </tr>
        </thead>
        <tbody>
          {courses.map((course) => {
            const state = seatsState(course);
            const hasParticipants = course.enrolledCount > 0;
            return (
              <tr key={course.id} style={categoryStyle(course.categoryId)}>
                <td data-label="חוג">
                  <div className="table-course">
                    <span className="table-dot" aria-hidden="true" />
                    <div>
                      <div className="table-title">{course.title}</div>
                      <div className="table-sub">{course.categoryName} · {course.instructorName}</div>
                    </div>
                  </div>
                </td>
                <td data-label="מתי">
                  <div>{formatWeekly(course.dayOfWeek, course.startTime)}</div>
                  <div className="table-sub">מ-{formatDate(course.startDate)}</div>
                </td>
                <td data-label="מקומות">
                  <div className={`table-seats is-${state}`}>
                    <span className="mini-bar" aria-hidden="true">
                      <span style={{ width: `${Math.min(100, (course.enrolledCount / course.capacity) * 100)}%` }} />
                    </span>
                    <span>
                      {course.enrolledCount}/{course.capacity}
                      <span className="visually-hidden"> מקומות תפוסים</span>
                    </span>
                  </div>
                </td>
                <td className="table-actions">
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onParticipants(course)}>
                    <Icon name="users" size={16} />משתתפות
                  </button>
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onEdit(course)}>
                    <Icon name="edit" size={16} />עריכה
                    <span className="visually-hidden"> של {course.title}</span>
                  </button>
                  <button
                    type="button"
                    className="btn btn-danger-ghost btn-sm"
                    disabled={hasParticipants}
                    title={hasParticipants ? 'אי אפשר למחוק חוג שיש בו משתתפות רשומות' : undefined}
                    onClick={() => onDelete(course)}
                  >
                    <Icon name="trash" size={16} />מחיקה
                    <span className="visually-hidden">
                      {' '}של {course.title}{hasParticipants ? ' (לא זמין — יש משתתפות רשומות)' : ''}
                    </span>
                  </button>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function AdminTableSkeleton() {
  return (
    <div className="table-wrap" aria-hidden="true">
      {Array.from({ length: 4 }, (_, i) => (
        <div key={i} className="table-skeleton-row">
          <span className="skeleton skeleton-title" />
          <span className="skeleton skeleton-line short" />
        </div>
      ))}
    </div>
  );
}
