# MVP PWA Starter Kit — design

**Status:** approved concept; awaiting review of this written specification

## Purpose

A reusable GitHub Template for teaching rapid MVP prototyping. A student creates a personal repository from the template, develops a credible mobile-first product with an AI assistant, stores its data locally in the browser, and publishes it to GitHub Pages without configuring a backend.

The starter removes repetitive setup. It intentionally does not promise multi-user accounts, cloud synchronisation, payments, private server data, or real authentication.

## Success criteria

A student can:

1. create a repository from the template;
2. start it locally with one documented command;
3. ask Hermes to add or alter a product screen while following the repository conventions;
4. create, edit, search, filter, persist, export and import local records;
5. install the result as a PWA;
6. publish it as a GitHub Pages project site;
7. demonstrate the same data after a reload and during offline launch.

## Technology decisions

| Concern | Decision | Reason |
| --- | --- | --- |
| Application | React + TypeScript + Vite | Fast local feedback, conventional AI-generated code, static build output. |
| Styling | Tailwind CSS | Fast composition and predictable responsive styling. |
| Interface kit | shadcn/ui | Copyable, owned components instead of opaque black-box packages. |
| Icons | Lucide React | Broad, consistent icon set with a simple API. |
| Client state | Zustand | Small API suitable for a student project. |
| Persistence | Zustand persistence adapter backed by localStorage | Local-first data survives reloads and needs no service. |
| Forms | React Hook Form + Zod | Reliable validation without custom boilerplate. |
| Notifications | Sonner | A consistent, small feedback primitive. |
| Charts | Recharts | Ready visualisation for dashboards and product metrics. |
| PWA | vite-plugin-pwa | Manifest, service worker and offline precache in a static application. |
| Deployment | GitHub Actions → GitHub Pages | No manual build/upload and compatible with template repositories. |
| Quality gates | ESLint, TypeScript, Vitest, Playwright | Catch type, storage and browser-flow regressions before publishing. |

The package manager is npm. The repository includes a lockfile and supported Node version declaration. No runtime server, API key or environment file is required.

## Repository shape

```text
src/
  app/                 application shell, routes and providers
  components/          reusable UI and shadcn/ui components
  features/            independently replaceable product capabilities
  lib/                 browser adapters, schema helpers and utilities
  stores/              Zustand stores and persistence boundaries
  types/               shared TypeScript types
  styles/              global Tailwind entry point and design tokens
public/                PWA icons and static assets
examples/              small copyable feature examples
prompts/               ready prompts for Hermes
.github/workflows/     Pages deployment and quality workflow
```

A `Component Gallery` route exposes the main visual blocks: application shell, navigation, cards, empty states, list and grid views, responsive forms, dialogs, toasts, search/filter controls, charts and destructive-action confirmation. It is both a visual reference and a safe place for students to copy patterns.

A small `Ideas` example demonstrates the complete local-first lifecycle: create, edit, delete, search, filter, reload persistence and JSON export/import. It is deliberately generic; students may adapt it or remove it.

## Data contract and resilience

- Every persisted store has a named key, a schema version and a Zod parser.
- Invalid, missing or legacy records fall back to safe defaults rather than breaking the application.
- Browser storage failures do not crash the interface. The user sees a non-blocking message that data may not be saved.
- Export produces a versioned JSON file. Import validates its structure before replacing any data.
- Data reset asks for confirmation, clears only application-owned keys and returns the app to its initial state.
- The app never sends locally stored product data to a remote service by default.

## AI development contract

The repository includes `AGENTS.md` and an equivalent concise guide in the README. They tell Hermes to:

- prefer existing components and composition patterns before introducing a dependency;
- use a feature folder for product behaviour and keep browser APIs behind small adapters;
- validate persisted data at the storage boundary;
- preserve mobile layout and accessible labels;
- add or update tests for changed behaviour;
- run the documented checks before proposing a publish step;
- treat GitHub Pages as a repository-subpath deployment, not a root-domain deployment.

The `prompts/` directory contains copyable starting prompts for: defining an MVP, creating a new entity, building a dashboard, transforming the Ideas example, adding local data import/export, and performing a release check.

## PWA and GitHub Pages contract

- The manifest, application icons and service worker are included from the first commit.
- The app works offline after its first successful visit; offline state is surfaced quietly rather than blocking the primary flow.
- Vite uses the repository-aware base URL needed by a GitHub Pages project site.
- The Pages workflow publishes build output only.
- The README documents the one-time GitHub Pages setting and how a student verifies their deployment.

## Accessibility and visual defaults

- Mobile-first layout, keyboard-accessible controls and labelled icon-only actions.
- Semantic headings, visible focus states, adequate contrast and reduced-motion support.
- Light and dark theme with system preference as the first-run default and persistence of the student’s choice.
- Russian-first interface copy; the string structure permits an English locale later without a rewrite.

## Verification requirements

Before a starter release:

1. lint, type check, unit tests, production build and browser-flow tests pass;
2. storage parser, corrupt data fallback, export/import validation and reset behaviour have unit coverage;
3. a browser test creates an Idea, reloads and sees the saved record;
4. a browser test runs against the production-style repository subpath;
5. PWA manifest and service-worker output exist in the production build;
6. narrow mobile and desktop screenshots show no clipped controls or horizontal page overflow;
7. the GitHub Pages workflow completes and the deployed page returns the new build.

## Non-goals

- Backend, database, serverless functions or secret management.
- Login, permissions, real authentication, multi-user collaboration or data synchronisation.
- Analytics, tracking or third-party scripts by default.
- A complete generic no-code builder. The template is a codebase that AI can safely accelerate.

## Acceptance definition

The finished repository is a usable GitHub Template with the documented toolchain preinstalled, a tested local-first example, PWA installation/offline support, a Pages workflow, and student-facing instructions that allow a product prototype to be developed and shared without configuring infrastructure.
