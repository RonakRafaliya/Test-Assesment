import { useMemo, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { TaskStatus } from '../types/task';
import { SortOption, SortDirection } from '../services/taskSort.service';

/**
 * Custom hook for managing task filter state from URL and localStorage
 * Responsibility: Handle filter state synchronization with URL and persistence
 */

const STORAGE_KEY = 'task_filters_preferences';
const REMEMBER_FILTER_KEY = 'remember_task_filters';

type FilterPreferences = {
  search?: string;
  assignee?: string;
  status?: string;
  sortBy?: SortOption;
  sortDirection?: SortDirection;
  showMyTasks?: boolean;
};

const loadPreferences = (): FilterPreferences => {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : {};
  } catch {
    return {};
  }
};

const savePreferences = (prefs: FilterPreferences) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Ignore storage errors
  }
};

const isRememberEnabled = (): boolean => {
  try {
    const stored = localStorage.getItem(REMEMBER_FILTER_KEY);
    return stored === 'true';
  } catch {
    return false;
  }
};

const setRememberEnabled = (enabled: boolean) => {
  try {
    localStorage.setItem(REMEMBER_FILTER_KEY, String(enabled));
  } catch {
    // Ignore storage errors
  }
};

export const useTaskFilters = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const rememberEnabled = isRememberEnabled();
  const savedPrefs = useMemo(() => (rememberEnabled ? loadPreferences() : {}), [rememberEnabled]);
  const hasLoadedPrefs = useRef(false);

  const searchKeyword = searchParams.get('search') || (rememberEnabled ? savedPrefs.search : '') || '';
  const assigneeId = searchParams.get('assignee') || (rememberEnabled ? savedPrefs.assignee : '') || 'all';
  const statusParam = searchParams.get('status') || (rememberEnabled ? savedPrefs.status : undefined);
  const sortBy = (searchParams.get('sortBy') || (rememberEnabled ? savedPrefs.sortBy : undefined) || 'date_created') as SortOption;
  const sortDirection = (searchParams.get('sortDirection') ||
    (rememberEnabled ? savedPrefs.sortDirection : undefined) ||
    'desc') as SortDirection;

  const showMyTasks = searchParams.get('myTasks') === 'true';

  const selectedStatuses = useMemo(() => {
    if (!statusParam) return [];
    const statusList = statusParam.split(',');
    return statusList.filter((s): s is TaskStatus =>
      ['todo', 'in_progress', 'done'].includes(s)
    );
  }, [statusParam]);

  const updateFilters = (updates: Record<string, string | null | boolean>) => {
    const newParams = new URLSearchParams(searchParams);

    Object.entries(updates).forEach(([key, value]) => {
      if (value === null || value === '' || value === false) {
        newParams.delete(key);
      } else {
        newParams.set(key, String(value));
      }
    });

    setSearchParams(newParams, { replace: true });
  };

  const saveToStorage = (updates: Record<string, string | null | boolean>) => {
    if (!rememberEnabled) return;

    const currentPrefs = loadPreferences();
    const newPrefs: FilterPreferences = { ...currentPrefs };

    Object.entries(updates).forEach(([key, value]) => {
      if (key === 'page') return;

      if (value === null || value === '' || value === false) {
        if (key === 'myTasks') {
          delete newPrefs.showMyTasks;
        } else {
          delete newPrefs[key as keyof FilterPreferences];
        }
      } else {
        if (key === 'myTasks') {
          newPrefs.showMyTasks = value === true;
        } else if (key === 'sortBy') {
          newPrefs.sortBy = value as SortOption;
        } else if (key === 'sortDirection') {
          newPrefs.sortDirection = value as SortDirection;
        } else if (key === 'search') {
          newPrefs.search = value as string;
        } else if (key === 'assignee') {
          newPrefs.assignee = value as string;
        } else if (key === 'status') {
          newPrefs.status = value as string;
        }
      }
    });

    savePreferences(newPrefs);
  };

  const setSearchKeyword = (keyword: string) => {
    updateFilters({ search: keyword || null, page: '1' });
    saveToStorage({ search: keyword || null });
  };

  const setAssigneeFilter = (assignee: string) => {
    const value = assignee === 'all' ? null : assignee;
    updateFilters({ assignee: value, page: '1' });
    saveToStorage({ assignee: value });
  };

  const toggleStatus = (status: TaskStatus) => {
    const isSelected = selectedStatuses.includes(status);
    const newStatuses = isSelected
      ? selectedStatuses.filter((s) => s !== status)
      : [...selectedStatuses, status];

    const statusValue = newStatuses.length > 0 ? newStatuses.join(',') : null;
    updateFilters({ status: statusValue, page: '1' });
    saveToStorage({ status: statusValue });
  };

  const setSortBy = (option: SortOption) => {
    updateFilters({ sortBy: option, page: '1' });
    saveToStorage({ sortBy: option });
  };

  const setSortDirection = (direction: SortDirection) => {
    updateFilters({ sortDirection: direction, page: '1' });
    saveToStorage({ sortDirection: direction });
  };

  const toggleMyTasks = (enabled: boolean) => {
    if (enabled) {
      updateFilters({ myTasks: true, page: '1' });
      saveToStorage({ myTasks: true });
    } else {
      updateFilters({ myTasks: null, page: '1' });
      saveToStorage({ myTasks: null });
    }
  };

  useEffect(() => {
    if (hasLoadedPrefs.current) return;
    hasLoadedPrefs.current = true;

    const hasUrlParams = searchParams.toString().length > 0;
    if (hasUrlParams) return;

    if (!rememberEnabled) return;

    const updates: Record<string, string | boolean> = {};
    if (savedPrefs.search) updates.search = savedPrefs.search;
    if (savedPrefs.assignee) updates.assignee = savedPrefs.assignee;
    if (savedPrefs.status) updates.status = savedPrefs.status;
    if (savedPrefs.sortBy) updates.sortBy = savedPrefs.sortBy;
    if (savedPrefs.sortDirection) updates.sortDirection = savedPrefs.sortDirection;
    if (savedPrefs.showMyTasks) updates.myTasks = true;

    if (Object.keys(updates).length > 0) {
      const newParams = new URLSearchParams();
      Object.entries(updates).forEach(([key, value]) => {
        newParams.set(key, String(value));
      });
      setSearchParams(newParams, { replace: true });
    }
  }, [searchParams, savedPrefs, setSearchParams, hasLoadedPrefs, rememberEnabled]);

  const toggleRememberFilters = (enabled: boolean) => {
    setRememberEnabled(enabled);
    if (enabled) {
      const currentParams: Record<string, string | boolean> = {};
      if (searchKeyword) currentParams.search = searchKeyword;
      if (assigneeId && assigneeId !== 'all') currentParams.assignee = assigneeId;
      if (statusParam) currentParams.status = statusParam;
      if (sortBy) currentParams.sortBy = sortBy;
      if (sortDirection) currentParams.sortDirection = sortDirection;
      if (showMyTasks) currentParams.myTasks = true;
      saveToStorage(currentParams);
    } else {
      try {
        localStorage.removeItem(STORAGE_KEY);
      } catch {
        // Ignore storage errors
      }
    }
  };

  return {
    searchKeyword,
    assigneeId,
    selectedStatuses,
    sortBy,
    sortDirection,
    showMyTasks,
    rememberEnabled,
    setSearchKeyword,
    setAssigneeFilter,
    toggleStatus,
    setSortBy,
    setSortDirection,
    toggleMyTasks,
    toggleRememberFilters,
  };
};

