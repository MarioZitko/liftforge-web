---
name: create-custom-component
description: Use when adding a new reusable UI component to avoid repeating Tailwind class strings across pages — triggers like "create a component for this", "this className is repeated, extract it", "add a shared card/list-row/icon-button". Scaffolds a component under src/components/shared/, following the project's cva + cn() conventions. Do NOT use for shadcn primitives (run `npx shadcn@latest add <name>` instead) or for a one-off page-specific layout that isn't reused anywhere.
---

# Create a shared custom component

Scaffolds a component in `src/components/shared/<Area>/` that follows the conventions in
`.claude/docs/02-component-library.md` — read that first if you haven't, especially the "dead vs.
live" component list, so you don't build a third competing implementation of something that
already has a live one (`ServerTable`, `MultiSelectField`, shadcn `ui/*`).

## Before you start — gather

- **Is this really shared, or page-specific?** If it's used by exactly one page and unlikely to be
  reused, a local component in that page's folder is fine — this skill is for things more than one
  page needs, or a className string that's already been copy-pasted once.
- **Does shadcn already have this primitive?** Check `src/components/ui/` first. If yes, compose
  it rather than rebuilding it.
- **Which feature area does it belong under?** Match the existing `shared/` folder shape:
  `shared/DataTable/`, `shared/Form/`, `shared/Auth/`, `shared/Navbar/` — pick or create the
  matching area folder, don't dump it flat into `shared/`.
- **Does it need variants** (size/tone/state)? Use `cva`, not `tailwind-variants` (installed but
  unused in this codebase — see [`.claude/docs/02-component-library.md`](../docs/02-component-library.md)).

## Steps

1. Create `src/components/shared/<Area>/<Name>.tsx` (PascalCase, matching the convention of the
   `shared/` folder — not the dotted/kebab style some of the older `components/` folders use).
2. Type props locally in the same file (`<Name>Props`) unless the area already has a `types.ts`.
3. Build the component using `cn()` from `src/lib/utils.ts` for any conditional classes, and `cva`
   if there's more than one visual variant.
4. Replace every site that had the repeated/long className with an import of the new component.
5. Verify against the checklist below.

## Template

```tsx
// src/components/shared/<Area>/<Name>.tsx
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const nameVariants = cva(
  "base classes shared by every variant",
  {
    variants: {
      tone: {
        default: "text-foreground",
        muted: "text-muted-foreground",
      },
    },
    defaultVariants: { tone: "default" },
  }
);

interface NameProps
  extends React.ComponentProps<"div">,
    VariantProps<typeof nameVariants> {}

export function Name({ className, tone, ...props }: NameProps) {
  return <div className={cn(nameVariants({ tone }), className)} {...props} />;
}
```

## Checklist (must all be true)

- [ ] Not a duplicate of an existing `ui/` or `shared/` component — checked both first.
- [ ] Lives under `src/components/shared/<Area>/`, not a new top-level folder (the older
  top-level folders like `buttons/`, `grid/`, `typography/` are the dead-code pattern to avoid —
  see [`.claude/docs/04-refactor-backlog.md`](../docs/04-refactor-backlog.md)).
- [ ] Variants (if any) use `cva`, not `tailwind-variants` or a ternary chain.
- [ ] `cn()` used for any conditional/merged className.
- [ ] No `any` in props.
- [ ] Every previous inline/repeated className this replaces has actually been swapped over — a
  new component with the old call sites still untouched doesn't fix anything.
- [ ] If this is genuinely reusable beyond the current task, consider adding a short usage example
  to [`.claude/docs/02-component-library.md`](../docs/02-component-library.md)'s "use these" table.
