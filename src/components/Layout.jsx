import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../auth/AuthContext.jsx';
import { firstName } from '../lib/format.js';
import Avatar from './Avatar.jsx';
import BrandMark from './BrandMark.jsx';

// המסגרת מוצגת רק למחוברות (היא עטופה ב-RequireAuth ב-App).
function navItems(isAdmin) {
  const items = [
    { to: '/courses', label: 'כל החוגים' },
    { to: '/my', label: isAdmin ? 'כל ההרשמות' : 'החוגים שלי' }
  ];
  if (isAdmin) items.push({ to: '/admin', label: 'ניהול' });
  return items;
}

export default function Layout() {
  const { user, isAdmin, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const mainRef = useRef(null);
  const isFirstRender = useRef(true);

  // מעבר דף: סוגר את תפריט הטלפון, גולל למעלה ומעביר את הפוקוס לתוכן — כך קורא מסך מתחיל מהדף החדש.
  useEffect(() => {
    setMenuOpen(false);
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    window.scrollTo(0, 0);
    mainRef.current?.focus({ preventScroll: true });
  }, [location.pathname]);

  return (
    <div className="app">
      <a href="#main" className="skip-link">דילוג לתוכן</a>

      <header className="site-header">
        <div className="container header-inner">
          <Link to="/courses" className="brand">
            <BrandMark />
            <span className="brand-name">חוגים</span>
          </Link>

          <button
            type="button"
            className="menu-toggle"
            aria-label={menuOpen ? 'סגירת התפריט' : 'פתיחת התפריט'}
            aria-expanded={menuOpen}
            aria-controls="site-menu"
            onClick={() => setMenuOpen((open) => !open)}
          >
            <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
              {menuOpen ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>

          <div id="site-menu" className={`site-menu${menuOpen ? ' is-open' : ''}`}>
            <nav aria-label="ניווט ראשי" className="main-nav">
              {navItems(isAdmin).map((item) => (
                <NavLink key={item.to} to={item.to} className="nav-link">
                  {item.label}
                </NavLink>
              ))}
            </nav>

            <div className="user-area">
              <span className="user-chip">
                <Avatar id={user.id} name={user.fullName} />
                היי, {firstName(user.fullName)}
                {isAdmin && <span className="role-badge">מנהלת</span>}
              </span>
              <button type="button" className="btn btn-quiet" onClick={logout}>יציאה</button>
            </div>
          </div>
        </div>
      </header>

      <main id="main" ref={mainRef} className="site-main" tabIndex={-1}>
        <Outlet />
      </main>

      <footer className="site-footer">
        <div className="container footer-inner">
          <BrandMark size={7} />
          <span>חוגים · כל מקום נתפס פעם אחת בלבד</span>
        </div>
      </footer>
    </div>
  );
}
