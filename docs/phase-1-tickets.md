# Phase 1 — Frontend component consolidation & hygiene (Issues 67–70, 77–78, 83–85)

Converts the findings in [`.claude/docs/04-refactor-backlog.md`](../.claude/docs/04-refactor-backlog.md)
(snapshot 2026-08-24/25 against `develop`) into actionable tickets.

## Reconciliation notes — read first

- **Ticket numbers are shared with `liftforge-api`'s `docs/phase-1-tickets.md`.** Both repos draw
  from one combined numbering pool (62–85) rather than each having their own counter — this
  matches how `feature/<n>` branches are already named across both repos with no overlapping
  numbers. This file only contains the numbers that landed on frontend work; the gaps (62–66,
  71–76, 79–82) are backend tickets — see `liftforge-api/docs/phase-1-tickets.md`.
- All 9 tickets here are direct conversions of `.claude/docs/04-refactor-backlog.md` items — that
  doc remains the "why we think this" narrative; this file is the actionable version going
  forward. Update both together if scope changes.
- **One backlog item is already resolved and intentionally not filed as a ticket:** the root
  `CLAUDE.md` used to recommend `tailwind-variants` for variants when the codebase actually uses
  `cva` — that doc line was already corrected directly in an earlier session. Nothing to do here.

## Build order

- **Issue 67 (dead-component decision) should land before 69 and 83** — it determines whether
  `components/buttons/`/`components/input/` are kept (and where a new `IconButton` should live) or
  deleted outright.
- **68, 70, 77, 78 are independent** of 67 and each other — can run in parallel.
- **84 (Prettier config)** is independent but worth landing before any ticket that would otherwise
  produce a noisy whitespace diff on top of a real change — not a hard blocker.

---

## 67 - [FE] - Decide and resolve the dead component library vs. duplicate live implementations

**Why:** commit `42d821d` added a component library (`buttons/`, `dataTable/`, `dropdown/`,
`fileUpload/`, `grid/`, `input/TextField+NumericField`, `sortableList/`, `submitHandler/`,
`typography/`) specifically to replace raw HTML/long Tailwind strings — almost none of it is used
by any real page today. A separate, later `components/shared/` folder (`ServerTable`,
`MultiSelectField`, `toast.util`) is what pages actually import. Concretely there are two
competing `Button` implementations (`components/buttons/button.tsx` vs `components/ui/button.tsx`)
and two competing `DataTable` implementations (`components/dataTable/DataTable.tsx` vs
`components/shared/DataTable/ServerTable.tsx`).

**Depends on:** none. Blocks Issue 69 (where should `IconButton` live?) and Issue 83 (only
relevant if these folders are kept).

### Files to touch

- `src/components/buttons/**`
- `src/components/dataTable/**`
- `src/components/dropdown/**`
- `src/components/grid/**`
- `src/components/fileUpload/**`
- `src/components/sortableList/**`
- `src/components/submitHandler/**`
- `src/components/typography/**`
- `src/components/input/TextField.tsx`, `NumericField.tsx`

### Shape

This is a decision ticket, per-folder — it doesn't have to be all-or-nothing. For each folder,
choose: **(a) delete it** and standardize on `ui/` + `shared/`, or **(b) migrate at least one real
page to use it** if there's a genuine reason to keep it (e.g. `Typography` or `SortableList` might
be worth reviving; `buttons/` and `dataTable/` are pure duplicates of things already live and
should almost certainly be deleted). Record the decision per folder in this ticket.

### Decision (recorded)

All eight folders/files are **deleted** — none had a genuine revival case strong enough to justify
migrating a real page (Typography/SortableList would both need a dedicated adoption pass across
several pages, which is out of scope for a decision ticket; `@dnd-kit` is already used directly for
drag/drop). Standardize entirely on `ui/` + `shared/`.

| Folder | Decision | Notes |
|---|---|---|
| `components/buttons/` | Delete | Duplicated `ui/button.tsx`. Live dependents (`ui/alert-dialog.tsx`, `ui/calendar.tsx`, `ui/pagination.tsx`, `sidebar/Sidebar.tsx`) were repointed to `ui/button.tsx` first — this folder was not actually fully dead, unlike the ticket's original assumption. |
| `components/dataTable/` | Delete | Duplicated `shared/DataTable/ServerTable.tsx`; zero usages. |
| `components/dropdown/` | Delete | Zero usages. |
| `components/grid/` | Delete | Zero usages. |
| `components/fileUpload/` | Delete | Zero usages; no page currently does file upload. |
| `components/sortableList/` | Delete | Zero usages; drag/drop is already done directly with `@dnd-kit` in `SortableExerciseRow.tsx`. |
| `components/submitHandler/` | Delete | Zero usages. |
| `components/typography/` | Delete | Zero usages; no adopting page identified. |
| `components/input/TextField.tsx`, `NumericField.tsx` | Delete | Zero usages; pages use `ui/input.tsx` directly. Also deleted the same folder's `input.tsx`/`input-group.tsx` (not explicitly listed above, but same `42d821d` batch, same duplicate-of-`ui/input.tsx` problem) — `input.tsx` was still imported by `sidebar/Sidebar.tsx`, repointed to `ui/input.tsx` first. |

