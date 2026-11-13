# MVP PWA Starter Kit Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a GitHub Template that lets students create, test, install and publish a local-first PWA MVP without backend setup.

**Architecture:** A Vite React application provides the shell, Component Gallery and an `Ideas` reference feature. Feature logic and browser storage are separated: Zod validates all persisted data, a small storage adapter makes failures benign, and a Zustand store exposes the UI contract. The PWA bundle and GitHub Actions workflow publish the static output at a repository subpath.

**Tech Stack:** React, TypeScript, Vite, Tailwind CSS, shadcn/ui, Lucide React, Zustand, Zod, React Hook Form, Sonner, Recharts, vite-plugin-pwa, Vitest, React Testing Library, Playwright, ESLint, GitHub Actions.

**Spec:** `docs/superpowers/specs/2026-11-13-mvp-pwa-starter-design.md`

## Global Constraints

- Use npm and declare Node.js 22 LTS in `.nvmrc` and `package.json` engines.
- Ship no runtime server, API key, environment file, analytics or third-party tracking.
- Keep all product data in browser `localStorage`; parse it with Zod before use.
- Use Russian-first visible copy, mobile-first layout, accessible labels and reduced-motion support.
- The app must build at `/` and a GitHub Pages project subpath through `VITE_BASE_PATH`.
- Prefer existing UI components and avoid new dependencies unless this plan names them.
- Treat a storage failure as a non-blocking status, never as a UI crash.

---

## File structure

```text
.
├── .github/workflows/pages.yml            # lint/test/build and Pages publication
├── .nvmrc                                 # Node.js 22 LTS declaration
├── AGENTS.md                              # Hermes development rules
├── README.md                              # student quickstart and publication guide
├── index.html                             # PWA metadata and application entry
├── package.json                           # scripts, engines and dependencies
├── vite.config.ts                         # repository-aware base and PWA setup
├── vitest.config.ts                       # explicit unit-test discovery
├── playwright.config.ts                   # isolated E2E runner and preview server
├── public/icons/                          # generated browser, Apple and maskable icons
├── prompts/                               # copyable Hermes prompts
├── src/
│   ├── app/App.tsx                        # provider composition and route selection
│   ├── app/layouts/AppShell.tsx           # responsive header and navigation
│   ├── app/routes.ts                      # `home`, `ideas`, `gallery` route model
│   ├── components/ui/                     # shadcn-owned primitives
│   ├── components/theme-toggle.tsx        # persistent colour-scheme control
│   ├── features/gallery/GalleryPage.tsx   # visual catalogue of primitives
│   ├── features/ideas/                    # Idea domain, form and page
│   ├── lib/base-path.ts                   # public URL and Pages base helpers
│   ├── lib/browser-storage.ts             # safe localStorage adapter
│   ├── lib/export-import.ts               # versioned JSON export/import parser
│   ├── lib/utils.ts                       # `cn` utility for shadcn components
│   ├── stores/app-preferences.ts          # persisted theme preference
│   ├── stores/ideas-store.ts              # validated local-first Ideas state
│   ├── styles/globals.css                 # Tailwind entry, tokens and motion policy
│   ├── types/idea.ts                      # shared Idea and import payload types
│   └── main.tsx                           # React mount point
├── src/**/*.test.ts(x)                    # unit/component tests only
└── e2e/ideas.spec.ts                      # production-style browser flow
```

## Task 1: Bootstrap the reproducible application and quality gates

**Files:**
- Create: `.nvmrc`, `package.json`, `package-lock.json`, `tsconfig.json`, `tsconfig.app.json`, `tsconfig.node.json`, `eslint.config.js`, `vite.config.ts`, `vitest.config.ts`, `playwright.config.ts`, `index.html`, `src/main.tsx`, `src/app/App.tsx`, `src/lib/base-path.ts`, `src/lib/base-path.test.ts`

**Interfaces:**
- Produces `normalizeBasePath(value?: string): string`, which returns `/` or a slash-delimited Pages subpath.
- Produces the documented commands `npm run dev`, `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run build`, and `npm run preview`.

- [ ] **Step 1: Initialise Vite React TypeScript and install the planned dependencies**

Run:

