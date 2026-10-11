import { animalsData } from '../data/animals'
import type { Animal } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<Animal>(animalsData)

export const animalService = {
  getAnimals: () => store.list(),
  getAnimalById: (id: string) => store.getById(id),
  createAnimal: (record: Animal) => store.create(record),
  updateAnimal: (id: string, patch: Partial<Animal>) => store.update(id, patch),
  deleteAnimal: (id: string) => store.remove(id),
}