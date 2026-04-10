import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../types';
interface JwtPayload {
  role: 'admin'  // ← era { id, email }, ahora es { role }
}

export function requireAuth(req: Request, _res: Response, next: NextFunction): void {
  const header = req.headers.authorization
  if (!header?.startsWith('Bearer ')) {
    return next(new AppError('Missing or invalid Authorization header', 401, 'UNAUTHORIZED'))
  }

  const token = header.slice(7)
  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload
    if (payload?.role !== 'admin') {
      throw new Error('Invalid token payload')
    }
    req.admin = { role: 'admin' }
    next()
  } catch {
    next(new AppError('Invalid or expired token', 401, 'UNAUTHORIZED'))
  }
}
