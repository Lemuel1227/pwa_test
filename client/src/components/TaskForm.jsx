import { useMemo, useState } from 'react';

const defaultForm = {
  title: '',
  description: '',
  status: 'pending',
  dueDate: '',
  sport: 'General',
};

const sportsOptions = ['General', 'Basketball', 'Football', 'Soccer', 'Tennis', 'Swimming'];

const TaskForm = ({ initialValues, onSubmit, onCancel, submitLabel = 'Save drill' }) => {
  const formattedInitialValues = useMemo(() => {
    if (initialValues?.dueDate) {
      return { ...initialValues, dueDate: initialValues.dueDate.split('T')[0] };
    }
    return initialValues;
  }, [initialValues]);

  const mergedInitial = useMemo(() => ({ ...defaultForm, ...formattedInitialValues }), [formattedInitialValues]);
  const [form, setForm] = useState(mergedInitial);
  const [errors, setErrors] = useState({});

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const validate = () => {
    const nextErrors = {};
    if (!form.title.trim()) {
      nextErrors.title = 'Title is required';
    }
    return nextErrors;
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    const payload = {
      ...form,
      dueDate: form.dueDate ? new Date(form.dueDate).toISOString() : undefined,
    };

    const result = await onSubmit(payload);
    if (result?.success) {
      setForm(defaultForm);
      setErrors({});
    } else if (result?.error) {
      setErrors({ form: result.error });
    }
  };

  return (
    <form className="form-card task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="title">Title</label>
        <input
          id="title"
          name="title"
          value={form.title}
          onChange={handleChange}
          placeholder="Eg. Ball-handling drills"
          required
        />
        {errors.title ? <span className="alert">{errors.title}</span> : null}
      </div>

      <div className="form-group">
        <label htmlFor="description">Description</label>
        <textarea
          id="description"
          name="description"
          value={form.description}
          onChange={handleChange}
          rows={3}
          placeholder="Add training notes or objectives"
        />
      </div>

      <div className="form-group">
        <label htmlFor="sport">Sport focus</label>
        <select id="sport" name="sport" value={form.sport} onChange={handleChange}>
          {sportsOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="status">Status</label>
        <select id="status" name="status" value={form.status} onChange={handleChange}>
          <option value="pending">Pending</option>
          <option value="in-progress">In progress</option>
          <option value="completed">Completed</option>
        </select>
      </div>

      <div className="form-group">
        <label htmlFor="dueDate">Due date</label>
        <input id="dueDate" name="dueDate" type="date" value={form.dueDate} onChange={handleChange} />
      </div>

      {errors.form ? <div className="alert">{errors.form}</div> : null}

      <div className="form-actions">
        <button type="submit" className="btn btn--neutral">
          {submitLabel}
        </button>
        {onCancel ? (
          <button type="button" className="btn btn--ghost" onClick={onCancel}>
            Cancel
          </button>
        ) : null}
      </div>
    </form>
  );
};

export default TaskForm;
