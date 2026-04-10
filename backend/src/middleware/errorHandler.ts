import { Request, Response, NextFunction } from 'express'
import { AppError } from '../types'

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error:   err.message,
      code:    err.code,
      ...(err.details && { details: err.details }),
    })
  }

  console.error(err)
  res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' })
}