### Definition of Done

- [x] A decision (delete / migrate) is recorded for each of the eight folders/files listed above.
- [x] Every folder marked "delete" is actually deleted, not just left unused.
- [x] Every folder marked "migrate" has at least one real page using it by the end of this ticket.
  (N/A — nothing was marked migrate.)
- [x] [`.claude/docs/02-component-library.md`](../.claude/docs/02-component-library.md) updated to
  reflect the new state.

---

## 68 - [FE] - Fix `showError` call sites that discard the real backend error

**Why:** roughly 10 call sites do `catch { showError("generic string") }` instead of binding the
caught error, silently discarding real backend validation messages that ~25 other call sites
correctly surface via `showError(err, fallback)`.

**Depends on:** none.

### Files to touch

- `src/pages/exercises/ExerciseListTable.tsx` (lines 61, 77)
- `src/pages/exercises/ExerciseFormModal.tsx` (line 115)
- `src/pages/admin/UserFormModal.tsx` (lines 81, 96)
- `src/pages/admin/AdminExercisesPage.tsx`
- `src/pages/admin/AdminUsersPage.tsx`
- `src/pages/auth/ResetPasswordPage.tsx` (line 34)
- `src/pages/auth/ConfirmEmailPage.tsx` (line 19)
- `src/pages/auth/OAuthFinalizePage.tsx` (line 24)

### Shape

At each site, change `catch { showError("..."); }` to `catch (err) { showError(err, "..."); }` —
keep the existing string as the fallback (second) argument.

### Decision (recorded)

Fixed in `ade5303`. All five actual discard sites (`AdminExercisesPage.tsx`'s fetch/delete,
`AdminUsersPage.tsx`'s fetch/delete, `UserFormModal.tsx`'s save, `ExerciseFormModal.tsx`'s save,
`ExerciseListTable.tsx`'s fetch/delete) now bind `err` and pass it as `showError(err, fallback)`.
`ResetPasswordPage.tsx:34`, `ConfirmEmailPage.tsx:19`, and `OAuthFinalizePage.tsx:24` needed no
change — those three call sites are pre-flight client-side validation (missing token / empty name)
with no caught backend error to discard in the first place; their actual `catch` blocks already
bound `err` correctly before this ticket.

### Definition of Done

- [x] All listed call sites bind the caught error and pass it to `showError`.
- [ ] Spot-check: trigger a real validation error on at least one of these forms and confirm the
  specific backend message now renders (not just the generic fallback). Not run against a live
  app — needs a running API + frontend and a real validation error to trigger; flag for whoever
  picks this up for review. Traced the path statically instead: `base.api.ts`'s response
  interceptor rejects with the backend's `message` string (or joined array) directly, and
  `showError`'s `typeof error === "string"` branch renders that string as-is, so the specific
  backend message should reach the toast — but this hasn't been observed in a browser.

---

## 69 - [FE] - Extract a shared `IconButton`, remove duplicated icon-button class strings

**Why:** `ProgramGrid.tsx` and `SessionCell.tsx` each independently define their own
`iconBtnCls`-style string for what's meant to be the same visual element, with different actual
class values.

**Depends on:** Issue 67's decision (if `components/buttons/` is kept, `IconButton` belongs there;
if deleted, put it in `components/shared/`).

### Files to touch

- `src/pages/programs/components/ProgramGrid.tsx` (lines ~48–49, and usages at 58, 61, 64, 88, 91,
  94, 144–160, 219)
- `src/pages/programs/components/SessionCell.tsx` (lines 41, 87, 92, 97, 108)

### Shape

Create one `IconButton` component (location per Issue 67) with a single canonical style — or a
small `tone`/`size` variant via `cva` if the two contexts genuinely need visually different
treatments (don't add a variant just to avoid picking one style; confirm they really differ
first). Replace both files' local `iconBtnCls` usages with it.

