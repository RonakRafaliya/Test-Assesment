/**
 * Role Service Interface
 * Responsibility: Handle role badge
 */

export type RoleBadgeInfo = {
  label: string;
  className: string;
};

export interface IRoleService {
  getRoleBadge(roles: string[]): RoleBadgeInfo;
}

export class RoleService implements IRoleService {
  getRoleBadge(roles: string[]): RoleBadgeInfo {
    const role = roles[0];

    switch (role) {
      case 'admin':
        return { label: 'Admin', className: 'role-admin' };
      case 'manager':
        return { label: 'Manager', className: 'role-manager' };
      default:
        return { label: 'User', className: 'role-user' };
    }
  }
}

// Singleton instance
export const roleService = new RoleService();

