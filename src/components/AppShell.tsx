import { NavLink, type To } from 'react-router-dom'
import type { ReactNode } from 'react'

function NavIcon({ to, label, children }: { to: To; label: string; children: ReactNode }) {
  return (
    <NavLink
      to={to}
      aria-label={label}
      className={({ isActive }) =>
        `tap flex h-11 w-11 items-center justify-center rounded-full ${
          isActive ? 'bg-light-green text-brand-green' : 'text-ink-soft'
        }`
      }
    >
      {children}
    </NavLink>
  )
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-dvh bg-canvas">
      <header
        className="sticky top-0 z-10 bg-canvas/95 shadow-nav backdrop-blur
          pt-[env(safe-area-inset-top)]"
      >
        <div className="mx-auto flex h-16 max-w-lg items-center justify-between px-4">
          <NavLink to="/" className="text-xl font-semibold text-brand-green">
            manio
          </NavLink>
          <nav className="flex items-center gap-1">
            <NavIcon to="/month" label="Monthly summary">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <rect x="3" y="5" width="18" height="16" rx="2" />
                <path d="M3 10h18M8 3v4M16 3v4" />
              </svg>
            </NavIcon>
            <NavIcon to="/settings" label="Settings">
              <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 8.9 19a1.7 1.7 0 0 0-1.9.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.9 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 5 8.9a1.7 1.7 0 0 0-.3-1.9l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.9.3H9.5a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.9v.1a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z" />
              </svg>
            </NavIcon>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-lg px-4 pb-28 pt-4">{children}</main>
    </div>
  )
}