```bash
npm create vite@latest . -- --template react-ts
npm install @hookform/resolvers @radix-ui/react-alert-dialog @radix-ui/react-dialog @radix-ui/react-dropdown-menu @radix-ui/react-label @radix-ui/react-select @radix-ui/react-slot @radix-ui/react-tabs class-variance-authority clsx lucide-react react-hook-form recharts sonner tailwind-merge tailwindcss-animate vite-plugin-pwa zod zustand
npm install -D @playwright/test @testing-library/jest-dom @testing-library/react @testing-library/user-event @types/node @vitejs/plugin-react eslint eslint-plugin-react-hooks eslint-plugin-react-refresh jsdom playwright typescript vite vitest
```

Set Node declaration and scripts to:

```json
{
  "engines": { "node": ">=22 <23" },
  "scripts": {
    "dev": "vite",
    "lint": "eslint .",
    "typecheck": "tsc -b",
    "test": "vitest run",
    "test:watch": "vitest",
    "test:e2e": "playwright test",
    "build": "tsc -b && vite build",
    "preview": "vite preview --host 127.0.0.1"
  }
}
```

Write `22` to `.nvmrc`.

- [ ] **Step 2: Write the failing base-path test**

Create `src/lib/base-path.test.ts`:

```ts
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
```

- [ ] **Step 3: Run the focused test to verify it fails**

Run: `npm run test -- src/lib/base-path.test.ts`

Expected: FAIL because `./base-path` does not exist.

- [ ] **Step 4: Implement the base helper and Vite configuration**

Create `src/lib/base-path.ts`:

```ts
export function normalizeBasePath(value = '/'): string {
  const trimmed = value.trim().replace(/^\/+|\/+$/g, '')
  return trimmed ? `/${trimmed}/` : '/'
}

export const publicBasePath = normalizeBasePath(import.meta.env.VITE_BASE_PATH)
```

Configure `vite.config.ts` to use the helper’s environment equivalent at build time:

```ts
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const base = (() => {
  const raw = process.env.VITE_BASE_PATH?.trim().replace(/^\/+|\/+$/g, '')
  return raw ? `/${raw}/` : '/'
})()

export default defineConfig({
  base,
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'MVP PWA Starter',
        short_name: 'MVP Starter',
        start_url: base,
        scope: base,
        display: 'standalone',
        background_color: '#09090b',
        theme_color: '#09090b',
        icons: [
          { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
          { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' }
        ]
      }
    })
  ]
})
```

- [ ] **Step 5: Isolate unit and browser runners**

Configure Vitest with `environment: 'jsdom'`, `setupFiles: ['./src/test/setup.ts']` and `include: ['src/**/*.test.{ts,tsx}']`. Configure Playwright with `testDir: './e2e'`, `testMatch: '**/*.spec.ts'`, a fixed port `4174`, `reuseExistingServer: false`, and webServer command `VITE_BASE_PATH=starter-kit npm run build && VITE_BASE_PATH=starter-kit npm run preview -- --port 4174`.

Create `src/test/setup.ts`:

```ts
import '@testing-library/jest-dom/vitest'
```

- [ ] **Step 6: Run the focused test and all baseline gates**

Run:

```bash
npm run test -- src/lib/base-path.test.ts
npm run lint
npm run typecheck
npm run build
```

Expected: the base-path test and all baseline gates pass.

- [ ] **Step 7: Commit the bootstrap**

```bash
git add .
git commit -m "chore: bootstrap PWA starter toolchain"
```

### Task 2: Create the safe versioned local-storage boundary

**Files:**
- Create: `src/lib/browser-storage.ts`, `src/lib/browser-storage.test.ts`, `src/lib/export-import.ts`, `src/lib/export-import.test.ts`, `src/types/idea.ts`

**Interfaces:**
- Produces `SafeStorage` with `getItem(key): string | null`, `setItem(key, value): boolean`, `removeItem(key): boolean` and `available(): boolean`.
- Produces `parseImportPayload(input: string): ImportPayload` and `serializeExportPayload(ideas: Idea[]): string`.
- Defines `Idea`, `IdeaDraft`, `IdeaStatus`, `IdeasExportV1` and `ImportPayload`.

- [ ] **Step 1: Write failing tests for unavailable storage and corrupt import**

Create `src/lib/browser-storage.test.ts`:

