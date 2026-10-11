import type { NextFunction, Request, RequestHandler, Response } from 'express'

export class HttpError extends Error {
  status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'HttpError'
    this.status = status
  }
}

type AsyncRoute = (req: Request, res: Response, next: NextFunction) => Promise<unknown>

/** Express 4 does not forward rejected promises, so wrap async handlers. */
export function asyncHandler(fn: AsyncRoute): RequestHandler {
  return (req, res, next) => {
    fn(req, res, next).catch(next)
  }
}

interface PgError {
  code?: string
}

export function errorHandler(err: unknown, _req: Request, res: Response, _next: NextFunction): void {
  if (err instanceof HttpError) {
    res.status(err.status).json({ error: err.message })
    return
  }

  const message = err instanceof Error ? err.message : 'Unexpected error'
  const code = (err as PgError)?.code

  // Connection / authentication / missing-database failures keep the API alive.
  if (code === 'ECONNREFUSED' || code === 'ENOTFOUND' || code === 'ETIMEDOUT' || code === '28P01' || code === '3D000') {
    res.status(503).json({
      error: 'Database unavailable. Check the PostgreSQL connection settings in server/.env.',
      detail: message,
    })
    return
  }

  if (code === '23503') {
    res.status(409).json({ error: 'Related record not found (foreign key constraint).', detail: message })
    return
  }
  if (code === '23505') {
    res.status(409).json({ error: 'Duplicate record id.', detail: message })
    return
  }
  if (code === '23514') {
    res.status(400).json({ error: 'Value is not allowed by a database check constraint.', detail: message })
    return
  }
  if (code === '23502') {
    res.status(400).json({ error: 'A required field is missing.', detail: message })
    return
  }

  res.status(500).json({ error: 'Internal server error', detail: message })
}
