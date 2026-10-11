import type { Incident } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/incidents'

export const incidentService = {
  getIncidents: () => api.get<Incident[]>(PATH),
  getIncidentById: (id: string) => getOrUndefined<Incident>(`${PATH}/${encodeURIComponent(id)}`),
  createIncident: (record: Incident) => api.create<Incident>(PATH, record),
  updateIncident: (id: string, patch: Partial<Incident>) => api.update<Incident>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteIncident: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}