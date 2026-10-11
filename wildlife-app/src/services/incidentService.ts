import { incidentsData } from '../data/incidents'
import type { Incident } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<Incident>(incidentsData)

export const incidentService = {
  getIncidents: () => store.list(),
  getIncidentById: (id: string) => store.getById(id),
  createIncident: (record: Incident) => store.create(record),
  updateIncident: (id: string, patch: Partial<Incident>) => store.update(id, patch),
  deleteIncident: (id: string) => store.remove(id),
}