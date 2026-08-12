import type { CSSProperties } from "react";

export const GRID_COLS = 14;
export const GRID_ROWS = 20;
export const GRID_CELL = 96;
export const GRID_VISIBLE_ROWS = 9;

export type GridBreakpoint = "mobile" | "tablet" | "desktop";

export type GridConfig = {
  cols: number;
  minCell: number;
  visibleRows: number;
};

export const GRID_BREAKPOINTS: Record<GridBreakpoint, GridConfig> = {
  mobile: { cols: 6, minCell: 48, visibleRows: GRID_VISIBLE_ROWS },
  tablet: { cols: 10, minCell: 64, visibleRows: GRID_VISIBLE_ROWS },
  desktop: { cols: 14, minCell: 96, visibleRows: GRID_VISIBLE_ROWS },
};

export function getBreakpoint(width: number): GridBreakpoint {
  if (width < 640) return "mobile";
  if (width < 1024) return "tablet";
  return "desktop";
}

export function getGridConfig(breakpoint: GridBreakpoint): GridConfig {
  return GRID_BREAKPOINTS[breakpoint];
}

export function cellSizeCss(_cols = GRID_COLS): string {
  return "var(--grid-cell)";
}

export const cellSize = cellSizeCss;

export function gridStyle(
  cols = GRID_COLS,
  rows = GRID_ROWS
): CSSProperties {
  return {
    width: "100%",
    containerType: "inline-size",
    gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))`,
    gridTemplateRows: `repeat(${rows}, calc(100cqi / ${cols}))`,
    alignContent: "start",
  };
}

export function resolveCellPx(
  layoutWidth: number,
  _viewportHeight: number,
  cols = GRID_COLS,
  _minCell = GRID_CELL,
  _visibleRows = GRID_VISIBLE_ROWS
): number {
  return layoutWidth / cols;
}
