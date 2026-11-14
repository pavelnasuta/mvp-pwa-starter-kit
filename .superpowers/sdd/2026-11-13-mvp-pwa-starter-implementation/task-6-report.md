# Task 6 report — PWA install and Pages path

## Delivered

- Added one original neutral geometric spark/grid source icon and derived RGB PNGs at 32, 180, 192 and 512 pixels, a maskable 512-pixel variant, and a multi-size (16/32/48) `favicon.ico`.
- Updated the document metadata and PWA configuration to use the repository-aware public base. All install assets are precached with the service worker.
- Added a GitHub Pages workflow for `main` and manual dispatch. It runs install, lint, type checking, unit tests, a repository-name-base build, then configures, uploads and deploys the Pages artifact with explicit required permissions and no secrets.
- Added a Playwright production-subpath acceptance test. Navigation now uses persistent hash links, so the Ideas view and its locally saved record remain visible after reload at `/starter-kit/`.

## TDD record

1. Added `e2e/ideas.spec.ts` before the routing/test configuration change.
2. Initial execution was red because the required Playwright Chromium executable was not installed. After installing the declared Playwright browser, it was red for the intended configuration issue: `page.goto('/starter-kit/')` had no configured `baseURL`.
3. Adding the base URL exposed the next real behavior gap: the test expected the accessible `Идеи` link, while the shell had state-only buttons and reload returned to the home view. Hash-based navigation fixed both subpath-safe link navigation and reload persistence.
4. The focused browser test is green: 1/1 passed.

## Verification

- `npm ci` completed from the lockfile.
- `npm run lint` passed.
- `npm run typecheck` passed.
- `npm run test` passed: 7 files, 28 tests.
- `VITE_BASE_PATH=starter-kit npm run build` passed. The built output has the `/starter-kit/` base, manifest, all seven icon/favicons and all of them in `sw.js` precache; the manifest has `any` 192/512 and maskable 512 entries.
- `npm run test:e2e -- e2e/ideas.spec.ts` passed: 1 test against the production-style `/starter-kit/` preview.
- A generated contact sheet was visually inspected at favicon, 32, 180, 192 and maskable 512 scales. The symbol remains recognisable at 16 pixels and the mark is entirely inside the central 66% maskable safe square (artwork coordinates 175–337 within safe coordinates 171–341).
- `git diff --check` passed.

## Limits and notes

- No remote repository, GitHub Pages setting, deployment, or workflow dispatch was performed, as required.
- The production build emits Vite’s existing large-chunk advisory for the approximately 923 kB JavaScript bundle; it does not fail the build. It is outside this PWA/deployment task’s scope.
- The local runner uses Node 26 while `package.json` declares Node 22; `npm ci` completed with an engine warning. `npm audit` reported 14 existing dependency advisories (2 low, 12 moderate); no dependencies were added or changed.
