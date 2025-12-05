import { Task } from '../types/task';

/**
 * Task Filter Service Interface
 * Dependency Inversion: Components depend on this abstraction
 * Open/Closed: Can be extended with new filter types
 */

export interface ITaskFilterService {
  filterByAssignee(tasks: Task[], assigneeId: string | 'all'): Task[];
}

export class TaskFilterService implements ITaskFilterService {
  filterByAssignee(tasks: Task[], assigneeId: string | 'all'): Task[] {
    if (assigneeId === 'all') {
      return tasks;
    }
    return tasks.filter((task) =>
      task.assignees.some((assignee) => assignee.id === assigneeId)
    );
  }
}

// Singleton instance
export const taskFilterService = new TaskFilterService();

