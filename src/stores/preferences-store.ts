import { create } from 'zustand'

import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'

export type ThemePreference = 'light' | 'dark' | 'system'

type PreferencesState = {
  theme: ThemePreference
  setTheme: (theme: ThemePreference) => void
}

const STORAGE_KEY = 'mvp-pwa-starter:preferences:v1'

const unavailableStorage: SafeStorage = {
  getItem: () => null,
  setItem: () => false,
  removeItem: () => false,
  available: () => false,
}

function getStorage(): SafeStorage {
  if (typeof window === 'undefined') return unavailableStorage

  try {
    return createSafeStorage(window.localStorage)
  } catch {
    return unavailableStorage
  }
}

function readTheme(storage: SafeStorage): ThemePreference {
  const value = storage.getItem(STORAGE_KEY)
  return value === 'light' || value === 'dark' || value === 'system' ? value : 'system'
}

const storage = getStorage()

export const usePreferencesStore = create<PreferencesState>((set) => ({
  theme: readTheme(storage),
  setTheme: (theme) => {
    storage.setItem(STORAGE_KEY, theme)
    set({ theme })
  },
}))
