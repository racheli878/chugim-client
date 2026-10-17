import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError, describeError } from '../../api/client.js';
import { categoriesApi, coursesApi, enrollmentsApi } from '../../api/endpoints.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import AsyncList from '../../components/AsyncList.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Pagination from '../../components/Pagination.jsx';
import StateMessage from '../../components/StateMessage.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch.js';
import { usePagedQuery } from '../../hooks/usePagedQuery.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { dayLabel, formatDate, formatTime, isPastDate } from '../../lib/format.js';
import CourseCard, { CourseCardSkeleton } from './CourseCard.jsx';
import CourseFilters from './CourseFilters.jsx';
import { applyFilterChanges, hasActiveFilters, readFilters, toApiQuery } from './courseFilters.js';
import { useEnrolledCourseIds } from './useEnrolledCourseIds.js';

const FLASH_MS = 1400;

function resultsText(total, filtered) {
  if (total === 0) return '';
  if (total === 1) return filtered ? 'נמצא חוג אחד' : 'חוג אחד';
  return filtered ? `נמצאו ${total} חוגים` : `${total} חוגים`;
}

export default function CoursesPage() {
  usePageTitle('כל החוגים');
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);

  const updateFilters = useCallback(
    (changes, options) => setParams((current) => applyFilterChanges(current, changes), options),
    [setParams]
  );

  const courses = usePagedQuery(
    (signal) => coursesApi.list(toApiQuery(filters), signal),
    params.toString(),
    { onPageOverflow: (lastPage) => updateFilters({ page: lastPage }, { replace: true }) }
  );

  const [searchText, setSearchText] = useDebouncedSearch(filters.search, (search) =>
    updateFilters({ search }, { replace: true })
  );

  const [categories, setCategories] = useState([]);
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  const enrolled = useEnrolledCourseIds(!isAdmin);
  const [pendingId, setPendingId] = useState(null);
  const [flash, setFlash] = useState({});
  const [startedCourse, setStartedCourse] = useState(null);
  const listTopRef = useRef(null);

  const changePage = (page) => {
    updateFilters({ page });
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---- הרשמה ----
  const flashCard = (courseId, kind) => {
    setFlash((current) => ({ ...current, [courseId]: kind }));
    setTimeout(() => setFlash(({ [courseId]: _done, ...rest }) => rest), FLASH_MS);
  };

  /** טוען מחדש חוג אחד מהשרת, כדי להציג את מספר המקומות האמיתי. */
  const refreshCourse = async (courseId) => {
    try {
      const fresh = await coursesApi.get(courseId);
      courses.updateItem(fresh);
      return fresh;
    } catch {
      return null;
    }
  };

  const enroll = async (course) => {
    setPendingId(course.id);
    try {
      await enrollmentsApi.enroll(course.id);
      enrolled.add(course.id);
      flashCard(course.id, 'joined');
      toast.success(
        `יש! נרשמת ל${course.title}`,
        `נתראה בימי ${dayLabel(course.dayOfWeek)} ב-${formatTime(course.startTime)}. ההרשמה מחכה לך ב"החוגים שלי".`,
        { action: { label: 'לחוגים שלי', to: '/my' } }
      );
      await refreshCourse(course.id);
    } catch (error) {
      await handleEnrollError(course, error);
    } finally {
      setPendingId(null);
    }
  };

  // חוג שכבר התחיל: מותר להצטרף, אבל קודם מוודאים שהיא יודעת שהשיעורים שעברו לא יחזרו.
  const requestEnroll = (course) => {
    if (isPastDate(course.startDate)) setStartedCourse(course);
    else enroll(course);
  };

  const confirmStartedEnroll = () => {
    const course = startedCourse;
    setStartedCourse(null);
    enroll(course);
  };

  // 409 יכול להיות שלושה דברים שונים. בודקים מה המצב עכשיו בשרת, ולא מסתמכים על נוסח ההודעה.
  const handleEnrollError = async (course, error) => {
    if (!(error instanceof ApiError) || error.status !== 409) {
      if (error?.status !== 401) toast.error('ההרשמה לא הצליחה', describeError(error));
      return;
    }

    const [mine, fresh] = await Promise.all([enrolled.refresh(), refreshCourse(course.id)]);

    if (mine?.has(course.id)) {
      toast.info('את כבר רשומה לחוג הזה', 'הוא מחכה לך ב"החוגים שלי".', { action: { label: 'לחוגים שלי', to: '/my' } });
    } else if (fresh && fresh.availableSpots <= 0) {
      flashCard(course.id, 'missed');
      toast.warning(
        'אוף, מישהי הקדימה אותך בשנייה',
        'המקום האחרון נתפס והחוג התמלא. יש עוד חוגים מקסימים עם מקום.',
        { action: { label: 'לחוגים שיש בהם מקום', to: '/courses?spots=1' } }
      );
    } else {
      toast.warning('לא הצלחנו לרשום אותך הפעם', describeError(error));
    }
  };

  const filtered = hasActiveFilters(filters);
  const { data } = courses;

  return (
    <div className="container page">
      <header className="page-head">
        <h1 className="page-title">איזה חוג בא לך השנה?</h1>
        <p className="page-subtitle">כל עיגול הוא מקום בחוג. עיגול צבעוני כבר תפוס, ועיגול ריק מחכה רק לך.</p>
      </header>

      <CourseFilters
        searchText={searchText}
        onSearchText={setSearchText}
        categories={categories}
        filters={filters}
        onChange={updateFilters}
      />

      <div ref={listTopRef} className="results-line" aria-live="polite">
        {data && resultsText(data.totalCount, filtered)}
        {data && data.totalPages > 1 && <span> · עמוד {data.page} מתוך {data.totalPages}</span>}
      </div>

      <AsyncList
        query={courses}
        errorTitle="לא הצלחנו לטעון את החוגים"
        skeleton={
          <div className="course-grid" aria-busy="true">
            {Array.from({ length: 6 }, (_, i) => <CourseCardSkeleton key={i} />)}
            <span className="visually-hidden" role="status">טוענים חוגים…</span>
          </div>
        }
        empty={
          filtered ? (
            <StateMessage
              title="לא מצאנו חוג שמתאים לחיפוש"
              action={
                <button type="button" className="btn btn-ghost" onClick={() => updateFilters({ search: '', categoryId: null, onlyAvailable: false })}>
                  ניקוי הסינון
                </button>
              }
            >
              אולי כדאי לנסות מילה אחרת או קטגוריה אחרת.
            </StateMessage>
          ) : (
            <StateMessage title="עוד אין חוגים">החוגים החדשים יופיעו כאן ממש בקרוב.</StateMessage>
          )
        }
      >
        {(page) => (
          <>
            <div className={`course-grid${courses.isRefreshing ? ' is-refreshing' : ''}`} aria-busy={courses.isRefreshing || undefined}>
              {page.items.map((course) => (
                <CourseCard
                  key={course.id}
                  course={course}
                  isAdmin={isAdmin}
                  isEnrolled={enrolled.ids.has(course.id)}
                  pending={pendingId === course.id}
                  flash={flash[course.id]}
                  onEnroll={requestEnroll}
                />
              ))}
            </div>
            <Pagination page={page.page} totalPages={page.totalPages} onChange={changePage} label="עמודי חוגים" />
          </>
        )}
      </AsyncList>

      <ConfirmDialog
        open={Boolean(startedCourse)}
        tone="primary"
        title={startedCourse && `החוג "${startedCourse.title}" כבר התחיל`}
        confirmLabel="כן, להירשם"
        cancelLabel="לא עכשיו"
        onConfirm={confirmStartedEnroll}
        onCancel={() => setStartedCourse(null)}
      >
        {startedCourse &&
          `הוא נפתח ב-${formatDate(startedCourse.startDate)}. אפשר להצטרף עכשיו, אבל השיעורים שכבר היו לא יחזרו.`}
      </ConfirmDialog>
    </div>
  );
}
