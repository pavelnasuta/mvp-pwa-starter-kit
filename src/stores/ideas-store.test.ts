import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'

import type { ImportPayload } from '../types/idea'
import { useIdeasStore } from './ideas-store'

const STORAGE_KEY = 'mvp-pwa-starter:ideas:v1'

const draft = {
  title: 'Проверить гипотезу',
  description: 'Показать прототип пяти людям',
  status: 'draft' as const,
  tags: ['исследование'],
}

const imported: ImportPayload = {
  version: 1,
  exportedAt: '2026-11-13T12:00:00.000Z',
  ideas: [
    {
      id: 'imported-idea',
      title: 'Импортированная идея',
      description: 'Проверить замену списка',
      status: 'active',
      tags: ['импорт'],
      createdAt: '2026-11-13T10:00:00.000Z',
      updatedAt: '2026-11-13T11:00:00.000Z',
    },
  ],
}

beforeEach(() => {
  localStorage.clear()
  useIdeasStore.getState().reset()
})

afterEach(() => {
  vi.restoreAllMocks()
  vi.useRealTimers()
  localStorage.clear()
})

describe('useIdeasStore', () => {
  it('creates an idea that remains after hydration', () => {
    const created = useIdeasStore.getState().create(draft)

    useIdeasStore.getState().hydrate()

    expect(useIdeasStore.getState().ideas).toContainEqual(
      expect.objectContaining({ id: created.id, title: 'Проверить гипотезу' }),
    )
  })

  it('trims draft strings and assigns an id with matching creation timestamps', () => {
    const created = useIdeasStore.getState().create({
      ...draft,
      title: '  Проверить гипотезу  ',
      description: '  Показать прототип  ',
      tags: [' исследование ', '  интервью'],
    })

    expect(created).toMatchObject({
      title: 'Проверить гипотезу',
      description: 'Показать прототип',
      tags: ['исследование', 'интервью'],
    })
    expect(created.id).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    )
    expect(created.createdAt).toBe(created.updatedAt)
  })

  it('updates an idea without changing its id or creation timestamp', () => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2026-11-13T12:00:00.000Z'))
    const created = useIdeasStore.getState().create(draft)

    vi.setSystemTime(new Date('2026-11-13T13:00:00.000Z'))
    useIdeasStore.getState().update(created.id, {
      ...draft,
      title: '  Обновить гипотезу  ',
      description: '  Показать второй прототип  ',
      tags: [' интервью '],
    })
    useIdeasStore.getState().hydrate()

    expect(useIdeasStore.getState().ideas).toEqual([
      expect.objectContaining({
        id: created.id,
        title: 'Обновить гипотезу',
        description: 'Показать второй прототип',
        tags: ['интервью'],
        createdAt: '2026-11-13T12:00:00.000Z',
        updatedAt: '2026-11-13T13:00:00.000Z',
      }),
    ])
  })

  it('removes an idea from persisted state', () => {
    const created = useIdeasStore.getState().create(draft)

    useIdeasStore.getState().remove(created.id)
    useIdeasStore.getState().hydrate()

    expect(useIdeasStore.getState().ideas).toEqual([])
  })

  it('recovers with an empty list when persisted JSON is corrupt', () => {
    localStorage.setItem(STORAGE_KEY, '{not valid JSON')

    useIdeasStore.getState().hydrate()

    expect(useIdeasStore.getState().storageStatus).toBe('recovered')
    expect(useIdeasStore.getState().ideas).toHaveLength(0)
  })

  it('replaces the current list from a valid import and persists it', () => {
    useIdeasStore.getState().create(draft)

    useIdeasStore.getState().replaceFromImport(imported)
    useIdeasStore.getState().hydrate()

    expect(useIdeasStore.getState().ideas).toEqual(imported.ideas)
  })

  it('resets the persisted list', () => {
    useIdeasStore.getState().create(draft)

    useIdeasStore.getState().reset()
    useIdeasStore.getState().hydrate()

    expect(useIdeasStore.getState().ideas).toEqual([])
  })

  it('retains the in-memory list and reports an unsaved status when writes fail', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked')
    })

    const created = useIdeasStore.getState().create(draft)

    expect(useIdeasStore.getState().ideas).toEqual([created])
    expect(useIdeasStore.getState().storageStatus).toBe('unsaved')
  })
})
