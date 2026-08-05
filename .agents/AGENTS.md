# Component Structure Rules

## Naming Convention

- Use **lower-kebab-case** for all component names.
  - This applies to both the file name (e.g., `hero-section.tsx`) and the folder name when a component is expanded into a folder (e.g., `hero-section/`).

## File Granularity

- If a component is **simple enough** (no sub-components, no co-located logic files), keep it as a **single file**.
- Only expand a component into a folder when it needs to co-locate child components, hooks, utilities, or other related files.
- When a component is a folder, the parent component file must be named **`index.tsx`** (the folder name itself serves as the component identifier).

## One Component Per File

- Each file must **export exactly one component**.
- Do not barrel-export multiple components from a single file.

## Child Components

- Child components that are **only used by a single parent** must be placed inside that parent's folder, under a `_components/` subdirectory.

  ```
  hero-section/
  +-- index.tsx                 # Parent component (named after the folder)
  +-- _components/
      +-- hero-headline.tsx     # Child only used by hero-section
      +-- hero-cta-button.tsx   # Child only used by hero-section
  ```

## Colocation — Keep Components Close to Their Consumer

- Always place a component **as close as possible** to the file that uses it.
- Avoid placing components in a global/shared folder unless they are genuinely reused across multiple feature areas.

## Promoting Shared Components

- If a child component is **consumed by more than one parent** across different folders, **move it up** to the nearest common ancestor directory.
- Continue promoting it up the tree until it lives at the lowest directory that contains all of its consumers.

  ```
  # Before: cta-button only used by hero-section
  hero-section/_components/cta-button.tsx

  # After: cta-button also used by pricing-section — promote it up
  _components/cta-button.tsx   # shared between hero-section & pricing-section
  ```
