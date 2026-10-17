import { useState } from 'react';
import Field from './Field.jsx';

// שדה סיסמה עם כפתור "הצגה / הסתרה".
export default function PasswordField(props) {
  const [visible, setVisible] = useState(false);

  return (
    <Field
      {...props}
      type={visible ? 'text' : 'password'}
      ltr
      adornment={
        <button
          type="button"
          className="field-adornment"
          aria-label={visible ? 'הסתרת הסיסמה' : 'הצגת הסיסמה'}
          aria-pressed={visible}
          onClick={() => setVisible((v) => !v)}
        >
          <svg aria-hidden="true" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12z" />
            <circle cx="12" cy="12" r="3" />
            {visible && <path d="M4 4l16 16" />}
          </svg>
        </button>
      }
    />
  );
}
