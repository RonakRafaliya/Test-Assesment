import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { fetchTasks } from '../api/tasks';
import { fetchUsers } from '../api/users';
import { Task, TaskInput, TaskStatus } from '../types/task';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { Pagination } from '../components/Pagination';
import { useAuth } from '../hooks/useAuth';
import { useTaskFilters } from '../hooks/useTaskFilters';
import { usePagination } from '../hooks/usePagination';
import { useTaskMutations } from '../hooks/useTaskMutations';
import {
  filterByAssignee,
  filterBySearch,
  filterByStatus,
  filterMyTasks,
} from '../services/taskFilter.service';
import { sortTasks, SortOption, SortDirection } from '../services/taskSort.service';

const TASKS_PER_PAGE = 3;

export const TasksPage = () => {
  const { user } = useAuth();
  const [taskBeingEdited, setTaskBeingEdited] = useState<Task | null>(null);

  const {
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
  } = useTaskFilters();

  console.log("toggleMyTasks", showMyTasks);

  const { data: tasksResponse, isLoading } = useQuery({
    queryKey: ['tasks', 'list'],
    queryFn: () => fetchTasks(1, 1000),
  });

  const { data: usersList = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const tasksAfterFiltering = useMemo(() => {
    const allTasks = tasksResponse?.tasks || [];
    let filtered = allTasks;

    if (showMyTasks && user) {
      filtered = filterMyTasks(filtered, user.id);
    }

    filtered = filterByAssignee(filtered, assigneeId);
    filtered = filterBySearch(filtered, searchKeyword);
    filtered = filterByStatus(filtered, selectedStatuses);
    filtered = sortTasks(filtered, sortBy, sortDirection);

    return filtered;
  }, [
    tasksResponse?.tasks,
    user,
    showMyTasks,
    assigneeId,
    searchKeyword,
    selectedStatuses,
    sortBy,
    sortDirection,
  ]);

  const { currentPage, totalPages, startIndex, endIndex, goToPage } = usePagination({
    totalItems: tasksAfterFiltering.length,
    itemsPerPage: TASKS_PER_PAGE,
  });

  const tasksToDisplay = tasksAfterFiltering.slice(startIndex, endIndex);

  const { createTask, updateTask, deleteTask } = useTaskMutations();

  const handleCreateTask = (taskData: TaskInput) => {
    createTask(taskData);
  };

  const handleUpdateTask = (taskData: TaskInput) => {
    if (!taskBeingEdited) return;
    updateTask({ id: taskBeingEdited.id, payload: taskData });
    setTaskBeingEdited(null);
  };

  const handleDeleteTask = (task: Task) => {
    deleteTask(task.id);
  };

  const handleEditClick = (task: Task) => {
    setTaskBeingEdited(task);
  };

  const canUserManageTasks = user?.roles.some((role) => role === 'admin' || role === 'manager');

  return (
    <div className="tasks-page">
      <section className="tasks-section">
        <div className="tasks-section-header">
          <h2>Tasks</h2>
        </div>

        <div className="filters-container">
          <div className="filter-group">
            <label htmlFor="search-input">Search:</label>
            <input
              id="search-input"
              type="text"
              placeholder="Search by title or description..."
              value={searchKeyword}
              onChange={(e) => setSearchKeyword(e.target.value)}
              className="filter-input"
            />
          </div>

          <div className="filter-group">
            <label htmlFor="assignee-filter">Assignee:</label>
            <select
              id="assignee-filter"
              value={assigneeId}
              onChange={(e) => setAssigneeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Tasks</option>
              {usersList.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>

          <div className="filter-group">
            <label>Status:</label>
            <div className="status-filter">
              {(['todo', 'in_progress', 'done'] as TaskStatus[]).map((status) => (
                <label key={status} className="status-checkbox-label">
                  <input
                    type="checkbox"
                    checked={selectedStatuses.includes(status)}
                    onChange={() => toggleStatus(status)}
                    className="status-checkbox"
                  />
                  <span className="status-checkbox-text">{status.replace('_', ' ')}</span>
                </label>
              ))}
            </div>
          </div>

          {user && (
            <div className="filter-group">
              <label className="my-tasks-label">
                <input
                  type="checkbox"
                  checked={showMyTasks}
                  onChange={() => toggleMyTasks(!showMyTasks)}
                  className="my-tasks-checkbox"
                />
                <span>My Tasks</span>
              </label>
            </div>
          )}

          <div className="filter-group">
            <label htmlFor="sort-by">Sort by:</label>
            <select
              id="sort-by"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="filter-select"
            >
              <option value="date_created">Date Created</option>
              <option value="title">Title</option>
              <option value="status">Status</option>
            </select>
          </div>

          <div className="filter-group">
            <label htmlFor="sort-direction">Order:</label>
            <select
              id="sort-direction"
              value={sortDirection}
              onChange={(e) => setSortDirection(e.target.value as SortDirection)}
              className="filter-select"
            >
              <option value="desc">Descending</option>
              <option value="asc">Ascending</option>
            </select>
          </div>

          <div className="filter-group">
            <button
              type="button"
              onClick={() => toggleRememberFilters(!rememberEnabled)}
              className={`remember-filter-btn ${rememberEnabled ? 'active' : ''}`}
            >
              {rememberEnabled ? '✓ Remember Filters' : 'Remember Filters'}
            </button>
          </div>
        </div>

        {isLoading ? (
          <p>Loading tasks…</p>
        ) : (
          <>
            <TaskList
              tasks={tasksToDisplay}
              onEdit={canUserManageTasks ? handleEditClick : undefined}
              onDelete={canUserManageTasks ? handleDeleteTask : undefined}
            />

            {tasksAfterFiltering.length > 0 && totalPages > 1 && (
              <Pagination
                pagination={{
                  page: currentPage,
                  limit: TASKS_PER_PAGE,
                  total: tasksAfterFiltering.length,
                  totalPages,
                }}
                onPageChange={goToPage}
              />
            )}

            {tasksAfterFiltering.length === 0 && !isLoading && (
              <p className="empty-state">No tasks match your filters.</p>
            )}
          </>
        )}
      </section>

      {canUserManageTasks && (
        <section className="tasks-section">
          <h2>{taskBeingEdited ? 'Edit Task' : 'Create Task'}</h2>
          <TaskForm
            initialValue={
              taskBeingEdited
                ? {
                    title: taskBeingEdited.title,
                    description: taskBeingEdited.description,
                    status: taskBeingEdited.status,
                    assigneeIds: taskBeingEdited.assignees.map((assignee) => assignee.id),
                  }
                : undefined
            }
            users={usersList}
            onSubmit={taskBeingEdited ? handleUpdateTask : handleCreateTask}
            submitLabel={taskBeingEdited ? 'Update Task' : 'Create Task'}
          />
        </section>
      )}
    </div>
  );
};

