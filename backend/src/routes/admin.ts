import { Router, Request, Response, NextFunction } from 'express';
import { requireAuth } from '../middleware/auth';

const router = Router();

// POST /api/v1/admin/login  — body: { email, password }
router.post('/login', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement — verify credentials, return JWT
    res.json({ data: { admin: null, token: '' }, message: 'Login successful' });
  } catch (err) { next(err); }
});

// POST /api/v1/admin/logout  — requires auth
router.post('/logout', requireAuth, async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement (stateless JWT — invalidate on client side or use a denylist)
    res.json({ message: 'Logout successful' });
  } catch (err) { next(err); }
});

// GET /api/v1/admin/me  — requires auth
router.get('/me', requireAuth, async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement — fetch admin by req.admin.id
    res.json({ data: req.admin });
  } catch (err) { next(err); }
});

export default router;
