import { useCallback, useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { describeError } from '../../api/client.js';
import { categoriesApi, coursesApi } from '../../api/endpoints.js';
import AsyncList from '../../components/AsyncList.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Icon from '../../components/Icon.jsx';
import Pagination from '../../components/Pagination.jsx';
import StateMessage from '../../components/StateMessage.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useDebouncedSearch } from '../../hooks/useDebouncedSearch.js';
import { usePagedQuery } from '../../hooks/usePagedQuery.js';
import { usePageTitle } from '../../hooks/usePageTitle.js';
import { applyFilterChanges, readFilters, toApiQuery } from '../courses/courseFilters.js';
import AdminCourseTable, { AdminTableSkeleton } from './AdminCourseTable.jsx';
import CategoriesPanel from './CategoriesPanel.jsx';
import CourseFormDialog from './CourseFormDialog.jsx';
import ParticipantsDialog from './ParticipantsDialog.jsx';

const PAGE_SIZE = 10;

export default function AdminPage() {
  usePageTitle('ניהול');
  const toast = useToast();
  const [params, setParams] = useSearchParams();
  const filters = useMemo(() => readFilters(params), [params]);

  const updateFilters = useCallback(
    (changes, options) => setParams((current) => applyFilterChanges(current, changes), options),
    [setParams]
  );

  const courses = usePagedQuery(
    (signal) => coursesApi.list(toApiQuery(filters, PAGE_SIZE), signal),
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

  // חלון פתוח אחד בכל רגע: form = { course } (course=null לחוג חדש)
  const [form, setForm] = useState(null);
  const [participantsOf, setParticipantsOf] = useState(null);
  const [toDelete, setToDelete] = useState(null);
  const [deleting, setDeleting] = useState(false);

  const closeForm = useCallback(() => setForm(null), []);

  const onSaved = ({ isNew, title }) => {
    setForm(null);
    toast.success(isNew ? `החוג "${title}" נוסף` : 'השינויים נשמרו', isNew ? 'הוא כבר מופיע ברשימת החוגים.' : undefined);
    courses.reload();
  };

  const confirmDelete = async () => {
    const course = toDelete;
    setDeleting(true);
    try {
      await coursesApi.remove(course.id);
      toast.success(`החוג "${course.title}" נמחק`);
    } catch (error) {
      if (error?.status !== 401) toast.error('אי אפשר למחוק את החוג', describeError(error));
    } finally {
      setDeleting(false);
      setToDelete(null);
      courses.reload();
    }
  };

  return (
    <div className="container page">
      <header className="page-head admin-head">
        <div>
          <h1 className="page-title">ניהול חוגים</h1>
          <p className="page-subtitle">הוספה, עריכה ומחיקה של חוגים, וצפייה במשתתפות.</p>
        </div>
        <button type="button" className="btn btn-primary btn-lg" onClick={() => setForm({ course: null })}>
          <Icon name="plus" />חוג חדש
        </button>
      </header>

      <div className="admin-layout">
        <section className="admin-main" aria-label="חוגים">
          <label className="search-box admin-search">
            <Icon name="search" />
            <span className="visually-hidden">חיפוש חוג</span>
            <input
              type="search"
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              placeholder="חיפוש לפי שם חוג או מדריכה"
              maxLength={100}
            />
          </label>

          <AsyncList
            query={courses}
            errorTitle="לא הצלחנו לטעון את החוגים"
            skeleton={<AdminTableSkeleton />}
            empty={
              filters.search ? (
                <StateMessage
                  title="לא נמצא חוג כזה"
                  action={<button type="button" className="btn btn-ghost" onClick={() => updateFilters({ search: '' })}>ניקוי החיפוש</button>}
                />
              ) : (
                <StateMessage
                  title="עוד אין חוגים"
                  action={<button type="button" className="btn btn-primary" onClick={() => setForm({ course: null })}>הוספת החוג הראשון</button>}
                />
              )
            }
          >
            {(result) => (
              <>
                <AdminCourseTable
                  courses={result.items}
                  busy={courses.isRefreshing}
                  onParticipants={setParticipantsOf}
                  onEdit={(course) => setForm({ course })}
                  onDelete={setToDelete}
                />
                <Pagination page={result.page} totalPages={result.totalPages} onChange={(page) => updateFilters({ page })} label="עמודי חוגים" />
              </>
            )}
          </AsyncList>
        </section>

        <CategoriesPanel categories={categories} onAdded={(created) => setCategories((current) => [...current, created])} />
      </div>

      <CourseFormDialog
        open={Boolean(form)}
        course={form?.course ?? null}
        categories={categories}
        onClose={closeForm}
        onSaved={onSaved}
      />

      <ParticipantsDialog course={participantsOf} onClose={() => setParticipantsOf(null)} />

      <ConfirmDialog
        open={Boolean(toDelete)}
        title={toDelete && `למחוק את "${toDelete.title}"?`}
        confirmLabel="כן, למחוק"
        cancelLabel="לא, להשאיר"
        busy={deleting}
        onConfirm={confirmDelete}
        onCancel={() => setToDelete(null)}
      >
        החוג יימחק לצמיתות ולא יופיע יותר ברשימה.
      </ConfirmDialog>
    </div>
  );
}
