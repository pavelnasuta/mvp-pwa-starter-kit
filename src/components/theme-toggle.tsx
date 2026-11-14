import { Monitor, Moon, Sun } from 'lucide-react'

import { usePreferencesStore, type ThemePreference } from '../stores/preferences-store'

const options: { value: ThemePreference; label: string; Icon: typeof Sun }[] = [
  { value: 'system', label: 'Системная', Icon: Monitor },
  { value: 'light', label: 'Светлая', Icon: Sun },
  { value: 'dark', label: 'Тёмная', Icon: Moon },
]

export function ThemeToggle() {
  const theme = usePreferencesStore((state) => state.theme)
  const setTheme = usePreferencesStore((state) => state.setTheme)
  const current = options.find((option) => option.value === theme) ?? options[0]
  const Icon = current.Icon

  return (
    <label className="inline-flex min-h-11 items-center gap-2 rounded-md border bg-background px-3 text-sm font-medium">
      <Icon className="h-4 w-4" aria-hidden="true" />
      <span className="sr-only sm:not-sr-only">Тема</span>
      <select aria-label="Тема оформления" value={theme} onChange={(event) => setTheme(event.target.value as ThemePreference)} className="min-h-9 bg-transparent text-sm outline-none">
        {options.map(({ value, label }) => <option key={value} value={value}>{label}</option>)}
      </select>
    </label>
  )
}
