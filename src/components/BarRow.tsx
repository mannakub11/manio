/**
 * One horizontal bar. Both the week screen (a row per day) and the month
 * screen (a row per week) are built from this, which is why the app carries no
 * charting library: a bar is a div with a width.
 */
export function BarRow({
  label,
  sublabel,
  minutes,
  max,
  goal,
  emphasis = false,
  onClick,
}: {
  label: string
  sublabel?: string
  minutes: number
  /** Value that fills the track completely. */
  max: number
  /** Draws a target marker on the track when set. */
  goal?: number
  emphasis?: boolean
  onClick?: () => void
}) {
  const pct = max > 0 ? Math.min(100, (minutes / max) * 100) : 0
  const goalPct = goal && max > 0 ? Math.min(100, (goal / max) * 100) : null
  const hitGoal = goal != null && minutes >= goal

  const content = (
    <>
      <div className="w-14 shrink-0 text-left">
        <div
          className={`text-sm ${emphasis ? 'font-semibold text-brand-green' : 'text-ink-soft'}`}
        >
          {label}
        </div>
        {sublabel && <div className="tnum text-micro text-ink-faint">{sublabel}</div>}
      </div>

      <div className="relative h-8 grow overflow-hidden rounded-pill bg-ceramic">
        <div
          className={`h-full rounded-pill transition-[width] duration-300 ${
            hitGoal ? 'bg-house-green' : 'bg-accent-green'
          }`}
          style={{ width: `${pct}%` }}
        />
        {goalPct != null && (
          <div
            className="absolute inset-y-1 w-px bg-ink-faint"
            style={{ left: `${goalPct}%` }}
            aria-hidden
          />
        )}
      </div>

      <div
        className={`tnum w-16 shrink-0 text-right text-sm ${
          minutes > 0 ? 'font-semibold text-ink' : 'text-ink-faint'
        }`}
      >
        {minutes > 0 ? `${minutes} min` : '–'}
      </div>
    </>
  )

  if (!onClick) {
    return <div className="flex items-center gap-3 py-1.5">{content}</div>
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className="tap flex w-full items-center gap-3 rounded-card py-1.5 text-left
        active:bg-canvas"
    >
      {content}
    </button>
  )
}
