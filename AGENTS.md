# MVP PWA Starter Kit — rules for AI agents

## Product boundary

- Build a static, local-first MVP only: no backend, authentication, API keys, secrets, cloud database, analytics or third-party tracking unless the student explicitly changes the product contract.
- Product records belong in versioned `localStorage` stores. Validate persisted and imported data with Zod before use.
- Storage must fail safely: a blocked, missing or corrupt browser storage value must not crash the interface. Preserve usable in-memory state and show a quiet status when saving is unavailable.

## Implementation

- Read the existing feature, store and gallery before adding code. Reuse the owned UI primitives in `src/components/ui/` and patterns in the Ideas example before adding a dependency or a custom replacement.
- Keep browser APIs behind small adapters. Keep domain logic, storage and rendering responsibilities separate.
- Use TypeScript. Keep visible interface copy and accessible names Russian-first.
- Prefer a focused feature folder. Do not put storage access directly in presentational list components.

## Interface and accessibility

- Design mobile-first. Keep touch targets at least 44 px, avoid horizontal page overflow and verify narrow layouts.
- Use semantic controls, labels for inputs and icon-only buttons, visible focus states and accessible destructive-action confirmation.
- Respect the existing light/dark/system theme and reduced-motion policy.

## Tests and checks

- Follow test-driven development: write or update a focused failing test before production behaviour, then make it pass with the smallest implementation.
- Add unit coverage for storage/domain behaviour and Playwright coverage for a changed user flow when it crosses a browser boundary.
- Before declaring a change ready, run the relevant focused tests plus `npm run lint`, `npm run typecheck`, `npm run test`, `npm run test:e2e` and `npm run build`.

## PWA and GitHub Pages

- This project is served below a repository subpath. Use the configured base helpers and never introduce root-absolute runtime asset paths.
- Keep the manifest, service worker and referenced icon assets in sync. Test the production-style repository subpath before release.
- The GitHub Pages workflow builds static output only; do not add server-side runtime assumptions.
