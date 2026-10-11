import type { Threat } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/threats'

export const threatService = {
  getThreats: () => api.get<Threat[]>(PATH),
  getThreatById: (id: string) => getOrUndefined<Threat>(`${PATH}/${encodeURIComponent(id)}`),
  createThreat: (record: Threat) => api.create<Threat>(PATH, record),
  updateThreat: (id: string, patch: Partial<Threat>) => api.update<Threat>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteThreat: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}