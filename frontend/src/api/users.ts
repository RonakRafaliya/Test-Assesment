import { apiClient } from './client';
import { AuthUser } from '../types/auth';

export const fetchUsers = async (): Promise<AuthUser[]> => {
  const { data } = await apiClient.get<AuthUser[]>('/users');
  return data;
};