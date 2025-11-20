import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { Task } from '../entities/Task';
import { User } from '../entities/User';
import { In } from 'typeorm';

export class TaskController {
  private taskRepository = AppDataSource.getRepository(Task);
  private userRepository = AppDataSource.getRepository(User);

  list = async (_req: Request, res: Response) => {
    try {
      const tasks = await this.taskRepository.find();
      return res.json(tasks);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch tasks' });
    }
  };

  create = async (req: Request, res: Response) => {
    const { title, description, status = 'todo', assigneeIds = [] } = req.body;
    const ownerId = req.user?.userId;

    try {
      if (!ownerId) {
        return res.status(401).json({ message: 'Unauthorized' });
      }

      const owner = await this.userRepository.findOne({ where: { id: ownerId } });
      if (!owner) {
        return res.status(404).json({ message: 'Owner not found' });
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
      return res.status(500).json({ message: 'Failed to create task' });
    }
  };

  update = async (req: Request, res: Response) => {
    const taskId = req.params.id;
    const { title, description, status, assigneeIds = [] } = req.body;

    try {
      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
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
      return res.status(500).json({ message: 'Failed to update task' });
    }
  };

  remove = async (req: Request, res: Response) => {
    const taskId = req.params.id;

    try {
      if (!taskId) {
        return res.status(400).json({ message: 'Task id is required' });
      }

      const task = await this.taskRepository.findOne({ where: { id: taskId } });
      if (!task) {
        return res.status(404).json({ message: 'Task not found' });
      }

      await this.taskRepository.remove(task);
      return res.status(204).send();
    } catch (error) {
      return res.status(500).json({ message: 'Failed to delete task' });
    }
  };
}

