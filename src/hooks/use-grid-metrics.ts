"use client";

import { useEffect, useState } from "react";
import {
  GRID_ROWS,
  type GridBreakpoint,
  cellSizeCss,
  getBreakpoint,
  getGridConfig,
  gridStyle,
  resolveCellPx,
} from "@/lib/grid";

type UseGridMetricsOptions = {
  cols?: number;
  rows?: number;
  minCell?: number;
  visibleRows?: number;
};

export function useGridMetrics(options: UseGridMetricsOptions = {}) {
  const [breakpoint, setBreakpoint] = useState<GridBreakpoint>("desktop");
  const config = getGridConfig(breakpoint);

  const cols = options.cols ?? config.cols;
  const rows = options.rows ?? GRID_ROWS;
  const minCell = options.minCell ?? config.minCell;
  const visibleRows = options.visibleRows ?? config.visibleRows;

  const [cellPx, setCellPx] = useState(minCell);

  useEffect(() => {
    const update = () => {
      const layoutWidth = document.documentElement.clientWidth;
      const nextBreakpoint = getBreakpoint(layoutWidth);
      setBreakpoint(nextBreakpoint);

      const next = getGridConfig(nextBreakpoint);
      const nextCols = options.cols ?? next.cols;
      const nextMinCell = options.minCell ?? next.minCell;
      const nextVisibleRows = options.visibleRows ?? next.visibleRows;

      const nextCellPx = resolveCellPx(
        layoutWidth,
        window.innerHeight,
        nextCols,
        nextMinCell,
        nextVisibleRows
      );
      setCellPx(nextCellPx);
      document.documentElement.style.setProperty(
        "--grid-cell",
        `${nextCellPx}px`
      );
    };

    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, [options.cols, options.minCell, options.visibleRows]);

  return {
    breakpoint,
    cols,
    rows,
    minCell,
    visibleRows,
    cellPx,
    cellSizeCss: cellSizeCss(cols),
    gridStyle: gridStyle(cols, rows),
  };
}
