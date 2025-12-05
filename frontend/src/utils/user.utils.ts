import { AuthUser } from '../types/auth';

/**
 * Utility functions for user-related operations
 */

export const getUserInitials = (user: AuthUser): string => {
  const first = user.firstName?.[0] || '';
  const last = user.lastName?.[0] || '';
  return `${first}${last}`.toUpperCase() || '?';
};

export const getAvatarColor = (userId: string): string => {
  const colors = [
    '#667eea',
    '#764ba2',
    '#f093fb',
    '#4facfe',
    '#00f2fe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#30cfd0',
    '#330867',
  ];
  const index = parseInt(userId.replace(/-/g, '').slice(0, 8), 16) % colors.length;
  return colors[index];
};

export const getUserFullName = (user: AuthUser): string => {
  return `${user.firstName} ${user.lastName}`;
};

