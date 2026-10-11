import { Router, type RequestHandler } from 'express'
import { query } from '../db'
import { asyncHandler, HttpError } from '../http'
import { generateId, getResource, selectList, toDbValue, type ResourceDef } from '../resources'

/**
 * Generic REST router. Every entity module shares the same request contract the
 * front-end service layer already expects:
 *
 *   GET    /api/:resource          -> list
 *   GET    /api/:resource/:id      -> single record (404 when absent)
 *   POST   /api/:resource          -> create (client may supply `id`)
 *   PATCH  /api/:resource/:id      -> partial update (also accepted as PUT)
 *   PUT    /api/:resource/:id      -> partial update
 *   DELETE /api/:resource/:id      -> delete
 */
export const crudRouter = Router()

function requireResource(name: string): ResourceDef {
  const def = getResource(name)
  if (!def) throw new HttpError(404, `Unknown resource "${name}"`)
  return def
}

function quoteColumns(def: ResourceDef): string {
  return def.columns.map((c) => `"${c.db}"`).join(', ')
}

crudRouter.get(
  '/:resource',
  asyncHandler(async (req, res) => {
    const def = requireResource(req.params.resource)
    const { rows } = await query(
      `SELECT ${selectList(def)} FROM "${def.table}" ORDER BY created_at DESC, seq ASC`,
    )
    res.json(rows)
  }),
)

crudRouter.get(
  '/:resource/:id',
  asyncHandler(async (req, res) => {
    const def = requireResource(req.params.resource)
    const { rows } = await query(
      `SELECT ${selectList(def)} FROM "${def.table}" WHERE id = $1`,
      [req.params.id],
    )
    if (rows.length === 0) throw new HttpError(404, 'Record not found')
    res.json(rows[0])
  }),
)

crudRouter.post(
  '/:resource',
  asyncHandler(async (req, res) => {
    const def = requireResource(req.params.resource)
    const body = (req.body ?? {}) as Record<string, unknown>

    const columns = def.columns
    const placeholders = columns.map((_, index) => `$${index + 1}`).join(', ')
    const values = columns.map((column) => {
      if (column.ts === 'id') {
        const provided = body.id
        return typeof provided === 'string' && provided.length > 0 ? provided : generateId(def.idPrefix)
      }
      return toDbValue(column, body[column.ts])
    })

    const { rows } = await query(
      `INSERT INTO "${def.table}" (${quoteColumns(def)}) VALUES (${placeholders}) RETURNING ${selectList(def)}`,
      values,
    )
    res.status(201).json(rows[0])
  }),
)

const updateRecord: RequestHandler = asyncHandler(async (req, res) => {
  const def = requireResource(req.params.resource)
  const body = (req.body ?? {}) as Record<string, unknown>

  const columns = def.columns.filter((c) => c.ts !== 'id' && body[c.ts] !== undefined)
  if (columns.length === 0) throw new HttpError(400, 'No updatable fields were provided')

  const assignments = columns.map((c, index) => `"${c.db}" = $${index + 1}`)
  const values: unknown[] = columns.map((c) => toDbValue(c, body[c.ts]))
  values.push(req.params.id)

  const { rows } = await query(
    `UPDATE "${def.table}" SET ${assignments.join(', ')} WHERE id = $${values.length} RETURNING ${selectList(def)}`,
    values,
  )
  if (rows.length === 0) throw new HttpError(404, 'Record not found')
  res.json(rows[0])
})

crudRouter.patch('/:resource/:id', updateRecord)
crudRouter.put('/:resource/:id', updateRecord)

crudRouter.delete(
  '/:resource/:id',
  asyncHandler(async (req, res) => {
    const def = requireResource(req.params.resource)
    const { rows } = await query(`DELETE FROM "${def.table}" WHERE id = $1 RETURNING id`, [req.params.id])
    if (rows.length === 0) throw new HttpError(404, 'Record not found')
    res.json({ id: (rows[0] as { id: string }).id })
  }),
)
