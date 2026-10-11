import type { ReportMeta } from '../types'
import { api } from '../lib/api'

const PATH = '/reports'

export interface ReportColumn {
  key: string
  label: string
}

export interface ReportSource {
  resource: string
  columns: ReportColumn[]
}

export interface ReportData {
  source: ReportSource
  rows: Record<string, unknown>[]
}

/** Maps each report to the live resource that supplies its records. */
const reportSources: Record<string, ReportSource> = {
  'RP-01': {
    resource: '/species',
    columns: [
      { key: 'commonName', label: 'Species' },
      { key: 'scientificName', label: 'Scientific Name' },
      { key: 'status', label: 'Conservation Status' },
      { key: 'populationEstimate', label: 'Population Estimate' },
      { key: 'habitat', label: 'Habitat' },
    ],
  },
  'RP-02': {
    resource: '/species',
    columns: [
      { key: 'commonName', label: 'Species' },
      { key: 'category', label: 'Category' },
      { key: 'status', label: 'Conservation Status' },
      { key: 'habitat', label: 'Habitat' },
      { key: 'regions', label: 'Regions' },
    ],
  },
  'RP-03': {
    resource: '/sightings',
    columns: [
      { key: 'id', label: 'Sighting ID' },
      { key: 'date', label: 'Date' },
      { key: 'location', label: 'Location' },
      { key: 'ranger', label: 'Ranger' },
      { key: 'count', label: 'Count' },
      { key: 'status', label: 'Status' },
    ],
  },
  'RP-04': {
    resource: '/incidents',
    columns: [
      { key: 'id', label: 'Incident ID' },
      { key: 'type', label: 'Type' },
      { key: 'location', label: 'Location' },
      { key: 'date', label: 'Date' },
      { key: 'severity', label: 'Severity' },
      { key: 'status', label: 'Status' },
    ],
  },
  'RP-05': {
    resource: '/threats',
    columns: [
      { key: 'id', label: 'Threat ID' },
      { key: 'type', label: 'Type' },
      { key: 'speciesAffected', label: 'Species Affected' },
      { key: 'severity', label: 'Severity' },
      { key: 'trend', label: 'Trend' },
      { key: 'status', label: 'Status' },
    ],
  },
  'RP-06': {
    resource: '/habitats',
    columns: [
      { key: 'id', label: 'Habitat ID' },
      { key: 'name', label: 'Name' },
      { key: 'location', label: 'Location' },
      { key: 'type', label: 'Type' },
      { key: 'condition', label: 'Condition' },
      { key: 'speciesCount', label: 'Species Count' },
    ],
  },
  'RP-07': {
    resource: '/rescue-operations',
    columns: [
      { key: 'id', label: 'Rescue ID' },
      { key: 'animalName', label: 'Animal' },
      { key: 'species', label: 'Species' },
      { key: 'rescueDate', label: 'Rescue Date' },
      { key: 'condition', label: 'Condition' },
      { key: 'outcome', label: 'Outcome' },
      { key: 'status', label: 'Status' },
    ],
  },
  'RP-08': {
    resource: '/conservation-activities',
    columns: [
      { key: 'id', label: 'Activity ID' },
      { key: 'name', label: 'Name' },
      { key: 'type', label: 'Type' },
      { key: 'area', label: 'Area' },
      { key: 'progress', label: 'Progress (%)' },
      { key: 'status', label: 'Status' },
    ],
  },
}

export const reportService = {
  getReports: () => api.get<ReportMeta[]>(PATH),
  async getReportData(report: ReportMeta): Promise<ReportData> {
    const source = reportSources[report.id]
    if (!source) throw new Error(`No live data source is configured for "${report.title}".`)
    const rows = await api.get<Record<string, unknown>[]>(source.resource)
    return { source, rows }
  },
}
