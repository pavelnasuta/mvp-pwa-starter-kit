import { describe, expect, it } from 'vitest'
import { createSafeStorage } from './browser-storage'

describe('createSafeStorage', () => {
  it('returns safe values when browser storage throws', () => {
    const storage = createSafeStorage({
      getItem: () => {
        throw new Error('blocked')
      },
      setItem: () => {
        throw new Error('blocked')
      },
      removeItem: () => {
        throw new Error('blocked')
      },
    })

    expect(storage.getItem('ideas')).toBeNull()
    expect(storage.setItem('ideas', '[]')).toBe(false)
    expect(storage.removeItem('ideas')).toBe(false)
    expect(storage.available()).toBe(false)
  })

  it('proxies successful browser storage operations', () => {
    const values = new Map<string, string>()
    const storage = createSafeStorage({
      getItem: (key) => values.get(key) ?? null,
      setItem: (key, value) => {
        values.set(key, value)
      },
      removeItem: (key) => {
        values.delete(key)
      },
    })

    expect(storage.available()).toBe(true)
    expect(storage.getItem('ideas')).toBeNull()
    expect(storage.setItem('ideas', '[]')).toBe(true)
    expect(storage.getItem('ideas')).toBe('[]')
    expect(storage.removeItem('ideas')).toBe(true)
    expect(storage.getItem('ideas')).toBeNull()
  })
})
