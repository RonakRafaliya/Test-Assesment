import { useMemo } from 'react';
import { AuthUser } from '../types/auth';

/**
 * Custom hook for filtering users
 * Responsibility: Handle user filtering logic
 */

export const useUserFilter = (users: AuthUser[], searchQuery: string): AuthUser[] => {
  return useMemo(() => {
    if (!searchQuery.trim()) return users;

    const query = searchQuery.toLowerCase();
    return users.filter(
      (user) =>
        user.firstName.toLowerCase().includes(query) ||
        user.lastName.toLowerCase().includes(query)
    );
  }, [users, searchQuery]);
};

