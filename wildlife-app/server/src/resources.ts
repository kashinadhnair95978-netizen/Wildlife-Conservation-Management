/**
 * Resource registry: maps each front-end service/module to a PostgreSQL table
 * and describes how TypeScript (camelCase) fields translate to database
 * (snake_case) columns. This is the single source of truth used by the generic
 * CRUD router, the schema helpers and the seed script.
 */

export type ColumnKind = 'text' | 'int' | 'date' | 'text[]'

export interface ColumnDef {
  /** camelCase name used by the front-end types */
  ts: string
  /** snake_case database column name */
  db: string
  kind: ColumnKind
}

export interface ResourceDef {
  /** URL segment, e.g. /api/protected-areas */
  resource: string
  /** PostgreSQL table name */
  table: string
  /** Prefix used when the client does not supply an id */
  idPrefix: string
  columns: ColumnDef[]
}

const text = (ts: string, db: string): ColumnDef => ({ ts, db, kind: 'text' })
const int = (ts: string, db: string): ColumnDef => ({ ts, db, kind: 'int' })
const date = (ts: string, db: string): ColumnDef => ({ ts, db, kind: 'date' })
const arr = (ts: string, db: string): ColumnDef => ({ ts, db, kind: 'text[]' })

export const resources: ResourceDef[] = [
  {
    resource: 'species',
    table: 'species',
    idPrefix: 'SP-',
    columns: [
      text('id', 'id'),
      text('commonName', 'common_name'),
      text('scientificName', 'scientific_name'),
      text('category', 'category'),
      text('status', 'status'),
      text('populationEstimate', 'population_estimate'),
      text('habitat', 'habitat'),
      text('image', 'image'),
      text('description', 'description'),
      text('bodyLength', 'body_length'),
      text('weight', 'weight'),
      text('diet', 'diet'),
      arr('regions', 'regions'),
    ],
  },
  {
    resource: 'animals',
    table: 'animals',
    idPrefix: 'AN-',
    columns: [
      text('id', 'id'),
      text('speciesId', 'species_id'),
      text('name', 'name'),
      text('gender', 'gender'),
      int('ageYears', 'age_years'),
      date('dateOfBirth', 'date_of_birth'),
      text('habitat', 'habitat'),
      text('healthStatus', 'health_status'),
      text('currentLocation', 'current_location'),
      text('trackingStatus', 'tracking_status'),
      text('image', 'image'),
    ],
  },
  {
    resource: 'habitats',
    table: 'habitats',
    idPrefix: 'HB-',
    columns: [
      text('id', 'id'),
      text('name', 'name'),
      text('location', 'location'),
      text('area', 'area'),
      text('type', 'type'),
      text('condition', 'condition'),
      int('speciesCount', 'species_count'),
      date('lastInspection', 'last_inspection'),
      text('image', 'image'),
      text('description', 'description'),
    ],
  },
  {
    resource: 'protected-areas',
    table: 'protected_areas',
    idPrefix: 'PA-',
    columns: [
      text('id', 'id'),
      text('name', 'name'),
      text('location', 'location'),
      text('areaSize', 'area_size'),
      text('type', 'type'),
      int('rangerCount', 'ranger_count'),
      int('speciesCount', 'species_count'),
      text('status', 'status'),
      text('established', 'established'),
      text('image', 'image'),
    ],
  },
  {
    resource: 'sightings',
    table: 'sightings',
    idPrefix: 'SG-',
    columns: [
      text('id', 'id'),
      text('speciesId', 'species_id'),
      text('location', 'location'),
      text('protectedAreaId', 'protected_area_id'),
      text('habitat', 'habitat'),
      date('date', 'date'),
      text('time', 'time'),
      text('ranger', 'ranger'),
      int('count', 'count'),
      text('behavior', 'behavior'),
      text('status', 'status'),
      text('notes', 'notes'),
    ],
  },
  {
    resource: 'incidents',
    table: 'incidents',
    idPrefix: 'IN-',
    columns: [
      text('id', 'id'),
      text('type', 'type'),
      text('location', 'location'),
      date('date', 'date'),
      text('time', 'time'),
      text('reportedBy', 'reported_by'),
      text('severity', 'severity'),
      text('status', 'status'),
      text('description', 'description'),
      text('notes', 'notes'),
    ],
  },
  {
    resource: 'threats',
    table: 'threats',
    idPrefix: 'TH-',
    columns: [
      text('id', 'id'),
      text('type', 'type'),
      text('speciesAffected', 'species_affected'),
      text('location', 'location'),
      text('severity', 'severity'),
      date('dateIdentified', 'date_identified'),
      text('status', 'status'),
      text('trend', 'trend'),
      text('description', 'description'),
    ],
  },
  {
    resource: 'rangers',
    table: 'rangers',
    idPrefix: 'RG-',
    columns: [
      text('id', 'id'),
      text('name', 'name'),
      text('assignedArea', 'assigned_area'),
      text('contact', 'contact'),
      text('status', 'status'),
      int('activeAssignments', 'active_assignments'),
      int('joinYear', 'join_year'),
      text('specialization', 'specialization'),
    ],
  },
  {
    resource: 'conservation-activities',
    table: 'conservation_activities',
    idPrefix: 'AC-',
    columns: [
      text('id', 'id'),
      text('name', 'name'),
      text('type', 'type'),
      text('area', 'area'),
      text('responsible', 'responsible'),
      date('startDate', 'start_date'),
      date('endDate', 'end_date'),
      int('progress', 'progress'),
      text('status', 'status'),
      text('budget', 'budget'),
    ],
  },
  {
    resource: 'rescue-operations',
    table: 'rescue_operations',
    idPrefix: 'RS-',
    columns: [
      text('id', 'id'),
      text('animalId', 'animal_id'),
      text('animalName', 'animal_name'),
      text('species', 'species'),
      text('location', 'location'),
      date('rescueDate', 'rescue_date'),
      arr('team', 'team'),
      text('condition', 'condition'),
      text('outcome', 'outcome'),
      text('status', 'status'),
      text('notes', 'notes'),
    ],
  },
  {
    resource: 'animal-health',
    table: 'animal_health',
    idPrefix: 'HT-',
    columns: [
      text('id', 'id'),
      text('animalId', 'animal_id'),
      text('species', 'species'),
      date('examinationDate', 'examination_date'),
      text('veterinarian', 'veterinarian'),
      text('condition', 'condition'),
      text('treatment', 'treatment'),
      text('medication', 'medication'),
      date('followUpDate', 'follow_up_date'),
      text('notes', 'notes'),
    ],
  },
  {
    resource: 'researchers',
    table: 'researchers',
    idPrefix: 'RS-',
    columns: [
      text('id', 'id'),
      text('name', 'name'),
      text('organization', 'organization'),
      text('specialization', 'specialization'),
      int('activeProjects', 'active_projects'),
      text('contact', 'contact'),
      text('status', 'status'),
      arr('focusAreas', 'focus_areas'),
    ],
  },
  {
    resource: 'reports',
    table: 'reports',
    idPrefix: 'RP-',
    columns: [
      text('id', 'id'),
      text('title', 'title'),
      text('description', 'description'),
      date('lastGenerated', 'last_generated'),
      text('icon', 'icon'),
    ],
  },
]

