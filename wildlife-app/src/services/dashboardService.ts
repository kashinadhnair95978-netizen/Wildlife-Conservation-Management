import { api } from '../lib/api'
import type { ActivityFeedItem, DashboardStats } from '../types'

export interface SightingsOverviewPoint {
  month: string
  sightings: number
  verified: number
}

export interface SpeciesPopulationPoint {
  name: string
  population: number
}

export interface IncidentCategoryCount {
  name: string
  count: number
}

export interface ActivityStatusCount {
  name: string
  value: number
}

export const dashboardService = {
  getStats: () => api.get<DashboardStats>('/dashboard/stats'),
  getSightingsOverview: () => api.get<SightingsOverviewPoint[]>('/dashboard/sightings-overview'),
  getSpeciesPopulation: () => api.get<SpeciesPopulationPoint[]>('/dashboard/species-population'),
  getIncidentCategories: () => api.get<IncidentCategoryCount[]>('/dashboard/incident-categories'),
  getActivityStatusBreakdown: () => api.get<ActivityStatusCount[]>('/dashboard/activity-status'),
  getActivityFeed: () => api.get<ActivityFeedItem[]>('/dashboard/activity-feed'),
}
