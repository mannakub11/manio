import { useMemo } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { BarRow } from '../components/BarRow'
import { PeriodNav } from '../components/PeriodNav'
import { Card } from '../components/ui/Card'
import { useEntries, useSettings } from '../data/queries'
import { monthTotals, sum } from '../data/totals'
import {
  addMonths,
  dayNumber,
  formatHoursMinutes,
  formatMonthLabel,
  monthAbbr,
  monthKey,
  todayISO,
  weekEnd,
} from '../lib/week'

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="grow text-center">
      <p className="tnum text-2xl font-semibold text-ink">{value}</p>
      <p className="text-micro text-ink-soft">{label}</p>
    </div>
  )
}

export function MonthRoute() {
  const { month: param } = useParams()
  const navigate = useNavigate()
  const thisMonth = monthKey(todayISO())
  const month = param ?? thisMonth

  const { data: entries = [] } = useEntries()
  const { data: settings } = useSettings()
  const goal = settings?.weeklyGoalMinutes ?? 200

  const weeks = useMemo(() => monthTotals(entries, month), [entries, month])
  const total = sum(weeks)
  const onTarget = weeks.filter((w) => w.minutes >= goal).length
  const average = weeks.length > 0 ? Math.round(total / weeks.length) : 0
  const max = Math.max(...weeks.map((w) => w.minutes), goal)

  return (
    <>
      <PeriodNav
        label={formatMonthLabel(month)}
        onPrev={() => navigate(`/month/${addMonths(month, -1)}`)}
        onNext={() => navigate(`/month/${addMonths(month, 1)}`)}
        onToday={() => navigate(`/month/${thisMonth}`)}
        todayLabel="Back to this month"
        atToday={month === thisMonth}
      />

      <Card className="flex items-stretch divide-x divide-hairline px-2 py-4">
        <Stat value={formatHoursMinutes(total)} label="total" />
        <Stat value={`${average}`} label="avg / week" />
        <Stat value={`${onTarget}/${weeks.length}`} label="weeks on target" />
      </Card>

      <Card className="mt-4 px-4 py-3">
        {weeks.map((week) => {
          const end = weekEnd(week.sunday)
          // Spell the month out only when the week spills into the next one,
          // so "27 / –Oct 3" cannot be misread as "27 to the 3rd of September".
          const crosses = monthKey(end) !== monthKey(week.sunday)
          return (
          <BarRow
            key={week.sunday}
            label={dayNumber(week.sunday)}
            sublabel={crosses ? `–${monthAbbr(end)} ${dayNumber(end)}` : `–${dayNumber(end)}`}
            minutes={week.minutes}
            max={max}
            goal={goal}
            onClick={() => navigate(`/week/${week.sunday}`)}
          />
          )
        })}
      </Card>

      <p className="mt-3 px-1 text-micro text-ink-faint">
        A week belongs to the month its Sunday falls in, so weeks are never split
        in half. The thin line marks the {goal} min goal.
      </p>
    </>
  )
}
