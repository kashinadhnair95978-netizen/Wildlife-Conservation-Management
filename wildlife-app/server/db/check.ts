import { closePool, getPool } from '../src/db'

/**
 * Minimal connectivity check: runs a real query against PostgreSQL and exits
 * with a nonzero status code when the connection fails. Credentials are never
 * printed - only the PostgreSQL error code and message are surfaced.
 */
async function main(): Promise<void> {
  const pool = getPool()
  try {
    const result = await pool.query<{ ok: number }>('SELECT 1 AS ok')
    if (result.rows[0]?.ok !== 1) {
      throw new Error('Unexpected result from SELECT 1')
    }
    console.log('Database connection OK: SELECT 1 succeeded.')
  } finally {
    await closePool()
  }
}

main().catch((error: unknown) => {
  const code = (error as { code?: string }).code
  const message = error instanceof Error ? error.message : String(error)
  console.error(`Database connection failed${code ? ` [${code}]` : ''}: ${message}`)
  process.exitCode = 1
})
