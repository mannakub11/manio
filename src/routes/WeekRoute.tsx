import { useMemo, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { GoalBar } from '../components/GoalBar'
import { BarRow } from '../components/BarRow'
import { PeriodNav } from '../components/PeriodNav'
import { DaySheet } from '../components/DaySheet'
import { FrapButton } from '../components/FrapButton'
import { Card } from '../components/ui/Card'
import { useEntries, useSettings } from '../data/queries'
import { entriesOn, sum, weekTotals } from '../data/totals'
import {
  addDays,
  dayName,
  dayNumber,
  formatWeekRange,
  todayISO,
  weekStart,
  type ISODate,
} from '../lib/week'

export function WeekRoute() {
  const { sunday: param } = useParams()
  const navigate = useNavigate()
  const today = todayISO()
  const thisWeek = weekStart(today)
  const sunday: ISODate = param ?? thisWeek

  const [openDay, setOpenDay] = useState<ISODate | null>(null)

  const { data: entries = [] } = useEntries()
  const { data: settings } = useSettings()
  const goal = settings?.weeklyGoalMinutes ?? 200

  const days = useMemo(() => weekTotals(entries, sunday), [entries, sunday])
  const total = sum(days)
  // Nothing is a target per day, so bars scale against the busiest day — with
  // an even split of the weekly goal as a floor so a quiet week reads as quiet.
  const max = Math.max(...days.map((d) => d.minutes), Math.ceil(goal / 7))

  const openToday = () => {
    if (sunday !== thisWeek) navigate(`/week/${thisWeek}`)
    setOpenDay(today)
  }

  return (
    <>
      <PeriodNav
        label={formatWeekRange(sunday)}
        onPrev={() => navigate(`/week/${addDays(sunday, -7)}`)}
        onNext={() => navigate(`/week/${addDays(sunday, 7)}`)}
        onToday={() => navigate(`/week/${thisWeek}`)}
        todayLabel="Back to this week"
        atToday={sunday === thisWeek}
      />

      <GoalBar
        minutes={total}
        goal={goal}
        caption={sunday === thisWeek ? 'This week' : 'Week of ' + formatWeekRange(sunday)}
      />

      <Card className="mt-4 px-4 py-3">
        {days.map((day) => (
          <BarRow
            key={day.date}
            label={dayName(day.date)}
            sublabel={dayNumber(day.date)}
            minutes={day.minutes}
            max={max}
            emphasis={day.date === today}
            onClick={() => setOpenDay(day.date)}
          />
        ))}
      </Card>

      <p className="mt-3 px-1 text-micro text-ink-faint">
        Tap any day to log or edit. Weeks run Sunday to Saturday.
      </p>

      <FrapButton onClick={openToday} />

      <DaySheet
        date={openDay}
        entries={openDay ? entriesOn(entries, openDay) : []}
        onClose={() => setOpenDay(null)}
      />
    </>
  )
}
