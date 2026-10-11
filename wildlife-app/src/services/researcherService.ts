import type { Researcher } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/researchers'

export const researcherService = {
  getResearchers: () => api.get<Researcher[]>(PATH),
  getResearcherById: (id: string) => getOrUndefined<Researcher>(`${PATH}/${encodeURIComponent(id)}`),
  createResearcher: (record: Researcher) => api.create<Researcher>(PATH, record),
  updateResearcher: (id: string, patch: Partial<Researcher>) => api.update<Researcher>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteResearcher: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}