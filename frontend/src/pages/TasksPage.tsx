import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { createTask, deleteTask, fetchTasks, updateTask } from '../api/tasks';
import { fetchUsers } from '../api/users';
import { Task, TaskInput } from '../types/task';
import { TaskForm } from '../components/TaskForm';
import { TaskList } from '../components/TaskList';
import { useAuth } from '../hooks/useAuth';
import { taskFilterService } from '../services/taskFilter.service';

export const TasksPage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [selectedAssigneeFilter, setSelectedAssigneeFilter] = useState<string>('all');

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ['tasks'],
    queryFn: fetchTasks,
  });

  const { data: users = [] } = useQuery({
    queryKey: ['users'],
    queryFn: fetchUsers,
  });

  const filteredTasks = taskFilterService.filterByAssignee(tasks, selectedAssigneeFilter);

  const createMutation = useMutation({
    mutationFn: createTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, payload }: { id: string; payload: TaskInput }) => updateTask(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tasks'] });
      setEditingTask(null);
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteTask,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['tasks'] }),
  });

  const handleCreate = (payload: TaskInput) => {
    createMutation.mutate(payload);
  };

  const handleUpdate = (payload: TaskInput) => {
    if (!editingTask) return;
    updateMutation.mutate({ id: editingTask.id, payload });
  };

  const canManage = user?.roles.some((role) => role === 'admin' || role === 'manager');

  return (
    <div className="tasks-page">
      <section className="tasks-section">
        <div className="tasks-section-header">
          <h2>Tasks</h2>
          <div className="filter-group">
            <label htmlFor="assignee-filter">Filter by assignee:</label>
            <select
              id="assignee-filter"
              value={selectedAssigneeFilter}
              onChange={(e) => setSelectedAssigneeFilter(e.target.value)}
              className="filter-select"
            >
              <option value="all">All Tasks</option>
              {users.map((user) => (
                <option key={user.id} value={user.id}>
                  {user.firstName} {user.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
        {isLoading ? (
          <p>Loading tasks…</p>
        ) : (
          <TaskList
            tasks={filteredTasks}
            onEdit={canManage ? (task) => setEditingTask(task) : undefined}
            onDelete={canManage ? (task) => deleteMutation.mutate(task.id) : undefined}
          />
        )}
      </section>
      {canManage && (
        <section className="tasks-section">
          <h2>{editingTask ? 'Edit Task' : 'Create Task'}</h2>
          <TaskForm
            initialValue={
              editingTask
                ? {
                    title: editingTask.title,
                    description: editingTask.description,
                    status: editingTask.status,
                    assigneeIds: editingTask.assignees.map((assignee) => assignee.id),
                  }
                : undefined
            }
            users={users}
            onSubmit={editingTask ? handleUpdate : handleCreate}
            submitLabel={editingTask ? 'Update Task' : 'Create Task'}
          />
        </section>
      )}
    </div>
  );
};

