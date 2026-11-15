import { useEffect, useState } from 'react'
import { Toaster } from 'sonner'

import { PwaInstallPrompt } from '../components/pwa-install-prompt'
import { PwaUpdateNotice } from '../components/pwa-update-notice'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../components/ui/card'
import { GalleryPage } from '../features/gallery/GalleryPage'
import { IdeasPage } from '../features/ideas/IdeasPage'
import { usePreferencesStore } from '../stores/preferences-store'
import { AppShell } from './layouts/AppShell'
import { appRoutes, type RouteName } from './routes'

function routeFromHash(): RouteName {
  const route = window.location.hash.slice(1)
  return appRoutes.find((candidate) => candidate.name === route)?.name ?? 'home'
}

function useAppliedTheme() {
  const theme = usePreferencesStore((state) => state.theme)

  useEffect(() => {
    const media = window.matchMedia?.('(prefers-color-scheme: dark)')
    const applyTheme = () => {
      const isDark = theme === 'dark' || (theme === 'system' && media?.matches)
      document.documentElement.classList.toggle('dark', Boolean(isDark))
      document.documentElement.dataset.theme = theme
      document.querySelector('meta[name="theme-color"]')?.setAttribute('content', isDark ? '#0f172a' : '#f8fafc')
    }

    applyTheme()
    if (theme !== 'system' || !media) return undefined

    media.addEventListener?.('change', applyTheme)
    return () => media.removeEventListener?.('change', applyTheme)
  }, [theme])
}

function OfflineStatus() {
  const [isOnline, setIsOnline] = useState(() => navigator.onLine)

  useEffect(() => {
    const updateStatus = () => setIsOnline(navigator.onLine)

    window.addEventListener('online', updateStatus)
    window.addEventListener('offline', updateStatus)
    return () => {
      window.removeEventListener('online', updateStatus)
      window.removeEventListener('offline', updateStatus)
    }
  }, [])

  if (isOnline) return null

  return (
    <p className="border-b border-amber-500/40 bg-amber-500/10 px-4 py-2 text-center text-sm text-foreground" role="status" aria-label="Подключение к интернету">
      Нет подключения к интернету. Данные доступны на этом устройстве.
    </p>
  )
}

function HomePage() {
  return (
    <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
      <div className="space-y-4">
        <p className="text-sm font-medium text-primary">Стартовая основа</p>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">Собирайте проверяемые MVP быстрее.</h1>
        <p className="max-w-xl text-base leading-7 text-muted-foreground">Мобильная оболочка, локальное хранение и доступные компоненты уже готовы к следующему продуктному экрану.</p>
      </div>
      <Card>
        <CardHeader><CardTitle>Что уже есть</CardTitle><CardDescription>Без сервера, ключей и внешнего трекинга.</CardDescription></CardHeader>
        <CardContent><ul className="space-y-2 text-sm text-muted-foreground"><li>• Светлая, тёмная и системная темы</li><li>• Адаптивная клавиатурная навигация</li><li>• Компоненты для форм, диалогов и статусов</li></ul></CardContent>
      </Card>
    </section>
  )
}

export function App() {
  const [activeRoute, setActiveRoute] = useState<RouteName>(routeFromHash)
  useAppliedTheme()

  useEffect(() => {
    const syncRoute = () => setActiveRoute(routeFromHash())
    window.addEventListener('hashchange', syncRoute)
    return () => window.removeEventListener('hashchange', syncRoute)
  }, [])

  const navigate = (route: RouteName) => {
    window.location.hash = route
    setActiveRoute(route)
  }

  const page = activeRoute === 'gallery' ? <GalleryPage /> : activeRoute === 'ideas' ? <IdeasPage /> : <HomePage />

  return <><OfflineStatus /><PwaInstallPrompt /><AppShell activeRoute={activeRoute} onNavigate={navigate}>{page}</AppShell><PwaUpdateNotice /><Toaster richColors position="top-center" closeButton /></>
}
