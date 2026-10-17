import { Link } from 'react-router-dom';
import BrandMark from '../../components/BrandMark.jsx';

// מסך מפוצל: צד צבעוני עם המסר, וצד לטופס. משותף לכניסה ולפתיחת חשבון.

const COLORS = ['#E8456B', '#10A39B', '#FF8B3D', '#4FAE5C', '#8B6AE6', '#EE6CB7', '#22B4D9'];
const PATTERN = '110110111011101111011100111101101101';

function SeatPattern() {
  return (
    <div className="seat-pattern" aria-hidden="true">
      {PATTERN.split('').map((taken, i) => (
        <span
          key={i}
          className={taken === '1' ? 'is-taken' : undefined}
          style={{ '--seat': COLORS[i % COLORS.length], '--i': i }}
        />
      ))}
    </div>
  );
}

export default function AuthLayout({ headline, text, children }) {
  return (
    <div className="auth">
      <section className="auth-panel">
        <Link to="/courses" className="brand">
          <BrandMark size={12} />
          <span className="brand-name">חוגים</span>
        </Link>
        <div className="auth-pitch">
          <p className="auth-headline">{headline}</p>
          <p className="auth-text">{text}</p>
        </div>
        <SeatPattern />
      </section>

      <main id="main" className="auth-main">
        <div className="auth-card">{children}</div>
      </main>
    </div>
  );
}
