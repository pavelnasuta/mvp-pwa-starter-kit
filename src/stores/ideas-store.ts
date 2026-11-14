import { create } from 'zustand'

import { createSafeStorage, type SafeStorage } from '../lib/browser-storage'
import { parseImportPayload, serializeExportPayload } from '../lib/export-import'
import type { Idea, IdeaDraft, ImportPayload } from '../types/idea'

export type StorageStatus = 'ready' | 'unsaved' | 'recovered'

export type IdeasState = {
  ideas: Idea[]
  storageStatus: StorageStatus
  create: (draft: IdeaDraft) => Idea
  update: (id: string, draft: IdeaDraft) => void
  remove: (id: string) => void
  replaceFromImport: (payload: ImportPayload) => void
  reset: () => void
  hydrate: () => void
}

const STORAGE_KEY = 'mvp-pwa-starter:ideas:v1'

const unavailableStorage: SafeStorage = {
  getItem: () => null,
  setItem: () => false,
  removeItem: () => false,
  available: () => false,
}

const storage =
  typeof window === 'undefined'
    ? unavailableStorage
    : createSafeStorage(window.localStorage)

function trimDraft(draft: IdeaDraft): IdeaDraft {
  return {
    ...draft,
    title: draft.title.trim(),
    description: draft.description.trim(),
    tags: draft.tags.map((tag) => tag.trim()),
  }
}

function persistIdeas(
  set: (state: Partial<IdeasState>) => void,
  ideas: Idea[],
) {
  const wasSaved = storage.setItem(STORAGE_KEY, serializeExportPayload(ideas))

  set({ ideas, storageStatus: wasSaved ? 'ready' : 'unsaved' })
}

export const useIdeasStore = create<IdeasState>((set, get) => ({
  ideas: [],
  storageStatus: 'ready',

  create: (draft) => {
    const timestamp = new Date().toISOString()
    const idea: Idea = {
      id: crypto.randomUUID(),
      ...trimDraft(draft),
      createdAt: timestamp,
      updatedAt: timestamp,
    }
    const ideas = [...get().ideas, idea]

    persistIdeas(set, ideas)

    return idea
  },

  update: (id, draft) => {
    const timestamp = new Date().toISOString()
    const trimmedDraft = trimDraft(draft)
    const ideas = get().ideas.map((idea) =>
      idea.id === id
        ? { ...idea, ...trimmedDraft, updatedAt: timestamp }
        : idea,
    )

    persistIdeas(set, ideas)
  },

  remove: (id) => {
    persistIdeas(
      set,
      get().ideas.filter((idea) => idea.id !== id),
    )
  },

  replaceFromImport: (payload) => {
    persistIdeas(set, payload.ideas)
  },

  reset: () => {
    persistIdeas(set, [])
  },

  hydrate: () => {
    const serialized = storage.getItem(STORAGE_KEY)

    if (serialized === null) {
      set({ ideas: [], storageStatus: 'ready' })
      return
    }

    try {
      const payload = parseImportPayload(serialized)
      set({ ideas: payload.ideas, storageStatus: 'ready' })
    } catch {
      set({ ideas: [], storageStatus: 'recovered' })
    }
  },
}))
