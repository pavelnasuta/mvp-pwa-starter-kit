import { Layers3 } from 'lucide-react'
import { type ReactNode } from 'react'

import { ThemeToggle } from '../../components/theme-toggle'
import { appRoutes, type RouteName } from '../routes'

type AppShellProps = {
  activeRoute: RouteName
  onNavigate: (route: RouteName) => void
  children: ReactNode
}

export function AppShell({ activeRoute, onNavigate, children }: AppShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b bg-background/95">
        <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between gap-3 px-4 py-2 sm:px-6">
          <button type="button" onClick={() => onNavigate('home')} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-left font-semibold hover:bg-muted" aria-label="MVP PWA Starter, перейти на главную">
            <Layers3 className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">MVP PWA Starter</span>
          </button>
          <ThemeToggle />
        </div>
        <nav className="mx-auto flex max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:px-6" aria-label="Основная навигация">
          {appRoutes.map((route) => (
            <button key={route.name} type="button" onClick={() => onNavigate(route.name)} aria-current={activeRoute === route.name ? 'page' : undefined} className={`min-h-11 shrink-0 rounded-md px-4 text-sm font-medium transition-colors ${activeRoute === route.name ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              {route.label}
            </button>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <footer className="border-t px-4 py-4 text-center text-sm text-muted-foreground sm:px-6">Локальный MVP без сервера и трекинга.</footer>
    </div>
  )
}
