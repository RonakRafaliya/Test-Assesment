import { Task, TaskStatus } from '../types/task';

/**
 * Responsibility: Handle task filtering
 */

export const filterByAssignee = (tasks: Task[], assigneeId: string | 'all'): Task[] => {
  if (assigneeId === 'all') {
    return tasks;
  }
  return tasks.filter((task) =>
    task.assignees.some((assignee) => assignee.id === assigneeId)
  );
};

export const filterBySearch = (tasks: Task[], searchKeyword: string): Task[] => {
  if (!searchKeyword.trim()) {
    return tasks;
  }

  const normalizedKeyword = searchKeyword.toLowerCase().trim();
  return tasks.filter((task) => {
    const titleMatch = task.title.toLowerCase().includes(normalizedKeyword);
    const descriptionMatch = task.description
      ? task.description.toLowerCase().includes(normalizedKeyword)
      : false;
    return titleMatch || descriptionMatch;
  });
};

export const filterByStatus = (tasks: Task[], statuses: TaskStatus[]): Task[] => {
  if (statuses.length === 0) {
    return tasks;
  }
  return tasks.filter((task) => statuses.includes(task.status));
};

export const filterMyTasks = (tasks: Task[], userId: string | null): Task[] => {
  if (!userId) {
    return tasks;
  }
  return tasks.filter(
    (task) => task.owner.id === userId || task.assignees.some((assignee) => assignee.id === userId)
  );
};

