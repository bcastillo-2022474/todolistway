import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database';
import { AppError, Event } from '../types';

const router = Router();

// GET /api/v1/events?page&limit&search&id_club&upcoming
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page     = Math.max(1, parseInt(req.query.page  as string) || 1);
    const limit    = Math.max(1, parseInt(req.query.limit as string) || 10);
    const search   = (req.query.search as string)?.trim() ?? '';
    const id_club  = req.query.id_club  as string | undefined;
    const upcoming = req.query.upcoming === 'true' || req.query.upcoming === '1';
    const offset   = (page - 1) * limit;

    // Build dynamic WHERE clauses
    const conditions: string[] = [];
    const params: (string | number)[] = [];
    let   idx = 1;

    if (search) {
      conditions.push(`(e.name ILIKE $${idx} OR e.description ILIKE $${idx})`);
      params.push(`%${search}%`);
      idx++;
    }
    if (id_club) {
      conditions.push(`e.id_club = $${idx}`);
      params.push(id_club);
      idx++;
    }
    if (upcoming) {
      conditions.push(`e.datetime > NOW()`);
    }

    const whereClause = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

    const countParams = [...params];

    params.push(limit);   const limitIdx  = idx++;
    params.push(offset);  const offsetIdx = idx;

    const dataQuery = `
      SELECT
        e.*,
        json_build_object('id', c.id, 'name', c.name) AS club,
        0 AS current_participants
      FROM event e
      JOIN club c ON c.id = e.id_club
      ${whereClause}
      ORDER BY e.datetime ASC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;

    const countQuery = `
      SELECT COUNT(*) FROM event e
      JOIN club c ON c.id = e.id_club
      ${whereClause}
    `;

    const [dataResult, countResult] = await Promise.all([
      pool.query<Event>(dataQuery, params),
      pool.query<{ count: string }>(countQuery, countParams),
    ]);

    const total       = parseInt(countResult.rows[0].count);
    const total_pages = Math.ceil(total / limit);

    res.json({ data: dataResult.rows, total, page, limit, total_pages });
  } catch (err) { next(err); }
});

// GET /api/v1/events/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await pool.query<Event>(
      `SELECT
         e.*,
         json_build_object('id', c.id, 'name', c.name) AS club,
         0 AS current_participants
       FROM event e
       JOIN club c ON c.id = e.id_club
       WHERE e.id = $1`,
      [id],
    );

    if (!result.rows[0]) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    res.json({ data: result.rows[0] });
  } catch (err) { next(err); }
});

// POST /api/v1/events  — body: { id_club, name, description, datetime, location, max_participants }
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id_club, name, description, datetime, location, max_participants } = req.body;

    // ── validation ────────────────────────────────────────────────────────────
    const errors: Record<string, string> = {};
    if (!id_club)         errors.id_club         = 'id_club is required';
    if (!name || typeof name !== 'string')
                          errors.name            = 'name is required';
    if (!datetime)        errors.datetime        = 'datetime is required';
    if (!location || typeof location !== 'string')
                          errors.location        = 'location is required';
    if (max_participants === undefined || max_participants === null)
                          errors.max_participants = 'max_participants is required';

    if (Object.keys(errors).length) {
      throw new AppError('Validation error', 400, 'VALIDATION_ERROR', errors);
    }

    // Verify id_club exists
    const clubCheck = await pool.query('SELECT id FROM club WHERE id = $1', [id_club]);
    if (!clubCheck.rows[0]) {
      throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    }

    const result = await pool.query<Event>(
      `INSERT INTO event (id_club, name, description, datetime, location, max_participants)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [id_club, name, description ?? null, datetime, location, max_participants],
    );

    res.status(201).json({ data: result.rows[0], message: 'Event created successfully' });
  } catch (err) { next(err); }
});

// PUT /api/v1/events/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;
    const { name, description, datetime, location, max_participants } = req.body;

    const result = await pool.query<Event>(
      `UPDATE event SET
         name             = COALESCE($1, name),
         description      = COALESCE($2, description),
         datetime         = COALESCE($3, datetime),
         location         = COALESCE($4, location),
         max_participants = COALESCE($5, max_participants)
       WHERE id = $6
       RETURNING *`,
      [
        name             ?? null,
        description      ?? null,
        datetime         ?? null,
        location         ?? null,
        max_participants ?? null,
        id,
      ],
    );

    if (!result.rows[0]) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    res.json({ data: result.rows[0], message: 'Event updated successfully' });
  } catch (err) { next(err); }
});

// DELETE /api/v1/events/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params;

    const result = await pool.query<Event>(
      `DELETE FROM event WHERE id = $1 RETURNING id`,
      [id],
    );

    if (!result.rows[0]) {
      throw new AppError('Event not found', 404, 'EVENT_NOT_FOUND');
    }

    res.json({ message: 'Event deleted successfully', deleted_id: result.rows[0].id });
  } catch (err) { next(err); }
});

export default router;