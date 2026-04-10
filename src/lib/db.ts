import Dexie, { type Table } from 'dexie'
import type { Moment } from '../types'

class LauSaiDB extends Dexie {
  moments!: Table<Moment>

  constructor() {
    super('lausai_db')
    this.version(1).stores({
      moments: 'id, createdAt, type, averageRating'
    })
  }
}

export const db = new LauSaiDB()

// CRUD helpers
export async function saveMoment(moment: Moment): Promise<void> {
  await db.moments.put(moment)
}

export async function getAllMoments(): Promise<Moment[]> {
  return db.moments.orderBy('createdAt').reverse().toArray()
}

export async function getMomentById(id: string): Promise<Moment | undefined> {
  return db.moments.get(id)
}

export async function deleteMoment(id: string): Promise<void> {
  await db.moments.delete(id)
}

export async function clearAllMoments(): Promise<void> {
  await db.moments.clear()
}
