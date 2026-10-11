import type { Animal } from '../types'
import { api, getOrUndefined } from '../lib/api'

const PATH = '/animals'

export const animalService = {
  getAnimals: () => api.get<Animal[]>(PATH),
  getAnimalById: (id: string) => getOrUndefined<Animal>(`${PATH}/${encodeURIComponent(id)}`),
  createAnimal: (record: Animal) => api.create<Animal>(PATH, record),
  updateAnimal: (id: string, patch: Partial<Animal>) => api.update<Animal>(`${PATH}/${encodeURIComponent(id)}`, patch),
  deleteAnimal: async (id: string): Promise<string> => {
    await api.remove<{ id: string }>(`${PATH}/${encodeURIComponent(id)}`)
    return id
  },
}