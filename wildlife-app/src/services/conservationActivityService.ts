import type { ConservationActivity } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/conservation-activities'

export const conservationActivityService = {
  getActivities: () => api.get<ConservationActivity[]>(PATH),
  getActivityById: (id: string) => getOrUndefined<ConservationActivity>(`${PATH}/${encodeURIComponent(id)}`),
  createActivity: (record: ConservationActivity) => api.create<ConservationActivity>(PATH, record),
  updateActivity: (id: string, patch: Partial<ConservationActivity>) => api.update<ConservationActivity>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteActivity: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}