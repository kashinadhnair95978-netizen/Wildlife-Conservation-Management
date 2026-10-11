import { readFile } from 'node:fs/promises'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { closePool, getPool } from '../src/db'

const here = dirname(fileURLToPath(import.meta.url))

async function main(): Promise<void> {
  const sql = await readFile(join(here, 'schema.sql'), 'utf8')
  const pool = getPool()
  try {
    await pool.query(sql)
    console.log('Schema applied successfully (CREATE TABLE IF NOT EXISTS - no data removed).')
  } finally {
    await closePool()
  }
}

main().catch((error: unknown) => {
  console.error('Migration failed:')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
