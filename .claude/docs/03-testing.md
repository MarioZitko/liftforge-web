# Testing conventions — liftforge-web

## Current state

Test infrastructure is set up (Issue 78): **Vitest** + **@testing-library/react** +
**@testing-library/jest-dom**, running under **jsdom**. Config lives in [`vitest.config.ts`](../../vitest.config.ts)
(kept separate from [`vite.config.ts`](../../vite.config.ts) so the Tailwind plugin isn't loaded
for tests); global matchers are wired up in [`src/setupTests.ts`](../../src/setupTests.ts). Run
with `yarn test` (single run) or `yarn test:watch` (watch mode).

First tests were written for the three files identified as highest-leverage/highest-blast-radius:

| File | Test file | Covers |
|---|---|---|
| `src/lib/base.api.ts` | `src/lib/base.api.test.ts` | The response interceptor: 401 clears the user store + redirects to `/login` outside public pages, does neither on a public page, and the array-vs-string backend message shape reaching `Promise.reject`. |
| `src/lib/RequireRole.tsx` | `src/lib/RequireRole.test.tsx` | Redirects to `/login` with no user, to `/dashboard` on a disallowed role, and renders children when the role is allowed. |
| `src/components/shared/DataTable/ServerTable.tsx` | `src/components/shared/DataTable/ServerTable.test.tsx` | Row rendering, loading/empty states, search (resets to page 1), sort toggle on header click, and pagination button disabled-state/`setQuery` calls. |

Don't assume tests exist for any other feature yet — coverage is intentionally limited to the
above per Issue 78's scope; everything else in the app is still only covered by manual QA.

## Stack notes for adding more tests

- Mock the API layer at the singleton boundary — e.g. `vi.mock` the relevant
  `SomeApiClient.getInstance()` module — rather than mocking `axios` globally, since every domain
  client is a thin, typed wrapper (`src/lib/base.api.ts` / `src/api/<domain>/<domain>.api.ts`) and
  mocking at that boundary keeps tests aligned with the real API contract types.
- `BaseApi`'s interceptors aren't otherwise exposed — reach into the axios instance's
  `interceptors.response.handlers[0].rejected` (see `base.api.test.ts`) to invoke the registered
  handler directly rather than spinning up a real HTTP call.
- Zustand stores (`useUserStore`, etc.) can be seeded directly with `useUserStore.setState({...})`
  in a test/`beforeEach` — no provider or mocking needed.
- **Node version note:** `jsdom` is pinned to `^26` (not latest) because newer jsdom pulls in an
  `undici` version requiring Node `>=22.19`, which is newer than what's currently installed
  locally. Revisit this pin once the local/CI Node version is bumped.

## File placement & naming

- Co-locate: `Component.tsx` next to `Component.test.tsx`, matching the existing convention of
  colocating feature files (e.g. `src/pages/exercises/`) rather than a parallel `__tests__/` tree.
- Name by what's under test, not by test type: `ExerciseListTable.test.tsx`, not
  `ExerciseListTable.spec.tsx` or `exerciseListTable.test.tsx` — match the PascalCase of the
  component file it tests.

## What's worth testing next

`base.api.ts`, `RequireRole`, and `ServerTable` are covered as of Issue 78 (see table above).
Next highest-leverage candidates, in priority order:
- `ProtectedRoute` (`src/routes.tsx`) — the other half of the role-gating logic; `RequireRole`
  alone is covered but `ProtectedRoute`'s no-user-in-store redirect isn't yet.
- Form validation schemas (Zod) — cheap to test in isolation, catches silent validation regressions.
- `PaginationControls` in isolation — currently only exercised indirectly via `ServerTable`'s tests.

Don't retroactively demand 100% coverage across the whole app in one pass — prioritize
shared/high-leverage code (above) over one-off page components.
