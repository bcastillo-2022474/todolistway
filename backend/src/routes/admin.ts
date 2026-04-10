import { Router, Request, Response, NextFunction } from 'express'
import jwt from 'jsonwebtoken'
import { AppError } from '../types'
import { requireAuth } from '../middleware/auth'

const router = Router()

// POST /api/v1/admin/login
// POST /api/v1/admin/login
router.post('/login', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { password } = req.body

    if (!password) {
      throw new AppError('Validation failed', 400, 'VALIDATION_ERROR', {
        password: 'Password is required',
      })
    }

    if (password !== process.env.ADMIN_PASSWORD) {
      throw new AppError('Invalid credentials', 401, 'UNAUTHORIZED')
    }

    const token = jwt.sign(
      { role: 'admin' },
      process.env.JWT_SECRET as string,
      { expiresIn: '12h' }
    )

    res.json({ data: { token }, message: 'Login successful' })
  } catch (err) {
    next(err)
  }
})

// POST /api/v1/admin/logout  — stateless, el cliente descarta el token
router.post('/logout', requireAuth, (_req: Request, res: Response) => {
  res.json({ message: 'Logout successful' })
})

// GET /api/v1/admin/me — confirma que el token es válido
router.get('/me', requireAuth, (_req: Request, res: Response) => {
  res.json({ data: { role: 'admin' } })
})

export default router