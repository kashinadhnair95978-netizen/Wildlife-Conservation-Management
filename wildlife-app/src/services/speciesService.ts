import type { Species } from '../types'
import { api, ApiError } from '../lib/api'

const PATH = '/species'

async function findByPathOrUndefined(id: string): Promise<Species | undefined> {
  try {
    return await api.get<Species>(`${PATH}/${encodeURIComponent(id)}`)
  } catch (error) {
    if (error instanceof ApiError && error.status === 404) return undefined
    throw error
  }
}

export const speciesService = {
  getSpecies: () => api.get<Species[]>(PATH),
  getSpeciesById: findByPathOrUndefined,
  createSpecies: (record: Species) => api.create<Species>(PATH, record),
  updateSpecies: (id: string, patch: Partial<Species>) => api.update<Species>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteSpecies: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}