```ts
import { describe, expect, it } from 'vitest'
import { createSafeStorage } from './browser-storage'

it('returns safe values when browser storage throws', () => {
  const storage = createSafeStorage({
    getItem: () => { throw new Error('blocked') },
    setItem: () => { throw new Error('blocked') },
    removeItem: () => { throw new Error('blocked') }
  })

  expect(storage.getItem('ideas')).toBeNull()
  expect(storage.setItem('ideas', '[]')).toBe(false)
  expect(storage.removeItem('ideas')).toBe(false)
  expect(storage.available()).toBe(false)
})
```

Create `src/lib/export-import.test.ts`:

```ts
import { expect, it } from 'vitest'
import { parseImportPayload } from './export-import'

it('rejects a malformed import without returning records', () => {
  expect(() => parseImportPayload('{"version":99}')).toThrow('Неверный файл экспорта')
})
```

- [ ] **Step 2: Run tests to verify they fail**

Run: `npm run test -- src/lib/browser-storage.test.ts src/lib/export-import.test.ts`

Expected: FAIL because the two modules do not exist.

- [ ] **Step 3: Define the domain and implement safe adapters**

Create `src/types/idea.ts` with these types:

```ts
export const IDEA_STATUSES = ['draft', 'active', 'done'] as const
export type IdeaStatus = (typeof IDEA_STATUSES)[number]

export type Idea = {
  id: string
  title: string
  description: string
  status: IdeaStatus
  tags: string[]
  createdAt: string
  updatedAt: string
}

export type IdeaDraft = Pick<Idea, 'title' | 'description' | 'status' | 'tags'>
export type IdeasExportV1 = { version: 1; exportedAt: string; ideas: Idea[] }
export type ImportPayload = IdeasExportV1
```

Implement `createSafeStorage` by wrapping the injected `Storage` methods in `try/catch`, returning `false` or `null` on failure. Implement `parseImportPayload` with a Zod schema that requires `version: 1`, ISO-like non-empty timestamps, non-empty titles and statuses from `IDEA_STATUSES`. Make schema failure throw `new Error('Неверный файл экспорта')`. `serializeExportPayload` must return `JSON.stringify({ version: 1, exportedAt: new Date().toISOString(), ideas }, null, 2)`.

- [ ] **Step 4: Run tests to verify the adapter passes**

Run: `npm run test -- src/lib/browser-storage.test.ts src/lib/export-import.test.ts`

Expected: PASS.

- [ ] **Step 5: Commit the persistence boundary**

```bash
git add src/lib src/types
git commit -m "feat: add safe versioned local data boundary"
```

### Task 3: Implement and test the Ideas store

**Files:**
- Create: `src/stores/ideas-store.ts`, `src/stores/ideas-store.test.ts`

**Interfaces:**
- Consumes: `Idea`, `IdeaDraft`, `ImportPayload`, `SafeStorage`.
- Produces `IdeasState` with `ideas`, `storageStatus`, `create(draft)`, `update(id, draft)`, `remove(id)`, `replaceFromImport(payload)`, `reset()` and `hydrate()`.

- [ ] **Step 1: Write the failing persistence test**

Create `src/stores/ideas-store.test.ts`:

```ts
import { beforeEach, expect, it } from 'vitest'
import { useIdeasStore } from './ideas-store'

beforeEach(() => useIdeasStore.getState().reset())

it('creates an idea that remains after hydration', () => {
  const created = useIdeasStore.getState().create({
    title: 'Проверить гипотезу',
    description: 'Показать прототип пяти людям',
    status: 'draft',
    tags: ['исследование']
  })

  useIdeasStore.getState().hydrate()

  expect(useIdeasStore.getState().ideas).toContainEqual(
    expect.objectContaining({ id: created.id, title: 'Проверить гипотезу' })
  )
})
```

- [ ] **Step 2: Run the test to verify it fails**

Run: `npm run test -- src/stores/ideas-store.test.ts`

Expected: FAIL because `ideas-store` does not exist.

- [ ] **Step 3: Implement the store contract**

