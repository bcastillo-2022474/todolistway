import { Router, Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from '../types';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/v1/admin/login  — body: { password }
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body;

    if (!password || password !== process.env.ADMIN_PASSWORD) {
      throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED');
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '12h' },
    );

    res.json({ data: { token }, message: 'Login successful' });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/admin/me  — just confirms the token is valid
router.get('/me', requireAuth, (_req: Request, res: Response) => {
  res.json({ data: { role: 'admin' } });
});

export default router;
