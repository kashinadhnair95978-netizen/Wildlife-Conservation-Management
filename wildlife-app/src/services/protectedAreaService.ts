import { protectedAreasData } from '../data/protectedAreas'
import type { ProtectedArea } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<ProtectedArea>(protectedAreasData)

export const protectedAreaService = {
  getProtectedAreas: () => store.list(),
  getProtectedAreaById: (id: string) => store.getById(id),
  createProtectedArea: (record: ProtectedArea) => store.create(record),
  updateProtectedArea: (id: string, patch: Partial<ProtectedArea>) => store.update(id, patch),
  deleteProtectedArea: (id: string) => store.remove(id),
}