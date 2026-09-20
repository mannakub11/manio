import { useEffect, useRef, useState } from 'react'
import { Sheet } from './ui/Sheet'
import { Button } from './ui/Button'
import { formatDayLong, type ISODate } from '../lib/week'
import type { Entry } from '../data/types'
import { useAddEntry, useDeleteEntry, useUpdateEntry } from '../data/queries'

function parseMinutes(raw: string): number | null {
  const n = Number(raw.trim())
  if (!Number.isFinite(n) || n <= 0) return null
  return Math.round(n)
}

function EntryRow({ entry }: { entry: Entry }) {
  // `null` means "show whatever is stored". Only a keystroke puts a draft here,
  // and committing clears it, so the field follows the stored value with no
  // effect syncing the two.
  const [draft, setDraft] = useState<string | null>(null)
  const update = useUpdateEntry()
  const remove = useDeleteEntry()

  // Saved as you type. Waiting for a blur loses the edit whenever the sheet is
  // left by backgrounding the app or locking the screen — neither of which
  // fires one on iOS.
  const type = (raw: string) => {
    setDraft(raw)
    const minutes = parseMinutes(raw)
    if (minutes !== null && minutes !== entry.minutes) {
      update.mutate({ id: entry.id, minutes })
    }
  }

  // Releasing the draft snaps the field back to whatever actually got stored,
  // which also undoes an unparseable entry like "" or "0".
  const release = () => setDraft(null)

  return (
    <li className="flex items-center gap-2">
      <div className="flex grow items-center rounded-[4px] border border-input-border bg-white px-3">
        <input
          value={draft ?? String(entry.minutes)}
          onChange={(event) => type(event.target.value)}
          onBlur={release}
          onKeyDown={(event) => {
            if (event.key === 'Enter') event.currentTarget.blur()
          }}
          inputMode="numeric"
          pattern="[0-9]*"
          aria-label="Minutes"
          className="tnum min-h-[44px] w-full bg-transparent text-base font-semibold
            text-ink outline-none"
        />
        <span className="shrink-0 text-sm text-ink-soft">min</span>
      </div>
      <button
        type="button"
        onClick={() => remove.mutate(entry.id)}
        aria-label={`Delete ${entry.minutes} minute entry`}
        className="tap flex h-11 w-11 shrink-0 items-center justify-center rounded-full
          border border-input-border text-ink-soft active:text-danger"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
          <path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3" />
        </svg>
      </button>
    </li>
  )
}

/** Remounted per day by its key, so the add field starts empty every time. */
function DayForm({ date, entries }: { date: ISODate; entries: Entry[] }) {
  const [draft, setDraft] = useState('')
  const add = useAddEntry()
  const inputRef = useRef<HTMLInputElement>(null)

  const total = entries.reduce((sum, entry) => sum + entry.minutes, 0)
  const empty = entries.length === 0

  useEffect(() => {
    // Fast path: an untouched day opens straight onto the number pad, so
    // logging is tap-type-enter. Focus is a DOM concern, hence an effect.
    if (!empty) return
    const id = window.setTimeout(() => inputRef.current?.focus(), 120)
    return () => window.clearTimeout(id)
  }, [empty])

  const submit = () => {
    const minutes = parseMinutes(draft)
    if (minutes === null) return
    add.mutate({ date, minutes })
    setDraft('')
    inputRef.current?.focus()
  }

  return (
    <>
      <p className="tnum -mt-2 mb-4 text-sm text-ink-soft">
        {total > 0 ? `${total} min total` : 'Nothing logged yet'}
      </p>

      {entries.length > 0 && (
        <ul className="mb-4 flex flex-col gap-2">
          {entries.map((entry) => (
            <EntryRow key={entry.id} entry={entry} />
          ))}
        </ul>
      )}

      <form
        className="flex items-center gap-2 pb-2"
        onSubmit={(event) => {
          event.preventDefault()
          submit()
        }}
      >
        <div className="flex grow items-center rounded-[4px] border border-input-border bg-white px-3">
          <input
            ref={inputRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            inputMode="numeric"
            pattern="[0-9]*"
            placeholder="Add minutes"
            aria-label="Minutes to add"
            className="tnum min-h-[44px] w-full bg-transparent text-base text-ink
              outline-none placeholder:font-normal placeholder:text-ink-faint"
          />
          <span className="shrink-0 text-sm text-ink-soft">min</span>
        </div>
        <Button type="submit" disabled={parseMinutes(draft) === null}>
          Add
        </Button>
      </form>
    </>
  )
}

export function DaySheet({
  date,
  entries,
  onClose,
}: {
  date: ISODate | null
  entries: Entry[]
  onClose: () => void
}) {
  // Hold on to the last opened day so the sheet keeps its title and list while
  // it slides back down instead of blanking mid-animation.
  const [shown, setShown] = useState<ISODate | null>(null)
  if (date !== null && date !== shown) setShown(date)

  return (
    <Sheet
      open={date !== null}
      onClose={onClose}
      title={shown ? formatDayLong(shown) : ''}
    >
      {shown && <DayForm key={shown} date={shown} entries={entries} />}
    </Sheet>
  )
}
