# Coding standards — liftforge-web

Supplements the root [`CLAUDE.md`](../../CLAUDE.md). See [components.md](02-component-library.md) for
UI/styling rules specifically.

## Component reuse comes first — before you write any JSX

This is the single most important rule in this document, restated here (not just in
[`02-component-library.md`](02-component-library.md)) because it's easy to forget mid-task:

1. **Use an existing custom component wherever one applies.** Before writing a `<button>`,
   `<input>`, `<select>`, `<table>`, form field, card, or list row, check `src/components/ui/`
   (shadcn primitives) and `src/components/shared/<Area>/` first. If one already fits, use it —
   don't hand-roll the same thing again in raw HTML/Tailwind because it feels faster in the
   moment.
2. **If nothing existing fits, and you can already tell this shape will be needed again** (a
   second page will want the same card/row/control, or you're about to copy-paste a className
   you just wrote), **create a new shared component instead of inlining the markup.** Put it
   under `src/components/shared/<Area>/`, following
   [`02-component-library.md`](02-component-library.md)'s conventions (`cva` for variants, `cn()`
   for merging classes). This is exactly how the codebase ended up with duplicated
   `iconBtnCls`-style strings and six copies of the same button block across two pages — see
   [`04-refactor-backlog.md`](04-refactor-backlog.md) items 3–4 — don't repeat that mistake.
3. **If it's genuinely one-off** (a single page, unlikely to be needed elsewhere), inline JSX with
   Tailwind classes is fine — don't build a reusable component "just in case" for something used
   exactly once.

The point of all of this: when the UI needs to change, we want to change it in **one place** (the
component), not hunt down every page that copy-pasted the same markup. A long or repeated
`className` string in a page file is a signal you skipped step 1 or 2, not a style choice.

## Naming

- Components: `PascalCase.tsx` (e.g. `ExerciseFormModal.tsx`).
- Hooks: camelCase, `useX.ts` (e.g. `useServerPagination.ts`).
- shadcn `ui/` files: kebab-case (`alert-dialog.tsx`) — this is shadcn's own convention, leave it.
- Everything else you write: PascalCase for component files, camelCase for non-component
  utility/hook files. Don't mix casing within the same folder for the same kind of file (existing
  inconsistency in `buttons/` and `input/` between e.g. `button-group.tsx` and `TextField.tsx` is
  a known wart, not a pattern to copy).
- Prop interfaces: existing pages that have a `types.ts` use an `I`-prefix
  (`IExerciseFormModalProps`). Follow that where a `types.ts` already exists for the feature; for
  files that define props inline (most of them), a plain `Props` type/interface local to the
  component file is fine — don't retrofit the `I`-prefix repo-wide, just be consistent within
  whichever file/feature you're editing.

## TypeScript

- Avoid `any`. It's essentially unused in real (non-dead) code today — keep it that way. If the
  API response shape is genuinely unknown, model it with `unknown` and narrow it, or define a
  proper type in the relevant `src/api/<domain>/<domain>.types.ts`.
- No barrel (`index.ts`) exports exist anywhere in `src/` currently — import from the concrete
  file path (`@/components/shared/DataTable/ServerTable`, not a folder index). Don't introduce
  barrels for a single feature area unless doing it consistently across the codebase.

## API calls

- Every domain has a singleton API client extending `BaseApi` (see root `CLAUDE.md` "API client
  pattern"). Call it directly from the component that needs it — that's the established pattern
  here, there's no separate data-fetching-hook layer (only `useServerPagination` and
  `useProgramView` exist as reusable data hooks, don't invent a `useExercises()`-style hook
  per-domain unless asked).
- The standard shape for a page that loads its own list of data:
  ```tsx
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    SomeApiClient.getInstance()
      .getAll()
      .then((res) => setData(res.data))
      .catch((err) => showError(err, "Failed to load X"))
      .finally(() => setLoading(false));
  }, []);
  ```
- **Always** bind the caught error and pass it to `showError(err, fallback)`. Don't write
  `catch { showError("Something went wrong") }` — that discards the real backend validation
  message the API actually sent. This inconsistency exists in several older pages; don't add to
  it, and fix it opportunistically if you're already editing one of those files (see
  [refactor-backlog.md](04-refactor-backlog.md) for the current list).

## Forms

Use React Hook Form + Zod + the shadcn `<Form>`/`<FormField>` wrapper — this is the standard,
already used in `UserFormModal.tsx`, `RegisterPage.tsx`, `LoginPage.tsx`:

```tsx
const schema = z.object({ name: z.string().min(1) });
const form = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });

<Form {...form}>
  <FormField control={form.control} name="name" render={({ field }) => (
    <FormItem>
      <FormLabel>Name</FormLabel>
      <FormControl><Input {...field} /></FormControl>
      <FormMessage />
    </FormItem>
  )} />
</Form>
```

Don't use plain `useForm()` + manual `register()` + hand-rolled `{errors.x && <p>}` blocks (as
seen in `ExerciseFormModal.tsx`) for new forms — the shadcn `<Form>` wrapper gives consistent,
accessible error rendering for free and is what most of the app already does.

For form field selects, note the `ALL_MUSCLES_FILTER_VALUE`-style sentinel pattern in
`ExerciseListTable.tsx` (a placeholder string standing in for "no selection", because Radix
`Select` disallows an empty-string value) — if you need an "all/none" option in a `Select`, use a
named sentinel constant like this rather than `""`.

## State management

- `useUserStore` (Zustand, persisted) is the auth source of truth — don't duplicate user data in
  local state.
- `clientStore`/`coachStore` exist for client/coach-specific shared state but are lightly used
  today — most feature state is local `useState` per page, which is fine for page-scoped data.
  Reach for a store only when the same piece of state genuinely needs to be shared across
  routes/components, not as a default.

## Error/loading state

- Loading: local `useState<boolean>` per async operation — there's no global loading indicator
  system, don't build one for a single page.
- Errors: always surface via `showError` (see above), never a silent `console.error`-only catch.

## Linting

- `.eslintrc.cjs` (legacy config format, not flat config — don't "helpfully" migrate this to flat
  config as a side effect of an unrelated task) enforces `eslint:recommended`,
  `@typescript-eslint/recommended`, `react-hooks/recommended`. `no-unused-vars` and
  `react-refresh/only-export-components` are warnings, not errors — treat unused-var warnings as
  things to actually clean up, not ignore, even though CI won't currently fail on them.
- There is no Prettier config in this repo and the codebase mixes tabs and 2-space indentation
  across files. Match the indentation style already used in the file you're editing; don't
  reformat a whole file's whitespace as a side effect of a small change.

## General hygiene

- No dead/commented-out code, no leftover `console.log`, no unresolved `TODO` comments — the
  codebase is currently clean on this front, keep it that way.
- Don't leave scaffold-style comments like `// ... your columns definition remains the same` or
  `// Make sure X is imported` — a few of these slipped into `ExerciseListTable.tsx` and should be
  treated as noise to remove on sight, not a pattern to replicate.
