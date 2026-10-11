import type { ActivityFeedItem, DashboardStats, ReportMeta } from '../types'

export const dashboardStats: DashboardStats = {
  totalSpecies: 86,
  totalAnimals: 1248,
  activeSightings: 342,
  protectedAreas: 12,
  openIncidents: 24,
  conservationActivities: 38,
  trend: { label: 'last 30 days', up: true, value: '+8.4%' },
}

export const sightingsOverMonths = [
  { month: 'Jan', sightings: 118, verified: 96 },
  { month: 'Feb', sightings: 132, verified: 108 },
  { month: 'Mar', sightings: 146, verified: 121 },
  { month: 'Apr', sightings: 129, verified: 102 },
  { month: 'May', sightings: 154, verified: 128 },
  { month: 'Jun', sightings: 171, verified: 143 },
  { month: 'Jul', sightings: 188, verified: 156 },
  { month: 'Aug', sightings: 202, verified: 168 },
  { month: 'Sep', sightings: 194, verified: 161 },
  { month: 'Oct', sightings: 176, verified: 145 },
  { month: 'Nov', sightings: 163, verified: 134 },
  { month: 'Dec', sightings: 149, verified: 122 },
]

export const speciesPopulation = [
  { name: 'Bengal Tiger', population: 2967 },
  { name: 'Asian Elephant', population: 29964 },
  { name: 'Indian Leopard', population: 13500 },
  { name: 'Sambar Deer', population: 100000 },
  { name: 'Indian Gaur', population: 17500 },
  { name: 'One-horned Rhino', population: 4014 },
]

export const incidentCategories = [
  { name: 'Poaching', count: 8 },
  { name: 'Forest Fire', count: 5 },
  { name: 'Injured Animal', count: 4 },
  { name: 'Habitat Destruction', count: 3 },
  { name: 'Human-Wildlife Conflict', count: 7 },
  { name: 'Other', count: 2 },
]

export const activityStatusBreakdown = [
  { name: 'Active', value: 18 },
  { name: 'Completed', value: 12 },
  { name: 'Planned', value: 5 },
  { name: 'On Hold', value: 3 },
]

export const activityFeed: ActivityFeedItem[] = [
  { id: 'F1', title: 'New elephant sighting recorded', detail: 'Periyar Lake Shore', timeAgo: '2 hours ago', icon: 'sighting' },
  { id: 'F2', title: 'Forest fire incident reported', detail: 'Bandipur North Range', timeAgo: '5 hours ago', icon: 'incident' },
  { id: 'F3', title: 'Animal health record updated', detail: 'Animal AN-1024', timeAgo: 'Yesterday', icon: 'health' },
  { id: 'F4', title: 'Conservation activity completed', detail: 'Habitat Restoration', timeAgo: 'Yesterday', icon: 'activity' },
  { id: 'F5', title: 'Rescue operation initiated', detail: 'Indian Leopard — Mudumalai', timeAgo: '2 days ago', icon: 'rescue' },
  { id: 'F6', title: 'Researcher project approved', detail: 'Hornbill Nest Monitoring', timeAgo: '3 days ago', icon: 'activity' },
]

export const reportsData: ReportMeta[] = [
  { id: 'RP-01', title: 'Wildlife Population Report', description: 'Aggregate population estimates by species, region and trend scoring across all protected areas.', lastGenerated: '2026-08-28', icon: 'population' },
  { id: 'RP-02', title: 'Species Conservation Report', description: 'Conservation status matrix with habitat coverage, key pressures and recovery milestones.', lastGenerated: '2026-08-26', icon: 'species' },
  { id: 'RP-03', title: 'Wildlife Sightings Report', description: 'Monthly sighting summaries, species distribution maps and verification statistics.', lastGenerated: '2026-08-25', icon: 'sighting' },
  { id: 'RP-04', title: 'Conservation Incident Report', description: 'Incident log analysis by type, severity, location and response times across ranges.', lastGenerated: '2026-08-24', icon: 'incident' },
  { id: 'RP-05', title: 'Threat Analysis Report', description: 'Priority threat assessment with affected species, emerging trends and mitigation status.', lastGenerated: '2026-08-22', icon: 'threat' },
  { id: 'RP-06', title: 'Habitat Report', description: 'Habitat condition monitoring, coverage statistics and degradation alerts by ecosystem type.', lastGenerated: '2026-08-20', icon: 'habitat' },
  { id: 'RP-07', title: 'Rescue Operations Report', description: 'Rescue case log, outcome classification and mortality review for the current period.', lastGenerated: '2026-08-18', icon: 'rescue' },
  { id: 'RP-08', title: 'Conservation Activities Report', description: 'Activity progress review covering restoration, patrols, breeding and awareness programs.', lastGenerated: '2026-08-16', icon: 'activity' },
]