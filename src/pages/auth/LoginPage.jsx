import { Link, useLocation, useNavigate } from 'react-router-dom';
import { describeError } from '../../api/client.js';
import { useAuth } from '../../auth/AuthContext.jsx';
import Field from '../../components/form/Field.jsx';
import FormAlert from '../../components/form/FormAlert.jsx';
import PasswordField from '../../components/form/PasswordField.jsx';
import SubmitButton from '../../components/form/SubmitButton.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useForm } from '../../hooks/useForm.js';
import { firstName } from '../../lib/format.js';
import { email, required, validateWith } from '../../lib/validation.js';
import AuthLayout from './AuthLayout.jsx';

const validate = validateWith({
  email: [required('צריך למלא מייל'), email()],
  password: [required('צריך למלא סיסמה')]
});

// משתמשות ה-seed — מילוי בלחיצה, כדי שיהיה נוח להדגים את המערכת.
const DEMO_ACCOUNTS = [
  { label: 'מנהלת', email: 'admin@chugim.dev', password: 'Admin123!' },
  { label: 'שרה', email: 'sara@chugim.dev', password: 'Demo1234!' },
  { label: 'רחל', email: 'rachel@chugim.dev', password: 'Demo1234!' },
  { label: 'לאה', email: 'leah@chugim.dev', password: 'Demo1234!' }
];

export default function LoginPage() {
  const { login } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({ email: '', password: '' }, validate);

  const onSubmit = async ({ email: mail, password }) => {
    const user = await login({ email: mail.trim(), password });
    toast.success(`שמחות שחזרת, ${firstName(user.fullName)}!`);
    navigate(location.state?.from ?? '/courses', { replace: true });
  };

  const wrongCredentials = form.formError?.status === 401;
  const alertMessage = wrongCredentials
    ? 'המייל או הסיסמה לא נכונים. כדאי לבדוק ולנסות שוב.'
    : form.formError && describeError(form.formError);

  return (
    <AuthLayout
      headline="יש מקום בשבילך. כדאי לתפוס אותו מהר."
      text="בכל חוג יש מספר מקומות מוגבל, והם נתפסים לפי הסדר. מי שנרשמת ראשונה מקבלת את המקום."
    >
      <form ref={form.formRef} className="auth-form" onSubmit={form.handleSubmit(onSubmit)} noValidate aria-labelledby="login-title">
        <div>
          <h1 id="login-title" className="auth-title">שמחות שחזרת!</h1>
          <p className="auth-subtitle">התחברי כדי להירשם לחוגים ולראות את החוגים שלך.</p>
        </div>

        <Field label="מייל" type="email" autoComplete="email" ltr autoFocus {...form.field('email')} />
        <PasswordField label="סיסמה" autoComplete="current-password" invalid={wrongCredentials} {...form.field('password')} />

        <FormAlert message={alertMessage} />

        <SubmitButton submitting={form.submitting} busyText="מתחברת…">כניסה</SubmitButton>

        <p className="auth-switch">
          פעם ראשונה כאן? <Link to="/register" state={location.state}>פתיחת חשבון</Link>
        </p>
      </form>

      <details className="demo-accounts">
        <summary>חשבונות להדגמה</summary>
        <p className="demo-accounts-note">לחיצה ממלאת את הפרטים בטופס.</p>
        <div className="demo-accounts-list">
          {DEMO_ACCOUNTS.map((account) => (
            <button
              key={account.email}
              type="button"
              className="demo-account"
              onClick={() => form.fill({ email: account.email, password: account.password })}
            >
              <strong>{account.label}</strong>
              <span dir="ltr">{account.email}</span>
            </button>
          ))}
        </div>
      </details>
    </AuthLayout>
  );
}
