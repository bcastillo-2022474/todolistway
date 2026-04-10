import { Router, Request, Response, NextFunction } from 'express';

const router = Router();

// ── Clubs ─────────────────────────────────────────────────────────────────────

// GET /api/v1/clubs?page&limit&search
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: [], total: 0, page: 1, limit: 10, total_pages: 0 });
  } catch (err) { next(err); }
});

// GET /api/v1/clubs/:id
router.get('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: null });
  } catch (err) { next(err); }
});

// POST /api/v1/clubs  — body: { name, description, schedule, location }
router.post('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.status(201).json({ data: null, message: 'Club created successfully' });
  } catch (err) { next(err); }
});

// PUT /api/v1/clubs/:id
router.put('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: null, message: 'Club updated successfully' });
  } catch (err) { next(err); }
});

// DELETE /api/v1/clubs/:id
router.delete('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ message: 'Club deleted successfully', deleted_id: null });
  } catch (err) { next(err); }
});

// ── Club members ──────────────────────────────────────────────────────────────

// GET /api/v1/clubs/:id/members?page&limit
router.get('/:id/members', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: [], total: 0, page: 1, limit: 20, total_pages: 0 });
  } catch (err) { next(err); }
});

// POST /api/v1/clubs/:id/members  — body: { id_member }
router.post('/:id/members', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.status(201).json({ data: null, message: 'Member assigned to club successfully' });
  } catch (err) { next(err); }
});

// POST /api/v1/clubs/:id/members/create-and-assign  — body: { name, lastname }
router.post('/:id/members/create-and-assign', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.status(201).json({ data: null, message: 'Member created and assigned to club successfully' });
  } catch (err) { next(err); }
});

// DELETE /api/v1/clubs/:id/members/:memberId
router.delete('/:id/members/:memberId', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ message: 'Member removed from club successfully' });
  } catch (err) { next(err); }
});

// ── Club events ───────────────────────────────────────────────────────────────

// GET /api/v1/clubs/:id/events?upcoming
router.get('/:id/events', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    // TODO: implement
    res.json({ data: [] });
  } catch (err) { next(err); }
});

export default router;
