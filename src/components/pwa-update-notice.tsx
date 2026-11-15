import { useState } from 'react'
import { useRegisterSW } from 'virtual:pwa-register/react'

import { Button } from './ui/button'

export function PwaUpdateNotice() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    updateServiceWorker,
  } = useRegisterSW()
  const [isUpdating, setIsUpdating] = useState(false)

  if (!needRefresh) return null

  const applyUpdate = async () => {
    setIsUpdating(true)
    try {
      await updateServiceWorker()
    } catch {
      setIsUpdating(false)
    }
  }

  return (
    <section className="fixed inset-x-4 bottom-[calc(5.5rem+env(safe-area-inset-bottom))] z-50 mx-auto max-w-md rounded-lg border bg-background p-4 shadow-lg sm:bottom-6" role="status" aria-label="Доступно обновление приложения">
      <p className="font-medium">Доступна новая версия</p>
      <p className="mt-1 text-sm text-muted-foreground">Обновите приложение, когда закончите текущую задачу.</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" onClick={() => void applyUpdate()} disabled={isUpdating}>
          {isUpdating ? 'Обновляем…' : 'Обновить'}
        </Button>
        <Button type="button" variant="ghost" onClick={() => setNeedRefresh(false)} disabled={isUpdating}>
          Позже
        </Button>
      </div>
    </section>
  )
}