Use the fixed storage key `mvp-pwa-starter:ideas:v1`. `create` must use `crypto.randomUUID()`, trim string inputs, set both timestamps with `new Date().toISOString()`, persist the new array, and return the new `Idea`. `update` must preserve `id` and `createdAt`, refresh `updatedAt`, then persist. `remove`, `replaceFromImport` and `reset` must persist their resulting state. `hydrate` must parse storage content through the import schema; corrupt content resets to an empty array and sets `storageStatus` to `'recovered'`. A failed write sets `storageStatus` to `'unsaved'` but leaves the current in-memory list usable.

Define:

```ts
export type StorageStatus = 'ready' | 'unsaved' | 'recovered'
```

- [ ] **Step 4: Expand tests for corruption, import replacement and reset**

Add tests that:

```ts
expect(useIdeasStore.getState().storageStatus).toBe('recovered')
expect(useIdeasStore.getState().ideas).toHaveLength(0)
expect(useIdeasStore.getState().ideas).toEqual(imported.ideas)
expect(useIdeasStore.getState().ideas).toEqual([])
```

after corrupt stored JSON, `replaceFromImport(payload)`, and `reset()` respectively.

- [ ] **Step 5: Run the unit suite**

Run: `npm run test -- src/stores/ideas-store.test.ts`

Expected: PASS.

- [ ] **Step 6: Commit the store**

```bash
git add src/stores/ideas-store.ts src/stores/ideas-store.test.ts
git commit -m "feat: add persistent Ideas store"
```

### Task 4: Build the visual system, shell and reusable UI gallery

**Files:**
- Create: `tailwind.config.ts`, `postcss.config.js`, `src/styles/globals.css`, `src/lib/utils.ts`, `src/app/routes.ts`, `src/app/layouts/AppShell.tsx`, `src/components/theme-toggle.tsx`, `src/components/ui/*`, `src/features/gallery/GalleryPage.tsx`, `src/features/gallery/GalleryPage.test.tsx`
- Modify: `src/app/App.tsx`, `src/main.tsx`, `index.html`

**Interfaces:**
- `RouteName` is `'home' | 'ideas' | 'gallery'`.
- `AppShell` consumes `activeRoute: RouteName` and `onNavigate(route: RouteName): void`.
- `ThemeToggle` persists `'light' | 'dark' | 'system'` through `usePreferencesStore`.

- [ ] **Step 1: Write the failing Gallery accessibility test**

Create `src/features/gallery/GalleryPage.test.tsx`:

```tsx
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { GalleryPage } from './GalleryPage'

it('exposes a labelled component gallery and destructive confirmation', () => {
  render(<GalleryPage />)
  expect(screen.getByRole('heading', { name: 'Галерея компонентов' })).toBeInTheDocument()
  expect(screen.getByRole('button', { name: 'Удалить пример' })).toBeInTheDocument()
})
```

- [ ] **Step 2: Run it to verify it fails**

Run: `npm run test -- src/features/gallery/GalleryPage.test.tsx`

Expected: FAIL because `GalleryPage` does not exist.

- [ ] **Step 3: Add Tailwind, shadcn primitives and visual tokens**

Initialise shadcn with a neutral base colour and CSS variables, then add `button`, `card`, `input`, `textarea`, `label`, `dialog`, `alert-dialog`, `select`, `tabs`, `badge`, `dropdown-menu` and `skeleton`. Define global tokens for page background, foreground, muted, border, radius and focus. Add:

```css
@media (prefers-reduced-motion: reduce) {
  *, *::before, *::after { animation-duration: 0.01ms !important; transition-duration: 0.01ms !important; }
}
```

Set `lang="ru"`, a description, theme colour, favicon and Apple touch icon in `index.html`.

- [ ] **Step 4: Implement shell, routes, theme and gallery**

Use a simple state-based route model rather than adding a routing dependency. The shell header must expose links labelled `Главная`, `Идеи`, `Галерея`; collapse to a touch-friendly horizontal navigation on narrow screens. `GalleryPage` must show a card, status badges, a labelled search field, a dialog example, toast trigger, a small Recharts bar chart and `Удалить пример` that opens an alert dialog rather than performing an immediate action.

- [ ] **Step 5: Run focused component test and inspect production build**

Run:

```bash
npm run test -- src/features/gallery/GalleryPage.test.tsx
npm run build
```

Expected: PASS and a build without TypeScript errors.

- [ ] **Step 6: Commit the visual foundation**

```bash
git add src index.html tailwind.config.ts postcss.config.js components.json
git commit -m "feat: add mobile-first UI foundation and gallery"
```

