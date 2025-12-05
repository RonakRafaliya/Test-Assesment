import { roleService } from '../services/role.service';

/**
 * RoleBadge Component
 * Responsibility: Display role badge
 */

type RoleBadgeProps = {
  roles: string[];
  className?: string;
};

export const RoleBadge = ({ roles, className = '' }: RoleBadgeProps) => {
  const badgeInfo = roleService.getRoleBadge(roles);

  return (
    <span className={`user-role-badge ${badgeInfo.className} ${className}`}>
      {badgeInfo.label}
    </span>
  );
};

