import { useRef, useState } from 'react';
import { ApiError } from '../api/client.js';

// מצב טופס אחד לכל הטפסים באתר: ערכים, שגיאות לפי שדה, שגיאה כללית ומצב שליחה.
// handleSubmit מריץ בדיקה מקומית, שולח, ומפזר שגיאות ולידציה מהשרת לשדות המתאימים.
export function useForm(initialValues, validate) {
  const [values, setValues] = useState(initialValues);
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const formRef = useRef(null);

  const focusFirstError = (fieldErrors) => {
    const first = Object.keys(fieldErrors)[0];
    requestAnimationFrame(() => formRef.current?.querySelector(`[name="${first}"]`)?.focus());
  };

  const clearError = (name) =>
    setErrors((current) => {
      if (!(name in current)) return current;
      const { [name]: _removed, ...rest } = current;
      return rest;
    });

  /** מחזיר את כל מה ששדה צריך: name, value, error, onChange. */
  const field = (name) => ({
    name,
    value: values[name] ?? '',
    error: errors[name],
    onChange: (event) => {
      const { type, checked, value } = event.target;
      setValues((current) => ({ ...current, [name]: type === 'checkbox' ? checked : value }));
      clearError(name);
    }
  });

  const fill = (nextValues) => {
    setValues((current) => ({ ...current, ...nextValues }));
    setErrors({});
    setFormError(null);
  };

  const handleSubmit = (onSubmit) => async (event) => {
    event.preventDefault();
    if (submitting) return;

    setFormError(null);
    const clientErrors = validate ? validate(values) : {};
    setErrors(clientErrors);
    if (Object.keys(clientErrors).length > 0) {
      focusFirstError(clientErrors);
      return;
    }

    setSubmitting(true);
    try {
      await onSubmit(values);
    } catch (error) {
      const serverFieldErrors = error instanceof ApiError ? pickKnownFields(error.fieldErrors, values) : {};
      if (Object.keys(serverFieldErrors).length > 0) {
        setErrors(serverFieldErrors);
        focusFirstError(serverFieldErrors);
      } else {
        setFormError(error);
      }
    } finally {
      setSubmitting(false);
    }
  };

  return { values, errors, formError, submitting, field, fill, handleSubmit, formRef };
}

// שגיאה מהשרת על שדה שאין בטופס (נדיר) תוצג כשגיאה כללית במקום להיעלם.
function pickKnownFields(fieldErrors, values) {
  return Object.fromEntries(Object.entries(fieldErrors).filter(([name]) => name in values));
}
