import { useId, useState } from 'react';
import { coursesApi } from '../../api/endpoints.js';
import AsyncList from '../../components/AsyncList.jsx';
import Avatar from '../../components/Avatar.jsx';
import Icon from '../../components/Icon.jsx';
import Modal from '../../components/Modal.jsx';
import Pagination from '../../components/Pagination.jsx';
import StateMessage from '../../components/StateMessage.jsx';
import { usePagedQuery } from '../../hooks/usePagedQuery.js';
import { formatDateTime } from '../../lib/format.js';

const PAGE_SIZE = 8;

function ParticipantsList({ course }) {
  const [page, setPage] = useState(1);
  const enrollments = usePagedQuery(
    (signal) => coursesApi.enrollments(course.id, { page, pageSize: PAGE_SIZE }, signal),
    page,
    { onPageOverflow: setPage }
  );

  return (
    <AsyncList
      query={enrollments}
      errorTitle="לא הצלחנו לטעון את המשתתפות"
      skeleton={<p className="dialog-text" role="status">טוענת…</p>}
      empty={<StateMessage title="עוד אין משתתפות בחוג הזה">כשמישהי תירשם, היא תופיע כאן.</StateMessage>}
    >
      {(result) => (
        <>
          <ul className={`participant-list${enrollments.isRefreshing ? ' is-refreshing' : ''}`}>
            {result.items.map((e) => (
              <li key={e.id} className={`participant${e.status === 'Active' ? '' : ' is-cancelled'}`}>
                <Avatar id={e.userId} name={e.participantName} size={34} />
                <span className="participant-name">{e.participantName}</span>
                <span className="participant-date">נרשמה ב-{formatDateTime(e.enrolledAtUtc)}</span>
                <span className={`status-pill ${e.status === 'Active' ? 'is-active' : 'is-cancelled'}`}>
                  {e.status === 'Active' ? 'רשומה' : 'בוטלה'}
                </span>
              </li>
            ))}
          </ul>
          <Pagination page={result.page} totalPages={result.totalPages} onChange={setPage} label="עמודי משתתפות" />
        </>
      )}
    </AsyncList>
  );
}

export default function ParticipantsDialog({ course, onClose }) {
  const titleId = useId();

  return (
    <Modal open={Boolean(course)} onClose={onClose} labelledBy={titleId} size="lg">
      {course && (
        <div className="dialog-body">
          <div className="dialog-head">
            <div>
              <h2 id={titleId} className="dialog-title">המשתתפות ב{course.title}</h2>
              <p className="dialog-subtitle">{course.enrolledCount} מתוך {course.capacity} מקומות תפוסים</p>
            </div>
            <button type="button" className="icon-button" aria-label="סגירה" onClick={onClose} data-autofocus>
              <Icon name="close" />
            </button>
          </div>
          <ParticipantsList course={course} />
        </div>
      )}
    </Modal>
  );
}
