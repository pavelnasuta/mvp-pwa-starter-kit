type BrowserStorage = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>

export type SafeStorage = {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => boolean
  removeItem: (key: string) => boolean
  available: () => boolean
}

const AVAILABILITY_CHECK_KEY = '__mvp_pwa_starter_storage_check__'

export function createSafeStorage(storage: BrowserStorage): SafeStorage {
  const getItem = (key: string): string | null => {
    try {
      return storage.getItem(key)
    } catch {
      return null
    }
  }

  const setItem = (key: string, value: string): boolean => {
    try {
      storage.setItem(key, value)
      return true
    } catch {
      return false
    }
  }

  const removeItem = (key: string): boolean => {
    try {
      storage.removeItem(key)
      return true
    } catch {
      return false
    }
  }

  return {
    getItem,
    setItem,
    removeItem,
    available: () => {
      try {
        storage.getItem(AVAILABILITY_CHECK_KEY)
        return true
      } catch {
        return false
      }
    },
  }
}