### Task 5: Build the Ideas reference feature and import/export flow

**Files:**
- Create: `src/features/ideas/IdeaForm.tsx`, `src/features/ideas/IdeaList.tsx`, `src/features/ideas/IdeasPage.tsx`, `src/features/ideas/IdeasPage.test.tsx`
- Modify: `src/app/App.tsx`, `src/lib/export-import.ts`

**Interfaces:**
- `IdeaForm` accepts `{ initialValue?: Idea; onSubmit(draft: IdeaDraft): void; onCancel(): void }`.
- `IdeasPage` owns form/dialog visibility, query and selected status; data mutations go only through `useIdeasStore`.
- `IdeaList` receives an already filtered list, never reads storage directly.

- [ ] **Step 1: Write the failing create-and-filter interaction test**

Create `src/features/ideas/IdeasPage.test.tsx`:

```tsx
import userEvent from '@testing-library/user-event'
import { render, screen } from '@testing-library/react'
import { expect, it } from 'vitest'
import { IdeasPage } from './IdeasPage'

it('creates and finds an idea by text', async () => {
  const user = userEvent.setup()
  render(<IdeasPage />)

  await user.click(screen.getByRole('button', { name: 'Новая идея' }))
  await user.type(screen.getByLabelText('Название'), 'Дневник привычек')
  await user.click(screen.getByRole('button', { name: 'Сохранить' }))
  await user.type(screen.getByLabelText('Поиск идей'), 'привычек')

  expect(screen.getByText('Дневник привычек')).toBeInTheDocument()
})
```

- [ ] **Step 2: Run test to verify it fails**

Run: `npm run test -- src/features/ideas/IdeasPage.test.tsx`

Expected: FAIL because `IdeasPage` does not exist.

- [ ] **Step 3: Implement form validation and CRUD UI**

Use React Hook Form with a Zod draft schema: `title` is 1–120 trimmed characters, `description` is at most 1000 characters, `status` is an `IdeaStatus`, and tags are a comma-separated UI field normalised into unique trimmed strings. Show field-level Russian validation messages. Provide an empty state, mobile-friendly create/edit dialog, filter by all three statuses, case-insensitive title/description/tag search, and an alert dialog before deletion.

- [ ] **Step 4: Implement export and defensive import**

Add two labelled buttons: `Экспортировать JSON` and `Импортировать JSON`. Export calls `serializeExportPayload` and downloads `ideas-export.json` using a temporary object URL. Import accepts only `.json`, reads text with `File.text()`, parses through `parseImportPayload`, asks for replacement confirmation, and shows a Sonner error `Не удалось импортировать файл` without changing current data when parsing fails.

- [ ] **Step 5: Add tests for import failure and reset confirmation**

Add a test selecting a malformed JSON `File`, then assert:

```tsx
expect(await screen.findByText('Не удалось импортировать файл')).toBeInTheDocument()
expect(screen.getByText('Дневник привычек')).toBeInTheDocument()
```

Add a test that presses `Сбросить данные`, asserts the confirmation dialog is present, confirms it, then asserts the empty-state text `Идей пока нет`.

- [ ] **Step 6: Run the feature tests**

Run: `npm run test -- src/features/ideas/IdeasPage.test.tsx`

Expected: PASS.

- [ ] **Step 7: Commit the reference feature**

```bash
git add src/features/ideas src/app/App.tsx src/lib/export-import.ts
git commit -m "feat: add local-first Ideas reference feature"
```

### Task 6: Add PWA assets, GitHub Pages workflow and production-path coverage

**Files:**
- Create: `public/icons/icon.svg`, `public/icons/icon-32.png`, `public/icons/icon-180.png`, `public/icons/icon-192.png`, `public/icons/icon-512.png`, `public/icons/icon-maskable-512.png`, `public/favicon.ico`, `.github/workflows/pages.yml`, `e2e/ideas.spec.ts`
- Modify: `index.html`, `vite.config.ts`, `playwright.config.ts`

**Interfaces:**
- The workflow receives no secrets and derives its published subpath from `${{ github.event.repository.name }}`.
- Browser acceptance test accesses the app at `/starter-kit/` through Playwright’s configured base URL.

- [ ] **Step 1: Generate an original neutral icon family**

