/**
 * The only module in the app that knows localStorage exists.
 *
 * Everything is async on purpose: the day this moves behind an HTTP API, the
 * function bodies change and nothing above this file does.
 */

import { DEFAULT_SETTINGS, type Entry, type Settings, type Snapshot } from './types'
import { todayISO } from '../lib/week'

const ENTRIES_KEY = 'manio.entries.v1'
const SETTINGS_KEY = 'manio.settings.v1'

function readJSON<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return fallback
    return JSON.parse(raw) as T
  } catch {
    // Corrupt or unavailable storage (private mode, cleared site data) must not
    // take the app down — an empty week is recoverable, a white screen is not.
    return fallback
  }
}

function writeJSON(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value))
  } catch (error) {
    console.error(`manio: failed to write ${key}`, error)
    throw new Error('Could not save — device storage may be full or blocked.')
  }
}

function isEntry(value: unknown): value is Entry {
  if (typeof value !== 'object' || value === null) return false
  const e = value as Record<string, unknown>
  return (
    typeof e.id === 'string' &&
    typeof e.date === 'string' &&
    /^\d{4}-\d{2}-\d{2}$/.test(e.date) &&
    typeof e.minutes === 'number' &&
    Number.isFinite(e.minutes) &&
    e.minutes > 0
  )
}

function newId(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) return crypto.randomUUID()
  return `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`
}

export async function getEntries(): Promise<Entry[]> {
  const raw = readJSON<unknown>(ENTRIES_KEY, [])
  return Array.isArray(raw) ? raw.filter(isEntry) : []
}

async function putEntries(entries: Entry[]): Promise<void> {
  writeJSON(ENTRIES_KEY, entries)
}

export async function addEntry(date: string, minutes: number): Promise<Entry> {
  const entry: Entry = { id: newId(), date, minutes }
  const entries = await getEntries()
  await putEntries([...entries, entry])
  return entry
}

export async function updateEntry(id: string, minutes: number): Promise<void> {
  const entries = await getEntries()
  await putEntries(entries.map((e) => (e.id === id ? { ...e, minutes } : e)))
}

export async function deleteEntry(id: string): Promise<void> {
  const entries = await getEntries()
  await putEntries(entries.filter((e) => e.id !== id))
}

export async function getSettings(): Promise<Settings> {
  const raw = readJSON<Partial<Settings>>(SETTINGS_KEY, {})
  const goal = Number(raw.weeklyGoalMinutes)
  return {
    weeklyGoalMinutes:
      Number.isFinite(goal) && goal > 0 ? goal : DEFAULT_SETTINGS.weeklyGoalMinutes,
    lastExportAt: typeof raw.lastExportAt === 'string' ? raw.lastExportAt : null,
  }
}

export async function saveSettings(patch: Partial<Settings>): Promise<Settings> {
  const next = { ...(await getSettings()), ...patch }
  writeJSON(SETTINGS_KEY, next)
  return next
}

export async function buildSnapshot(): Promise<Snapshot> {
  return {
    app: 'manio',
    version: 1,
    exportedAt: new Date().toISOString(),
    entries: await getEntries(),
    settings: await getSettings(),
  }
}

/** Records that a backup actually left the device. */
export async function markExported(): Promise<Settings> {
  return saveSettings({ lastExportAt: todayISO() })
}

export type ImportResult = { entries: number }

/**
 * Replaces everything. Import is a restore, not a merge — merging two devices
 * needs a sync story this app deliberately does not have.
 */
export async function importSnapshot(text: string): Promise<ImportResult> {
  let parsed: unknown
  try {
    parsed = JSON.parse(text)
  } catch {
    throw new Error('That is not valid JSON.')
  }
  if (typeof parsed !== 'object' || parsed === null) {
    throw new Error('That file does not look like a manio backup.')
  }
  const snapshot = parsed as Partial<Snapshot>
  if (!Array.isArray(snapshot.entries)) {
    throw new Error('That file does not look like a manio backup.')
  }
  const entries = snapshot.entries.filter(isEntry)
  if (entries.length === 0 && snapshot.entries.length > 0) {
    throw new Error('Every entry in that file was unreadable — nothing imported.')
  }
  await putEntries(entries)
  if (snapshot.settings) {
    await saveSettings({
      weeklyGoalMinutes: snapshot.settings.weeklyGoalMinutes,
      lastExportAt: snapshot.settings.lastExportAt ?? null,
    })
  }
  return { entries: entries.length }
}
