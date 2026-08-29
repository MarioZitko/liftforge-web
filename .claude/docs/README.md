# LiftForge Web — Claude docs

Deeper, verified reference material that supplements the root [`CLAUDE.md`](../../CLAUDE.md). The
root file covers the project overview (tech stack, folder map, routing, auth, API client pattern,
state management) — read it first if you haven't. This folder goes deeper on conventions and known
issues, and is loaded automatically alongside the root file via its `@.claude/docs/...` imports.

## How to use these docs

- **Building or touching any UI?** Read [02-component-library.md](02-component-library.md) first —
  it's the most important doc here. The core rule: use an existing component before writing raw
  HTML or a long Tailwind class string; extract a new one if you'd otherwise repeat one.
- **Writing a form, an API call, or naming something new?** [01-coding-standards.md](01-coding-standards.md).
- **Adding or planning tests?** [03-testing.md](03-testing.md) — there currently are none; this is
  the plan for when that changes.
- **Not sure if something is a known issue or a new one?** Check
  [04-refactor-backlog.md](04-refactor-backlog.md) before reporting/fixing it — it may already be
  tracked with more context than you'd otherwise have.

## Document index

| # | Document | What it covers |
|---|---|---|
| 01 | [coding-standards.md](01-coding-standards.md) | Naming, TypeScript conventions, forms (RHF + Zod + shadcn `Form`), API-call shape, state management, lint. |
| 02 | [component-library.md](02-component-library.md) | The custom-component catalog: what's actually used vs. dead, the Tailwind-discipline rule, good/bad examples, decision checklist. |
| 03 | [testing.md](03-testing.md) | Current state (no tests), the Vitest + RTL stack to use once tests are added, what to prioritize first. |
| 04 | [refactor-backlog.md](04-refactor-backlog.md) | Known issues found in the codebase, prioritized, with file:line evidence — a working list, not a permanent record. |

## The one-sentence summary

> React 19 + TypeScript SPA (Vite, TailwindCSS v4, shadcn/ui) where the whole point of the custom
> component layer is to change UI in one place instead of everywhere — follow what's actually used
> today (`components/ui/`, `components/shared/`), not the parallel unused component folders left
> over from an earlier, incomplete pass at the same goal.

## ⚠️ Known inconsistencies (don't carry these into new code)

Full detail and file references are in [04-refactor-backlog.md](04-refactor-backlog.md). The
recurring ones to keep front-of-mind:

- **Two competing implementations of the same idea** exist in a few places (Button, DataTable) —
  one dead, one live. Always check what real pages actually import before assuming a
  `src/components/<x>/` folder is the current pattern.
- **`showError(err, fallback)` needs the bound error** — several older call sites pass a bare
  string and silently discard the real backend message. Don't copy that shape.
- **The root `CLAUDE.md` recommends `tailwind-variants`; the codebase uses `cva`.** Follow `cva`.
- **No test infrastructure exists yet** — don't assume any page has coverage.

## Ticket structure

Feature/fix work for this repo is tracked as tickets under the project-root [`docs/`](../../docs/)
folder (`docs/phase-N-tickets.md`), not under `.claude/`. See [`docs/README.md`](../../docs/README.md)
for that convention.
