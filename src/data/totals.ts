import type { Entry } from './types'
import { monthWeeks, weekDays, weekStart, type ISODate, type MonthKey } from '../lib/week'

/** date → total minutes, built once per render of a screen. */
export function byDay(entries: Entry[]): Map<ISODate, number> {
  const map = new Map<ISODate, number>()
  for (const e of entries) map.set(e.date, (map.get(e.date) ?? 0) + e.minutes)
  return map
}

/** Sunday → total minutes for that whole week. */
export function byWeek(entries: Entry[]): Map<ISODate, number> {
  const map = new Map<ISODate, number>()
  for (const e of entries) {
    const sunday = weekStart(e.date)
    map.set(sunday, (map.get(sunday) ?? 0) + e.minutes)
  }
  return map
}

export function entriesOn(entries: Entry[], date: ISODate): Entry[] {
  return entries.filter((e) => e.date === date)
}

export type DayTotal = { date: ISODate; minutes: number }

export function weekTotals(entries: Entry[], sunday: ISODate): DayTotal[] {
  const days = byDay(entries)
  return weekDays(sunday).map((date) => ({ date, minutes: days.get(date) ?? 0 }))
}

export type WeekTotal = { sunday: ISODate; minutes: number }

export function monthTotals(entries: Entry[], month: MonthKey): WeekTotal[] {
  const weeks = byWeek(entries)
  return monthWeeks(month).map((sunday) => ({ sunday, minutes: weeks.get(sunday) ?? 0 }))
}

export function sum(values: { minutes: number }[]): number {
  return values.reduce((total, v) => total + v.minutes, 0)
}
