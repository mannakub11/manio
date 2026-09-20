/**
 * DESIGN.md's signature elevation element, reused here as "log today".
 * It always means today, whichever week is on screen.
 */
export function FrapButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label="Log today"
      className="fixed bottom-[max(1.5rem,env(safe-area-inset-bottom))] right-5 z-10
        flex h-14 w-14 items-center justify-center rounded-full bg-accent-green
        text-white shadow-frap transition-all duration-200 active:scale-95
        active:shadow-frap-active"
    >
      <svg viewBox="0 0 24 24" className="h-7 w-7" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
        <path d="M12 5v14M5 12h14" />
      </svg>
    </button>
  )
}
