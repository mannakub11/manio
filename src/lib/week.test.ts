import { describe, expect, it } from 'vitest'
import {
  addDays,
  addMonths,
  dayOfWeek,
  daysBetween,
  formatHoursMinutes,
  formatWeekRange,
  monthKey,
  monthWeeks,
  parseISO,
  weekDays,
  weekEnd,
  weekStart,
} from './week'

describe('parseISO', () => {
  it('builds a local date, not a UTC one', () => {
    // The bug this guards: new Date("2026-09-20") is UTC midnight, which is
    // Sep 19 anywhere west of Greenwich and shifts the weekday east of it.
    const d = parseISO('2026-09-20')
    expect(d.getFullYear()).toBe(2026)
    expect(d.getMonth()).toBe(8)
    expect(d.getDate()).toBe(20)
  })
})

describe('addDays', () => {
  it('crosses a month boundary', () => {
    expect(addDays('2026-09-30', 1)).toBe('2026-10-01')
  })
  it('crosses a year boundary', () => {
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01')
  })
  it('walks backwards', () => {
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28')
  })
  it('handles a leap day', () => {
    expect(addDays('2028-02-28', 1)).toBe('2028-02-29')
    expect(addDays('2028-02-29', 1)).toBe('2028-03-01')
  })
})

describe('weekStart', () => {
  it('leaves a Sunday where it is', () => {
    expect(dayOfWeek('2026-09-20')).toBe(0)
    expect(weekStart('2026-09-20')).toBe('2026-09-20')
  })
  it('pulls a Saturday back to its own Sunday', () => {
    expect(dayOfWeek('2026-09-26')).toBe(6)
    expect(weekStart('2026-09-26')).toBe('2026-09-20')
  })
  it('pulls a mid-week day back', () => {
    expect(weekStart('2026-09-23')).toBe('2026-09-20')
  })
  it('reaches back into the previous month', () => {
    expect(weekStart('2026-10-01')).toBe('2026-09-27')
  })
  it('reaches back into the previous year', () => {
    expect(weekStart('2027-01-01')).toBe('2026-12-27')
  })
})

describe('weekDays / weekEnd', () => {
  it('runs Sunday through Saturday', () => {
    const days = weekDays('2026-09-20')
    expect(days).toHaveLength(7)
    expect(days[0]).toBe('2026-09-20')
    expect(days[6]).toBe('2026-09-26')
    expect(dayOfWeek(days[6])).toBe(6)
  })
  it('spans a month boundary without dropping a day', () => {
    expect(weekDays('2026-09-27')).toEqual([
      '2026-09-27', '2026-09-28', '2026-09-29', '2026-09-30',
      '2026-10-01', '2026-10-02', '2026-10-03',
    ])
  })
  it('weekEnd is the Saturday', () => {
    expect(weekEnd('2026-09-20')).toBe('2026-09-26')
  })
})

describe('monthWeeks', () => {
  it('lists only weeks whose Sunday is inside the month', () => {
    // Sep 2026 starts on a Tuesday, so the week of Aug 30 belongs to August.
    expect(monthWeeks('2026-09')).toEqual([
      '2026-09-06', '2026-09-13', '2026-09-20', '2026-09-27',
    ])
  })
  it('keeps a month that opens on a Sunday', () => {
    // Nov 2026 starts on a Sunday.
    expect(monthWeeks('2026-11')[0]).toBe('2026-11-01')
  })
  it('never returns fewer than 4 or more than 5 weeks', () => {
    for (let m = 1; m <= 12; m++) {
      const weeks = monthWeeks(`2026-${String(m).padStart(2, '0')}`)
      expect(weeks.length).toBeGreaterThanOrEqual(4)
      expect(weeks.length).toBeLessThanOrEqual(5)
    }
  })
  it('assigns every week of a year to exactly one month', () => {
    const all = Array.from({ length: 12 }, (_, i) =>
      monthWeeks(`2026-${String(i + 1).padStart(2, '0')}`),
    ).flat()
    expect(new Set(all).size).toBe(all.length)
    // Consecutive weeks, no gaps.
    for (let i = 1; i < all.length; i++) {
      expect(all[i]).toBe(addDays(all[i - 1], 7))
    }
  })
  it('every returned week actually starts on a Sunday', () => {
    for (const sunday of monthWeeks('2026-09')) {
      expect(dayOfWeek(sunday)).toBe(0)
      expect(monthKey(sunday)).toBe('2026-09')
    }
  })
})

describe('addMonths', () => {
  it('steps forward across a year', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01')
  })
  it('steps backward across a year', () => {
    expect(addMonths('2026-01', -1)).toBe('2025-12')
  })
})

describe('formatting', () => {
  it('collapses the month inside one week', () => {
    expect(formatWeekRange('2026-09-20')).toBe('Sep 20 – 26, 2026')
  })
  it('spells both months when a week straddles them', () => {
    expect(formatWeekRange('2026-09-27')).toBe('Sep 27 – Oct 3, 2026')
  })
  it('renders hours and minutes', () => {
    expect(formatHoursMinutes(0)).toBe('0m')
    expect(formatHoursMinutes(45)).toBe('45m')
    expect(formatHoursMinutes(120)).toBe('2h')
    expect(formatHoursMinutes(137)).toBe('2h 17m')
  })
})

describe('daysBetween', () => {
  it('counts plain days', () => {
    expect(daysBetween('2026-09-20', '2026-09-27')).toBe(7)
  })
  it('counts across a month', () => {
    expect(daysBetween('2026-08-31', '2026-09-01')).toBe(1)
  })
  it('is negative going backwards', () => {
    expect(daysBetween('2026-09-27', '2026-09-20')).toBe(-7)
  })
  it('survives a daylight-saving shift in the host timezone', () => {
    // Counted at midday so a 23- or 25-hour day cannot round to the wrong day.
    expect(daysBetween('2026-03-01', '2026-04-01')).toBe(31)
  })
})
