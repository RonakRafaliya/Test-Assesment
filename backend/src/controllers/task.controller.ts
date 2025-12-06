import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { In } from 'typeorm';

export class TaskController {
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);

  list = async (req: Request, res: Response) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 10;
      const offset = (page - 1) * limit;

      const [tasks, total] = await this.taskRepository.findAndCount({
        skip: offset,
        take: limit,
        order: {
          createdAt: 'DESC',
        },
      });

      return res.json({
        tasks,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  };

  create = async (req: Request, res: Response) => {
    const { title, description, status = 'todo', assigneeIds = [] } = req.body;
    const ownerId = req.user?.userId;

    try {
      if (!ownerId) {
        return res.status(401).json({ message: 'Unauthorized. Please log in to continue.' });
      }

      const owner = await this.userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        return res.status(404).json({ message: 'User account not found. Please contact support.' });
      }

      // Validate assignee IDs if provided
      if (assigneeIds && assigneeIds.length > 0) {
        const assignees = await this.userRepository.findBy({ id: In(assigneeIds) });
        const foundIds = assignees.map((a) => a.id);
        const invalidIds = assigneeIds.filter((id: string) => !foundIds.includes(id));

        if (invalidIds.length > 0) {
          return res.status(400).json({
            message: 'Validation failed',
            errors: {
              assigneeIds: [`Invalid user IDs: ${invalidIds.join(', ')}. Please select valid users.`],
            },
          });
        }
      }

      const assignees = assigneeIds.length
        ? await this.userRepository.findBy({ id: In(assigneeIds) })
        : [];

      const task = this.taskRepository.create({
        title,
        description,
        status,
        owner,
        assignees,
      });

      const saved = await this.taskRepository.save(task);
      return res.status(201).json(saved);
    } catch (error) {
      console.error('Task creation error:', error);
      return res.status(500).json({
        message: 'An unexpected error occurred while creating the task. Please try again later.',
      });
    }
  };

  update = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { title, description, status, assigneeIds = [] } = req.body;

    try {
      if (!taskId) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            id: ['Task ID is required'],
          },
        });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({
          message: 'Task not found',
          errors: {
            id: [`No task found with ID: ${taskId}. Please check the task ID and try again.`],
          },
        });
      }

      // Validate assignee IDs if provided
      if (assigneeIds && assigneeIds.length > 0) {
        const assignees = await this.userRepository.findBy({ id: In(assigneeIds) });
        const foundIds = assignees.map((a) => a.id);
        const invalidIds = assigneeIds.filter((id: string) => !foundIds.includes(id));

        if (invalidIds.length > 0) {
          return res.status(400).json({
            message: 'Validation failed',
            errors: {
              assigneeIds: [`Invalid user IDs: ${invalidIds.join(', ')}. Please select valid users.`],
            },
          });
        }
      }

      if (title !== undefined) task.title = title;
      if (description !== undefined) task.description = description;
      if (status !== undefined) task.status = status;
      if (assigneeIds) {
        task.assignees =
          assigneeIds && assigneeIds.length
            ? await this.userRepository.findBy({ id: In(assigneeIds) })
            : [];
      }

      const updated = await this.taskRepository.save(task);
      return res.json(updated);
    } catch (error) {
      console.error('Task update error:', error);
      return res.status(500).json({
        message: 'An unexpected error occurred while updating the task. Please try again later.',
      });
    }
  };

  remove = async (req: Request, res: Response) => {
    const taskId = req.params.id;

    try {
      if (!taskId) {
        return res.status(400).json({
          message: 'Validation failed',
          errors: {
            id: ['Task ID is required'],
          },
        });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({
          message: 'Task not found',
          errors: {
            id: [`No task found with ID: ${taskId}. Please check the task ID and try again.`],
          },
        });
      }

      await this.taskRepository.remove(task);
      return res.status(204).send();
    } catch (error) {
      console.error('Task deletion error:', error);
      return res.status(500).json({
        message: 'An unexpected error occurred while deleting the task. Please try again later.',
      });
    }
  };
}