Create one square RGB source with a simple geometric spark/grid symbol. Derive the required PNGs and ensure the maskable version keeps the symbol inside the central 66% safe region. Add the 180 px Apple touch icon, 32 px favicon fallback and multi-size ICO. Do not use text inside the favicon mark.

- [ ] **Step 2: Write the failing production-subpath browser test**

Create `e2e/ideas.spec.ts`:

```ts
import { expect, test } from '@playwright/test'

test('creates an idea that remains after a page reload', async ({ page }) => {
  await page.goto('/starter-kit/')
  await page.getByRole('link', { name: 'Идеи' }).click()
  await page.getByRole('button', { name: 'Новая идея' }).click()
  await page.getByLabel('Название').fill('Прототип без бэкенда')
  await page.getByRole('button', { name: 'Сохранить' }).click()
  await expect(page.getByText('Прототип без бэкенда')).toBeVisible()
  await page.reload()
  await expect(page.getByText('Прототип без бэкенда')).toBeVisible()
})
```

- [ ] **Step 3: Run the browser test to verify initial behaviour**

Run: `npm run test:e2e -- e2e/ideas.spec.ts`

Expected: PASS after Tasks 1–5; if it fails, correct the application’s subpath routing or test configuration before continuing.

- [ ] **Step 4: Add the Pages workflow**

Create `.github/workflows/pages.yml` with workflow dispatch and push-to-`main` triggers. It must use `actions/configure-pages`, `actions/upload-pages-artifact` and `actions/deploy-pages`; build with:

```yaml
- run: npm ci
- run: npm run lint
- run: npm run typecheck
- run: npm run test
- run: VITE_BASE_PATH="/${{ github.event.repository.name }}" npm run build
- uses: actions/upload-pages-artifact@v3
  with:
    path: dist
```

Set job permissions explicitly to `contents: read`, `pages: write`, and `id-token: write`; set the deployment environment to `github-pages` and pass the deployment URL as output.

- [ ] **Step 5: Verify production output contains install assets**

Run:

```bash
VITE_BASE_PATH=starter-kit npm run build
node -e "const fs=require('fs'); const html=fs.readFileSync('dist/index.html','utf8'); if(!html.includes('/starter-kit/')) throw new Error('missing Pages base'); if(!fs.existsSync('dist/manifest.webmanifest')) throw new Error('missing manifest')"
npm run test:e2e -- e2e/ideas.spec.ts
```

Expected: build succeeds, manifest exists, the subpath is present, and browser flow passes.

- [ ] **Step 6: Commit the install and publish path**

```bash
git add public .github/workflows index.html vite.config.ts playwright.config.ts e2e
git commit -m "feat: add PWA assets and GitHub Pages deployment"
```

### Task 7: Write the student and Hermes operating guides

**Files:**
- Create: `AGENTS.md`, `README.md`, `prompts/01-define-mvp.md`, `prompts/02-add-entity.md`, `prompts/03-build-dashboard.md`, `prompts/04-adapt-ideas.md`, `prompts/05-release-check.md`

**Interfaces:**
- README is the single student entry point: setup, development, AI workflow, local data boundaries and GitHub Pages release.
- AGENTS.md is the in-repository operating contract for Hermes.

- [ ] **Step 1: Add a documentation verification test**

Create `src/lib/documented-commands.test.ts` that reads `package.json` and asserts every command named in the README’s `Проверка перед публикацией` list exists in `scripts`. The expected command list is `lint`, `typecheck`, `test`, `test:e2e`, and `build`.

- [ ] **Step 2: Run it to verify it fails before the README contains the section**

Run: `npm run test -- src/lib/documented-commands.test.ts`

Expected: FAIL because the README does not yet contain the required section and command list.

- [ ] **Step 3: Write README and AGENTS contract**

README sections, in this exact order:

1. `Что это` — one paragraph on the local-first MVP purpose.
2. `Быстрый старт` — Node 22, `npm install`, `npm run dev`.
3. `Как работать с Hermes` — begin with the Idea feature or gallery; state that the AI must read `AGENTS.md` first.
4. `Данные и приватность` — localStorage only, browser-specific storage, JSON export as backup, no recovery after clearing browser data unless exported.
5. `Публикация на GitHub Pages` — create from template, push to `main`, choose GitHub Actions as Pages source, wait for workflow and open the generated link.
6. `Проверка перед публикацией` — exact commands `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e`, `npm run build`.

