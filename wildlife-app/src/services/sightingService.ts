import type { Sighting } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/sightings'

export const sightingService = {
  getSightings: () => api.get<Sighting[]>(PATH),
  getSightingById: (id: string) => getOrUndefined<Sighting>(`${PATH}/${encodeURIComponent(id)}`),
  createSighting: (record: Sighting) => api.create<Sighting>(PATH, record),
  updateSighting: (id: string, patch: Partial<Sighting>) => api.update<Sighting>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteSighting: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },

  exportCsv: async () => {
    const rows = await api.get<Sighting[]>(PATH)
    const header = ['ID', 'Species', 'Location', 'Date', 'Time', 'Ranger', 'Count', 'Status']
    const body = rows.map((s) => [s.id, s.speciesId, s.location, s.date, s.time, s.ranger, s.count, s.status].join(','))
    return [header.join(','), ...body].join('\n')
  },
}