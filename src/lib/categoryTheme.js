// הצבע של קטגוריה נגזר מה-Id שלה, מתוך פלטה קבועה. קטגוריה חדשה מקבלת אוטומטית את הגוון הבא.
// color — עיגולים ונקודות · deep — טקסט על רקע בהיר · tint — רקעים בהירים
const PALETTE = [
  { color: '#E8456B', deep: '#A8204A', tint: '#FDE8EF' },
  { color: '#10A39B', deep: '#0B6F69', tint: '#E0F5F3' },
  { color: '#FF8B3D', deep: '#B4520F', tint: '#FFEEDF' },
  { color: '#4FAE5C', deep: '#2F7A3B', tint: '#E6F5E8' },
  { color: '#8B6AE6', deep: '#5B3DB8', tint: '#EFEAFC' },
  { color: '#EE6CB7', deep: '#A9327B', tint: '#FDEAF5' },
  { color: '#22B4D9', deep: '#0E7591', tint: '#E1F5FA' },
  { color: '#C9763B', deep: '#8A4B1E', tint: '#F8EDE3' }
];

export function categoryTheme(categoryId) {
  const index = (((Number(categoryId) || 1) - 1) % PALETTE.length + PALETTE.length) % PALETTE.length;
  return PALETTE[index];
}

/** משתני CSS לשימוש ב-style={...} של רכיב. */
export function categoryStyle(categoryId) {
  const { color, deep, tint } = categoryTheme(categoryId);
  return { '--cat': color, '--cat-deep': deep, '--cat-tint': tint };
}
