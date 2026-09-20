import type { ReactNode } from 'react'

export function Card({
  children,
  className = '',
  tone = 'light',
}: {
  children: ReactNode
  className?: string
  tone?: 'light' | 'dark'
}) {
  const surface =
    tone === 'dark' ? 'bg-house-green text-on-dark' : 'bg-surface text-ink'
  return (
    <section className={`rounded-card shadow-card ${surface} ${className}`}>
      {children}
    </section>
  )
}
