import { zodResolver } from '@hookform/resolvers/zod'
import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { z } from 'zod'

import { Button } from '../../components/ui/button'
import { Input } from '../../components/ui/input'
import { Label } from '../../components/ui/label'
import { Textarea } from '../../components/ui/textarea'
import { IDEA_STATUSES, type Idea, type IdeaDraft, type IdeaStatus } from '../../types/idea'

const statusLabels: Record<IdeaStatus, string> = {
  draft: 'Черновик',
  active: 'В работе',
  done: 'Готово',
}

const ideaDraftSchema = z.object({
  title: z.string().trim().min(1, 'Введите название идеи').max(120, 'Название должно содержать не более 120 символов'),
  description: z.string().max(1000, 'Описание должно содержать не более 1000 символов'),
  status: z.enum(IDEA_STATUSES),
  tags: z.string(),
})

type IdeaFormValues = z.infer<typeof ideaDraftSchema>

type IdeaFormProps = {
  initialValue?: Idea
  onSubmit: (draft: IdeaDraft) => void
  onCancel: () => void
}

function toTags(value: string): string[] {
  return [...new Set(value.split(',').map((tag) => tag.trim()).filter(Boolean))]
}

export function IdeaForm({ initialValue, onSubmit, onCancel }: IdeaFormProps) {
  const form = useForm<IdeaFormValues>({
    resolver: zodResolver(ideaDraftSchema),
    defaultValues: {
      title: initialValue?.title ?? '',
      description: initialValue?.description ?? '',
      status: initialValue?.status ?? 'draft',
      tags: initialValue?.tags.join(', ') ?? '',
    },
  })

  useEffect(() => {
    form.reset({
      title: initialValue?.title ?? '',
      description: initialValue?.description ?? '',
      status: initialValue?.status ?? 'draft',
      tags: initialValue?.tags.join(', ') ?? '',
    })
  }, [form, initialValue])

  const submit = (values: IdeaFormValues) => {
    onSubmit({
      title: values.title.trim(),
      description: values.description.trim(),
      status: values.status,
      tags: toTags(values.tags),
    })
  }

  return (
    <form className="grid gap-4" noValidate onSubmit={form.handleSubmit(submit)}>
      <div className="grid gap-2">
        <Label htmlFor="idea-title">Название</Label>
        <Input id="idea-title" aria-invalid={Boolean(form.formState.errors.title)} aria-describedby={form.formState.errors.title ? 'idea-title-error' : undefined} {...form.register('title')} />
        {form.formState.errors.title && <p id="idea-title-error" className="text-sm text-destructive">{form.formState.errors.title.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="idea-description">Описание</Label>
        <Textarea id="idea-description" aria-invalid={Boolean(form.formState.errors.description)} aria-describedby={form.formState.errors.description ? 'idea-description-error' : undefined} {...form.register('description')} />
        {form.formState.errors.description && <p id="idea-description-error" className="text-sm text-destructive">{form.formState.errors.description.message}</p>}
      </div>
      <div className="grid gap-2">
        <Label htmlFor="idea-status">Статус</Label>
        <select id="idea-status" className="h-11 w-full rounded-md border bg-background px-3 text-sm shadow-sm" {...form.register('status')}>
          {IDEA_STATUSES.map((status) => <option key={status} value={status}>{statusLabels[status]}</option>)}
        </select>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="idea-tags">Теги</Label>
        <Input id="idea-tags" placeholder="исследование, pwa" {...form.register('tags')} />
        <p className="text-sm text-muted-foreground">Перечислите теги через запятую.</p>
      </div>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="outline" onClick={onCancel}>Отмена</Button>
        <Button type="submit">Сохранить</Button>
      </div>
    </form>
  )
}
