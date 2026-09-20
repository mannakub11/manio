/**
 * TanStack Query sits on top of the local repository so the day a backend
 * appears, only `storage.ts` changes — the hooks and every component stay put.
 *
 * The whole dataset is a few hundred rows, so we load it once and aggregate in
 * memory rather than querying per week.
 */

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import * as storage from './storage'
import type { Settings } from './types'

export const keys = {
  entries: ['entries'] as const,
  settings: ['settings'] as const,
}

export function useEntries() {
  return useQuery({ queryKey: keys.entries, queryFn: storage.getEntries })
}

export function useSettings() {
  return useQuery({ queryKey: keys.settings, queryFn: storage.getSettings })
}

export function useAddEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ date, minutes }: { date: string; minutes: number }) =>
      storage.addEntry(date, minutes),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.entries }),
  })
}

export function useUpdateEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: ({ id, minutes }: { id: string; minutes: number }) =>
      storage.updateEntry(id, minutes),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.entries }),
  })
}

export function useDeleteEntry() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (id: string) => storage.deleteEntry(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.entries }),
  })
}

export function useSaveSettings() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (patch: Partial<Settings>) => storage.saveSettings(patch),
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.settings }),
  })
}

export function useImportSnapshot() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: (text: string) => storage.importSnapshot(text),
    onSuccess: () => qc.invalidateQueries(),
  })
}

export function useMarkExported() {
  const qc = useQueryClient()
  return useMutation({
    mutationFn: storage.markExported,
    onSuccess: () => qc.invalidateQueries({ queryKey: keys.settings }),
  })
}
