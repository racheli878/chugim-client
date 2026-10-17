import { Link } from 'react-router-dom';
import { usePageTitle } from '../hooks/usePageTitle.js';

export default function NotFoundPage() {
  usePageTitle('הדף לא נמצא');
  return (
    <div className="container page empty-state">
      <p className="empty-state-number" aria-hidden="true">404</p>
      <h1 className="page-title">הדף הזה לא קיים</h1>
      <p className="page-subtitle">אולי הקישור השתנה. בואי נחזור לחוגים.</p>
      <Link to="/courses" className="btn btn-primary">לכל החוגים</Link>
    </div>
  );
}
