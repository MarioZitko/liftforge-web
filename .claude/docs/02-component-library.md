# Component & styling conventions

This is the most important file in `.claude/` for this project. The whole point of having a
custom component layer is: **when we want to change how something looks, we change it in one
place** — a component file — not in every page that happens to use it. A page file should read
like a description of *what* is on the screen, not *how* each pixel is styled.

## The rule

> If you are about to write a Tailwind class string longer than ~4-5 utilities, or you are about
> to copy a `className` you already wrote somewhere else, stop. Either use an existing component
> or extract a new one.

Raw `<button>`, `<input>`, `<select>`, `<table>` with hand-written `className` strings should
almost never appear in `src/pages/**`. If you're reaching for one, check `src/components/ui/`
first (shadcn primitives — `Button`, `Input`, `Select`, `Checkbox`, `Table`, etc.) before writing
raw HTML.

## Current state (read before "fixing" anything)

A real effort was made in commit `42d821d` ("Replace pure html components with reusable ones") to
build a component library for exactly this purpose. In practice, most of what it built is **not
used** by any page today, and a second, competing effort (`src/components/shared/`) grew up
alongside it and *is* what pages actually use. Don't be surprised by dead code — it's tracked in
[refactor-backlog.md](04-refactor-backlog.md). The practical guidance below reflects **what to
actually use today**, not what's aspirationally sitting in the tree.

### Use these (actually adopted, keep using them)

