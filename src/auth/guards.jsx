import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './AuthContext.jsx';

// השמירה כאן היא לנוחות בלבד (לא להציג מסך שאין בו טעם). ההרשאה האמיתית נבדקת בשרת.

export function RequireAuth({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  return children;
}

export function RequireAdmin({ children }) {
  const { isAuthenticated, isAdmin } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  if (!isAdmin) return <Navigate to="/courses" replace />;
  return children;
}

// מחוברת שמגיעה לכניסה/הרשמה — חוזרת לאן שרצתה להגיע (או לחוגים).
export function GuestOnly({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (isAuthenticated) return <Navigate to={location.state?.from ?? '/courses'} replace />;
  return children;
}
