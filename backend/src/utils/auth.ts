import bcrypt from 'bcrypt';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../entities/User';

const saltRounds = 10;
const jwtSecret: jwt.Secret = process.env.JWT_SECRET || 'dev-secret';
const jwtExpiresIn = (process.env.JWT_EXPIRES_IN ?? '1h') as SignOptions['expiresIn'];

export const hashPassword = async (password: string): Promise<string> => {
  return bcrypt.hash(password, saltRounds);
};

export const comparePassword = async (password: string, hash: string): Promise<boolean> => {
  return bcrypt.compare(password, hash);
};

export type AuthTokenPayload = {
  userId: string;
  roles: string[];
};

export const generateJwt = (user: User): string => {
  const payload: AuthTokenPayload = {
    userId: user.id,
    roles: user.roles?.map((role) => role.name) ?? [],
  };

  const signOptions: SignOptions = jwtExpiresIn ? { expiresIn: jwtExpiresIn } : {};
  return jwt.sign(payload, jwtSecret, signOptions);
};