const byName = new Map(resources.map((def) => [def.resource, def]))

export function getResource(name: string): ResourceDef | undefined {
  return byName.get(name)
}

/** Builds the aliased SELECT/RETURNING list that yields camelCase objects. */
export function selectList(def: ResourceDef): string {
  return def.columns
    .map((c) => {
      switch (c.kind) {
        case 'date':
          return `COALESCE(to_char("${c.db}", 'YYYY-MM-DD'), '') AS "${c.ts}"`
        case 'int':
          return `COALESCE("${c.db}", 0) AS "${c.ts}"`
        case 'text[]':
          return `COALESCE("${c.db}", '{}'::text[]) AS "${c.ts}"`
        default:
          return `COALESCE("${c.db}", '') AS "${c.ts}"`
      }
    })
    .join(', ')
}

/** Normalizes an incoming JSON value into a value node-postgres can bind. */
export function toDbValue(column: ColumnDef, value: unknown): unknown {
  switch (column.kind) {
    case 'text[]':
      return Array.isArray(value) ? value.map((entry) => String(entry)) : []
    case 'int': {
      const parsed = Number(value)
      return Number.isFinite(parsed) ? Math.trunc(parsed) : 0
    }
    case 'date':
      if (value === undefined || value === null || value === '') return null
      return String(value)
    default:
      if (value === undefined || value === null) return ''
      return String(value)
  }
}

/** Mirrors the front-end `generateId` helper for client-less inserts. */
export function generateId(prefix: string): string {
  const n = Math.floor(1000 + Math.random() * 9000)
  return `${prefix}${n}`
}
