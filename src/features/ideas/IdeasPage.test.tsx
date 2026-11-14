import { act, cleanup, render, screen, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Toaster } from 'sonner'
import { afterEach, beforeEach, expect, it } from 'vitest'

import { useIdeasStore } from '../../stores/ideas-store'
import { IdeasPage } from './IdeasPage'

function renderIdeasPage() {
  return render(<><IdeasPage /><Toaster /></>)
}

beforeEach(() => {
  localStorage.clear()
  useIdeasStore.getState().reset()
})

afterEach(() => {
  cleanup()
  localStorage.clear()
  useIdeasStore.getState().reset()
})

it('creates and finds an idea by text', async () => {
  const user = userEvent.setup()
  renderIdeasPage()

  await user.click(screen.getByRole('button', { name: 'Новая идея' }))
  await user.type(screen.getByLabelText('Название'), 'Дневник привычек')
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))
  await user.type(screen.getByLabelText('Поиск идей'), 'привычек')

  expect(screen.getByText('Дневник привычек')).toBeInTheDocument()
})

it('keeps data unchanged and shows an error for malformed JSON imports', async () => {
  const user = userEvent.setup()
  useIdeasStore.getState().create({
    title: 'Дневник привычек',
    description: '',
    status: 'draft',
    tags: [],
  })
  renderIdeasPage()

  const malformedFile = new File(['{not valid JSON'], 'ideas.json', { type: 'application/json' })
  await user.upload(screen.getByLabelText('Импортировать JSON'), malformedFile)

  expect(await screen.findByText('Не удалось импортировать файл')).toBeInTheDocument()
  expect(screen.getByText('Дневник привычек')).toBeInTheDocument()
})

it('asks for confirmation before resetting ideas and empties the list after confirmation', async () => {
  const user = userEvent.setup()
  useIdeasStore.getState().create({
    title: 'Дневник привычек',
    description: '',
    status: 'draft',
    tags: [],
  })
  renderIdeasPage()

  await user.click(screen.getByRole('button', { name: 'Сбросить данные' }))
  expect(screen.getByRole('alertdialog')).toBeInTheDocument()

  const confirmation = screen.getByRole('alertdialog')
  await user.click(within(confirmation).getByRole('button', { name: 'Сбросить данные' }))
  expect(screen.getByText('Идей пока нет')).toBeInTheDocument()
})

it('updates an existing idea', async () => {
  const user = userEvent.setup()
  useIdeasStore.getState().create({
    title: 'Дневник привычек',
    description: 'Первая версия',
    status: 'draft',
    tags: ['личное'],
  })
  renderIdeasPage()

  await user.click(screen.getByRole('button', { name: 'Редактировать: Дневник привычек' }))
  await user.clear(screen.getByLabelText('Название'))
  await user.type(screen.getByLabelText('Название'), 'Трекер привычек')
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))

  expect(screen.getByText('Трекер привычек')).toBeInTheDocument()
  expect(screen.queryByText('Дневник привычек')).not.toBeInTheDocument()
})

it('deletes an idea only after confirmation', async () => {
  const user = userEvent.setup()
  useIdeasStore.getState().create({
    title: 'Дневник привычек',
    description: '',
    status: 'draft',
    tags: [],
  })
  renderIdeasPage()

  await user.click(screen.getByRole('button', { name: 'Удалить: Дневник привычек' }))
  expect(screen.getByText('Дневник привычек')).toBeInTheDocument()

  const confirmation = screen.getByRole('alertdialog')
  await user.click(within(confirmation).getByRole('button', { name: 'Удалить идею' }))
  expect(screen.getByText('Идей пока нет')).toBeInTheDocument()
})

it('replaces ideas only after confirmation of a valid import', async () => {
  const user = userEvent.setup()
  useIdeasStore.getState().create({
    title: 'Текущая идея',
    description: '',
    status: 'draft',
    tags: [],
  })
  renderIdeasPage()

  const importedFile = new File([JSON.stringify({
    version: 1,
    exportedAt: '2026-11-14T00:00:00.000Z',
    ideas: [{
      id: 'imported-idea',
      title: 'Идея из файла',
      description: 'Импортированное описание',
      status: 'active',
      tags: ['импорт'],
      createdAt: '2026-11-14T00:00:00.000Z',
      updatedAt: '2026-11-14T00:00:00.000Z',
    }],
  })], 'ideas.json', { type: 'application/json' })
  await user.upload(screen.getByLabelText('Импортировать JSON'), importedFile)

  expect(screen.getByRole('alertdialog')).toBeInTheDocument()
  expect(screen.getByText('Текущая идея')).toBeInTheDocument()
  expect(screen.queryByText('Идея из файла')).not.toBeInTheDocument()

  const confirmation = screen.getByRole('alertdialog')
  await user.click(within(confirmation).getByRole('button', { name: 'Заменить идеи' }))
  expect(screen.getByText('Идея из файла')).toBeInTheDocument()
  expect(screen.queryByText('Текущая идея')).not.toBeInTheDocument()
})

it('finds an idea by a tag', async () => {
  const user = userEvent.setup()
  useIdeasStore.getState().create({
    title: 'Дневник привычек',
    description: '',
    status: 'done',
    tags: ['Личное'],
  })
  renderIdeasPage()

  await user.type(screen.getByLabelText('Поиск идей'), 'личное')

  expect(screen.getByText('Дневник привычек')).toBeInTheDocument()
})

it('filters ideas by status', async () => {
  const user = userEvent.setup()
  useIdeasStore.getState().create({
    title: 'Черновая идея',
    description: '',
    status: 'draft',
    tags: [],
  })
  useIdeasStore.getState().create({
    title: 'Готовая идея',
    description: '',
    status: 'done',
    tags: [],
  })
  renderIdeasPage()

  await user.selectOptions(screen.getByLabelText('Статус'), 'done')

  expect(screen.getByText('Готовая идея')).toBeInTheDocument()
  expect(screen.queryByText('Черновая идея')).not.toBeInTheDocument()
})

it('normalizes tags entered in the form', async () => {
  const user = userEvent.setup()
  renderIdeasPage()

  await user.click(screen.getByRole('button', { name: 'Новая идея' }))
  await user.type(screen.getByLabelText('Название'), 'Идея с тегами')
  await user.type(screen.getByLabelText('Теги'), ' исследование, pwa, исследование ')
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))

  const tags = screen.getByLabelText('Теги')
  expect(within(tags).getAllByText('исследование')).toHaveLength(1)
  expect(within(tags).getByText('pwa')).toBeInTheDocument()
})

it.each([
  ['unsaved', 'Изменения сохранены только в памяти: хранилище браузера недоступно.'],
  ['recovered', 'Повреждённые локальные данные были пропущены. Новые изменения можно сохранить.'],
] as const)('quietly discloses the %s storage state', (storageStatus, message) => {
  renderIdeasPage()
  act(() => {
    useIdeasStore.setState({ storageStatus })
  })

  expect(screen.getByRole('status', { name: 'Состояние хранения' })).toHaveTextContent(message)
})
