import { FormEvent, useEffect, useMemo, useState } from 'react';
import { TaskInput, TaskStatus } from '../types/task';

type TaskFormProps = {
  initialValue?: TaskInput;
  onSubmit: (payload: TaskInput) => void;
  submitLabel?: string;
};

const defaultTask: TaskInput = {
  title: '',
  description: '',
  status: 'todo',
  assigneeIds: [],
};

const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const TaskForm = ({ initialValue, onSubmit, submitLabel = 'Create Task' }: TaskFormProps) => {
  const computedInitialValue = useMemo<TaskInput>(
    () => initialValue ?? { ...defaultTask },
    [initialValue],
  );

  const [form, setForm] = useState<TaskInput>(computedInitialValue);

  useEffect(() => {
    setForm(computedInitialValue);
  }, [computedInitialValue]);

  const handleChange = (key: keyof TaskInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    onSubmit(form);
    setForm({ ...defaultTask });
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      <div className="form-group">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          required
          value={form.title}
          onChange={(event) => handleChange('title', event.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={form.description || ''}
          onChange={(event) => handleChange('description', event.target.value)}
        />
      </div>
      <div className="form-group">
        <label htmlFor="task-status">Status</label>
        <select
          id="task-status"
          value={form.status || 'todo'}
          onChange={(event) => handleChange('status', event.target.value)}
        >
          {statusOptions.map((status) => (
            <option key={status} value={status}>
              {status.replace('_', ' ')}
            </option>
          ))}
        </select>
      </div>
      <button type="submit">{submitLabel}</button>
    </form>
  );
};