### Decision (recorded)

Issue 67 deleted `components/buttons/`, so `IconButton` lives in `src/components/shared/IconButton.tsx`
(not area-specific, so not nested under a `shared/<Area>/` folder). The two files' original class
strings genuinely differed on two axes, not just accidentally — `ProgramGrid.tsx`'s buttons sit on
the `bg-primary` block/week header (needs `text-primary-foreground/60` + hover fill) with `p-1`
padding, while `SessionCell.tsx`'s sit on the card body (needs `text-muted-foreground`) with a
tighter `p-0.5`. Modeled as two `cva` variants — `tone: "header" | "muted"` (default `"muted"`) and
`size: "sm" | "xs"` (default `"xs"`) — plus a `destructive` boolean compound-variant that reproduces
each context's own delete-button hover color (`hover:text-red-300` for `header`, `hover:text-red-400`
for `muted`) instead of collapsing them to one color. `ProgramGrid.tsx` passes `tone="header"
size="sm"` explicitly at all 9 call sites; `SessionCell.tsx` relies on the `muted`/`xs` defaults.
Icon size (`w-3.5 h-3.5` vs `w-3 h-3`) stays with the `<Pencil>`/`<Trash2>`/etc. child, not the
button, matching how the original code already varied it independent of `iconBtnCls`.

### Definition of Done

- [x] One `IconButton` component exists; both files use it.
- [x] No remaining local `iconBtnCls`-style string in either file.
- [ ] Visual check on both the program grid and session cell confirms icon buttons still look
  correct. Not run in a browser — needs `yarn dev` + a real program with blocks/weeks/sessions to
  click through; flag for whoever picks this up for review. Verified statically instead: every
  original class string is reproduced exactly by the `tone`/`size`/`destructive` combination used
  at each call site (traced by hand, see Decision above), and `npx tsc --noEmit` passes.

---

## 70 - [FE] - Collapse `ProgramDetailPage` / `ClientProgramDetailPage` duplication

**Why:** the 782-line `ProgramDetailPage.tsx` and 258-line `ClientProgramDetailPage.tsx` are
near-duplicate coach/client views of the same program-detail feature, each repeating the identical
`<button className="flex items-center gap-2 text-left flex-1 hover:opacity-80">` block three
times (six copies total across both files).

**Depends on:** none.

### Files to touch

- `src/pages/programs/ProgramDetailPage.tsx` (lines 475, 525, 580)
- `src/pages/programs/ClientProgramDetailPage.tsx` (lines 117, 155, 189)

### Shape

`ProgramGrid.tsx` already demonstrates the right pattern for exactly this problem — a single
component with a `variant: "coach" | "client"` prop. Extract the repeated button block into one
shared row component first; then evaluate whether more of the two pages' structure can converge
behind the same variant-prop approach (don't force a full merge if the two views have genuinely
diverging logic beyond the repeated markup — the row extraction alone is the required minimum).

### Definition of Done

- [ ] The repeated button markup exists in exactly one place, used by both pages.
- [ ] Both pages render/behave identically to before for their respective roles.
- [ ] Combined line count across both files shrinks (this removes duplication, it doesn't just
  relocate it).

---

## 77 - [FE] - Migrate remaining raw HTML / long inline Tailwind strings to shared components

**Why:** several pages still use raw `<button>`/`<input>`/`<select>`/`<table>` with long inline
`className` strings instead of the shadcn/shared equivalents that already exist.

**Depends on:** none — can run in parallel with 67–70.

### Files to touch

- `src/pages/calendar/components/AssignSessionDrawer.tsx`
- `src/pages/calendar/components/ScheduleProgramDialog.tsx`
- `src/pages/calendar/components/ClientFilterBar.tsx`
- `src/pages/calendar/components/CalendarShell.tsx`
- `src/pages/admin/UserFormModal.tsx` (raw `<select>` at line ~173–180, raw checkbox `<Input
  type="checkbox">` at line ~193)
