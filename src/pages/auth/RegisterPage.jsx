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
import { email, matches, maxLength, minLength, required, validateWith } from '../../lib/validation.js';
import AuthLayout from './AuthLayout.jsx';

const MIN_PASSWORD = 8;

// אותם חוקים כמו RegisterRequest בשרת.
const validate = validateWith({
  fullName: [required('צריך למלא שם מלא'), minLength(2, 'השם קצר מדי'), maxLength(100, 'השם ארוך מדי')],
  email: [required('צריך למלא מייל'), email(), maxLength(200, 'כתובת המייל ארוכה מדי')],
  password: [required('צריך לבחור סיסמה'), minLength(MIN_PASSWORD, `הסיסמה צריכה להיות באורך ${MIN_PASSWORD} תווים לפחות`)],
  confirmPassword: [required('צריך להקליד את הסיסמה שוב'), matches('password', 'הסיסמאות לא זהות')]
});

// מד אורך הסיסמה — באותה שפה של "מושבים" כמו בכל האתר.
function PasswordSeats({ length }) {
  return (
    <span className="password-seats" aria-hidden="true">
      {Array.from({ length: MIN_PASSWORD }, (_, i) => (
        <span key={i} className={i < length ? 'is-taken' : undefined} />
      ))}
    </span>
  );
}

function passwordHint(length) {
  if (length >= MIN_PASSWORD) return 'מעולה, הסיסמה באורך טוב';
  const left = MIN_PASSWORD - length;
  return length === 0 ? `לפחות ${MIN_PASSWORD} תווים` : left === 1 ? 'עוד תו אחד' : `עוד ${left} תווים`;
}

export default function RegisterPage() {
  const { register } = useAuth();
  const toast = useToast();
  const navigate = useNavigate();
  const location = useLocation();
  const form = useForm({ fullName: '', email: '', password: '', confirmPassword: '' }, validate);
  const passwordLength = form.values.password.length;

  const onSubmit = async ({ fullName, email: mail, password }) => {
    const user = await register({ fullName: fullName.trim(), email: mail.trim(), password });
    toast.success(`ברוכה הבאה, ${firstName(user.fullName)}!`, 'עכשיו אפשר לבחור חוג ולהירשם.');
    navigate(location.state?.from ?? '/courses', { replace: true });
  };

  const isConflict = form.formError?.status === 409;

  return (
    <AuthLayout
      headline="חשבון אחד, וכל החוגים פתוחים בפנייך."
      text="פותחים חשבון פעם אחת, ואז נרשמים בלחיצה לכל חוג שיש בו מקום — ורואים את כל החוגים שלך במקום אחד."
    >
      <form ref={form.formRef} className="auth-form" onSubmit={form.handleSubmit(onSubmit)} noValidate aria-labelledby="register-title">
        <div>
          <h1 id="register-title" className="auth-title">נעים להכיר!</h1>
          <p className="auth-subtitle">כמה פרטים קטנים, ואפשר להתחיל להירשם לחוגים.</p>
        </div>

        <Field label="שם מלא" autoComplete="name" autoFocus {...form.field('fullName')} />
        <Field label="מייל" type="email" autoComplete="email" ltr {...form.field('email')} />
        <PasswordField
          label="סיסמה"
          autoComplete="new-password"
          hint={
            <>
              <PasswordSeats length={passwordLength} />
              {passwordHint(passwordLength)}
            </>
          }
          {...form.field('password')}
        />
        <PasswordField label="אימות סיסמה" autoComplete="new-password" {...form.field('confirmPassword')} />

        <FormAlert message={form.formError && describeError(form.formError)}>
          {isConflict && <Link to="/login" state={location.state}>כבר יש לך חשבון? כניסה</Link>}
        </FormAlert>

        <SubmitButton submitting={form.submitting} busyText="פותחת חשבון…">פתיחת חשבון</SubmitButton>

        <p className="auth-switch">
          כבר יש לך חשבון? <Link to="/login" state={location.state}>כניסה</Link>
        </p>
      </form>
    </AuthLayout>
  );
}
