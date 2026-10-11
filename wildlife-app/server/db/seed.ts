import { closePool, getPool } from '../src/db'
import { resources, toDbValue } from '../src/resources'

import { speciesData } from '../../src/data/species'
import { animalsData } from '../../src/data/animals'
import { habitatsData } from '../../src/data/habitats'
import { protectedAreasData } from '../../src/data/protectedAreas'
import { sightingsData } from '../../src/data/sightings'
import { incidentsData } from '../../src/data/incidents'
import { threatsData } from '../../src/data/threats'
import { rangersData } from '../../src/data/rangers'
import { conservationActivitiesData } from '../../src/data/conservationActivities'
import { rescueOperationsData } from '../../src/data/rescueOperations'
import { animalHealthData } from '../../src/data/animalHealth'
import { researchersData } from '../../src/data/researchers'
import { reportsData } from '../../src/data/reports'

/**
 * Seeds the database from the existing front-end mock data. The insert is
 * idempotent: rows whose `id` already exists are skipped, so it never
 * overwrites or deletes data that is already present.
 */
const seeds: Record<string, readonly { id: string }[]> = {
  species: speciesData,
  animals: animalsData,
  habitats: habitatsData,
  'protected-areas': protectedAreasData,
  sightings: sightingsData,
  incidents: incidentsData,
  threats: threatsData,
  rangers: rangersData,
  'conservation-activities': conservationActivitiesData,
  'rescue-operations': rescueOperationsData,
  'animal-health': animalHealthData,
  researchers: researchersData,
  reports: reportsData,
}

async function main(): Promise<void> {
  const client = await getPool().connect()
  try {
    await client.query('BEGIN')

    for (const def of resources) {
      const rows = seeds[def.resource]
      if (!rows || rows.length === 0) {
        console.log(`- ${def.resource}: no seed data`)
        continue
      }

      const names = def.columns.map((c) => `"${c.db}"`).join(', ')
      const placeholders = def.columns.map((_, index) => `$${index + 1}`).join(', ')
      const sql = `INSERT INTO "${def.table}" (${names}) VALUES (${placeholders}) ON CONFLICT ("id") DO NOTHING`

      let inserted = 0
      for (const record of rows) {
        const data = record as unknown as Record<string, unknown>
        const values = def.columns.map((column) => {
          if (column.ts === 'id') return String(data.id ?? '')
          return toDbValue(column, data[column.ts])
        })
        const result = await client.query(sql, values)
        inserted += result.rowCount ?? 0
      }

      console.log(`- ${def.resource}: ${inserted}/${rows.length} new row(s) inserted (existing ids skipped)`)
    }

    await client.query('COMMIT')
    console.log('Seed completed.')
  } catch (error: unknown) {
    await client.query('ROLLBACK')
    throw error
  } finally {
    client.release()
    await closePool()
  }
}

main().catch((error: unknown) => {
  console.error('Seed failed:')
  console.error(error instanceof Error ? error.message : error)
  process.exitCode = 1
})
