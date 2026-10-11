import { dashboardStats, sightingsOverMonths, speciesPopulation, incidentCategories, activityStatusBreakdown, activityFeed, reportsData } from '../data/reports'

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export const dashboardService = {
  getStats: async () => {
    await delay(260)
    return dashboardStats
  },
  getSightingsOverview: async () => {
    await delay(240)
    return sightingsOverMonths
  },
  getSpeciesPopulation: async () => {
    await delay(240)
    return speciesPopulation
  },
  getIncidentCategories: async () => {
    await delay(240)
    return incidentCategories
  },
  getActivityStatusBreakdown: async () => {
    await delay(240)
    return activityStatusBreakdown
  },
  getActivityFeed: async () => {
    await delay(220)
    return activityFeed
  },
  getReports: async () => {
    await delay(240)
    return reportsData
  },
}