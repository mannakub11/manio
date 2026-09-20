/** The ‹ › stepper shared by the week and month screens. */
export function PeriodNav({
  label,
  onPrev,
  onNext,
  onToday,
  todayLabel,
  atToday,
}: {
  label: string
  onPrev: () => void
  onNext: () => void
  onToday: () => void
  todayLabel: string
  atToday: boolean
}) {
  return (
    <div className="mb-4 flex items-center justify-between gap-2">
      <button
        type="button"
        onClick={onPrev}
        aria-label="Previous"
        className="tap flex h-11 w-11 shrink-0 items-center justify-center rounded-full
          text-accent-green active:bg-ceramic"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 5l-7 7 7 7" />
        </svg>
      </button>

      <div className="min-w-0 text-center">
        <p className="truncate text-base font-semibold text-ink">{label}</p>
        {!atToday && (
          <button
            type="button"
            onClick={onToday}
            className="tap text-micro font-semibold text-accent-green"
          >
            {todayLabel}
          </button>
        )}
      </div>

      <button
        type="button"
        onClick={onNext}
        aria-label="Next"
        className="tap flex h-11 w-11 shrink-0 items-center justify-center rounded-full
          text-accent-green active:bg-ceramic"
      >
        <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  )
}
