import { Request, Response } from 'express';
import { AppDataSource } from '../config/data-source';
import { User } from '../entities/User';
import { Role } from '../entities/Role';
import { hashPassword, comparePassword, generateJwt } from '../utils/auth';

export class AuthController {
  private userRepository = AppDataSource.getRepository(User);
  private roleRepository = AppDataSource.getRepository(Role);

  register = async (req: Request, res: Response) => {
    const { email, password, firstName, lastName, roles = ['user'] } = req.body;

    try {
      const existing = await this.userRepository.findOne({ where: { email } });
      if (existing) {
        return res.status(400).json({ message: 'Email already registered' });
      }

      const roleEntities = await Promise.all(
        roles.map(async (roleName: string) => {
          let role = await this.roleRepository.findOne({ where: { name: roleName } });
          if (!role) {
            role = this.roleRepository.create({ name: roleName });
            await this.roleRepository.save(role);
          }
          return role;
        }),
      );

      const user = this.userRepository.create({
        email,
        password: await hashPassword(password),
        firstName,
        lastName,
        roles: roleEntities,
      });

      await this.userRepository.save(user);

      return res.status(201).json({ id: user.id, email: user.email });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to register user' });
    }
  };

  login = async (req: Request, res: Response) => {
    const { email, password } = req.body;

    try {
      const user = await this.userRepository.findOne({ where: { email } });
      if (!user) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const passwordMatch = await comparePassword(password, user.password);
      if (!passwordMatch) {
        return res.status(401).json({ message: 'Invalid credentials' });
      }

      const token = generateJwt(user);

      return res.json({
        token,
        user: {
          id: user.id,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          roles: user.roles.map((role) => role.name),
        },
      });
    } catch (error) {
      return res.status(500).json({ message: 'Failed to login' });
    }
  };
}

