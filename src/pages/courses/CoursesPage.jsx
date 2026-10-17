import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { ApiError, describeError } from '../../api/client.js';
import { categoriesApi, coursesApi, enrollmentsApi } from '../../api/endpoints.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import StateMessage from '../../components/StateMessage.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useDebouncedValue } from '../../hooks/useDebouncedValue.js';
import { dayLabel, formatTime } from '../../lib/format.js';
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
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);
  const queryKey = params.toString();

  const [courses, setCourses] = useState({ status: 'loading', data: null, error: null });
  const [reloadKey, setReloadKey] = useState(0);
  const [categories, setCategories] = useState([]);
  const [pendingId, setPendingId] = useState(null);
  const [flash, setFlash] = useState({});
  const enrolled = useEnrolledCourseIds(!isAdmin);
  const listTopRef = useRef(null);

  const updateFilters = useCallback(
    (changes, options) => setParams((current) => applyFilterChanges(current, changes), options),
    [setParams]
  );

  // ---- חיפוש: מקלידים חופשי, והכתובת מתעדכנת רק כשמפסיקים להקליד ----
  const [searchText, setSearchText] = useState(filters.search);
  const debouncedSearch = useDebouncedValue(searchText.trim());
  useEffect(() => {
    if (debouncedSearch !== filters.search) updateFilters({ search: debouncedSearch }, { replace: true });
  }, [debouncedSearch]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    // סינון שהתאפס מבחוץ (ניקוי / "אחורה") — מעדכנים גם את תיבת החיפוש.
    setSearchText((current) => (current.trim() === filters.search ? current : filters.search));
  }, [filters.search]);

  // ---- קטגוריות (פעם אחת) ----
  useEffect(() => {
    categoriesApi.list().then(setCategories).catch(() => setCategories([]));
  }, []);

  // ---- החוגים: בקשה חדשה בכל שינוי בכתובת; בקשה ישנה מבוטלת ----
  useEffect(() => {
    const controller = new AbortController();
    setCourses((current) => ({ ...current, status: 'loading', error: null }));

    coursesApi
      .list(toApiQuery(filters), controller.signal)
      .then((data) => {
        if (data.totalPages > 0 && filters.page > data.totalPages) {
          updateFilters({ page: data.totalPages }, { replace: true });
          return;
        }
        setCourses({ status: 'ready', data, error: null });
      })
      .catch((error) => {
        if (error.name !== 'AbortError') setCourses((current) => ({ ...current, status: 'error', error }));
      });

    return () => controller.abort();
  }, [queryKey, reloadKey]); // eslint-disable-line react-hooks/exhaustive-deps

  const changePage = (page) => {
    updateFilters({ page });
    listTopRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // ---- הרשמה ----
  const flashCard = (courseId, kind) => {
    setFlash((current) => ({ ...current, [courseId]: kind }));
    setTimeout(() => setFlash(({ [courseId]: _done, ...rest }) => rest), FLASH_MS);
  };

  const replaceCourse = (course) =>
    setCourses((current) => ({
      ...current,
      data: current.data && { ...current.data, items: current.data.items.map((c) => (c.id === course.id ? course : c)) }
    }));

  /** טוען מחדש חוג אחד מהשרת, כדי להציג את מספר המקומות האמיתי. */
  const refreshCourse = async (courseId) => {
    try {
      const fresh = await coursesApi.get(courseId);
      replaceCourse(fresh);
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

  // ---- תצוגה ----
  const { status, data, error } = courses;
  const filtered = hasActiveFilters(filters);
  const isRefreshing = status === 'loading' && data;

  let content;
  if (status === 'error' && !data) {
    content = (
      <StateMessage
        tone="error"
        title="לא הצלחנו לטעון את החוגים"
        action={
          <button type="button" className="btn btn-ghost" onClick={() => setReloadKey((k) => k + 1)}>
            <Icon name="refresh" />לנסות שוב
          </button>
        }
      >
        {describeError(error)}
      </StateMessage>
    );
  } else if (!data) {
    content = (
      <div className="course-grid" aria-busy="true">
        {Array.from({ length: 6 }, (_, i) => <CourseCardSkeleton key={i} />)}
        <span className="visually-hidden" role="status">טוענת חוגים…</span>
      </div>
    );
  } else if (data.items.length === 0) {
    content = filtered ? (
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
    );
  } else {
    content = (
      <>
        {status === 'error' && (
          <p className="inline-error" role="alert">
            {describeError(error)}{' '}
            <button type="button" className="link-button" onClick={() => setReloadKey((k) => k + 1)}>לנסות שוב</button>
          </p>
        )}
        <div className={`course-grid${isRefreshing ? ' is-refreshing' : ''}`} aria-busy={isRefreshing || undefined}>
          {data.items.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              isAdmin={isAdmin}
              isEnrolled={enrolled.ids.has(course.id)}
              pending={pendingId === course.id}
              flash={flash[course.id]}
              onEnroll={enroll}
            />
          ))}
        </div>
        <Pagination page={data.page} totalPages={data.totalPages} onChange={changePage} label="עמודי חוגים" />
      </>
    );
  }

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
        {data && data.totalPages > 1 && (
          <span className="results-page"> · עמוד {data.page} מתוך {data.totalPages}</span>
        )}
      </div>

      {content}
    </div>
  );
}

