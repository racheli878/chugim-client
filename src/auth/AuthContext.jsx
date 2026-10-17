import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { configureApi } from '../api/client.js';
import { authApi } from '../api/endpoints.js';
import { useToast } from '../components/Toast.jsx';

const STORAGE_KEY = 'chugim.session';
const AuthContext = createContext(null);

// ההתחברות נשמרת בדפדפן כדי שרענון הדף לא ינתק. אם האחסון חסום — פשוט לא נשמרת.
function readSession() {
  try {
    const session = JSON.parse(localStorage.getItem(STORAGE_KEY));
    if (!session || new Date(session.expiresAtUtc) <= new Date()) return null;
    return session;
  } catch {
    return null;
  }
}

function writeSession(session) {
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    // אחסון לא זמין (גלישה פרטית וכו') — ההתחברות תחזיק עד סגירת הלשונית.
  }
}

export function AuthProvider({ children }) {
  const [session, setSession] = useState(readSession);
  const navigate = useNavigate();
  const toast = useToast();

  const sessionRef = useRef(session);
  sessionRef.current = session;

  const endSession = useCallback((reason) => {
    setSession(null);
    writeSession(null);
    if (reason === 'expired') {
      toast.info('צריך להתחבר שוב', 'עבר זמן מאז ההתחברות, אז ניתקנו אותך לביטחון.');
      navigate('/login');
    } else {
      toast.info('התנתקת. נתראה בקרוב!');
      navigate('/courses');
    }
  }, [navigate, toast]);

  // מוגדר בזמן הרינדור (ולא ב-effect) — כדי שגם הבקשה הראשונה של המסכים כבר תישלח עם ה-token.
  configureApi({
    tokenGetter: () => sessionRef.current?.token ?? null,
    unauthorizedHandler: () => endSession('expired')
  });

  // ניתוק אוטומטי ברגע שה-token פג.
  useEffect(() => {
    if (!session) return undefined;
    const msLeft = new Date(session.expiresAtUtc).getTime() - Date.now();
    const timer = setTimeout(() => endSession('expired'), Math.max(msLeft, 0));
    return () => clearTimeout(timer);
  }, [session, endSession]);

  const startSession = useCallback((response) => {
    const next = {
      token: response.token,
      expiresAtUtc: response.expiresAtUtc,
      user: { id: response.userId, fullName: response.fullName, role: response.role }
    };
    setSession(next);
    writeSession(next);
    return next.user;
  }, []);

  const value = useMemo(() => ({
    user: session?.user ?? null,
    isAuthenticated: Boolean(session),
    isAdmin: session?.user.role === 'Admin',
    login: async (credentials) => startSession(await authApi.login(credentials)),
    register: async (details) => startSession(await authApi.register(details)),
    logout: () => endSession('user')
  }), [session, startSession, endSession]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  return useContext(AuthContext);
}
