import { Navigate, Route, Routes } from 'react-router-dom';
import { GuestOnly, RequireAdmin, RequireAuth } from './auth/guards.jsx';
import Layout from './components/Layout.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import Placeholder from './pages/Placeholder.jsx';
import LoginPage from './pages/auth/LoginPage.jsx';
import RegisterPage from './pages/auth/RegisterPage.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<GuestOnly><LoginPage /></GuestOnly>} />
      <Route path="/register" element={<GuestOnly><RegisterPage /></GuestOnly>} />

      <Route element={<Layout />}>
        <Route index element={<Navigate to="/courses" replace />} />
        <Route path="/courses" element={<Placeholder title="איזה חוג בא לך השנה?" />} />
        <Route path="/my" element={<RequireAuth><Placeholder title="החוגים שלי" /></RequireAuth>} />
        <Route path="/admin" element={<RequireAdmin><Placeholder title="ניהול" /></RequireAdmin>} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>
    </Routes>
  );
}
