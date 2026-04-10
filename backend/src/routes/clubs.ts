import { Router, Request, Response, NextFunction } from 'express';
import pool from '../config/database'
import { Club, AppError, ClubMember } from '../types';

const router = Router();

// ── Clubs ─────────────────────────────────────────────────────────────────────

// GET /api/v1/clubs?page&limit&search
router.get('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = Math.max(1, parseInt(_req.query.page  as string) || 1);
    const limit = Math.max(1, parseInt(_req.query.limit as string) || 10);
    const search = (_req.query.search as string)?.trim() ?? '';
    const offset = (page - 1) * limit;
 
    const whereClause = search ? `WHERE c.name ILIKE $1 OR c.description ILIKE $1` : '';
    const params: (string | number)[] = search ? [`%${search}%`, limit, offset] : [limit, offset];
    const limitIdx  = search ? 2 : 1;
    const offsetIdx = search ? 3 : 2;
 
    const dataQuery = `
      SELECT
        c.id, c.name, c.description, c.schedule, c.location, c.created_at,
        (SELECT COUNT(*) FROM club_member cm WHERE cm.id_club = c.id)::int AS member_count
      FROM club c
      ${whereClause}
      ORDER BY c.created_at DESC
      LIMIT $${limitIdx} OFFSET $${offsetIdx}
    `;
 
    const countQuery = `
      SELECT COUNT(*) FROM club c ${whereClause}
    `;
 
    const countParams = search ? [`%${search}%`] : [];
 
    const [dataResult, countResult] = await Promise.all([
      pool.query<Club>(dataQuery, params),
      pool.query<{ count: string }>(countQuery, countParams),
    ]);
 
    const total       = parseInt(countResult.rows[0].count);
    const total_pages = Math.ceil(total / limit);
 
    res.json({ data: dataResult.rows, total, page, limit, total_pages });
  } catch (err) {
    next(err);
  }
});

