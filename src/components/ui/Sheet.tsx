import { useEffect, useRef, type ReactNode } from 'react'

/**
 * Bottom sheet built on <dialog> so focus trapping, Esc and the top layer come
 * from the platform rather than from hand-written listeners.
 */
export function Sheet({
  open,
  onClose,
  title,
  children,
}: {
  open: boolean
  onClose: () => void
  title: string
  children: ReactNode
}) {
  const ref = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = ref.current
    if (!dialog) return
    if (open && !dialog.open) dialog.showModal()
    if (!open && dialog.open) dialog.close()
  }, [open])

  return (
    <dialog
      ref={ref}
      onClose={onClose}
      onClick={(event) => {
        // Clicking the backdrop lands on the dialog element itself.
        if (event.target === ref.current) onClose()
      }}
      className="sheet m-0 mt-auto w-full max-w-lg border-0 bg-transparent p-0
        backdrop:bg-black/40 sm:mx-auto sm:mb-6"
    >
      <div className="safe-bottom rounded-t-[20px] bg-surface px-4 pt-3 sm:rounded-[20px]">
        <div className="mx-auto mb-4 h-1 w-10 rounded-pill bg-ink-faint" aria-hidden />
        <div className="mb-4 flex items-baseline justify-between gap-3">
          <h2 className="text-xl font-semibold text-brand-green">{title}</h2>
          <button
            type="button"
            onClick={onClose}
            className="tap -mr-2 min-h-[44px] px-2 text-sm font-semibold text-accent-green"
          >
            Done
          </button>
        </div>
        {children}
      </div>
    </dialog>
  )
}
