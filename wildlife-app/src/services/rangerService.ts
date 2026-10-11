import { rangersData } from '../data/rangers'
import type { Ranger } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<Ranger>(rangersData)

export const rangerService = {
  getRangers: () => store.list(),
  getRangerById: (id: string) => store.getById(id),
  createRanger: (record: Ranger) => store.create(record),
  updateRanger: (id: string, patch: Partial<Ranger>) => store.update(id, patch),
  deleteRanger: (id: string) => store.remove(id),
}