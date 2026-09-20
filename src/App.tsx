import { Navigate, Route, Routes } from 'react-router-dom'
import { AppShell } from './components/AppShell'
import { WeekRoute } from './routes/WeekRoute'
import { MonthRoute } from './routes/MonthRoute'
import { SettingsRoute } from './routes/SettingsRoute'

export function App() {
  return (
    <AppShell>
      <Routes>
        {/* No :sunday means "this week"; the stepper then writes the URL. */}
        <Route path="/" element={<WeekRoute />} />
        <Route path="/week/:sunday" element={<WeekRoute />} />
        <Route path="/month" element={<MonthRoute />} />
        <Route path="/month/:month" element={<MonthRoute />} />
        <Route path="/settings" element={<SettingsRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AppShell>
  )
}
