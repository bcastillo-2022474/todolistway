import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../types';

declare global {
  namespace Express {
    interface Request {
      admin?: { role: string };
    }
  }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED'));
  }

  const token = header.slice(7);
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as { role: string };
    req.admin = payload;
    next();
  } catch {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'));
  }
}
