import { speciesData } from '../data/species'
import type { Species } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<Species>(speciesData)

export const speciesService = {
  getSpecies: () => store.list(),
  getSpeciesById: (id: string) => store.getById(id),
  createSpecies: (record: Species) => store.create(record),
  updateSpecies: (id: string, patch: Partial<Species>) => store.update(id, patch),
  deleteSpecies: (id: string) => store.remove(id),
}