import { Router, Request, Response, NextFunction } from 'express'
import pool from '../config/database'
import { AppError } from '../types'

const router = Router()

// GET /api/v1/members
router.get('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const page  = Math.max(1, parseInt(req.query.page  as string) || 1)
    const limit = Math.max(1, parseInt(req.query.limit as string) || 10)
    const search = (req.query.search as string)?.trim() || ''
    const offset = (page - 1) * limit

    const whereClause = search
      ? `WHERE name ILIKE $1 OR lastname ILIKE $1`
      : ''

    const values      = search ? [`%${search}%`] : []
    const limitIndex  = values.length + 1
    const offsetIndex = values.length + 2

    const countResult = await pool.query(
      `SELECT COUNT(*) FROM member ${whereClause}`,
      values
    )
    const total = parseInt(countResult.rows[0].count)

    const dataResult = await pool.query(
      `SELECT id, name, lastname, created_at
       FROM member
       ${whereClause}
       ORDER BY created_at DESC
       LIMIT $${limitIndex} OFFSET $${offsetIndex}`,
      [...values, limit, offset]
    )

    res.json({
      data:        dataResult.rows,
      total,
      page,
      limit,
      total_pages: Math.ceil(total / limit),
    })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/members/search  — debe ir ANTES de /:id
router.get('/search', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const q     = (req.query.q as string)?.trim()
    const limit = Math.min(parseInt(req.query.limit as string) || 5, 20)

    if (!q || q.length < 2) {
      throw new AppError('Query param q is required and must be at least 2 chars', 400, 'VALIDATION_ERROR')
    }

    const result = await pool.query(
      `SELECT id, name, lastname
       FROM member
       WHERE name ILIKE $1 OR lastname ILIKE $1
       ORDER BY name ASC
       LIMIT $2`,
      [`%${q}%`, limit]
    )

    res.json({ data: result.rows })
  } catch (err) {
    next(err)
  }
})

// GET /api/v1/members/:id
router.get('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    const result = await pool.query(
      `SELECT id, name, lastname, created_at FROM member WHERE id = $1`,
      [id]
    )

    if (result.rowCount === 0) {
      throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')
    }

    res.json({ data: result.rows[0] })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/members
router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { name, lastname } = req.body

    const errors: Record<string, string> = {}
    if (!name?.trim())     errors.name     = 'Name is required'
    if (!lastname?.trim()) errors.lastname = 'Lastname is required'

    if (Object.keys(errors).length > 0) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', errors)
    }

    const result = await pool.query(
      `INSERT INTO member (name, lastname)
       VALUES ($1, $2)
       RETURNING id, name, lastname, created_at`,
      [name.trim(), lastname.trim()]
    )

    res.status(201).json({
      data:    result.rows[0],
      message: 'Member created successfully',
    })
  } catch (err) {
    next(err)
  }
})

// PUT /api/v1/members/:id
router.put('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id }              = req.params
    const { name, lastname }  = req.body

    const result = await pool.query(
      `UPDATE member
       SET name     = COALESCE($1, name),
           lastname = COALESCE($2, lastname)
       WHERE id = $3
       RETURNING id, name, lastname, created_at`,
      [name?.trim() || null, lastname?.trim() || null, id]
    )

    if (result.rowCount === 0) {
      throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')
    }

    res.json({
      data:    result.rows[0],
      message: 'Member updated successfully',
    })
  } catch (err) {
    next(err)
  }
})

// DELETE /api/v1/members/:id
router.delete('/:id', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const { id } = req.params

    // Verificar que no tenga clubes activos
    const clubCheck = await pool.query(
      `SELECT 1 FROM club_member WHERE id_member = $1 LIMIT 1`,
      [id]
    )

    if ((clubCheck.rowCount ?? 0) > 0) {
      throw new AppError(
        'Cannot delete member with active club memberships',
        409,
        'MEMBER_HAS_CLUBS'
      )
    }

    const result = await pool.query(
      `DELETE FROM member WHERE id = $1 RETURNING id`,
      [id]
    )

    if (result.rowCount === 0) {
      throw new AppError('Member not found', 404, 'MEMBER_NOT_FOUND')
    }

    res.json({
      message:    'Member deleted successfully',
      deleted_id: parseInt(id),
    })
  } catch (err) {
    next(err)
  }
})

export default router