import { categoryTheme } from '../lib/categoryTheme.js';
import { firstName } from '../lib/format.js';

// עיגול עם האות הראשונה של השם. הצבע נגזר מה-Id, כך שלכל אחת יש צבע קבוע משלה.
export default function Avatar({ id, name, size = 38 }) {
  return (
    <span
      className="avatar"
      aria-hidden="true"
      style={{ background: categoryTheme(id).color, width: size, height: size, fontSize: Math.round(size * 0.47) }}
    >
      {firstName(name).charAt(0)}
    </span>
  );
}
