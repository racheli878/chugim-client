import { useEffect, useId, useState } from 'react';
import { describeError } from '../../api/client.js';
import { coursesApi } from '../../api/endpoints.js';
import Field from '../../components/form/Field.jsx';
import FormAlert from '../../components/form/FormAlert.jsx';
import SubmitButton from '../../components/form/SubmitButton.jsx';
import Icon from '../../components/Icon.jsx';
import Modal from '../../components/Modal.jsx';
import { useForm } from '../../hooks/useForm.js';
import { DAYS, formatTime } from '../../lib/format.js';
import { maxLength, minLength, range, required, validateWith } from '../../lib/validation.js';

// אותם חוקים כמו CourseRequest בשרת, ועוד אחד: בעריכה אי אפשר לרדת מתחת למספר הרשומות.
function buildValidator(enrolledCount) {
  return validateWith({
    title: [required('צריך לתת לחוג שם'), minLength(2, 'השם קצר מדי'), maxLength(100, 'השם ארוך מדי')],
    categoryId: [required('צריך לבחור קטגוריה')],
    instructorName: [required('צריך למלא את שם המדריכה'), minLength(2, 'השם קצר מדי'), maxLength(100, 'השם ארוך מדי')],
    dayOfWeek: [required('צריך לבחור יום')],
    startTime: [required('צריך לבחור שעה')],
    startDate: [required('צריך לבחור תאריך פתיחה')],
    location: [required('צריך למלא מיקום'), maxLength(200, 'המיקום ארוך מדי')],
    price: [required('צריך למלא מחיר (0 = חינם)'), range(0, 10000, 'המחיר צריך להיות בין 0 ל-10,000')],
    capacity: [
      required('צריך למלא מספר מקומות'),
      range(1, 500, 'מספר שלם בין 1 ל-500', { integer: true }),
      range(enrolledCount, 500, `לא ניתן להקטין מתחת למספר הרשומות (${enrolledCount})`)
    ],
    description: [maxLength(1000, 'התיאור ארוך מדי (עד 1000 תווים)')]
  });
}

const toFormValues = (course) => ({
  title: course?.title ?? '',
  categoryId: course ? String(course.categoryId) : '',
  instructorName: course?.instructorName ?? '',
  dayOfWeek: course?.dayOfWeek ?? '',
  startTime: course ? formatTime(course.startTime) : '',
  startDate: course?.startDate ?? '',
  location: course?.location ?? '',
  price: course ? String(course.price) : '',
  capacity: course ? String(course.capacity) : '',
  description: course?.description ?? ''
});

const toRequest = (v) => ({
  title: v.title.trim(),
  description: v.description.trim(),
  categoryId: Number(v.categoryId),
  instructorName: v.instructorName.trim(),
  dayOfWeek: v.dayOfWeek,
  startTime: v.startTime.length === 5 ? `${v.startTime}:00` : v.startTime,
  startDate: v.startDate,
  location: v.location.trim(),
  price: Number(v.price),
  capacity: Number(v.capacity)
});

function CourseForm({ course, categories, titleId, onClose, onSaved, onBusyChange }) {
  const isNew = !course;
  const enrolledCount = course?.enrolledCount ?? 0;
  const [validate] = useState(() => buildValidator(enrolledCount));
  const form = useForm(toFormValues(course), validate);

  useEffect(() => onBusyChange(form.submitting), [form.submitting, onBusyChange]);

  const onSubmit = async (values) => {
    const request = toRequest(values);
    if (isNew) await coursesApi.create(request);
    else await coursesApi.update(course.id, request);
    onSaved({ isNew, title: request.title });
  };

  return (
    <form ref={form.formRef} className="dialog-body" onSubmit={form.handleSubmit(onSubmit)} noValidate>
      <div className="dialog-head">
        <h2 id={titleId} className="dialog-title">{isNew ? 'חוג חדש' : `עריכת חוג: ${course.title}`}</h2>
        <button type="button" className="icon-button" aria-label="סגירה" onClick={onClose} disabled={form.submitting}>
          <Icon name="close" />
        </button>
      </div>

      <div className="form-grid">
        <div className="span-2">
          <Field label="שם החוג" data-autofocus maxLength={100} {...form.field('title')} />
        </div>
        <Field label="קטגוריה" as="select" {...form.field('categoryId')}>
          <option value="">בחירת קטגוריה</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </Field>
        <Field label="מדריכה" maxLength={100} {...form.field('instructorName')} />
        <Field label="יום בשבוע" as="select" {...form.field('dayOfWeek')}>
          <option value="">בחירת יום</option>
          {DAYS.map((d) => <option key={d.value} value={d.value}>{d.label}</option>)}
        </Field>
        <Field label="שעה" type="time" ltr {...form.field('startTime')} />
        <Field label="תאריך פתיחה" type="date" ltr {...form.field('startDate')} />
        <Field label="מיקום" maxLength={200} {...form.field('location')} />
        <Field label="מחיר (₪)" type="number" inputMode="decimal" min="0" max="10000" step="any" ltr hint="0 = חינם" {...form.field('price')} />
        <Field
          label="מספר מקומות"
          type="number"
          inputMode="numeric"
          min={Math.max(1, enrolledCount)}
          max="500"
          ltr
          hint={isNew ? 'בין 1 ל-500' : `רשומות כרגע: ${enrolledCount}`}
          {...form.field('capacity')}
        />
        <div className="span-2">
          <Field label="תיאור" as="textarea" maxLength={1000} hint="לא חובה. עד 1000 תווים." {...form.field('description')} />
        </div>
      </div>

      <FormAlert message={form.formError && describeError(form.formError)} />

      <div className="dialog-actions">
        <SubmitButton submitting={form.submitting} className="btn btn-primary" busyText="שומרים…">
          {isNew ? 'הוספת החוג' : 'שמירת השינויים'}
        </SubmitButton>
        <button type="button" className="btn btn-ghost" onClick={onClose} disabled={form.submitting}>ביטול</button>
      </div>
    </form>
  );
}

/** course: null — חוג חדש; אחרת — עריכה. */
export default function CourseFormDialog({ open, course, categories, onClose, onSaved }) {
  const titleId = useId();
  const [busy, setBusy] = useState(false);

  return (
    <Modal open={open} onClose={onClose} labelledBy={titleId} busy={busy} size="lg">
      <CourseForm
        course={course}
        categories={categories}
        titleId={titleId}
        onClose={onClose}
        onSaved={onSaved}
        onBusyChange={setBusy}
      />
    </Modal>
  );
}
