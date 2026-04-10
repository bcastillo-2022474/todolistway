import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// GET /api/v1/members?page&limit&search
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: [], total: 0, page: 1, limit: 10, total_pages: 0 });
  } catch (err) { next(err); }
});

// GET /api/v1/members/search?q&limit
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement — must be registered before /:id
    res.json({ data: [] });
  } catch (err) { next(err); }
});

// GET /api/v1/members/:id
router.get('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: null });
  } catch (err) { next(err); }
});

// POST /api/v1/members  — body: { name, lastname }
router.post('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.status(201).json({ data: null, message: 'Member created successfully' });
  } catch (err) { next(err); }
});

// PUT /api/v1/members/:id  — body: { name?, lastname? }
router.put('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: null, message: 'Member updated successfully' });
  } catch (err) { next(err); }
});

// DELETE /api/v1/members/:id
router.delete('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ message: 'Member deleted successfully', deleted_id: null });
  } catch (err) { next(err); }
});

export default router;
