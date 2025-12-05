import { Task } from '../types/task';
import { useAuth } from '../hooks/useAuth';
import { useTaskAssignment } from '../hooks/useTaskAssignment';
import { getUserInitials, getAvatarColor, getUserFullName } from '../utils/user.utils';

type TaskListProps = {
  tasks: Task[];
  onEdit?: (task: Task) => void;
  onDelete?: (task: Task) => void;
};

export const TaskList = ({ tasks, onEdit, onDelete }: TaskListProps) => {
  const { user } = useAuth();
  const { isAssignedToCurrentUser } = useTaskAssignment(user);

  if (!tasks.length) {
    return <p className="empty-state">No tasks yet.</p>;
  }

  return (
    <div className="task-list">
      {tasks.map((task) => {
        const isAssignedToMe = isAssignedToCurrentUser(task);
        return (
          <article
            key={task.id}
            className={`task-card ${isAssignedToMe ? 'task-card--assigned-to-me' : ''}`}
          >
          <header className="task-card__header">
            <div className="task-card__title-group">
              <h3>{task.title}</h3>
              {isAssignedToMe && (
                <span className="assigned-to-me-badge" title="Assigned to you">
                  You
                </span>
              )}
            </div>
            <span className={`status status-${task.status}`}>{task.status.replace('_', ' ')}</span>
          </header>
          <p>{task.description}</p>
          <dl>
            <dt>Owner</dt>
            <dd>
              <div className="assignees-list">
                <span
                  key={task.owner.id}
                  className="assignee-avatar"
                  style={{ backgroundColor: getAvatarColor(task.owner.id) }}
                  title={getUserFullName(task.owner)}
                >
                  {getUserInitials(task.owner)}
                </span>
              </div>
            </dd>
          </dl>
          <dl>
            <div>
              <dt>Assignees</dt>
              <dd>
                {task.assignees.length > 0 ? (
                  <div className="assignees-list">
                    {task.assignees.map((assignee) => (
                      <span
                        key={assignee.id}
                        className="assignee-avatar"
                        style={{ backgroundColor: getAvatarColor(assignee.id) }}
                        title={getUserFullName(assignee)}
                      >
                        {getUserInitials(assignee)}
                      </span>
                    ))}
                  </div>
                ) : (
                  <span className="no-assignees">—</span>
                )}
              </dd>
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
        );
      })}
    </div>
  );
};

