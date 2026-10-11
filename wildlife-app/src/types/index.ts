export type ConservationStatus =
  | 'Critically Endangered'
  | 'Endangered'
  | 'Vulnerable'
  | 'Near Threatened'
  | 'Least Concern'
  | 'Threatened'

export type SpeciesCategory = 'Mammal' | 'Bird' | 'Reptile' | 'Amphibian' | 'Fish' | 'Insect'

export type Gender = 'Male' | 'Female' | 'Unknown'

export type HealthStatus = 'Healthy' | 'Under Observation' | 'Injured' | 'Recovering' | 'Critical'

export type TrackingStatus = 'Tracked' | 'Untracked'

export type HabitatType =
  | 'Tropical Forest'
  | 'Grassland'
  | 'Wetland'
  | 'Mountain'
  | 'Coastal'
  | 'River Ecosystem'

export type HabitatCondition = 'Excellent' | 'Good' | 'Fair' | 'Degraded'

export type ProtectedAreaType = 'National Park' | 'Wildlife Sanctuary' | 'Tiger Reserve' | 'Biosphere Reserve'

export type ProtectedAreaStatus = 'Active' | 'Under Review' | 'Restricted'

export type SightingStatus = 'Verified' | 'Pending' | 'Under Review'

export type IncidentType =
  | 'Poaching'
  | 'Forest Fire'
  | 'Injured Animal'
  | 'Habitat Destruction'
  | 'Human-Wildlife Conflict'
  | 'Illegal Activity'
  | 'Other'

export type IncidentSeverity = 'Low' | 'Medium' | 'High' | 'Critical'

export type IncidentStatus = 'Open' | 'Investigating' | 'Resolved'

export type ThreatType =
  | 'Poaching'
  | 'Habitat Loss'
  | 'Human Encroachment'
  | 'Invasive Species'
  | 'Climate Impact'
  | 'Water Scarcity'
  | 'Disease Outbreak'
  | 'Pollution'
  | 'Illegal Logging'

export type ThreatStatus = 'Active' | 'Mitigating' | 'Monitored' | 'Contained'

export type ThreatTrend = 'Rising' | 'Stable' | 'Declining'

export type RangerStatus = 'On Field Duty' | 'On Patrol' | 'On Leave' | 'Reserve'

export type ActivityType =
  | 'Habitat Restoration'
  | 'Anti-Poaching Patrol'
  | 'Species Monitoring'
  | 'Tree Plantation'
  | 'Community Awareness'
  | 'Wildlife Rescue'
  | 'Breeding Program'

export type ActivityStatus = 'Active' | 'Completed' | 'Planned' | 'On Hold'

export type AnimalCondition = 'Stable' | 'Critical' | 'Fair' | 'Good'

export type RescueOutcome = 'Released' | 'Under Treatment' | 'Under Observation' | 'Transferred' | 'Deceased'

export type RescueStatus = 'Ongoing' | 'Completed'

export type HealthCondition = 'Healthy' | 'Under Treatment' | 'Recovering' | 'Critical' | 'Under Observation'

export type ResearcherStatus = 'Active' | 'Inactive'

export interface Species {
  id: string
  commonName: string
  scientificName: string
  category: SpeciesCategory
  status: ConservationStatus
  populationEstimate: string
  habitat: string
  image: string
  description: string
  bodyLength: string
  weight: string
  diet: string
  regions: string[]
}

export interface Animal {
  id: string
  speciesId: string
  name: string
  gender: Gender
  ageYears: number
  dateOfBirth: string
  habitat: string
  healthStatus: HealthStatus
  currentLocation: string
  trackingStatus: TrackingStatus
  image: string
}

export interface Habitat {
  id: string
  name: string
  location: string
  area: string
  type: HabitatType
  condition: HabitatCondition
  speciesCount: number
  lastInspection: string
  image: string
  description: string
}

export interface ProtectedArea {
  id: string
  name: string
  location: string
  areaSize: string
  type: ProtectedAreaType
  rangerCount: number
  speciesCount: number
  status: ProtectedAreaStatus
  established: string
  image: string
}

export interface Sighting {
  id: string
  speciesId: string
  location: string
  protectedAreaId: string
  habitat: string
  date: string
  time: string
  ranger: string
  count: number
  behavior: string
  status: SightingStatus
  notes?: string
}

export interface Incident {
  id: string
  type: IncidentType
  location: string
  date: string
  time: string
  reportedBy: string
  severity: IncidentSeverity
  status: IncidentStatus
  description: string
  notes?: string
}

export interface Threat {
  id: string
  type: ThreatType
  speciesAffected: string
  location: string
  severity: IncidentSeverity
  dateIdentified: string
  status: ThreatStatus
  trend: ThreatTrend
  description: string
}

export interface Ranger {
  id: string
  name: string
  assignedArea: string
  contact: string
  status: RangerStatus
  activeAssignments: number
  joinYear: number
  specialization: string
}

export interface ConservationActivity {
  id: string
  name: string
  type: ActivityType
  area: string
  responsible: string
  startDate: string
  endDate: string
  progress: number
  status: ActivityStatus
  budget: string
}

export interface RescueOperation {
  id: string
  animalId: string
  animalName: string
  species: string
  location: string
  rescueDate: string
  team: string[]
  condition: AnimalCondition
  outcome: RescueOutcome
  status: RescueStatus
  notes: string
}

export interface AnimalHealth {
  id: string
  animalId: string
  species: string
  examinationDate: string
  veterinarian: string
  condition: HealthCondition
  treatment: string
  medication: string
  followUpDate: string
  notes: string
}

export interface Researcher {
  id: string
  name: string
  organization: string
  specialization: string
  activeProjects: number
  contact: string
  status: ResearcherStatus
  focusAreas: string[]
}

export interface ReportMeta {
  id: string
  title: string
  description: string
  lastGenerated: string
  icon: 'population' | 'species' | 'sighting' | 'incident' | 'threat' | 'habitat' | 'rescue' | 'activity'
}

export interface DashboardStats {
  totalSpecies: number
  totalAnimals: number
  activeSightings: number
  protectedAreas: number
  openIncidents: number
  conservationActivities: number
  trend: { label: string; up: boolean; value: string }
}

export interface ActivityFeedItem {
  id: string
  title: string
  detail: string
  timeAgo: string
  icon: 'sighting' | 'incident' | 'health' | 'activity' | 'rescue'
}

export type { SightingStatus as SightingStatusType }