# Ticket structure — liftforge-web

Feature and fix work is tracked here as self-contained, paste-ready tickets — written so whoever
picks one up (a different session, a colleague, you in a month) doesn't need today's conversation
context to execute it. This mirrors the pattern used successfully on a sibling project
(`M3-AdminPanel`); adapted to this repo's simpler two-service setup.

## File layout

```
docs/
  README.md                        — this file
  phase-template.md                — copy this to start a new phase
  phase-<N>-tickets.md             — one file per phase, one ## heading per ticket
  phase-<N>-story-instructions.md  — OPTIONAL, only for a phase that needs upfront design/
                                      architecture decisions before tickets can be written
                                      (see "When to write a story-instructions doc" below)
```

Phases are numbered sequentially as they're planned (`phase-1`, `phase-2`, ...) — a phase is a
batch of related work (e.g. "hierarchy management", "calendar view v2"), not a fixed time window.

## Ticket ID convention

**Use the existing GitHub issue number as the ticket ID** — this repo already names branches
`feature/<issue-number>` and commit messages `<issue-number> - <description>` (see `git log`).
Don't invent a new prefix scheme (no `LFW-63`-style codes) — just reference the issue number
directly.

**Heading format: `## <issue-number> - [FE] - <ticket title>`**, e.g.
`## 62 - [FE] - Exercise picker multi-select`. This repo only files `[FE]` tickets (backend work
goes in `liftforge-api/docs/`), but the tag is kept on every heading anyway so a ticket stays
identifiable once both repos' tickets are listed together. The number comes first and is
separated by ` - ` specifically so everything after the number can be copy-pasted straight in as
a Trello card title.

## What every ticket must contain

One `##` heading per ticket. Each ticket needs:

1. **Why** — the motivation/context in 1-3 sentences. Someone picking this up cold should
   understand the goal without asking.
2. **Exact files to touch** — real paths in this repo, not placeholders. If you're not sure of the
   exact current shape of a file you're extending, say "read `X` first, mirror its existing
   pattern" rather than guessing.
3. **Non-obvious shape** — prop interfaces, DTO/type shapes, the exact component/hook to reuse
   (link to [`.claude/docs/02-component-library.md`](../.claude/docs/02-component-library.md) if a
   shared component applies) — copied from the real source when possible, not invented.
4. **Definition of Done** — a short checklist. This is a binding acceptance criterion — the
   `code-review` skill treats an unmet DoD bullet as a HIGH-severity finding.
5. **Dependencies / build order**, if the ticket depends on another ticket in the same phase or on
   work in `liftforge-api` (call this out explicitly — e.g. "needs `GET /exercises/search` from
   liftforge-api issue 64 first").

## Reconciliation notes — read first, per phase file

Start each `phase-N-tickets.md` with a short "Reconciliation notes" section if anything has
drifted since the tickets were written (a dependency shipped early, a decision changed, a ticket
number got reassigned). This is exactly the situation `M3-AdminPanel`'s `phase-1-tickets.md`
documents well — copy that structure: state what changed and why, so nobody re-derives a stale
assumption. If nothing has drifted, omit the section.

## When to write a story-instructions doc

Most phases just need `phase-N-tickets.md`. Write a `phase-N-story-instructions.md` first, only
when the phase involves a genuine design decision that several tickets depend on (a new DTO
contract shared by frontend and backend, a routing/data-flow decision) — freeze that decision in
the story-instructions doc, then derive the tickets from it. Don't write one for a phase that's
just "implement this straightforward feature."

## Cross-repo tickets

`liftforge-web` and `liftforge-api` are separate git repositories (siblings under
`Desktop/liftforge/`). When a ticket needs backend work, put backend tickets in
`liftforge-api/docs/phase-N-tickets.md` and reference them by repo + path
(`liftforge-api/src/modules/exercise/exercise.controller.ts`), not a relative `../` path — those
don't resolve across separate repos. State the cross-repo dependency explicitly in both tickets'
"Dependencies" section.

## Using these with the `code-review` skill

The [`code-review`](../.claude/skills/code-review/SKILL.md) skill automatically looks up which
`phase-N-tickets.md` a change belongs to (via branch name / issue number / recent commits) and
treats that ticket's DoD as a binding acceptance criterion — keep tickets accurate as work
progresses (update the DoD if scope genuinely changes) rather than letting them go stale.
