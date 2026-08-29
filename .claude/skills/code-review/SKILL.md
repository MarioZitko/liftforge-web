---
name: code-review
description: Use when reviewing code, checking spec compliance, finding deviations from .claude/docs, auditing changed files, or producing a code quality report for this repo — triggers like "review this", "code review", "check spec compliance", "audit my changes", "/code-review". Reviews spec compliance directly, with no subagents; dead-code detection only runs when explicitly requested. Optional args: a file/folder to scope the review to, a git commit range (e.g. HEAD~1..HEAD), and/or a request to also check for dead code — if none given, reviews all changes on the current branch vs. develop (plus any uncommitted changes).
---

# Code Review

You are acting as the Code Reviewer for liftforge-web. Enforce compliance with the `.claude/docs`
specifications and produce a deviation report with actionable fix instructions — do this yourself,
directly; do not spawn subagents for this.

## Step 1 — Determine review scope

- If given a git commit range: use `git diff --name-only <range>` for the file list and
  `git diff <range>` for the actual diffs.
- Otherwise, review everything different from `develop`: combine `git status --short` (uncommitted
  changes) with `git diff --name-only $(git merge-base develop HEAD)..HEAD` (committed changes not
  yet merged).
- If also given a specific file or folder path, filter the resulting file list down to that path.
- Narrow the resulting list to `.ts`/`.tsx`/`.css` files under `src/` or root config files.
- If no relevant changed files are found in scope, say so and stop.

## Step 2 — Load the relevant specification catalogue

Read only the docs that apply, based on the changed files' paths — don't re-read something already
covered in this conversation's context:

| Changed path matches | Read |
|---|---|
| `src/components/`, or a component with inline Tailwind classes | [`.claude/docs/02-component-library.md`](../docs/02-component-library.md) |
| `src/pages/**/*.tsx` (forms, API calls, state) | [`.claude/docs/01-coding-standards.md`](../docs/01-coding-standards.md) |
| `*.test.ts(x)` (if any exist yet) | [`.claude/docs/03-testing.md`](../docs/03-testing.md) |
| always | [`.claude/docs/01-coding-standards.md`](../docs/01-coding-standards.md) |

- Find which `docs/phase-N-tickets.md` contains the ticket referenced by the changed files, the
  current branch name (e.g. `feature/62`), or recent commit messages (`git log --oneline -10`).
  Grep across `docs/phase-*-tickets.md` if it isn't obvious. Read that ticket's full section — its
  **Definition of Done is a binding acceptance criterion**.

## Step 3 — Spec compliance review

For each file in scope:

1. Read the file in full.
2. Identify its category (page, shared component, API client, hook, store) from its path.
3. Apply the relevant doc(s) from Step 2.
4. Apply the relevant ticket's DoD, if one was identified — an unmet DoD bullet is always a HIGH finding.
5. Specifically check for the recurring issues tracked in
   [`.claude/docs/04-refactor-backlog.md`](../docs/04-refactor-backlog.md): raw HTML/long inline
   Tailwind strings that duplicate an existing component, `showError` called without the bound
   error, a new component built in a dead top-level folder instead of `components/shared/`.
6. Record every deviation: file, line, severity, violated rule, spec source, description, and a
   concrete fix instruction.

**Severity guide:**
- 🔴 HIGH — Breaks an established pattern with real consequences (swallowed error message,
  duplicate implementation of an existing component, unmet ticket DoD).
- 🟡 MEDIUM — Pattern deviation (raw HTML where a shadcn/shared component exists, missing `cn()`
  on a conditional className, inconsistent naming).
- 🟢 LOW — Style/naming inconsistency that doesn't affect correctness.

Do not invent rules that aren't in `.claude/docs` or the ticket's DoD. A file that fully complies
gets no finding.

## Step 4 — Dead code detection (only if explicitly requested)

Only if the request explicitly mentions dead code, unused code, unused imports/exports, or
cleanup. Check for: unused imports, unreachable code, commented-out blocks, dead exports (confirm
with a workspace-wide grep, not just the file's folder), duplicate logic that already exists in
`components/shared/` or `components/ui/`.

Classify each finding as **SAFE TO AUTO-REMOVE** (zero risk) or **REVIEW NEEDED** (requires human
judgment).

## Step 5 — Apply safe dead-code removals

Only if Step 4 ran. Apply **SAFE TO AUTO-REMOVE** items directly with `Edit`. List **REVIEW
NEEDED** items in the report instead of touching them.

## Step 6 — Output the final report

Produce exactly this report as your final message — no extra commentary beyond it.

---

# Code Review Report

**Branch:** `<current git branch>`
**Scope:** `<git range | path | "vs develop">`
**Reviewed files:** `<count>`
**Total findings:** `<count>` (`<HIGH count>` HIGH · `<MEDIUM count>` MEDIUM · `<LOW count>` LOW)
**Dead-code check:** `Not requested` | `<count> items found (<count> auto-removable)`

## Summary

One paragraph on overall health and the most critical issues.

## Findings by File

### `src/path/to/file.tsx`

| # | Severity | Type | Line | Description |
|---|----------|------|------|-------------|
| 1 | 🔴 HIGH | Spec: `<rule>` ([source](../docs/02-component-library.md)) | 42 | ... |

**Fix instructions:**
1. **[HIGH] `<rule>`** (line 42): `<fix instruction>`

_(repeat per file with findings)_

## Dead Code — Safe to Auto-Remove
_(omit if Step 4 not run)_

## Dead Code — Requires Review
_(omit if Step 4 not run)_

---

## Constraints

- Do NOT modify any file except confirmed SAFE TO AUTO-REMOVE dead code, and only when dead-code
  detection was explicitly requested.
- Do NOT skip reading the relevant `.claude/docs` — they are mandatory context.
- Do NOT invent rules not present in `.claude/docs` or a ticket's DoD.
- Only produce the structured report above as final output.
- If no relevant changed files are found in scope, say so and stop.
