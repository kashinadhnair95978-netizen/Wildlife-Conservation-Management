import type { AnimalHealth } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/animal-health'

export const animalHealthService = {
  getHealthRecords: () => api.get<AnimalHealth[]>(PATH),
  getHealthRecordById: (id: string) => getOrUndefined<AnimalHealth>(`${PATH}/${encodeURIComponent(id)}`),
  createHealthRecord: (record: AnimalHealth) => api.create<AnimalHealth>(PATH, record),
  updateHealthRecord: (id: string, patch: Partial<AnimalHealth>) => api.update<AnimalHealth>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteHealthRecord: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}