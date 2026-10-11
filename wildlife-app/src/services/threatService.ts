import { threatsData } from '../data/threats'
import type { Threat } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<Threat>(threatsData)

export const threatService = {
  getThreats: () => store.list(),
  getThreatById: (id: string) => store.getById(id),
  createThreat: (record: Threat) => store.create(record),
  updateThreat: (id: string, patch: Partial<Threat>) => store.update(id, patch),
  deleteThreat: (id: string) => store.remove(id),
}