AGENTS.md must state exact component reuse, storage validation, accessibility, test, Pages-base and no-backend rules from the approved specification.

- [ ] **Step 4: Write five copyable prompts**

Each prompt must name a concrete outcome and constraints. For example `02-add-entity.md` starts:

```md
# Добавить сущность

Прочитай `AGENTS.md`. Добавь сущность «Клиент» с полями: имя, сегмент, заметка и статус. Используй существующие shadcn-компоненты, Zustand и versioned localStorage. Добавь создание, редактирование, удаление, поиск и фильтр статуса. Не добавляй сервер, новый UI-kit или зависимость. Напиши unit-тест хранения и браузерный сценарий создания с перезагрузкой.
```

The other four prompts cover: defining an MVP from a problem statement, dashboard metrics built from local records, adapting Ideas into a product feature, and executing release checks with a concise report.

- [ ] **Step 5: Update the documentation test to pass and run all checks**

Run:

```bash
npm run test -- src/lib/documented-commands.test.ts
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Expected: all commands pass.

- [ ] **Step 6: Commit the teaching materials**

```bash
git add README.md AGENTS.md prompts src/lib/documented-commands.test.ts
git commit -m "docs: add student and Hermes workflow guides"
```

### Task 8: Perform release verification and make the repository template-ready

**Files:**
- Modify: `README.md` only if verification exposes an inaccurate command or instruction.
- Verify: all tracked repository content and the GitHub Pages configuration after remote creation.

**Interfaces:**
- A clean `main` branch contains the starter and has no generated `dist` directory tracked.
- The remote repository will be set as a GitHub Template only after the user approves the public/private visibility and target account.

- [ ] **Step 1: Run the complete local release gate**

Run:

```bash
npm ci
npm run lint
npm run typecheck
npm run test
npm run build
npm run test:e2e
```

Expected: all commands pass on a clean install.

- [ ] **Step 2: Inspect mobile and desktop states**

Use Playwright screenshots at 390×844 and 1440×900 for the Ideas empty state, populated state, create dialog and Component Gallery. Confirm there is no horizontal overflow, clipped primary action, invisible focus state or overlapping navigation. Save only the QA screenshots outside the repository or add them to a non-tracked review directory.

- [ ] **Step 3: Validate offline build assets**

Serve the production output, load the application once, set the browser offline, reload, and assert that the shell and Ideas records are available. Confirm the generated service worker and manifest are fetched from the configured base path.

- [ ] **Step 4: Verify repository hygiene**

Run:

```bash
git status --short
git ls-files | grep -E '(^dist/|\.env$|node_modules)' && exit 1 || true
```

Expected: no generated build, environment or dependency folders are tracked; working tree is clean after the release commit.

- [ ] **Step 5: Commit final release corrections, if any**

If verification required documentation corrections:

```bash
git add README.md
git commit -m "docs: correct verified release instructions"
```

Otherwise do not create an empty commit.

- [ ] **Step 6: Create and verify the remote publication only after explicit user approval**

Ask the user for the target GitHub account and repository visibility. After creation, push `main`, enable Pages with GitHub Actions as source, enable the Template repository setting, then read back repository settings and the Pages URL. Trigger or observe the workflow, confirm successful completion, fetch the site over HTTP, and compare a fresh build asset filename to the served HTML before reporting publication.

## Plan self-review

- **Spec coverage:** Task 1 establishes the declared toolchain. Tasks 2–3 enforce versioned validated local data and safe failure. Tasks 4–5 deliver reusable UI, Russian mobile UX, forms, CRUD, search, filters, charts, notifications and import/export. Task 6 covers manifest, icons, service worker, project-subpath Pages workflow and PWA production flow. Task 7 provides the README, AI contract and prompts. Task 8 covers clean install, visual/mobile, offline and release verification.
- **Placeholder scan:** No unfinished markers, deferred implementation language or unnamed interfaces remain.
- **Type consistency:** `Idea`, `IdeaDraft`, `ImportPayload`, `SafeStorage`, `RouteName` and `StorageStatus` are defined before their consuming tasks and use the same names throughout.
