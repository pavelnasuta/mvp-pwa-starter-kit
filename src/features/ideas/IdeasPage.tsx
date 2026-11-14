import { Download, Plus, RotateCcw, Upload } from 'lucide-react'
import { useEffect, useMemo, useRef, useState, type ChangeEvent } from 'react'
import { toast } from 'sonner'

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '../../components/ui/alert-dialog'
import { Button } from '../../components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '../../components/ui/dialog'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { parseImportPayload, serializeExportPayload } from '../../lib/export-import'
import { useIdeasStore } from '../../stores/ideas-store'
import { IDEA_STATUSES, type Idea, type IdeaDraft, type IdeaStatus, type ImportPayload } from '../../types/idea'
import { IdeaForm } from './IdeaForm'
import { IdeaList } from './IdeaList'

const filterLabels: Record<'all' | IdeaStatus, string> = {
  all: 'Все статусы',
  draft: 'Черновик',
  active: 'В работе',
  done: 'Готово',
}

const storageMessages = {
  unsaved: 'Изменения сохранены только в памяти: хранилище браузера недоступно.',
  recovered: 'Повреждённые локальные данные были пропущены. Новые изменения можно сохранить.',
} as const

function matchesQuery(idea: Idea, query: string) {
  if (!query) return true

  const haystack = [idea.title, idea.description, ...idea.tags].join(' ').toLocaleLowerCase()
  return haystack.includes(query.toLocaleLowerCase())
}

