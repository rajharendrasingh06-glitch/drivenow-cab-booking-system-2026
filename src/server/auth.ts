import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { UserModel } from './models';
import { User, UserRole } from '../types';

const JWT_SECRET = process.env.JWT_SECRET || 'drivenow_super_secret_jwt_key_india_2026';

export interface AuthRequest extends Request {
  user?: User;
}

export function generateToken(user: User): string {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      name: user.name,
    },
    JWT_SECRET,
    { expiresIn: '7d' }
  );
}

export function hashPassword(plainText: string): string {
  return bcrypt.hashSync(plainText, 10);
}

export function comparePassword(plainText: string, hashed: string): boolean {
  if (!hashed) return false;
  if (!hashed.startsWith('$2')) {
    return plainText === hashed;
  }
  return bcrypt.compareSync(plainText, hashed);
}

export async function authenticate(req: AuthRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. No Bearer token provided.' });
    return;
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as { id: string; role: UserRole };
    const user = await UserModel.findOne({ id: decoded.id }).lean();
    if (!user) {
      res.status(401).json({ error: 'User not found or session expired.' });
      return;
    }
    req.user = user as unknown as User;
    next();
  } catch {
    res.status(401).json({ error: 'Invalid or expired authentication token.' });
  }
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required.' });
      return;
    }
    if (!allowedRoles.includes(req.user.role)) {
      res.status(403).json({
        error: `Access forbidden for role ${req.user.role}. Required: ${allowedRoles.join(', ')}`,
      });
      return;
    }
    next();
  };
}
