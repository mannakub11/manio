import type { ISODate } from '../lib/week'

/** One logged block of cardio. A day can hold several. */
export type Entry = {
  id: string
  date: ISODate
  minutes: number
}

export type Settings = {
  weeklyGoalMinutes: number
  /** ISO date of the last successful export — drives the backup nag. */
  lastExportAt: ISODate | null
}

export const DEFAULT_SETTINGS: Settings = {
  weeklyGoalMinutes: 200,
  lastExportAt: null,
}

/** The shape of an export file. `version` exists so imports can be migrated. */
export type Snapshot = {
  app: 'manio'
  version: 1
  exportedAt: string
  entries: Entry[]
  settings: Settings
}
