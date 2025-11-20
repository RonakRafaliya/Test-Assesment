import { apiClient } from './client';
import { AuthResponse, LoginPayload, RegisterPayload } from '../types/auth';

export const loginRequest = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await apiClient.post<AuthResponse>('/auth/login', payload);
  return data;
};

export const registerRequest = async (payload: RegisterPayload): Promise<void> => {
  await apiClient.post('/auth/register', payload);
};

