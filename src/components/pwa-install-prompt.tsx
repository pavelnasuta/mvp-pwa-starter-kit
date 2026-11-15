import { useEffect, useRef, useState } from 'react'
import { Download, Share } from 'lucide-react'

import { Button } from './ui/button'

type DeferredInstallEvent = Event & {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

const DISMISSED_INSTALL_PROMPT_KEY = 'mvp-pwa-install-prompt-dismissed'

function isIos() {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)
}

function isStandalone() {
  return window.matchMedia?.('(display-mode: standalone)').matches || Boolean((navigator as Navigator & { standalone?: boolean }).standalone)
}

function hasDismissedPrompt() {
  try {
    return window.localStorage.getItem(DISMISSED_INSTALL_PROMPT_KEY) === 'true'
  } catch {
    return false
  }
}

function dismissPrompt() {
  try {
    window.localStorage.setItem(DISMISSED_INSTALL_PROMPT_KEY, 'true')
  } catch {
    // The prompt remains functional when browser storage is unavailable.
  }
}

export function PwaInstallPrompt() {
  const [deferredPrompt, setDeferredPrompt] = useState<DeferredInstallEvent | null>(null)
  const [isDismissed, setIsDismissed] = useState(hasDismissedPrompt)
  const [isInstalling, setIsInstalling] = useState(false)
  const isInstallingRef = useRef(false)
  const isInstalledRef = useRef(false)
  const showIosInstructions = !isDismissed && !isStandalone() && isIos()

  useEffect(() => {
    if (isDismissed || isStandalone() || isIos()) return undefined

    const onBeforeInstallPrompt = (event: Event) => {
      event.preventDefault()
      setDeferredPrompt(event as DeferredInstallEvent)
    }
    const onAppInstalled = () => {
      isInstalledRef.current = true
      dismissPrompt()
      setDeferredPrompt(null)
      setIsDismissed(true)
    }

    window.addEventListener('beforeinstallprompt', onBeforeInstallPrompt)
    window.addEventListener('appinstalled', onAppInstalled)
    return () => {
      window.removeEventListener('beforeinstallprompt', onBeforeInstallPrompt)
      window.removeEventListener('appinstalled', onAppInstalled)
    }
  }, [isDismissed])

  const chooseLater = () => {
    dismissPrompt()
    setIsDismissed(true)
  }

  const install = async () => {
    if (!deferredPrompt || isInstallingRef.current) return

    const prompt = deferredPrompt
    isInstallingRef.current = true
    setIsInstalling(true)
    setDeferredPrompt(null)

    try {
      await prompt.prompt()
      await prompt.userChoice
      chooseLater()
    } catch {
      if (isInstalledRef.current) return
      isInstallingRef.current = false
      setIsInstalling(false)
      setDeferredPrompt(prompt)
    }
  }

  const isVisible = !isDismissed && (showIosInstructions || deferredPrompt !== null)
  if (!isVisible) return null

  return (
    <section className="fixed inset-x-4 top-20 z-50 mx-auto max-w-md rounded-lg border bg-background p-4 shadow-lg" role="status" aria-label="Установка приложения">
      <div className="flex gap-3">
        <div className="mt-0.5 rounded-md bg-primary/10 p-2 text-primary"><Download className="h-5 w-5" aria-hidden="true" /></div>
        <div className="min-w-0 flex-1">
          <p className="font-medium">Установить приложение?</p>
          {showIosInstructions ? (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Нажмите <span className="sr-only">Поделиться</span><Share className="mx-0.5 inline h-4 w-4 align-text-bottom" aria-hidden="true" />, затем выберите «На экран «Домой»».</p>
          ) : (
            <p className="mt-1 text-sm leading-6 text-muted-foreground">Откроется быстрее и будет доступно с главного экрана.</p>
          )}
        </div>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        {deferredPrompt ? <Button type="button" onClick={() => void install()} disabled={isInstalling}>Установить</Button> : null}
        <Button type="button" variant="ghost" onClick={chooseLater}>{showIosInstructions ? 'Понятно' : 'Позже'}</Button>
      </div>
    </section>
  )
}
