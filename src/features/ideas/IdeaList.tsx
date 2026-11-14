import { Pencil, Trash2 } from 'lucide-react'

import { Badge } from '../../components/ui/badge'
import { Button } from '../../components/ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '../../components/ui/card'
import type { Idea, IdeaStatus } from '../../types/idea'

const statusLabels: Record<IdeaStatus, string> = {
  draft: 'Черновик',
  active: 'В работе',
  done: 'Готово',
}

type IdeaListProps = {
  ideas: Idea[]
  emptyMessage: string
  onEdit: (idea: Idea) => void
  onDelete: (idea: Idea) => void
}

export function IdeaList({ ideas, emptyMessage, onEdit, onDelete }: IdeaListProps) {
  if (ideas.length === 0) {
    return <Card><CardContent className="py-10 text-center"><p className="font-medium">{emptyMessage}</p><p className="mt-2 text-sm text-muted-foreground">Добавьте первую идею, чтобы сохранить её только на этом устройстве.</p></CardContent></Card>
  }

  return (
    <div className="grid gap-3">
      {ideas.map((idea) => (
        <Card key={idea.id}>
          <CardHeader className="gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <h2 className="text-lg font-semibold leading-none tracking-tight">{idea.title}</h2>
              {idea.description && <p className="text-sm leading-6 text-muted-foreground">{idea.description}</p>}
            </div>
            <Badge variant={idea.status === 'done' ? 'secondary' : 'outline'}>{statusLabels[idea.status]}</Badge>
          </CardHeader>
          <CardFooter className="flex flex-col items-stretch gap-3 sm:flex-row sm:justify-between">
            <div className="flex flex-wrap gap-2" aria-label="Теги">
              {idea.tags.map((tag) => <Badge key={tag} variant="secondary">{tag}</Badge>)}
            </div>
            <div className="flex gap-2 self-end sm:self-auto">
              <Button type="button" variant="outline" size="sm" onClick={() => onEdit(idea)} aria-label={`Редактировать: ${idea.title}`}><Pencil className="h-4 w-4" aria-hidden="true" />Изменить</Button>
              <Button type="button" variant="destructive" size="sm" onClick={() => onDelete(idea)} aria-label={`Удалить: ${idea.title}`}><Trash2 className="h-4 w-4" aria-hidden="true" />Удалить</Button>
            </div>
          </CardFooter>
        </Card>
      ))}
    </div>
  )
}