export function IdeasPage() {
  const ideas = useIdeasStore((state) => state.ideas)
  const storageStatus = useIdeasStore((state) => state.storageStatus)
  const create = useIdeasStore((state) => state.create)
  const update = useIdeasStore((state) => state.update)
  const remove = useIdeasStore((state) => state.remove)
  const replaceFromImport = useIdeasStore((state) => state.replaceFromImport)
  const reset = useIdeasStore((state) => state.reset)
  const hydrate = useIdeasStore((state) => state.hydrate)
  const importInputRef = useRef<HTMLInputElement>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState<'all' | IdeaStatus>('all')
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingIdea, setEditingIdea] = useState<Idea>()
  const [ideaToDelete, setIdeaToDelete] = useState<Idea>()
  const [pendingImport, setPendingImport] = useState<ImportPayload>()
  const [isResetOpen, setIsResetOpen] = useState(false)

  useEffect(() => {
    hydrate()
  }, [hydrate])

  const filteredIdeas = useMemo(
    () => ideas.filter((idea) => (status === 'all' || idea.status === status) && matchesQuery(idea, query.trim())),
    [ideas, query, status],
  )

  const closeForm = () => {
    setIsFormOpen(false)
    setEditingIdea(undefined)
  }

  const saveIdea = (draft: IdeaDraft) => {
    if (editingIdea) {
      update(editingIdea.id, draft)
    } else {
      create(draft)
    }
    closeForm()
  }

  const openEditForm = (idea: Idea) => {
    setEditingIdea(idea)
    setIsFormOpen(true)
  }

  const exportIdeas = () => {
    const blob = new Blob([serializeExportPayload(ideas)], { type: 'application/json' })
    const objectUrl = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = objectUrl
    link.download = 'ideas-export.json'
    link.click()
    URL.revokeObjectURL(objectUrl)
  }

  const importIdeas = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    event.target.value = ''

    if (!file || !file.name.toLocaleLowerCase().endsWith('.json')) {
      toast.error('Не удалось импортировать файл')
      return
    }

    try {
      const payload = parseImportPayload(await file.text())
      setPendingImport(payload)
    } catch {
      toast.error('Не удалось импортировать файл')
    }
  }

  return (
    <section className="space-y-6" aria-labelledby="ideas-title">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-primary">Пример локальных данных</p>
          <h1 id="ideas-title" className="text-3xl font-bold tracking-tight">Идеи</h1>
          <p className="max-w-2xl text-muted-foreground">Создавайте, ищите и переносите идеи без сервера: записи сохраняются только в браузере.</p>
        </div>
        <Button type="button" onClick={() => { setEditingIdea(undefined); setIsFormOpen(true) }}><Plus className="h-4 w-4" aria-hidden="true" />Новая идея</Button>
      </div>

      {storageStatus !== 'ready' && (
        <p className="rounded-md border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-foreground" role="status" aria-label="Состояние хранения">
          {storageMessages[storageStatus]}
        </p>
      )}

      <div className="grid gap-3 rounded-lg border bg-card p-4 sm:grid-cols-[1fr_13rem]">
        <div className="grid gap-2">
          <Label htmlFor="idea-search">Поиск идей</Label>
          <Input id="idea-search" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Название, описание или тег" />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="idea-filter-status">Статус</Label>
          <select id="idea-filter-status" className="h-11 w-full rounded-md border bg-background px-3 text-sm shadow-sm" value={status} onChange={(event) => setStatus(event.target.value as 'all' | IdeaStatus)}>
            <option value="all">{filterLabels.all}</option>
            {IDEA_STATUSES.map((ideaStatus) => <option key={ideaStatus} value={ideaStatus}>{filterLabels[ideaStatus]}</option>)}
          </select>
        </div>
      </div>

      <IdeaList
        ideas={filteredIdeas}
        emptyMessage={ideas.length === 0 ? 'Идей пока нет' : 'Подходящих идей нет'}
        onEdit={openEditForm}
        onDelete={setIdeaToDelete}
      />

      <div className="flex flex-col gap-3 border-t pt-6 sm:flex-row sm:flex-wrap">
        <Button type="button" variant="outline" onClick={exportIdeas}><Download className="h-4 w-4" aria-hidden="true" />Экспортировать JSON</Button>
        <Button type="button" variant="outline" onClick={() => importInputRef.current?.click()}><Upload className="h-4 w-4" aria-hidden="true" />Импортировать JSON</Button>
        <input ref={importInputRef} className="sr-only" type="file" accept=".json,application/json" aria-label="Импортировать JSON" onChange={importIdeas} />
        <Button type="button" variant="destructive" onClick={() => setIsResetOpen(true)}><RotateCcw className="h-4 w-4" aria-hidden="true" />Сбросить данные</Button>
      </div>

      <Dialog open={isFormOpen} onOpenChange={(open) => { if (!open) closeForm(); else setIsFormOpen(true) }}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingIdea ? 'Изменить идею' : 'Новая идея'}</DialogTitle><DialogDescription>Все изменения хранятся локально в этом браузере.</DialogDescription></DialogHeader>
          <IdeaForm key={editingIdea?.id ?? 'new'} initialValue={editingIdea} onSubmit={saveIdea} onCancel={closeForm} />
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(ideaToDelete)} onOpenChange={(open) => { if (!open) setIdeaToDelete(undefined) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Удалить идею?</AlertDialogTitle><AlertDialogDescription>Идея «{ideaToDelete?.title}» будет удалена с этого устройства.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { if (ideaToDelete) remove(ideaToDelete.id); setIdeaToDelete(undefined) }}>Удалить идею</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={Boolean(pendingImport)} onOpenChange={(open) => { if (!open) setPendingImport(undefined) }}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Заменить текущие идеи?</AlertDialogTitle><AlertDialogDescription>Импорт заменит все текущие идеи данными из выбранного файла.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { if (pendingImport) replaceFromImport(pendingImport); setPendingImport(undefined) }}>Заменить идеи</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isResetOpen} onOpenChange={setIsResetOpen}>
        <AlertDialogContent>
          <AlertDialogHeader><AlertDialogTitle>Сбросить все данные?</AlertDialogTitle><AlertDialogDescription>Все идеи будут удалены только с этого устройства. Это действие нельзя отменить.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter><AlertDialogCancel>Отмена</AlertDialogCancel><AlertDialogAction onClick={() => { reset(); setIsResetOpen(false) }}>Сбросить данные</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  )
}
