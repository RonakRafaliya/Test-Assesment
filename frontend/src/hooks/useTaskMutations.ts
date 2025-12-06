import { useMutation, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, updateTask } from '../api/tasks';
import { TaskInput } from '../types/task';

/**
 * Custom hook for task mutations
 * Responsibility: Handle task CRUD operations
 */

export const useTaskMutations = () => {
  const queryClient = useQueryClient();

  const createTaskMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const updateTaskMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskInput }) =>
      updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  const deleteTaskMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
    },
  });

  return {
    createTask: async (payload: TaskInput) => {
      return createTaskMutation.mutateAsync(payload);
    },
    updateTask: async ({ id, payload }: { id: string; payload: TaskInput }) => {
      return updateTaskMutation.mutateAsync({ id, payload });
    },
    deleteTask: async (id: string) => {
      return deleteTaskMutation.mutateAsync(id);
    },
    isCreating: createTaskMutation.isPending,
    isUpdating: updateTaskMutation.isPending,
    isDeleting: deleteTaskMutation.isPending,
  };
};

