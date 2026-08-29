# Testing conventions — liftforge-web

## Current state

**There is no test setup in this project at all** — no test runner config, no testing-library
packages installed, no `*.test.ts(x)`/`*.spec.ts(x)` files, no `test` script in `package.json`.
Don't assume tests exist for a feature just because it's non-trivial; there is nothing to run
today (`yarn dev` / `yarn build` / `yarn lint` are the only checks available).

## What to set up when tests are added

When asked to add tests (or to add a test alongside a new feature), use this stack — it's the
natural fit for this exact toolchain (Vite + React 19 + TS) and requires no extra build config:

- **Vitest** — shares Vite's config/transform, no separate Babel/webpack setup needed.
- **@testing-library/react** + **@testing-library/jest-dom** — render components, assert on
  rendered output/behavior rather than internals.
- **jsdom** as the test environment.
- Mock the API layer at the singleton boundary — e.g. `vi.mock` the relevant
  `SomeApiClient.getInstance()` module — rather than mocking `axios` globally, since every domain
  client is a thin, typed wrapper (`src/lib/base.api.ts` / `src/api/<domain>/<domain>.api.ts`) and
  mocking at that boundary keeps tests aligned with the real API contract types.

Suggested setup when first introducing this:
```bash
yarn add -D vitest @testing-library/react @testing-library/jest-dom jsdom @testing-library/user-event
```
Add a `test` script (`"test": "vitest"`) and a `vitest.config.ts` (or extend `vite.config.ts` with
a `test` block) pointing `environment: "jsdom"`.

## File placement & naming (once introduced)

- Co-locate: `Component.tsx` next to `Component.test.tsx`, matching the existing convention of
  colocating feature files (e.g. `src/pages/exercises/`) rather than a parallel `__tests__/` tree.
- Name by what's under test, not by test type: `ExerciseListTable.test.tsx`, not
  `ExerciseListTable.spec.tsx` or `exerciseListTable.test.tsx` — match the PascalCase of the
  component file it tests.

## What's worth testing first, if/when this is prioritized

Given the actual shape of this codebase (see [refactor-backlog.md](04-refactor-backlog.md)):
- `src/lib/base.api.ts` and the 401-redirect interceptor logic — this is shared, high-blast-radius
  logic that every API call depends on.
- `RequireRole` / `ProtectedRoute` — the role-gating logic in `src/routes.tsx` and
  `src/lib/RequireRole.tsx` is security-relevant and currently has zero coverage.
- `ServerTable` — it's the most-reused component in the app; a regression here affects 7+ pages.
- Form validation schemas (Zod) — cheap to test in isolation, catches silent validation regressions.

Don't retroactively demand 100% coverage across the whole app in one pass — prioritize
shared/high-leverage code (above) over one-off page components.
