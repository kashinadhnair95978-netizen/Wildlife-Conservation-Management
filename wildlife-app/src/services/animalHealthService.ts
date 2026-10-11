import { animalHealthData } from '../data/animalHealth'
import type { AnimalHealth } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<AnimalHealth>(animalHealthData)

export const animalHealthService = {
  getHealthRecords: () => store.list(),
  getHealthRecordById: (id: string) => store.getById(id),
  createHealthRecord: (record: AnimalHealth) => store.create(record),
  updateHealthRecord: (id: string, patch: Partial<AnimalHealth>) => store.update(id, patch),
  deleteHealthRecord: (id: string) => store.remove(id),
}