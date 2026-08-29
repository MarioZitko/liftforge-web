# Known issues / refactor backlog — liftforge-web

Snapshot taken 2026-08-24 against `develop`. This is a working list, not a permanent record —
update or remove entries as they're fixed, and add new ones as they're found. Referenced from
[components.md](02-component-library.md) and [coding-standards.md](01-coding-standards.md); don't duplicate
the "how to do it right" guidance here, just track "what's currently wrong."

**Every item below has been filed as an actionable ticket** in
[`docs/phase-1-tickets.md`](../../docs/phase-1-tickets.md) (Issues 67–70, 77–78, 83–85) — this doc
is the "why we think this" narrative; that file is where to check status/DoD/dependencies.

## High priority

1. ~~**Dead component library vs. duplicate live implementations.**~~ — **resolved in Issue 67.**
   Commit `42d821d`'s unused batch (`components/buttons/`, `dataTable/`, `dropdown/`, `fileUpload/`,
   `grid/`, `input/TextField+NumericField` plus the `input.tsx`/`input-group.tsx` duplicates from
   the same commit, `sortableList/`, `submitHandler/`, `typography/`) has been deleted; the
   codebase now standardizes on `ui/` + `shared/`. `ui/alert-dialog.tsx`, `ui/calendar.tsx`,
   `ui/pagination.tsx`, and `sidebar/Sidebar.tsx` had been importing `Button`/`Input` from the dead
   folders — those were repointed to `ui/button.tsx`/`ui/input.tsx` first. See
   [components.md](02-component-library.md) for the current state.

2. **`showError` called without the caught error in ~10 places**, discarding real backend
   messages in favor of a generic string: `ExerciseListTable.tsx:61,77`, `ExerciseFormModal.tsx:115`,
   `UserFormModal.tsx:81,96`, `AdminExercisesPage.tsx`, `AdminUsersPage.tsx`,
   `ResetPasswordPage.tsx:34`, `ConfirmEmailPage.tsx:19`, `OAuthFinalizePage.tsx:24`. Fix: change
   `catch { showError("...") }` to `catch (err) { showError(err, "..."); }` at each site.

3. ~~**Duplicated icon-button class strings with diverging values.**~~ — **resolved in Issue 69.**
   `ProgramGrid.tsx` and `SessionCell.tsx` each defined their own `iconBtnCls`-style string with
   different actual class values; both now use the shared `IconButton` component
   (`src/components/shared/IconButton.tsx`, `tone`/`size`/`destructive` `cva` variants). See
   [components.md](02-component-library.md) for the current state.

4. **`ProgramDetailPage.tsx` (782 lines) and `ClientProgramDetailPage.tsx` (258 lines) are
   near-duplicate coach/client views** of the same program-detail feature, each repeating the same
   `<button className="flex items-center gap-2 text-left flex-1 hover:opacity-80">` block 3 times
   (6 copies total across both files). `ProgramGrid.tsx` already demonstrates the right pattern
   for this exact problem — a single component with a `variant: "coach" | "client"` prop. Apply
   that same approach to collapse the two detail pages.

## Medium priority

5. **Raw `<button>`/`<input>`/`<select>` with long inline class strings** instead of shadcn
   components, in: `src/pages/calendar/components/AssignSessionDrawer.tsx`,
   `ScheduleProgramDialog.tsx`, `ClientFilterBar.tsx`, `CalendarShell.tsx`; and
   `src/pages/admin/UserFormModal.tsx` (raw `<select>` instead of `ui/select`, raw checkbox
   `<Input type="checkbox">` instead of `ui/checkbox`); and
   `src/pages/programs/components/ProgramGrid.tsx` (raw `<table>` instead of `ui/table`);
   `TrainingDetailPage.tsx:346-356` (a 190-char inline className copy-pasted from shadcn's own
   button/select styles instead of just using `<Button variant="outline">`). Migrate
   opportunistically when touching these files — see [components.md](02-component-library.md) for the
   target pattern.

6. **No test coverage at all** — see [testing.md](03-testing.md) for the plan when this is
   prioritized. Not urgent to backfill wholesale, but any new non-trivial shared logic
   (`base.api.ts`, `RequireRole`, `ServerTable`) is currently unverified beyond manual QA.

7. **Root `CLAUDE.md` recommends `tailwind-variants` for variants; the codebase actually uses
   `cva` exclusively** (`tailwind-variants` is installed, zero usages in `src/`). Low-risk doc
   drift, already corrected in [components.md](02-component-library.md) — worth fixing in the root
   `CLAUDE.md` too next time it's edited.

## Low priority / hygiene

8. ~~Inconsistent file casing within the `buttons/`/`input/` folders~~ — moot, those folders were
   deleted in Issue 67 rather than revived.
9. Mixed tabs/2-space indentation across files, no Prettier config to normalize it. Consider
   adding a root `.prettierrc` + `eslint-config-prettier` at some point — currently intentionally
   out of scope unless requested, since it'd touch a large diff surface across the whole repo.
10. Scaffold-leftover comments in `ExerciseListTable.tsx` (e.g. `// Make sure TableFilterOption is
    imported`) — harmless, delete on sight if editing that file.
