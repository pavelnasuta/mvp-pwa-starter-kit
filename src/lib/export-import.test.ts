import { expect, it } from 'vitest'
import { parseImportPayload, serializeExportPayload } from './export-import'

const idea = {
  id: 'idea-1',
  title: 'Безопасное хранилище',
  description: 'Данные остаются в браузере.',
  status: 'active' as const,
  tags: ['pwa'],
  createdAt: '2026-11-13T12:00:00.000Z',
  updatedAt: '2026-11-13T12:30:00.000Z',
}

it('rejects a malformed import without returning records', () => {
  expect(() => parseImportPayload('{"version":99}')).toThrow('Неверный файл экспорта')
})

it('rejects invalid idea fields in an import', () => {
  const invalidPayload = JSON.stringify({
    version: 1,
    exportedAt: '',
    ideas: [{ ...idea, title: '', status: 'unknown', createdAt: 'not-a-timestamp' }],
  })

  expect(() => parseImportPayload(invalidPayload)).toThrow('Неверный файл экспорта')
})

it('parses a valid version-one export payload', () => {
  const payload = JSON.stringify({
    version: 1,
    exportedAt: '2026-11-13T13:00:00.000Z',
    ideas: [idea],
  })

  expect(parseImportPayload(payload)).toEqual(JSON.parse(payload))
})

it('serializes ideas into a version-one export payload', () => {
  const serialized = serializeExportPayload([idea])
  const payload = JSON.parse(serialized)

  expect(payload.version).toBe(1)
  expect(payload.ideas).toEqual([idea])
  expect(payload.exportedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/)
  expect(serialized).toContain('\n  "version": 1')
})
