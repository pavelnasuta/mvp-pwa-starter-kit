import { describe, expect, it } from 'vitest'
import { normalizeBasePath } from './base-path'

describe('normalizeBasePath', () => {
  it('normalizes a GitHub Pages project path', () => {
    expect(normalizeBasePath('starter-kit')).toBe('/starter-kit/')
    expect(normalizeBasePath('/starter-kit/')).toBe('/starter-kit/')
  })

  it('uses root for absent or root input', () => {
    expect(normalizeBasePath()).toBe('/')
    expect(normalizeBasePath('/')).toBe('/')
  })
})
