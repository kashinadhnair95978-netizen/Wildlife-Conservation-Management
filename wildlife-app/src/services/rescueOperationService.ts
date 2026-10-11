import { rescueOperationsData } from '../data/rescueOperations'
import type { RescueOperation } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<RescueOperation>(rescueOperationsData)

export const rescueOperationService = {
  getRescueOperations: () => store.list(),
  getRescueOperationById: (id: string) => store.getById(id),
  createRescueOperation: (record: RescueOperation) => store.create(record),
  updateRescueOperation: (id: string, patch: Partial<RescueOperation>) => store.update(id, patch),
  deleteRescueOperation: (id: string) => store.remove(id),
}