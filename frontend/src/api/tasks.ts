import { apiClient } from './client';
import { Task, TaskInput, PaginatedTasksResponse } from '../types/task';

export const fetchTasks = async (page = 1, limit = 10): Promise<PaginatedTasksResponse> => {
  const { data } = await apiClient.get<PaginatedTasksResponse>('/tasks', {
    params: { page, limit },
  });
  return data;
};

export const createTask = async (payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.post<Task>('/tasks', payload);
  return data;
};

export const updateTask = async (id: string, payload: TaskInput): Promise<Task> => {
  const { data } = await apiClient.put<Task>(`/tasks/${id}`, payload);
  return data;
};

export const deleteTask = async (id: string): Promise<void> => {
  await apiClient.delete(`/tasks/${id}`);
};

