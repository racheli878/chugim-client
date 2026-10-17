import { useId, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import Icon from '../../components/Icon.jsx';
import { categoryStyle } from '../../lib/categoryTheme.js';
import { formatDate, formatPrice, formatWeekly, isPastDate } from '../../lib/format.js';
import SeatRow from './SeatRow.jsx';

// כרטיס חוג בצורת "כרטיס כניסה": מידע מימין, ו"ספח" משמאל עם מספר המקומות והכפתור.

function cardStatus(course, isEnrolled) {
  if (isEnrolled) return 'enrolled';
  if (course.availableSpots <= 0) return 'full';
  return course.availableSpots === 1 ? 'last' : 'open';
}

const SPOTS_LABEL = { full: 'אין מקום', last: 'מקום אחרון!', open: 'מקומות מחכים' };

// תיאור מקוצר לשתי שורות. אם הוא באמת נחתך — מופיע "לקריאת הכול", שפותח אותו בתוך הכרטיס.
function CourseDescription({ text }) {
  const ref = useRef(null);
  const id = useId();
  const [expanded, setExpanded] = useState(false);
  const [truncated, setTruncated] = useState(false);

  useLayoutEffect(() => {
    const el = ref.current;
    const check = () => setTruncated(el.scrollHeight > el.clientHeight + 1);
    check();
    const observer = new ResizeObserver(check); // רוחב הכרטיס משתנה עם החלון
    observer.observe(el);
    return () => observer.disconnect();
  }, [text]);

  return (
    <div className="course-description-wrap">
      <p ref={ref} id={id} className={`course-description${expanded ? ' is-expanded' : ''}`}>{text}</p>
      {(truncated || expanded) && (
        <button
          type="button"
          className="read-more"
          aria-expanded={expanded}
          aria-controls={id}
          onClick={() => setExpanded((open) => !open)}
        >
          {expanded ? 'להסתיר' : 'לקריאת הכול'}
        </button>
      )}
    </div>
  );
}

function Stub({ course, status, isAdmin, pending, onEnroll }) {
  if (status === 'enrolled') {
    return (
      <div className="course-stub">
        <div className="stub-joined">
          <span className="stub-check"><Icon name="check" size={30} strokeWidth={2.6} /></span>
          <span className="stub-joined-text">את בפנים!</span>
        </div>
        <Link to="/my" className="stub-link">לחוגים שלי</Link>
      </div>
    );
  }

  return (
    <div className="course-stub">
      <div className="stub-count">
        <span className="stub-number">{Math.max(course.availableSpots, 0)}</span>
        <span className="stub-label">{SPOTS_LABEL[status]}</span>
      </div>

      {isAdmin ? (
        <Link to={`/admin?q=${encodeURIComponent(course.title)}`} className="btn btn-ghost btn-block">לניהול</Link>
      ) : status === 'full' ? (
        <button type="button" className="btn btn-full btn-block" disabled>החוג התמלא</button>
      ) : (
        <button
          type="button"
          className="btn btn-primary btn-block btn-enroll"
          disabled={pending}
          aria-busy={pending || undefined}
          aria-describedby={`course-${course.id}-title`}
          onClick={() => onEnroll(course)}
        >
          {pending ? <><span className="spinner" aria-hidden="true" />רגע…</> : 'הירשמי'}
        </button>
      )}
    </div>
  );
}

export default function CourseCard({ course, isEnrolled, isAdmin, pending, flash, onEnroll }) {
  const status = cardStatus(course, isEnrolled);
  const titleId = `course-${course.id}-title`;

  return (
    <article
      className={`course-card is-${status}${flash ? ` flash-${flash}` : ''}`}
      style={categoryStyle(course.categoryId)}
      aria-labelledby={titleId}
    >
      <div className="course-info">
        <span className="category-chip">
          <span className="chip-dot" aria-hidden="true" />
          {course.categoryName}
        </span>
        <h2 id={titleId} className="course-title">{course.title}</h2>
        <p className="course-instructor">עם {course.instructorName}</p>
        {course.description && <CourseDescription text={course.description} />}

        <ul className="course-meta">
          <li><Icon name="clock" size={16} />{formatWeekly(course.dayOfWeek, course.startTime)}</li>
          <li><Icon name="pin" size={16} />{course.location}</li>
          <li className={isPastDate(course.startDate) ? 'is-started' : undefined}>
            <Icon name="calendar" size={16} />
            {isPastDate(course.startDate) ? 'התחיל' : 'מתחיל'} ב-{formatDate(course.startDate)}
          </li>
          <li className="course-price">{formatPrice(course.price)}</li>
        </ul>

        <SeatRow capacity={course.capacity} taken={course.enrolledCount} highlightNewest={flash === 'joined'} />
      </div>

      <Stub course={course} status={status} isAdmin={isAdmin} pending={pending} onEnroll={onEnroll} />
    </article>
  );
}

export function CourseCardSkeleton() {
  return (
    <div className="course-card is-skeleton" aria-hidden="true">
      <div className="course-info">
        <span className="skeleton skeleton-chip" />
        <span className="skeleton skeleton-title" />
        <span className="skeleton skeleton-line" />
        <span className="skeleton skeleton-line short" />
        <span className="skeleton skeleton-dots" />
      </div>
      <div className="course-stub">
        <span className="skeleton skeleton-number" />
        <span className="skeleton skeleton-button" />
      </div>
    </div>
  );
}
