import { researchersData } from '../data/researchers'
import type { Researcher } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<Researcher>(researchersData)

export const researcherService = {
  getResearchers: () => store.list(),
  getResearcherById: (id: string) => store.getById(id),
  createResearcher: (record: Researcher) => store.create(record),
  updateResearcher: (id: string, patch: Partial<Researcher>) => store.update(id, patch),
  deleteResearcher: (id: string) => store.remove(id),
}