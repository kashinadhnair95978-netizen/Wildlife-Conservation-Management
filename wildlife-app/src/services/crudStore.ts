const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

export interface CrudStore<T extends { id: string }> {
  list(): Promise<T[]>
  getById(id: string): Promise<T | undefined>
  create(record: T): Promise<T>
  update(id: string, patch: Partial<T>): Promise<T | undefined>
  remove(id: string): Promise<string>
}

export function createCrudStore<T extends { id: string }>(seed: T[]): CrudStore<T> {
  const items: T[] = [...seed]

  return {
    async list() {
      await delay(280)
      return [...items]
    },
    async getById(id: string) {
      await delay(180)
      return items.find((item) => item.id === id)
    },
    async create(record: T) {
      await delay(320)
      items.unshift(record)
      return record
    },
    async update(id: string, patch) {
      await delay(320)
      const index = items.findIndex((item) => item.id === id)
      if (index === -1) return undefined
      items[index] = { ...items[index], ...patch, id }
      return items[index]
    },
    async remove(id: string) {
      await delay(220)
      const index = items.findIndex((item) => item.id === id)
      if (index !== -1) items.splice(index, 1)
      return id
    },
  }
}

export type ServiceActionResult = { ok: true; message: string; data?: unknown } | { ok: false; message: string }