- `src/pages/programs/components/ProgramGrid.tsx` (raw `<table>` from line ~103)
- `src/pages/programs/TrainingDetailPage.tsx` (lines 346–356, a ~190-char inline className
  copy-pasted from shadcn's own button/select styles)

### Shape

Replace each raw element with its shadcn equivalent (`ui/select`, `ui/checkbox`, `ui/table`,
`ui/button`) per [`.claude/docs/02-component-library.md`](../.claude/docs/02-component-library.md)'s
decision checklist. `SortableExerciseRow.tsx`'s raw drag-handle `<button>` is a documented,
legitimate exception (`@dnd-kit` requires it) — don't touch that one.

### Definition of Done

- [ ] Every file listed above uses the shadcn `ui/` component instead of the raw HTML element
  named.
- [ ] No visual regression on any affected screen (spot-check each one).

---

## 78 - [FE] - Set up Vitest + React Testing Library; write first tests for high-leverage code

**Why:** there is currently no test infrastructure in this repo at all — no runner config, no
testing-library packages, no test files, no `test` script.

**Depends on:** none.

### Files to touch

- `package.json` (add `vitest`, `@testing-library/react`, `@testing-library/jest-dom`, `jsdom`,
  `@testing-library/user-event`; add a `test` script)
- New `vitest.config.ts` (or a `test` block added to `vite.config.ts`)
- New `src/setupTests.ts` if jsdom polyfills are needed
- First test files for `src/lib/base.api.ts`, `src/lib/RequireRole.tsx`,
  `src/components/shared/DataTable/ServerTable.tsx`

### Shape

Follow [`.claude/docs/03-testing.md`](../.claude/docs/03-testing.md)'s plan: Vitest +
`@testing-library/react` + `jsdom`; mock at the `SomeApiClient.getInstance()` boundary rather than
globally mocking `axios`.

### Definition of Done

- [ ] `npm run test` (or `yarn test`) runs Vitest successfully.
- [ ] At least one passing test each for: `base.api.ts`'s 401-redirect interceptor behavior,
  `RequireRole`'s role-gating logic, `ServerTable`'s rendering/pagination behavior.
- [ ] [`.claude/docs/03-testing.md`](../.claude/docs/03-testing.md) updated to reflect that tests
  now exist, replacing the "there is no test setup at all" framing with the current state.

---

## 83 - [FE] - Normalize file casing within `components/buttons` and `components/input`

**Why:** `buttons/button-group.tsx` and `input/input-group.tsx` are kebab-case while sibling files
in the same folders (`AddButton.tsx`, `TextField.tsx`) are PascalCase.

**Depends on:** Issue 67 — only relevant if those folders are kept rather than deleted.

### Files to touch

- `src/components/buttons/*`
- `src/components/input/*`

### Shape

Rename files to one consistent casing convention (match the folder's dominant style — PascalCase,
consistent with the rest of the custom `components/` tree).

### Definition of Done

- [ ] All files within `components/buttons/` and `components/input/` share one casing convention.
- [ ] All imports updated to match renamed files.

---

## 84 - [FE] - Add a Prettier config + `eslint-config-prettier`

**Why:** no Prettier config exists anywhere in this repo, and the codebase mixes tabs and 2-space
indentation with no enforcement.

**Depends on:** none.

### Files to touch

- New `.prettierrc`
- `package.json` (add `prettier`, `eslint-config-prettier` dev deps)
- `.eslintrc.cjs` (add `eslint-config-prettier` to `extends`, last in the array)

### Shape

Pick a team-standard config (2-space indent, matching the majority convention already in the
codebase). Add `eslint-config-prettier` last in `extends` so ESLint stops flagging
formatting that Prettier would otherwise own. **Do not** mass-reformat the whole repo as part of
this ticket — that's a separate, explicit, reviewed decision given the diff size it would produce.

### Definition of Done

- [ ] `.prettierrc` exists with the team's chosen settings.
- [ ] `npx prettier --check src` result is reported honestly (this ticket fixes tooling, not
  necessarily every file).
- [ ] ESLint config updated to not fight Prettier.
- [ ] A separate follow-up ticket is filed (not this one) if/when the team decides to do a
  one-time repo-wide reformat.

---

## 85 - [FE] - Remove scaffold-leftover comments in `ExerciseListTable.tsx`

**Why:** a few comments read as autogenerated placeholder text never cleaned up before commit
(e.g. `// Make sure TableFilterOption is imported`, `// ... your columns definition remains the
same`).

**Depends on:** none.

### Files to touch

- `src/pages/exercises/ExerciseListTable.tsx` (lines 6, 113 — review line 26's comment on the way
  through; keep it if it documents a real invariant like the `ALL_MUSCLES_FILTER_VALUE` sentinel,
  since that one's genuinely non-obvious)

### Shape

Delete the scaffold-style comments. Keep any comment that explains a real non-obvious invariant
rather than restating the code next to it.

### Definition of Done

- [ ] Listed scaffold comments removed.
- [ ] Any comment kept is verified to explain a real non-obvious invariant.
