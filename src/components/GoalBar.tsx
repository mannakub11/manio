import { formatHoursMinutes } from '../lib/week'

/** The headline panel: minutes so far this period against the weekly goal. */
export function GoalBar({
  minutes,
  goal,
  caption,
}: {
  minutes: number
  goal: number
  caption: string
}) {
  const pct = goal > 0 ? Math.min(100, (minutes / goal) * 100) : 0
  const remaining = Math.max(0, goal - minutes)
  const hit = minutes >= goal

  return (
    <div className="rounded-card bg-house-green px-5 py-5 text-on-dark shadow-card">
      <p className="text-sm text-on-dark-soft">{caption}</p>

      <p className="mt-1 flex items-baseline gap-2">
        <span className="tnum text-5xl font-semibold leading-none">{minutes}</span>
        <span className="text-base text-on-dark-soft">/ {goal} min</span>
      </p>

      <div className="mt-4 h-2 overflow-hidden rounded-pill bg-white/20">
        <div
          className="h-full rounded-pill bg-white transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>

      <p className="mt-2 text-sm text-on-dark-soft">
        {hit ? (
          <span className="font-semibold text-white">
            Goal reached — {formatHoursMinutes(minutes)} logged
          </span>
        ) : (
          <>
            {remaining} min to go · {formatHoursMinutes(minutes)} so far
          </>
        )}
      </p>
    </div>
  )
}
