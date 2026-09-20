/**
 * All date maths in the app lives here.
 *
 * Rule: dates are plain local calendar strings ("2026-09-20"). We never build a
 * Date from a string directly — `new Date("2026-09-20")` parses as UTC, which
 * makes a Saturday-night session jump into the next week for anyone east of
 * Greenwich. Every Date is constructed from numbers, which is always local.
 */

export type ISODate = string // "YYYY-MM-DD"
export type MonthKey = string // "YYYY-MM"

const pad = (n: number) => String(n).padStart(2, '0')

export function toISO(year: number, month: number, day: number): ISODate {
  return `${year}-${pad(month)}-${pad(day)}`
}

/** Local midnight of an ISO date. Never goes through UTC parsing. */
export function parseISO(iso: ISODate): Date {
  const [y, m, d] = iso.split('-').map(Number)
  return new Date(y, m - 1, d)
}

export function fromDate(date: Date): ISODate {
  return toISO(date.getFullYear(), date.getMonth() + 1, date.getDate())
}

export function todayISO(): ISODate {
  return fromDate(new Date())
}

export function addDays(iso: ISODate, days: number): ISODate {
  const d = parseISO(iso)
  d.setDate(d.getDate() + days)
  return fromDate(d)
}

/** 0 = Sunday … 6 = Saturday */
export function dayOfWeek(iso: ISODate): number {
  return parseISO(iso).getDay()
}

/** The Sunday that starts the week containing `iso`. This is a week's id. */
export function weekStart(iso: ISODate): ISODate {
  return addDays(iso, -dayOfWeek(iso))
}

export function weekEnd(sunday: ISODate): ISODate {
  return addDays(sunday, 6)
}

/** The seven days Sunday → Saturday. */
export function weekDays(sunday: ISODate): ISODate[] {
  return Array.from({ length: 7 }, (_, i) => addDays(sunday, i))
}

export function monthKey(iso: ISODate): MonthKey {
  return iso.slice(0, 7)
}

export function addMonths(month: MonthKey, delta: number): MonthKey {
  const [y, m] = month.split('-').map(Number)
  const d = new Date(y, m - 1 + delta, 1)
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}`
}

/**
 * The weeks that belong to a month = the weeks whose *Sunday* falls in it.
 *
 * A week is the unit the goal is set in, so it is never split across two
 * months. Every week in the year belongs to exactly one month, which means a
 * month's total is the sum of its weeks with nothing double-counted — at the
 * cost of a month total not matching the calendar month's days exactly.
 */
export function monthWeeks(month: MonthKey): ISODate[] {
  const [y, m] = month.split('-').map(Number)
  const first = toISO(y, m, 1)
  let sunday = dayOfWeek(first) === 0 ? first : addDays(weekStart(first), 7)
  const weeks: ISODate[] = []
  while (monthKey(sunday) === month) {
    weeks.push(sunday)
    sunday = addDays(sunday, 7)
  }
  return weeks
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
]
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

export function dayName(iso: ISODate): string {
  return DAYS[dayOfWeek(iso)]
}

export function dayNumber(iso: ISODate): string {
  return String(Number(iso.slice(8, 10)))
}

export function formatMonthLabel(month: MonthKey): string {
  const [y, m] = month.split('-').map(Number)
  return `${MONTHS[m - 1]} ${y}`
}

/** "Sep 20 – 26, 2026" — collapses the month when the week stays inside one. */
export function formatWeekRange(sunday: ISODate): string {
  const end = weekEnd(sunday)
  const sm = MONTHS[Number(sunday.slice(5, 7)) - 1].slice(0, 3)
  const em = MONTHS[Number(end.slice(5, 7)) - 1].slice(0, 3)
  const sd = dayNumber(sunday)
  const ed = dayNumber(end)
  const year = end.slice(0, 4)
  return sm === em ? `${sm} ${sd} – ${ed}, ${year}` : `${sm} ${sd} – ${em} ${ed}, ${year}`
}

/** 137 → "2h 17m". Used as a secondary read next to the raw minute count. */
export function formatHoursMinutes(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  if (h === 0) return `${m}m`
  return m === 0 ? `${h}h` : `${h}h ${m}m`
}

const DAYS_LONG = [
  'Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday',
]

/** "Sunday, Sep 20" — the day sheet's title. */
export function formatDayLong(iso: ISODate): string {
  const month = MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)
  return `${DAYS_LONG[dayOfWeek(iso)]}, ${month} ${dayNumber(iso)}`
}

/** Whole days from `from` to `to`, counted on the calendar, not in hours. */
export function daysBetween(from: ISODate, to: ISODate): number {
  const ms = parseISO(to).setHours(12, 0, 0, 0) - parseISO(from).setHours(12, 0, 0, 0)
  return Math.round(ms / 86_400_000)
}

/** "Sep" — used when a week spills into the next month. */
export function monthAbbr(iso: ISODate): string {
  return MONTHS[Number(iso.slice(5, 7)) - 1].slice(0, 3)
}
