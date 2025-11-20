import { AuthUser } from './auth';

export type TaskStatus = 'todo' | 'in_progress' | 'done';

export type TaskAttachment = {
  id: string;
  filename: string;
  mimetype: string;
  path: string;
};

export type Task = {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  owner: AuthUser;
  assignees: AuthUser[];
  attachments: TaskAttachment[];
  createdAt: string;
  updatedAt: string;
};

export type TaskInput = {
  title: string;
  description?: string;
  status?: TaskStatus;
  assigneeIds?: string[];
};

