import { Task } from '../types/task';

/**
 * Responsibility: Handle task sorting
 */

export type SortOption = 'date_created' | 'title' | 'status';
export type SortDirection = 'asc' | 'desc';

export const sortTasks = (
  tasks: Task[],
  sortBy: SortOption,
  direction: SortDirection = 'asc'
): Task[] => {
  const sorted = [...tasks];

  sorted.sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case 'date_created': {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        break;
      }
      case 'title': {
        comparison = a.title.localeCompare(b.title);
        break;
      }
      case 'status': {
        const statusOrder = { todo: 1, in_progress: 2, done: 3 };
        comparison = statusOrder[a.status] - statusOrder[b.status];
        break;
      }
    }

    return direction === 'asc' ? comparison : -comparison;
  });

  return sorted;
};

