import { ApiError, describeError } from '../../api/client.js';
import { categoriesApi } from '../../api/endpoints.js';
import Field from '../../components/form/Field.jsx';
import FormAlert from '../../components/form/FormAlert.jsx';
import SubmitButton from '../../components/form/SubmitButton.jsx';
import { useToast } from '../../components/Toast.jsx';
import { useForm } from '../../hooks/useForm.js';
import { categoryStyle } from '../../lib/categoryTheme.js';
import { maxLength, minLength, required, validateWith } from '../../lib/validation.js';

const validate = validateWith({
  name: [required('צריך לתת שם לקטגוריה'), minLength(2, 'השם קצר מדי'), maxLength(50, 'עד 50 תווים')]
});

export default function CategoriesPanel({ categories, onAdded }) {
  const toast = useToast();
  const form = useForm({ name: '' }, validate);
  // הצבע נגזר מה-Id, והמסד נותן את ה-Id הבא בתור — כך אפשר להראות מראש איזה צבע תקבל הקטגוריה.
  const nextId = categories.reduce((max, c) => Math.max(max, c.id), 0) + 1;

  const onSubmit = async ({ name }) => {
    try {
      const created = await categoriesApi.create({ name: name.trim() });
      onAdded(created);
      form.fill({ name: '' });
      toast.success(`הקטגוריה "${created.name}" נוספה`, 'אפשר לבחור בה כבר עכשיו בטופס החוג.');
    } catch (error) {
      // שם תפוס — מציגים את ההודעה ליד השדה עצמו.
      if (error instanceof ApiError && error.status === 409) {
        throw new ApiError({ status: 409, message: error.message, fieldErrors: { name: error.message } });
      }
      throw error;
    }
  };

  return (
    <aside className="admin-aside" aria-labelledby="categories-title">
      <h2 id="categories-title" className="aside-title">קטגוריות</h2>

      <ul className="category-list">
        {categories.map((c) => (
          <li key={c.id} className="category-item" style={categoryStyle(c.id)}>
            <span className="chip-dot" aria-hidden="true" />
            {c.name}
          </li>
        ))}
      </ul>

      <form ref={form.formRef} className="category-form" onSubmit={form.handleSubmit(onSubmit)} noValidate>
        <Field
          label="קטגוריה חדשה"
          maxLength={50}
          hint={
            <>
              <span className="next-color" style={categoryStyle(nextId)} aria-hidden="true" />
              כל קטגוריה מקבלת צבע משלה, אוטומטית.
            </>
          }
          {...form.field('name')}
        />
        <FormAlert message={form.formError && describeError(form.formError)} />
        <SubmitButton submitting={form.submitting} className="btn btn-primary btn-block" busyText="מוסיפה…">
          הוספת קטגוריה
        </SubmitButton>
      </form>
    </aside>
  );
}
