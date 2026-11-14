import { beforeEach, expect, it } from 'vitest'

import { usePreferencesStore } from './preferences-store'

const STORAGE_KEY = 'mvp-pwa-starter:preferences:v1'

beforeEach(() => {
  window.localStorage.clear()
  usePreferencesStore.getState().setTheme('system')
  window.localStorage.clear()
})

it('persists the selected theme preference locally', () => {
  usePreferencesStore.getState().setTheme('dark')

  expect(usePreferencesStore.getState().theme).toBe('dark')
  expect(window.localStorage.getItem(STORAGE_KEY)).toBe('dark')
})
