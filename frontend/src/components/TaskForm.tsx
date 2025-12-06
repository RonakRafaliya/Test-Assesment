import { FormEvent, useEffect, useMemo, useState } from 'react';
import { AuthUser } from '../types/auth';
import { TaskInput, TaskStatus } from '../types/task';
import { UserSelector } from './UserSelector';
import { validateTaskTitle, validateTaskDescription, extractValidationErrors } from '../utils/validation';
import axios from 'axios';

type TaskFormProps = {
  initialValue?: TaskInput;
  users: AuthUser[];
  onSubmit: (payload: TaskInput) => Promise<void> | void;
  submitLabel?: string;
  onError?: (errors: Record<string, string[]>) => void;
};

const defaultTask: TaskInput = {
  title: '',
  description: '',
  status: 'todo',
  assigneeIds: [],
};

const statusOptions: TaskStatus[] = ['todo', 'in_progress', 'done'];

export const TaskForm = ({
  initialValue,
  users,
  onSubmit,
  submitLabel = 'Create Task',
  onError,
}: TaskFormProps) => {
  const computedInitialValue = useMemo<TaskInput>(
    () => initialValue ?? { ...defaultTask },
    [initialValue],
  );

  const [form, setForm] = useState<TaskInput>(computedInitialValue);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setForm(computedInitialValue);
    setFieldErrors({});
  }, [computedInitialValue]);

  const validateForm = (): boolean => {
    const newFieldErrors: Record<string, string[]> = {};

    const titleValidation = validateTaskTitle(form.title);
    if (!titleValidation.isValid) {
      newFieldErrors.title = titleValidation.errors;
    }

    const descriptionValidation = validateTaskDescription(form.description || '');
    if (!descriptionValidation.isValid) {
      newFieldErrors.description = descriptionValidation.errors;
    }

    setFieldErrors(newFieldErrors);
    return Object.keys(newFieldErrors).length === 0;
  };

  const handleChange = (key: keyof TaskInput, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    // Clear error when user starts typing
    if (fieldErrors[key as string]) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[key as string];
        return newErrors;
      });
    }
  };

  const handleAssigneeChange = (userIds: string[]) => {
    setForm((prev) => ({ ...prev, assigneeIds: userIds }));
    if (fieldErrors.assigneeIds) {
      setFieldErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors.assigneeIds;
        return newErrors;
      });
    }
  };

  const handleBlur = (field: 'title' | 'description') => {
    if (field === 'title') {
      const validation = validateTaskTitle(form.title);
      setFieldErrors((prev) => ({
        ...prev,
        title: validation.isValid ? [] : validation.errors,
      }));
    } else if (field === 'description') {
      const validation = validateTaskDescription(form.description || '');
      setFieldErrors((prev) => ({
        ...prev,
        description: validation.isValid ? [] : validation.errors,
      }));
    }
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFieldErrors({});

    if (!validateForm()) {
      return;
    }

    setLoading(true);
    try {
      await onSubmit(form);
      // Only reset form if not editing (no initialValue)
      if (!initialValue) {
        setForm({ ...defaultTask });
      }
    } catch (err) {
      if (axios.isAxiosError(err)) {
        const validationErrors = extractValidationErrors(err);
        if (validationErrors) {
          setFieldErrors(validationErrors);
          if (onError) {
            onError(validationErrors);
          }
        } else if (onError) {
          onError({ general: [err.message || 'Failed to save task'] });
        }
      } else if (onError) {
        onError({ general: [err instanceof Error ? err.message : 'Failed to save task'] });
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <form className="task-form" onSubmit={handleSubmit}>
      {fieldErrors.general && fieldErrors.general.length > 0 && (
        <div className="form-error">{fieldErrors.general[0]}</div>
      )}
      <div className="form-group">
        <label htmlFor="task-title">Title</label>
        <input
          id="task-title"
          type="text"
          value={form.title}
          onChange={(event) => handleChange('title', event.target.value)}
          onBlur={() => handleBlur('title')}
          className={fieldErrors.title && fieldErrors.title.length > 0 ? 'error' : ''}
        />
        {fieldErrors.title && fieldErrors.title.length > 0 && (
          <div className="field-error">{fieldErrors.title[0]}</div>
        )}
      </div>
      <div className="form-group">
        <label htmlFor="task-description">Description</label>
        <textarea
          id="task-description"
          value={form.description || ''}
          onChange={(event) => handleChange('description', event.target.value)}
          onBlur={() => handleBlur('description')}
          className={fieldErrors.description && fieldErrors.description.length > 0 ? 'error' : ''}
          rows={4}
        />
        {fieldErrors.description && fieldErrors.description.length > 0 && (
          <div className="field-error">{fieldErrors.description[0]}</div>
        )}
        {!fieldErrors.description && form.description && (
          <div className="field-hint">{form.description.length}/5000 characters</div>
        )}
      </div>
      <div className="form-row">
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
        <div className="form-group">
          <label htmlFor="task-assignees">Assignees</label>
          <UserSelector
            users={users}
            selectedUserIds={form.assigneeIds || []}
            onSelectionChange={handleAssigneeChange}
          />
          {fieldErrors.assigneeIds && fieldErrors.assigneeIds.length > 0 && (
            <div className="field-error">{fieldErrors.assigneeIds[0]}</div>
          )}
        </div>
      </div>
      <button type="submit" disabled={loading}>
        {loading ? 'Saving…' : submitLabel}
      </button>
    </form>
  );
};

