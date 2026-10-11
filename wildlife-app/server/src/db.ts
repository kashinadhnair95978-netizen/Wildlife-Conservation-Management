import { Pool } from 'pg'
import type { QueryResult, QueryResultRow } from 'pg'
import { config } from './config'

/**
 * The pool is created lazily on the first query. Simply importing this module
 * (or booting the API) never opens a PostgreSQL connection, which lets the
 * server run before database access is restored.
 */
let pool: Pool | null = null

export function getPool(): Pool {
  if (!pool) {
    pool = config.databaseUrl
      ? new Pool({ connectionString: config.databaseUrl })
      : new Pool(config.pg)
  }
  return pool
}

export function query<R extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<QueryResult<R>> {
  return getPool().query<R>(text, params)
}

export async function closePool(): Promise<void> {
  if (pool) {
    await pool.end()
    pool = null
  }
}
