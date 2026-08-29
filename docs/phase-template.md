# Phase <N> — <short phase name>

<One or two sentences: what this phase delivers and why it's being done now.>

## Reconciliation notes — read first

<Delete this section if nothing has drifted since these tickets were written. Otherwise: state
what changed (a dependency shipped early/late, a decision was revised, an issue number was
reassigned) and why, so a session picking this up cold doesn't act on a stale assumption.>

## Build order

<e.g. `Issue 70` → (`Issue 71` ‖ `Issue 72`) → `Issue 73` last. Omit if tickets are independent.>

---

## <N> - [FE] - <ticket title>

**Why:** <1-3 sentences of motivation/context.>

**Depends on:** <another issue in this phase, a liftforge-api ticket, or "none".>

### Files to touch

- `src/path/to/file.tsx` — <what changes>
- `src/path/to/new-file.tsx` — new, <what it does>

### Shape

<Prop interfaces / DTO shapes / the exact shared component or hook to reuse, copied from real
source where possible. Link to the relevant `.claude/docs/*.md` doc if a documented pattern
applies.>

```tsx
// concrete code sketch, not pseudocode, where it helps
```

### Definition of Done

- [ ] <concrete, verifiable condition>
- [ ] <concrete, verifiable condition>
- [ ] `npm run lint` / `npx tsc -b` clean

---

_(repeat `## Issue <N> — ...` per ticket)_
