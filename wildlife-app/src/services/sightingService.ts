import { sightingsData } from '../data/sightings'
import type { Sighting } from '../types'
import { createCrudStore } from './crudStore'

const store = createCrudStore<Sighting>(sightingsData)

export const sightingService = {
  getSightings: () => store.list(),
  getSightingById: (id: string) => store.getById(id),
  createSighting: (record: Sighting) => store.create(record),
  updateSighting: (id: string, patch: Partial<Sighting>) => store.update(id, patch),
  deleteSighting: (id: string) => store.remove(id),

  exportCsv: async () => {
    const rows = await store.list()
    const header = ['ID', 'Species', 'Location', 'Date', 'Time', 'Ranger', 'Count', 'Status']
    const body = rows.map((s) => [s.id, s.speciesId, s.location, s.date, s.time, s.ranger, s.count, s.status].join(','))
    return [header.join(','), ...body].join('\n')
  },
}