// GET /api/v1/clubs/:id
router.get('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = _req.params;
 
    const result = await pool.query<Club>(
      `SELECT
         c.id, c.name, c.description, c.schedule, c.location, c.created_at,
         (SELECT COUNT(*) FROM club_member cm WHERE cm.id_club = c.id)::int AS member_count
       FROM club c
       WHERE c.id = $1`,
      [id],
    );
 
    if (!result.rows[0]) {
      throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    }
 
    res.json({ data: result.rows[0] });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/clubs  — body: { name, description, schedule, location }
router.post('/', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, description, schedule, location } = _req.body;
 
    // ── validation ────────────────────────────────────────────────────────────
    const errors: Record<string, string> = {};
    if (!name        || typeof name        !== 'string') errors.name        = 'name is required';
    else if (name.length        > 150)                  errors.name        = 'name must be at most 150 characters';
    if (!description || typeof description !== 'string') errors.description = 'description is required';
    else if (description.length > 500)                  errors.description = 'description must be at most 500 characters';
    if (!schedule    || typeof schedule    !== 'string') errors.schedule    = 'schedule is required';
    else if (schedule.length    > 100)                  errors.schedule    = 'schedule must be at most 100 characters';
    if (!location    || typeof location    !== 'string') errors.location    = 'location is required';
    else if (location.length    > 150)                  errors.location    = 'location must be at most 150 characters';
 
    if (Object.keys(errors).length) {
      throw new AppError('Validation error', 400, 'VALIDATION_ERROR', errors);
    }
 
    const result = await pool.query<Club>(
      `INSERT INTO club (name, description, schedule, location)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description, schedule, location],
    );
 
    res.status(201).json({ data: result.rows[0], message: 'Club created successfully' });
  } catch (err) {
    next(err);
  }
});

// PUT /api/v1/clubs/:id
router.put('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = _req.params;
    const { name, description, schedule, location } = _req.body;
 
    const result = await pool.query<Club>(
      `UPDATE club SET
         name        = COALESCE($1, name),
         description = COALESCE($2, description),
         schedule    = COALESCE($3, schedule),
         location    = COALESCE($4, location)
       WHERE id = $5
       RETURNING *`,
      [name ?? null, description ?? null, schedule ?? null, location ?? null, id],
    );
 
    if (!result.rows[0]) {
      throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    }
 
    res.json({ data: result.rows[0], message: 'Club updated successfully' });
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/clubs/:id
router.delete('/:id', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = _req.params;
 
    const result = await pool.query<Club>(
      `DELETE FROM club WHERE id = $1 RETURNING id`,
      [id],
    );
 
    if (!result.rows[0]) {
      throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    }
 
    res.json({ message: 'Club deleted successfully', deleted_id: result.rows[0].id });
  } catch (err) {
    next(err);
  }
});

// ── Club members ──────────────────────────────────────────────────────────────

// GET /api/v1/clubs/:id/members?page&limit
router.get('/:id/members', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clubId = _req.params.id;
    const page   = Math.max(1, parseInt(_req.query.page  as string) || 1);
    const limit  = Math.max(1, parseInt(_req.query.limit as string) || 20);
    const offset = (page - 1) * limit;
 
    // 404 if club doesn't exist
    const clubCheck = await pool.query('SELECT id FROM club WHERE id = $1', [clubId]);
    if (!clubCheck.rows[0]) {
      throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    }
 
    const [dataResult, countResult] = await Promise.all([
      pool.query<ClubMember>(
        `SELECT
           cm.id_member, cm.id_club, cm.date_assign,
           json_build_object('id', m.id, 'name', m.name, 'lastname', m.lastname) AS member
         FROM club_member cm
         JOIN member m ON m.id = cm.id_member
         WHERE cm.id_club = $1
         ORDER BY cm.date_assign DESC
         LIMIT $2 OFFSET $3`,
        [clubId, limit, offset],
      ),
      pool.query<{ count: string }>(
        'SELECT COUNT(*) FROM club_member WHERE id_club = $1',
        [clubId],
      ),
    ]);
 
    const total       = parseInt(countResult.rows[0].count);
    const total_pages = Math.ceil(total / limit);
 
    res.json({ data: dataResult.rows, total, page, limit, total_pages });
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/clubs/:id/members  — body: { id_member }
router.post('/:id/members', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clubId   = _req.params.id;
    const { id_member } = _req.body;
 
    if (!id_member) {
      throw new AppError('Validation error', 400, 'VALIDATION_ERROR', { id_member: 'id_member is required' });
    }
 
    // 404 if club doesn't exist
    const clubCheck = await pool.query('SELECT id FROM club WHERE id = $1', [clubId]);
    if (!clubCheck.rows[0]) {
      throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    }
 
    try {
      const result = await pool.query<ClubMember>(
        `INSERT INTO club_member (id_member, id_club)
         VALUES ($1, $2)
         RETURNING *`,
        [id_member, clubId],
      );
      res.status(201).json({ data: result.rows[0], message: 'Member assigned to club successfully' });
    } catch (dbErr: any) {
      // PostgreSQL unique / PK violation → code 23505
      if (dbErr.code === '23505') {
        throw new AppError('Member already assigned to this club', 409, 'MEMBER_ALREADY_ASSIGNED');
      }
      throw dbErr;
    }
  } catch (err) {
    next(err);
  }
});

// POST /api/v1/clubs/:id/members/create-and-assign  — body: { name, lastname }
router.post('/:id/members/create-and-assign', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clubId = _req.params.id;
    const { name, lastname } = _req.body;
 
    const errors: Record<string, string> = {};
    if (!name     || typeof name     !== 'string') errors.name     = 'name is required';
    if (!lastname || typeof lastname !== 'string') errors.lastname = 'lastname is required';
    if (Object.keys(errors).length) {
      throw new AppError('Validation error', 400, 'VALIDATION_ERROR', errors);
    }
 
    // 404 if club doesn't exist
    const clubCheck = await pool.query('SELECT id FROM club WHERE id = $1', [clubId]);
    if (!clubCheck.rows[0]) {
      throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    }
 
    const client = await pool.connect();
    try {
      await client.query('BEGIN');
 
      const memberResult = await client.query(
        `INSERT INTO member (name, lastname) VALUES ($1, $2) RETURNING *`,
        [name, lastname],
      );
      const newMember = memberResult.rows[0];
 
      const assignResult = await client.query(
        `INSERT INTO club_member (id_member, id_club) VALUES ($1, $2) RETURNING *`,
        [newMember.id, clubId],
      );
      const assignment = assignResult.rows[0];
 
      await client.query('COMMIT');
 
      res.status(201).json({
        data: { member: newMember, assignment },
        message: 'Member created and assigned to club successfully',
      });
    } catch (err) {
      await client.query('ROLLBACK');
      throw err;
    } finally {
      client.release();
    }
  } catch (err) {
    next(err);
  }
});

// DELETE /api/v1/clubs/:id/members/:memberId
router.delete('/:id/members/:memberId', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const { id: clubId, memberId } = _req.params;
 
    const result = await pool.query(
      `DELETE FROM club_member WHERE id_club = $1 AND id_member = $2 RETURNING *`,
      [clubId, memberId],
    );
 
    if (!result.rows[0]) {
      throw new AppError('Member not found in this club', 404, 'MEMBER_NOT_FOUND');
    }
 
    res.json({ message: 'Member removed from club successfully' });
  } catch (err) {
    next(err);
  }
});

// ── Club events ───────────────────────────────────────────────────────────────

// GET /api/v1/clubs/:id/events?upcoming
router.get('/:id/events', async (_req: Request, res: Response, next: NextFunction) => {
  try {
    const clubId   = _req.params.id;
    const upcoming = _req.query.upcoming === 'true' || _req.query.upcoming === '1';
 
    // 404 if club doesn't exist
    const clubCheck = await pool.query('SELECT id FROM club WHERE id = $1', [clubId]);
    if (!clubCheck.rows[0]) {
      throw new AppError('Club not found', 404, 'CLUB_NOT_FOUND');
    }
 
    const upcomingClause = upcoming ? `AND e.datetime > NOW()` : '';
 
    const result = await pool.query(
      `SELECT
         e.*,
         json_build_object('id', c.id, 'name', c.name) AS club,
         0 AS current_participants
       FROM event e
       JOIN club c ON c.id = e.id_club
       WHERE e.id_club = $1
       ${upcomingClause}
       ORDER BY e.datetime ASC`,
      [clubId],
    );
 
    res.json({ data: result.rows });
  } catch (err) {
    next(err);
  }
});

export default router;
