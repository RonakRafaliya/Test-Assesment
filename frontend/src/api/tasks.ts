import { apiClient } from './client';
import { Task, TaskInput } from '../types/task';

export const fetchTasks = async (): Promise<Task[]> => {
  const { data } = await apiClient.get<Task[]>('/tasks');
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

