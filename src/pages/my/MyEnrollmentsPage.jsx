import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ApiError, describeError } from '../../api/client.js';
import { enrollmentsApi } from '../../api/endpoints.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import AsyncList from '../../components/AsyncList.jsx';
import ConfirmDialog from '../../components/ConfirmDialog.jsx';
import Pagination from '../../components/Pagination.jsx';
import StateMessage from '../../components/StateMessage.jsx';
import { useToast } from '../../components/Toast.jsx';
import { usePageParam } from '../../hooks/usePageParam.js';
import { usePagedQuery } from '../../hooks/usePagedQuery.js';
import EnrollmentRow, { EnrollmentRowSkeleton } from './EnrollmentRow.jsx';

const PAGE_SIZE = 10;

// השרת מחזיר קודם את ההרשמות הפעילות. לכן אם בעמוד 1 כבר מופיעה הרשמה מבוטלת (או שיש עמוד אחד) —
// כל הפעילות נמצאות בו, ואפשר לספור אותן בדיוק.
function participantSubtitle(data) {
  if (!data || data.page !== 1) return 'כל החוגים שנרשמת אליהם, במקום אחד.';
  const active = data.items.filter((e) => e.status === 'Active').length;
  const exact = data.totalPages === 1 || active < data.items.length;
  if (!exact) return 'את רשומה להרבה חוגים. איזה כיף!';
  if (active === 0) return 'כרגע את לא רשומה לאף חוג. יש הרבה חוגים שמחכים לך!';
  if (active === 1) return 'את רשומה לחוג אחד. איזה כיף!';
  if (active === 2) return 'את רשומה לשני חוגים. איזה כיף!';
  return `את רשומה ל-${active} חוגים. איזה כיף!`;
}

export default function MyEnrollmentsPage() {
  const { isAdmin } = useAuth();
  const toast = useToast();
  const [page, setPage] = usePageParam();
  const enrollments = usePagedQuery(
    (signal) => enrollmentsApi.list({ page, pageSize: PAGE_SIZE }, signal),
    page,
    { onPageOverflow: (lastPage) => setPage(lastPage, { replace: true }) }
  );
  const [toCancel, setToCancel] = useState(null);
  const [cancelling, setCancelling] = useState(false);

  const confirmCancel = async () => {
    const enrollment = toCancel;
    setCancelling(true);
    try {
      await enrollmentsApi.cancel(enrollment.id);
      toast.success(
        'ההרשמה בוטלה',
        isAdmin
          ? `המקום של ${enrollment.participantName} ב${enrollment.courseTitle} פנוי עכשיו.`
          : `המקום ב${enrollment.courseTitle} פנוי עכשיו למישהי אחרת.`
      );
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        toast.info('ההרשמה הזו כבר בוטלה', 'עדכנו את הרשימה.');
      } else if (error?.status !== 401) {
        toast.error('הביטול לא הצליח', describeError(error));
      }
    } finally {
      setCancelling(false);
      setToCancel(null);
      enrollments.reload();
    }
  };

  const { data } = enrollments;

  return (
    <div className="container page page-narrow">
      <header className="page-head">
        <h1 className="page-title">{isAdmin ? 'כל ההרשמות' : 'החוגים שלי'}</h1>
        <p className="page-subtitle" aria-live="polite">
          {isAdmin
            ? data ? `${data.totalCount} הרשמות בסך הכול. הפעילות מופיעות למעלה.` : 'כל ההרשמות של כל המשתתפות.'
            : participantSubtitle(data)}
        </p>
      </header>

      <AsyncList
        query={enrollments}
        errorTitle="לא הצלחנו לטעון את ההרשמות"
        skeleton={
          <ul className="enrollment-list" aria-busy="true">
            {Array.from({ length: 3 }, (_, i) => <EnrollmentRowSkeleton key={i} />)}
          </ul>
        }
        empty={
          isAdmin ? (
            <StateMessage title="עוד אין הרשמות">כשמשתתפות יירשמו לחוגים, ההרשמות יופיעו כאן.</StateMessage>
          ) : (
            <StateMessage title="עוד לא נרשמת לאף חוג" action={<Link to="/courses" className="btn btn-primary">בואי נמצא לך חוג</Link>}>
              יש חוגים מקסימים שמחכים לך — ובחלק מהם כבר לא נשארו הרבה מקומות.
            </StateMessage>
          )
        }
      >
        {(result) => (
          <>
            <ul className={`enrollment-list${enrollments.isRefreshing ? ' is-refreshing' : ''}`} aria-busy={enrollments.isRefreshing || undefined}>
              {result.items.map((enrollment) => (
                <EnrollmentRow key={enrollment.id} enrollment={enrollment} showParticipant={isAdmin} onCancel={setToCancel} />
              ))}
            </ul>
            <Pagination
              page={result.page}
              totalPages={result.totalPages}
              onChange={(p) => { setPage(p); window.scrollTo({ top: 0, behavior: 'smooth' }); }}
              label="עמודי הרשמות"
            />
          </>
        )}
      </AsyncList>

      <ConfirmDialog
        open={Boolean(toCancel)}
        title={
          toCancel && (isAdmin
            ? `לבטל את ההרשמה של ${toCancel.participantName}?`
            : `לוותר על המקום ב${toCancel.courseTitle}?`)
        }
        confirmLabel="כן, לבטל"
        cancelLabel={isAdmin ? 'לא, להשאיר' : 'לא, אני נשארת'}
        busy={cancelling}
        onConfirm={confirmCancel}
        onCancel={() => setToCancel(null)}
      >
        {toCancel && (isAdmin
          ? `ההרשמה ל${toCancel.courseTitle} תבוטל, והמקום יתפנה מיד למשתתפת אחרת.`
          : 'המקום שלך יתפנה מיד, ומישהי אחרת תוכל לתפוס אותו.')}
      </ConfirmDialog>
    </div>
  );
}
