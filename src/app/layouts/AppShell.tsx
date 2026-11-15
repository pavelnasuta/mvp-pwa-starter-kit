import { House, Layers3, Lightbulb, PanelsTopLeft } from 'lucide-react'
import { type ReactNode } from 'react'

import { ThemeToggle } from '../../components/theme-toggle'
import { appRoutes, type RouteName } from '../routes'

const routeIcons = {
  home: House,
  ideas: Lightbulb,
  gallery: PanelsTopLeft,
}

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
          <a href="#home" onClick={() => onNavigate('home')} className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-md px-2 text-left font-semibold hover:bg-muted" aria-label="MVP PWA Starter, перейти на главную">
            <Layers3 className="h-5 w-5 text-primary" aria-hidden="true" />
            <span className="hidden sm:inline">MVP PWA Starter</span>
          </a>
          <ThemeToggle />
        </div>
        <nav className="mx-auto hidden max-w-6xl gap-1 overflow-x-auto px-4 pb-2 sm:flex sm:px-6" aria-label="Основная навигация">
          {appRoutes.map((route) => (
            <a key={route.name} href={`#${route.name}`} onClick={() => onNavigate(route.name)} aria-current={activeRoute === route.name ? 'page' : undefined} className={`inline-flex min-h-11 shrink-0 items-center rounded-md px-4 text-sm font-medium transition-colors ${activeRoute === route.name ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
              {route.label}
            </a>
          ))}
        </nav>
      </header>
      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 pb-[calc(6rem+env(safe-area-inset-bottom))] sm:px-6 sm:py-8">{children}</main>
      <footer className="hidden border-t px-4 py-4 text-center text-sm text-muted-foreground sm:block sm:px-6">Локальный MVP без сервера и трекинга.</footer>
      <nav className="fixed inset-x-0 bottom-0 z-50 border-t bg-background/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-8px_24px_rgb(0_0_0_/_0.06)] backdrop-blur sm:hidden" aria-label="Мобильная навигация">
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1">
          {appRoutes.map((route) => {
            const Icon = routeIcons[route.name]
            const isActive = activeRoute === route.name

            return (
              <a key={route.name} href={`#${route.name}`} onClick={() => onNavigate(route.name)} aria-current={isActive ? 'page' : undefined} className={`flex min-h-12 flex-col items-center justify-center gap-1 rounded-md px-2 py-1 text-xs font-medium transition-colors ${isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted hover:text-foreground'}`}>
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span>{route.label}</span>
              </a>
            )
          })}
        </div>
      </nav>
    </div>
  )
}
