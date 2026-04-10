import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// GET /api/v1/events?page&limit&search&id_club&upcoming
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: [], total: 0, page: 1, limit: 10, total_pages: 0 });
  } catch (err) { next(err); }
});

// GET /api/v1/events/:id
router.get('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: null });
  } catch (err) { next(err); }
});

// POST /api/v1/events  — body: { id_club, name, description, datetime, location, max_participants }
router.post('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.status(201).json({ data: null, message: 'Event created successfully' });
  } catch (err) { next(err); }
});

// PUT /api/v1/events/:id
router.put('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: null, message: 'Event updated successfully' });
  } catch (err) { next(err); }
});

// DELETE /api/v1/events/:id
router.delete('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ message: 'Event deleted successfully', deleted_id: null });
  } catch (err) { next(err); }
});

export default router;
