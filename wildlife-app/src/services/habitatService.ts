import type { Habitat } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/habitats'

export const habitatService = {
  getHabitats: () => api.get<Habitat[]>(PATH),
  getHabitatById: (id: string) => getOrUndefined<Habitat>(`${PATH}/${encodeURIComponent(id)}`),
  createHabitat: (record: Habitat) => api.create<Habitat>(PATH, record),
  updateHabitat: (id: string, patch: Partial<Habitat>) => api.update<Habitat>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteHabitat: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}