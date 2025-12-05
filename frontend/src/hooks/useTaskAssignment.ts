import { useMemo } from 'react';
import { Task } from '../types/task';
import { AuthUser } from '../types/auth';

/**
 * Custom hook for task assignment logic
 * Responsibility: Handle task assignment checks
 */

export const useTaskAssignment = (currentUser: AuthUser | null) => {
  const isAssignedToCurrentUser = useMemo(
    () => (task: Task): boolean => {
      if (!currentUser) return false;
      return task.assignees.some((assignee) => assignee.id === currentUser.id);
    },
    [currentUser]
  );

  return { isAssignedToCurrentUser };
};

