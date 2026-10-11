import type { Ranger } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/rangers'

export const rangerService = {
  getRangers: () => api.get<Ranger[]>(PATH),
  getRangerById: (id: string) => getOrUndefined<Ranger>(`${PATH}/${encodeURIComponent(id)}`),
  createRanger: (record: Ranger) => api.create<Ranger>(PATH, record),
  updateRanger: (id: string, patch: Partial<Ranger>) => api.update<Ranger>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteRanger: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}