import { useRef, useState } from 'react'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { useEntries, useImportSnapshot, useMarkExported, useSaveSettings, useSettings } from '../data/queries'
import { buildSnapshot } from '../data/storage'
import { daysBetween, todayISO } from '../lib/week'

const STALE_BACKUP_DAYS = 30

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="mt-4 px-5 py-5">
      <h2 className="text-xl font-semibold text-brand-green">{title}</h2>
      {children}
    </Card>
  )
}

function BackupStatus({ lastExportAt }: { lastExportAt: string | null }) {
  if (!lastExportAt) {
    return (
      <p className="mt-2 text-sm font-semibold text-danger">
        Never backed up. Everything lives on this device only — deleting the app
        from the Home Screen erases it.
      </p>
    )
  }
  const age = daysBetween(lastExportAt, todayISO())
  const stale = age >= STALE_BACKUP_DAYS
  return (
    <p className={`mt-2 text-sm ${stale ? 'font-semibold text-danger' : 'text-ink-soft'}`}>
      Last backup {age === 0 ? 'today' : `${age} day${age === 1 ? '' : 's'} ago`}
      {stale && ' — time for another one.'}
    </p>
  )
}

export function SettingsRoute() {
  const { data: settings } = useSettings()
  const { data: entries = [] } = useEntries()
  const saveSettings = useSaveSettings()
  const markExported = useMarkExported()
  const importSnapshot = useImportSnapshot()

  // `null` means "show the stored goal"; typing fills it, committing clears it.
  const [goalDraft, setGoalDraft] = useState<string | null>(null)
  const [pasted, setPasted] = useState('')
  const [notice, setNotice] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const fileRef = useRef<HTMLInputElement>(null)

  const say = (message: string) => {
    setError(null)
    setNotice(message)
    window.setTimeout(() => setNotice(null), 4000)
  }

  const commitGoal = () => {
    if (goalDraft === null) return
    const goal = Math.round(Number(goalDraft))
    setGoalDraft(null) // an unusable draft snaps back to the stored goal
    if (Number.isFinite(goal) && goal > 0 && goal !== settings?.weeklyGoalMinutes) {
      saveSettings.mutate({ weeklyGoalMinutes: goal })
    }
  }

  const copyJson = async () => {
    const json = JSON.stringify(await buildSnapshot(), null, 2)
    try {
      await navigator.clipboard.writeText(json)
      markExported.mutate()
      say('Copied to the clipboard. Paste it somewhere safe.')
    } catch {
      setError('Could not reach the clipboard — use Download instead.')
    }
  }

  const downloadJson = async () => {
    const json = JSON.stringify(await buildSnapshot(), null, 2)
    const url = URL.createObjectURL(new Blob([json], { type: 'application/json' }))
    const link = document.createElement('a')
    link.href = url
    link.download = `manio-${todayISO()}.json`
    link.click()
    URL.revokeObjectURL(url)
    markExported.mutate()
    say('Saved. On iPhone it lands in Files ▸ Downloads.')
  }

  const runImport = (text: string) => {
    if (
      entries.length > 0 &&
      !window.confirm(
        `This replaces all ${entries.length} entries on this device. Continue?`,
      )
    ) {
      return
    }
    importSnapshot.mutate(text, {
      onSuccess: (result) => {
        setPasted('')
        say(`Imported ${result.entries} entries.`)
      },
      onError: (cause) => {
        setNotice(null)
        setError(cause instanceof Error ? cause.message : 'Import failed.')
      },
    })
  }

  return (
    <>
      <h1 className="mb-1 px-1 text-2xl font-semibold text-brand-green">Settings</h1>

      <Section title="Weekly goal">
        <p className="mt-1 text-sm text-ink-soft">
          Minutes of cardio per week, Sunday through Saturday.
        </p>
        <div className="mt-3 flex items-center gap-2">
          <div className="flex grow items-center rounded-[4px] border border-input-border px-3">
            <input
              value={goalDraft ?? String(settings?.weeklyGoalMinutes ?? '')}
              onChange={(event) => setGoalDraft(event.target.value)}
              onBlur={commitGoal}
              onKeyDown={(event) => {
                if (event.key === 'Enter') event.currentTarget.blur()
              }}
              inputMode="numeric"
              pattern="[0-9]*"
              aria-label="Weekly goal in minutes"
              className="tnum min-h-[44px] w-full bg-transparent text-base font-semibold
                text-ink outline-none"
            />
            <span className="shrink-0 text-sm text-ink-soft">min / week</span>
          </div>
        </div>
      </Section>

      <Section title="Backup">
        <BackupStatus lastExportAt={settings?.lastExportAt ?? null} />
        <div className="mt-3 flex flex-wrap gap-2">
          <Button onClick={copyJson}>Copy JSON</Button>
          <Button variant="outline" onClick={downloadJson}>
            Download file
          </Button>
        </div>
        <p className="mt-3 text-micro text-ink-faint">
          {entries.length} {entries.length === 1 ? 'entry' : 'entries'} stored.
        </p>
      </Section>

      <Section title="Restore">
        <p className="mt-1 text-sm text-ink-soft">
          Importing replaces everything on this device — it is a restore, not a
          merge.
        </p>
        <div className="mt-3 flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => fileRef.current?.click()}>
            Choose file
          </Button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="application/json,.json"
          className="hidden"
          onChange={async (event) => {
            const file = event.target.files?.[0]
            event.target.value = '' // let the same file be picked twice
            if (file) runImport(await file.text())
          }}
        />
        <textarea
          value={pasted}
          onChange={(event) => setPasted(event.target.value)}
          placeholder="…or paste backup JSON here"
          rows={3}
          className="mt-3 w-full rounded-[4px] border border-input-border bg-white p-3
            text-sm text-ink outline-none placeholder:text-ink-faint"
        />
        <Button
          className="mt-2"
          variant="outline"
          disabled={pasted.trim().length === 0}
          onClick={() => runImport(pasted)}
        >
          Import pasted JSON
        </Button>
      </Section>

      {notice && (
        <p className="mt-4 rounded-card bg-light-green px-4 py-3 text-sm text-brand-green">
          {notice}
        </p>
      )}
      {error && (
        <p className="mt-4 rounded-card bg-danger/5 px-4 py-3 text-sm font-semibold text-danger">
          {error}
        </p>
      )}
    </>
  )
}
