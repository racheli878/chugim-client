import { describeError } from '../api/client.js';
import Icon from './Icon.jsx';
import StateMessage from './StateMessage.jsx';

/**
 * ארבעת המצבים של כל רשימה: שגיאה ראשונה / טעינה ראשונה / ריקה / יש נתונים.
 * אם טעינה חוזרת נכשלה — הנתונים הקודמים נשארים, ומעליהם הודעה קטנה עם "לנסות שוב".
 */
export default function AsyncList({ query, errorTitle, skeleton, empty, children }) {
  const { status, data, error, reload } = query;
  const retry = (
    <button type="button" className="btn btn-ghost" onClick={reload}>
      <Icon name="refresh" />לנסות שוב
    </button>
  );

  if (status === 'error' && !data) {
    return <StateMessage tone="error" title={errorTitle} action={retry}>{describeError(error)}</StateMessage>;
  }
  if (!data) return skeleton;
  if (data.items.length === 0) return empty;

  return (
    <>
      {status === 'error' && (
        <p className="inline-error" role="alert">
          {describeError(error)}{' '}
          <button type="button" className="link-button" onClick={reload}>לנסות שוב</button>
        </p>
      )}
      {children(data)}
    </>
  );
}
