import { Router } from 'express'
import { query } from '../db'
import { asyncHandler } from '../http'

/**
 * Aggregate endpoints backing Dashboard.tsx and its charts. These compute from
 * the relational tables instead of returning the static values in
 * `src/data/reports.ts`.
 */
export const dashboardRouter = Router()

type StatsRow = {
  total_species: number
  total_animals: number
  active_sightings: number
  protected_areas: number
  open_incidents: number
  conservation_activities: number
  recent_sightings: number
}

dashboardRouter.get(
  '/stats',
  asyncHandler(async (_req, res) => {
    const result = await query(`
      SELECT
        (SELECT COUNT(*)::int FROM species)                                         AS total_species,
        (SELECT COUNT(*)::int FROM animals)                                         AS total_animals,
        (SELECT COUNT(*)::int FROM sightings)                                       AS active_sightings,
        (SELECT COUNT(*)::int FROM protected_areas)                                 AS protected_areas,
        (SELECT COUNT(*)::int FROM incidents WHERE status <> 'Resolved')            AS open_incidents,
        (SELECT COUNT(*)::int FROM conservation_activities)                         AS conservation_activities,
        (SELECT COUNT(*)::int FROM sightings WHERE date >= CURRENT_DATE - INTERVAL '30 days') AS recent_sightings
    `)
    const row = result.rows[0] as StatsRow
    res.json({
      totalSpecies: row.total_species,
      totalAnimals: row.total_animals,
      activeSightings: row.active_sightings,
      protectedAreas: row.protected_areas,
      openIncidents: row.open_incidents,
      conservationActivities: row.conservation_activities,
      trend: { label: 'last 30 days', up: true, value: `+${row.recent_sightings}` },
    })
  }),
)

type SightingOverviewRow = { month: string; sightings: number; verified: number }

dashboardRouter.get(
  '/sightings-overview',
  asyncHandler(async (_req, res) => {
    const result = await query(`
      SELECT month, sightings, verified
      FROM (
        SELECT
          to_char(date, 'Mon')                                   AS month,
          COUNT(*)::int                                          AS sightings,
          COUNT(*) FILTER (WHERE status = 'Verified')::int       AS verified,
          EXTRACT(MONTH FROM date)                               AS mi
        FROM sightings
        GROUP BY 1, 4
      ) t
      ORDER BY t.mi
    `)
    const rows = result.rows as SightingOverviewRow[]
    res.json(rows.map((r) => ({ month: r.month, sightings: r.sightings, verified: r.verified })))
  }),
)

type SpeciesPopulationRow = { name: string; population: number }

dashboardRouter.get(
  '/species-population',
  asyncHandler(async (_req, res) => {
    const result = await query(`
      SELECT
        common_name AS name,
        COALESCE(NULLIF(regexp_replace(population_estimate, '[^0-9]', '', 'g'), ''), '0')::integer AS population
      FROM species
      ORDER BY population DESC
      LIMIT 6
    `)
    res.json(result.rows as SpeciesPopulationRow[])
  }),
)

type CategoryRow = { name: string; count: number }

dashboardRouter.get(
  '/incident-categories',
  asyncHandler(async (_req, res) => {
    const result = await query(`
      SELECT type AS name, COUNT(*)::int AS count
      FROM incidents
      GROUP BY type
      ORDER BY count DESC
    `)
    res.json(result.rows as CategoryRow[])
  }),
)

type ActivityStatusRow = { name: string; value: number }

dashboardRouter.get(
  '/activity-status',
  asyncHandler(async (_req, res) => {
    const result = await query(`
      SELECT status AS name, COUNT(*)::int AS value
      FROM conservation_activities
      GROUP BY status
      ORDER BY value DESC
    `)
    res.json(result.rows as ActivityStatusRow[])
  }),
)

type FeedRow = {
  id: string
  title: string
  detail: string
  ts: string | Date | null
  icon: string
}

function timeAgo(value: string | Date | null): string {
  if (!value) return 'recently'
  const date = value instanceof Date ? value : new Date(value)
  if (Number.isNaN(date.getTime())) return 'recently'
  const days = Math.floor((Date.now() - date.getTime()) / 86_400_000)
  if (days <= 0) return 'today'
  if (days === 1) return 'yesterday'
  if (days < 30) return `${days} days ago`
  const months = Math.floor(days / 30)
  return months === 1 ? '1 month ago' : `${months} months ago`
}

dashboardRouter.get(
  '/activity-feed',
  asyncHandler(async (_req, res) => {
    const result = await query(`
      SELECT id, title, detail, ts, icon
      FROM (
        SELECT
          sg.id AS id,
          'New ' || COALESCE(
            (SELECT s.common_name FROM species s WHERE s.id = sg.species_id),
            'wildlife'
          ) || ' sighting recorded' AS title,
          sg.location AS detail,
          (sg.date::timestamp + COALESCE(NULLIF(sg.time, ''), '00:00')::time) AS ts,
          'sighting' AS icon
        FROM sightings sg
        UNION ALL
        SELECT
          id,
          type || ' incident reported',
          location,
          (date::timestamp + COALESCE(NULLIF(time, ''), '00:00')::time),
          'incident'
        FROM incidents
        UNION ALL
        SELECT
          id,
          'Animal health record updated',
          'Animal ' || COALESCE(NULLIF(animal_id, ''), species),
          examination_date::timestamp,
          'health'
        FROM animal_health
        UNION ALL
        SELECT
          id,
          'Conservation activity: ' || name,
          area,
          start_date::timestamp,
          'activity'
        FROM conservation_activities
        UNION ALL
        SELECT
          id,
          'Rescue operation initiated',
          species || ' - ' || location,
          rescue_date::timestamp,
          'rescue'
        FROM rescue_operations
      ) feed
      ORDER BY ts DESC NULLS LAST
      LIMIT 6
    `)
    const rows = result.rows as FeedRow[]
    res.json(rows.map((r) => ({ id: r.id, title: r.title, detail: r.detail, timeAgo: timeAgo(r.ts), icon: r.icon })))
  }),
)
