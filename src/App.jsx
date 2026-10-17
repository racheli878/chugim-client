import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestOnly, RequireAdmin, RequireAuth } from './auth/guards.jsx';
import Layout from './components/Layout.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';
import CoursesPage from './pages/courses/CoursesPage.jsx';
import MyEnrollmentsPage from './pages/my/MyEnrollmentsPage.jsx';
import AdminPage from './pages/admin/AdminPage.jsx';

// כל האתר למחוברות בלבד, חוץ ממסכי הכניסה וההרשמה. (השרת אוכף את אותו כלל.)
export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

      <Route element={<RequireAuth><Layout /></RequireAuth>}>
        <Route index element={<Navigate to="/courses" replace />} />
        <Route path="/courses" element={<CoursesPage />} />
        <Route path="/my" element={<MyEnrollmentsPage />} />
        <Route path="/admin" element={<RequireAdmin><AdminPage /></RequireAdmin>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
