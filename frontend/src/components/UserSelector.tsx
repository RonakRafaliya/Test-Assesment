import { useState, useEffect, useRef, useMemo } from 'react';
import { getUserInitials } from '../utils/user.utils';
import { useUserFilter } from '../hooks/useUserFilter';
import { RoleBadge } from './RoleBadge';
import { AuthUser } from '../types/auth';

/**
 * UserSelector Component
 * Responsibility: Handle user selection UI
 */

type UserSelectorProps = {
  users: AuthUser[];
  selectedUserIds: string[];
  onSelectionChange: (userIds: string[]) => void;
  placeholder?: string;
};

export const UserSelector = ({
  users,
  selectedUserIds,
  onSelectionChange,
  placeholder = 'Select assignees...',
}: UserSelectorProps) => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  const filteredUsers = useUserFilter(users, searchQuery);

  const selectedUsers = useMemo(() => {
    if (!selectedUserIds || !users.length) return [];
    return users.filter((user) => selectedUserIds.includes(user.id));
  }, [selectedUserIds, users]);

  const handleClickOutside = (event: MouseEvent) => {
    if (
      dropdownRef.current &&
      !dropdownRef.current.contains(event.target as Node)
    ) {
      setIsDropdownOpen(false);
      setSearchQuery("");
    }
  };

  useEffect(() => {
    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      setTimeout(() => searchInputRef.current?.focus(), 0);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleUserToggle = (userId: string) => {
    const newIds = selectedUserIds.includes(userId)
      ? selectedUserIds.filter((id) => id !== userId)
      : [...selectedUserIds, userId];
    onSelectionChange(newIds);
  };

  return (
    <div className="multi-select-wrapper" ref={dropdownRef}>
      <div
        className="multi-select-trigger"
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            setIsDropdownOpen(!isDropdownOpen);
          }
        }}
      >
        <div className="multi-select-selected">
          {selectedUsers.length > 0 ? (
            <div className="selected-users">
              {selectedUsers.map((user) => (
                <span key={user.id} className="selected-user-tag">
                  <span className="user-initials-small">{getUserInitials(user)}</span>
                  {user.firstName} {user.lastName}
                </span>
              ))}
            </div>
          ) : (
            <span className="multi-select-placeholder">{placeholder}</span>
          )}
        </div>
        <span className="multi-select-arrow">{isDropdownOpen ? '▲' : '▼'}</span>
      </div>
      {isDropdownOpen && (
        <div className="multi-select-dropdown">
          <div className="multi-select-search">
            <input
              ref={searchInputRef}
              type="text"
              placeholder="Search users..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="multi-select-search-input"
              onClick={(e) => e.stopPropagation()}
            />
          </div>
          <div className="multi-select-options-list">
            {filteredUsers.length === 0 ? (
              <div className="multi-select-empty">
                {searchQuery ? 'No users found' : 'No users available'}
              </div>
            ) : (
              filteredUsers.map((user) => {
                const isSelected = selectedUserIds.includes(user.id);
                return (
                  <div
                    key={user.id}
                    className={`multi-select-option ${isSelected ? 'selected' : ''}`}
                    onClick={() => handleUserToggle(user.id)}
                    role="option"
                    aria-selected={isSelected}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleUserToggle(user.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    <span className="user-option-avatar">{getUserInitials(user)}</span>
                    <span className="user-option-name">
                      {user.firstName} {user.lastName}
                    </span>
                    <RoleBadge roles={user.roles} />
                  </div>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
};

