import { Task } from '../types/task';

type TaskListProps = {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  if (!tasks.length) {
    return <p className="empty-state">No tasks yet.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => (
        <article key={task.id} className="task-card">
          <header className="task-card__header">
            <h3>{task.title}</h3>
            <span className={`status status-${task.status}`}>{task.status.replace('_', ' ')}</span>
          </header>
          <p>{task.description}</p>
          <dl>
            <div>
              <dt>Owner</dt>
              <dd>
                {task.owner.firstName} {task.owner.lastName}
              </dd>
            </div>
            <div>
              <dt>Assignees</dt>
              <dd>{task.assignees.map((assignee) => assignee.firstName).join(', ') || '—'}</dd>
            </div>
          </dl>
          {(onEdit || onDelete) && (
            <footer className="task-card__actions">
              {onEdit && (
                <button type="button" onClick={() => onEdit(task)}>
                  Edit
                </button>
              )}
              {onDelete && (
                <button type="button" onClick={() => onDelete(task)} className="danger">
                  Delete
                </button>
              )}
            </footer>
          )}
        </article>
      ))}
    </div>
  );
};