| Component | Where | Use for |
|---|---|---|
| `src/components/ui/*` | shadcn/ui primitives | Buttons, inputs, selects, checkboxes, dialogs, tables, tabs, etc. **Never hand-edit these** — regenerate with `npx shadcn@latest add <name>`. |
| `ServerTable` | `src/components/shared/DataTable/ServerTable.tsx` | Any paginated/filterable/searchable list view. This is the standard list pattern — see `src/pages/exercises/ExerciseListTable.tsx` for the reference usage. |
| `PaginationControls` | `src/components/shared/DataTable/PaginationControls.tsx` | Pagination UI, used inside `ServerTable` |
| `MultiSelectField` | `src/components/shared/Form/MultiSelectField.tsx` | Multi-select form fields |
| `toast.util` (`showSuccess`/`showError`) | `src/components/shared/utils/toast.util.ts` | All success/error toasts. **Always call `showError(err, "fallback message")` with the caught error bound** — never `showError("static string")` in a bare `catch {}`. Swallowing the real error hides genuinely useful backend validation messages from the user. |
| `Page` / `SiteHeader` | `src/components/page/` | Page-level app-shell layout only (already wired into the shell, you won't need to touch this for feature work) |
| `cn()` | `src/lib/utils.ts` | Merging/conditionally applying classNames. Use it any time a className is conditional, ever. |
| `cva` (class-variance-authority) | see `src/components/ui/button.tsx`, `badge.tsx`, etc. | The actual variant mechanism in this codebase for a component with a fixed set of style variants (size/variant/tone). |

**Correction to an old doc claim:** the root `CLAUDE.md` says to prefer `tailwind-variants` for
variants. In practice `tailwind-variants` is installed but has zero usages anywhere in `src/` —
`cva` is what's actually used everywhere. Follow `cva`, matching existing `ui/` components,
unless you have a specific reason to introduce `tailwind-variants` (and if you do, say so and be
consistent about it going forward — don't add a third pattern).

### Resolved: the dead `42d821d` component library

The `buttons/`, `dataTable/`, `dropdown/`, `grid/`, `fileUpload/`, `sortableList/`,
`submitHandler/`, `typography/`, and `input/` (`TextField.tsx`, `NumericField.tsx`, plus the
`input.tsx`/`input-group.tsx` duplicates of `ui/input.tsx` that shipped in the same commit)
folders described in earlier snapshots of this doc have been **deleted** (Issue 67) — none of
them had a live page depending on them. Two shadcn `ui/` files and `Sidebar.tsx` had imported
`Button`/`Input` from the dead folders instead of `ui/button.tsx`/`ui/input.tsx`; those were
switched to the canonical `ui/` versions before deleting (`ui/alert-dialog.tsx`, `ui/calendar.tsx`,
`ui/pagination.tsx`, `sidebar/Sidebar.tsx`).

`src/components/loaders/` is unrelated to that commit and was left alone — it wasn't in scope for
Issue 67.

If a task needs drag-and-drop, follow the live pattern already used in
`src/pages/programs/components/SortableExerciseRow.tsx` (`@dnd-kit` directly), not the deleted
`sortableList/`.

## Concrete example: the pattern to follow

```tsx
// src/pages/exercises/ExerciseListTable.tsx
<ServerTable<Exercise>
  data={pagedExercises}
  columns={columns}
  totalCount={filteredExercises.length}
  loading={loading}
  query={query}
  setQuery={setQuery}
  getRowId={(exercise) => exercise.id.toString()}
  filters={tableFilters}
/>
```
State (search/sort/pagination/filter) is owned by the component; the page only supplies data and
column definitions. This is the shape to replicate for any new list view.

## Concrete anti-pattern: what NOT to do

Don't do this (real example, simplified from `src/pages/calendar/components/AssignSessionDrawer.tsx`):

```tsx
<button className="flex items-center gap-3 p-3 rounded-lg border border-border hover:bg-muted/50 text-left transition-colors">
  ...
</button>
```

If this exact className (or a near-variant of it) shows up more than once, or it's doing something
a shadcn component already does (a clickable list row, an icon button, a card), extract it:

```tsx
// e.g. src/components/shared/SelectableCard.tsx
export function SelectableCard({ children, ...props }: SelectableCardProps) {
  return (
    <button className={cn(selectableCardVariants(), props.className)} {...props}>
      {children}
    </button>
  );
}
```
Now a future "make selectable rows have a colored left border on hover" request is a one-line
change in `SelectableCard.tsx`, not a find-and-replace across every page that copy-pasted the
string.

**Known duplicated strings to consolidate first if you touch these files:**
- `iconBtnCls`-style inline strings independently defined in `src/pages/programs/components/ProgramGrid.tsx` and `src/pages/programs/components/SessionCell.tsx` with *different* values for what's meant to be the same icon-button style — this is exactly the bug class the component layer exists to prevent. If you touch either file, pull this into one shared `IconButton` component instead of adding a third copy.
- The repeated `<button className="flex items-center gap-2 text-left flex-1 hover:opacity-80">` block in `ClientProgramDetailPage.tsx` and `ProgramDetailPage.tsx` (3 copies each, 6 total) — same fix.

## Legitimate exceptions

- `src/pages/programs/components/SortableExerciseRow.tsx` uses a raw `<button>` for the drag
  handle because `@dnd-kit` needs to spread its ref/listeners directly onto a native element —
  this is documented with a comment in the file. Follow that pattern (a short comment explaining
  *why* raw HTML is required) if you hit a similar library constraint elsewhere, rather than
  silently reintroducing raw HTML for convenience.
- OAuth/redirect-driven pages and other places where there's genuinely no reusable shape yet are
  fine to write plainly — the rule is about *repeated or lengthy* class strings, not about
  banning `className` outright.

## Decision checklist before writing UI

1. Does `src/components/ui/` already have this primitive? Use it.
2. Does `src/components/shared/` already have this pattern (table, form field, toast)? Use it.
3. Is this markup/style showing up a second time, or is the className string long/complex? Extract
   a component into `src/components/shared/<Area>/` (co-locate by feature area, matching the
   existing `shared/DataTable/`, `shared/Form/`, `shared/Auth/`, `shared/Navbar/` folders).
4. Only if none of the above apply, write it inline — and keep it short.
