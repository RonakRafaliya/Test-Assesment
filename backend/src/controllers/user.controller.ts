import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';

export class UserController {
  private userRepository = AppDataSource.getRepository(User);

  list = async (_req: Request, res: Response) => {
    try {
      // Fetch all users, excluding password field, including roles
      const users = await this.userRepository.find({
        select: ['id', 'email', 'firstName', 'lastName', 'createdAt'],
        relations: ['roles'],
        order: { firstName: 'ASC' },
      });
      // Map users to include role names
      const usersWithRoles = users.map((user) => ({
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        roles: user.roles.map((role) => role.name),
        createdAt: user.createdAt,
      }));
      return res.json(usersWithRoles);
    } catch (error) {
      return res.status(500).json({ message: 'Failed to fetch users' });
    }
  };
}

