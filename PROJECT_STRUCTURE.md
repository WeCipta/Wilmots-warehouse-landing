# PROJECT_STRUCTURE.md

How to place a new file in this repo. This is a working reference for the "colocate, then lift" model already defined as the canonical rule in `CLAUDE.md` ("File Organization"). If the two ever disagree, `CLAUDE.md` wins — update this file to match.

## The core rule: colocate, then lift to the nearest common ancestor

Don't decide a file's home by its *type* (component/hook/util). Decide by **how many places use it**, and put it at the lowest level that covers all of them.

| Level | Used by | Lives in |
|---|---|---|
| 1. Route | Only one `page.tsx` | Inside that route's own folder |
| 2. Feature | Sibling routes within one feature (e.g. `feature-a/[id]` and `feature-a/new`) | `app/(authenticated)/feature-a/_components/` (or `_hooks/`, `_lib/`, `_types/`) |
| 3. Route group | Different features, same route group (e.g. both `feature-a` and `feature-b` under `(authenticated)`) | `app/(authenticated)/_components/` |
| 4. Root | Genuinely shared by both `(auth)` and `(authenticated)` | `src/components/`, `src/hooks/`, `src/lib/`, `src/types/` |

Start a new file at level 1. Only lift it once a second consumer at the next level up actually needs it — never pre-emptively.

The same logic applies uniformly to components, hooks, utils, and types — one mental model, not a different rule per file kind.

## Folder naming

- Non-route folders are **underscore-prefixed** at every level: `_components/`, `_hooks/`, `_lib/`, `_types/`. There is no generic catch-all `utils/` — use `_lib/`.
- This applies one level deep inside a single component's own folder too: `some-component/_components/`, `some-component/_hooks/`.
- Root-level folders keep bare names: `src/components/`, `src/hooks/`, `src/lib/`, `src/types/`.
- Route folders (the App Router segments themselves) stay kebab-case with no underscore, as Next.js requires.

## When a component becomes a folder

**Default:** a single kebab-case file — `entity-detail-header.tsx`.

**Promote to a folder** (same kebab-case name) once it needs any of: child components, a component-local hook, or its own async Suspense boundary:

```
entity-detail-header/
  index.tsx          # the component itself
  skeleton.tsx        # loading fallback (if it fetches data)
  error.tsx           # error fallback (if it fetches data)
  _components/
    entity-detail-header-badge.tsx
  _hooks/
    use-entity-header-state.ts
```

- `index.tsx` is always the component.
- `skeleton.tsx` / `error.tsx` sit as direct siblings of `index.tsx` — they're a property of that component (does it fetch data?), not a separate shared category. There is no top-level `sections/` folder in this repo.
- No rename when a file graduates to a folder — the kebab-case name stays identical.

## One export per file

Every feature/page component (`_components/**`, any root-promoted `src/components/<area>/`) gets its own file — no exceptions, even for a tightly-coupled compound-family part (`Field`, `FieldLabel`, `FieldError`). Dot-notation (`Field.Label`) is how the parent's `index.tsx` re-attaches children for consumers; it is not license to share a file.

**Exempt:** `src/components/ui/` (shadcn primitives) keeps its upstream multi-export shape so `shadcn add`/updates keep working.

## Quick examples

**A form used only on one entity's detail page:**
```
app/(authenticated)/feature-a/[id]/
  page.tsx
  entity-form.tsx
```

**That same form is now also needed on `feature-a/new`:** lift it —
```
app/(authenticated)/feature-a/_components/
  entity-form.tsx
```

**A `useDebounce` hook needed by two different features, both under `(authenticated)`:**
```
app/(authenticated)/_components/... (components)
app/(authenticated)/_hooks/
  use-debounce.ts
```

**A currency formatter needed by both `(auth)` and `(authenticated)`:**
```
src/lib/format-currency.ts
```

**shadcn primitive (always root, always exempt from one-export-per-file):**
```
src/components/ui/button.tsx
```

## File size and cohesion

- Typical file: 200–400 lines. Hard max: 800 lines.
- Many small, cohesive files beat few large ones — split before a file creeps past 400 lines.
- Organize by feature/domain, not by technical type.
- No vanity barrel `index.ts` files for re-exports — import the specific path. Exception: `src/lib/site-content/` is a composed content module (`index.ts` holds shared values and assembles `siteContent` from per-section files), not a re-export barrel.

## Naming

- Components: `PascalCase` symbol, kebab-case file/folder (`entity-form.tsx` exports `EntityForm`).
- Drop a parent folder’s own name from child filenames when location already encodes it (`tutorial-section/_components/board/` not `tutorial-board/`). Keep the prefix on the exported symbol (`TutorialBoard`).
- Landing `page.tsx` consumers take a `-section` suffix (`hero-section.tsx` exports `HeroSection`). Do not introduce a `sections/` folder.
- Custom hooks: `useCamelCase` symbol, kebab-case file (`use-debounce.ts` exports `useDebounce`).
- `.tsx` for anything with JSX (even one-liners); `.ts` for pure logic/types.

## Known migration debt (don't retrofit incidentally)

Some flat legacy folders may predate this convention (e.g. ungrouped feature folders directly under `src/components/`, or shared components sitting at root instead of their proper route-group level). Where that's the case, treat them as a separate migration, not something to fix as a side effect of unrelated work — leave them as-is unless a ticket specifically targets them.

## See also

- `CLAUDE.md` — "File Organization" section is the canonical source this file summarizes.
- `.claude/rules/15-react-coding-style.md` — naming, JSX, hooks discipline, shadcn preference (still applies; only its own "File Organization" section is superseded by `CLAUDE.md`).
- `.claude/rules/21-web-coding-style.md` — general web file organization principles.
- `ARCHITECTURE.md` — structural/architectural decisions.
