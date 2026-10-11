import { conservationActivitiesData } from '../data/conservationActivities'
import type { ConservationActivity } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<ConservationActivity>(conservationActivitiesData)

export const conservationActivityService = {
  getActivities: () => store.list(),
  getActivityById: (id: string) => store.getById(id),
  createActivity: (record: ConservationActivity) => store.create(record),
  updateActivity: (id: string, patch: Partial<ConservationActivity>) => store.update(id, patch),
  deleteActivity: (id: string) => store.remove(id),
}