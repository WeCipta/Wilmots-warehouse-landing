import { CSSProperties } from "react";
import { cn } from "@/lib/utils";

// ─── Constants ─────────────────────────────────────────────────────────────────
export const GRID_COLS = 14;
export const GRID_ROWS = 20;
export const GRID_CELL = 96; // min cell size in px

/** Returns the CSS `gridTemplateColumns` / `gridTemplateRows` value for the
 *  standard game grid. Pass `cols` / `rows` to override the defaults. */
export function gridStyle(
  cols = GRID_COLS,
  rows = GRID_ROWS,
  cell = GRID_CELL
): CSSProperties {
  const track = `repeat(%n, max(${cell}px, calc(100vw / ${cols})))`;
  return {
    gridTemplateColumns: track.replace("%n", String(cols)),
    gridTemplateRows: track.replace("%n", String(rows)),
  };
}

/** Returns the CSS value for exactly one grid cell's width/height.
 *  This is the same `max()` expression each track uses, so elements
 *  sized with this will always align flush with the grid lines. */
export function cellSize(cols = GRID_COLS, cell = GRID_CELL): string {
  return `max(${cell}px, calc(100vw / ${cols}))`;
}

// ─── Component ─────────────────────────────────────────────────────────────────

export interface GridOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  /** Number of columns. Defaults to GRID_COLS (14). */
  cols?: number;
  /** Number of rows. Defaults to GRID_ROWS (20). */
  rows?: number;
  /** Minimum cell size in px. Defaults to GRID_CELL (96). */
  cell?: number;
  /** Extra className on the inner CSS-grid element */
  gridClassName?: string;
}


/**
 * GridOverlay
 *
 * Renders the characteristic Wilmot's Warehouse dot-grid background.
 * The outer wrapper is `absolute inset-0 overflow-hidden`; the inner grid
 * is centred and tiles the full width × height with `border-white/20` cells.
 *
 * Usage – background ornament layer:
 * ```tsx
 * <GridOverlay data-grid="hero" />
 * ```
 *
 * Usage – content placement layer (pass children that use `style={{ gridColumn, gridRow }}`):
 * ```tsx
 * <GridOverlay data-grid="hero-content" gridClassName="z-20">
 *   <div style={{ gridColumn: "5 / 11", gridRow: "3 / 5" }}>…</div>
 * </GridOverlay>
 * ```
 */
export function GridOverlay({
  cols = GRID_COLS,
  rows = GRID_ROWS,
  cell = GRID_CELL,
  className,
  gridClassName,
  children,
  ...rest
}: GridOverlayProps) {

  const style = gridStyle(cols, rows, cell);
  const totalCells = cols * rows;
  const hasChildren = Boolean(children);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} {...rest}>
      <div
        className={cn(
          "absolute top-0 left-1/2 -translate-x-1/2 grid",
          // Only fill the full height when used as a background (no children)
          !hasChildren && "h-full",
          gridClassName
        )}
        style={style}
      >
        {/* Background cells — only rendered when no content children provided */}
        {!hasChildren &&
          Array.from({ length: totalCells }, (_, i) => (
            <div key={i} className="border border-white/20 bg-background" />
          ))}

        {children}
      </div>
    </div>
  );
}
