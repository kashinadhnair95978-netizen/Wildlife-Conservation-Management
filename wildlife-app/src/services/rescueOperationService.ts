import type { RescueOperation } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/rescue-operations'

export const rescueOperationService = {
  getRescueOperations: () => api.get<RescueOperation[]>(PATH),
  getRescueOperationById: (id: string) => getOrUndefined<RescueOperation>(`${PATH}/${encodeURIComponent(id)}`),
  createRescueOperation: (record: RescueOperation) => api.create<RescueOperation>(PATH, record),
  updateRescueOperation: (id: string, patch: Partial<RescueOperation>) => api.update<RescueOperation>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteRescueOperation: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}