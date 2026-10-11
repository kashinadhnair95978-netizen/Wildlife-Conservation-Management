import { habitatsData } from '../data/habitats'
import type { Habitat } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<Habitat>(habitatsData)

export const habitatService = {
  getHabitats: () => store.list(),
  getHabitatById: (id: string) => store.getById(id),
  createHabitat: (record: Habitat) => store.create(record),
  updateHabitat: (id: string, patch: Partial<Habitat>) => store.update(id, patch),
  deleteHabitat: (id: string) => store.remove(id),
}