import type { ProtectedArea } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/protected-areas'

export const protectedAreaService = {
  getProtectedAreas: () => api.get<ProtectedArea[]>(PATH),
  getProtectedAreaById: (id: string) => getOrUndefined<ProtectedArea>(`${PATH}/${encodeURIComponent(id)}`),
  createProtectedArea: (record: ProtectedArea) => api.create<ProtectedArea>(PATH, record),
  updateProtectedArea: (id: string, patch: Partial<ProtectedArea>) => api.update<ProtectedArea>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteProtectedArea: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}