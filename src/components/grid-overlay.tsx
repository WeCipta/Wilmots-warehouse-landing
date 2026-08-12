import { cn } from "@/lib/utils";
import {
  GRID_CELL,
  GRID_COLS,
  GRID_ROWS,
  gridStyle,
} from "@/lib/grid";

export {
  GRID_CELL,
  GRID_COLS,
  GRID_ROWS,
  GRID_VISIBLE_ROWS,
  cellSize,
  cellSizeCss,
  getBreakpoint,
  getGridConfig,
  gridStyle,
  resolveCellPx,
} from "@/lib/grid";

export interface GridOverlayProps
  extends React.HTMLAttributes<HTMLDivElement> {
  cols?: number;
  rows?: number;
  cell?: number;
  gridClassName?: string;
}

export function GridOverlay({
  cols = GRID_COLS,
  rows = GRID_ROWS,
  cell = GRID_CELL,
  className,
  gridClassName,
  children,
  ...rest
}: GridOverlayProps) {
  const style = gridStyle(cols, rows);
  const totalCells = cols * rows;
  const hasChildren = Boolean(children);

  return (
    <div className={cn("absolute inset-0 overflow-hidden", className)} {...rest}>
      <div
        className={cn(
          "absolute inset-x-0 top-0 w-full grid",
          gridClassName
        )}
        style={style}
      >
        {!hasChildren &&
          Array.from({ length: totalCells }, (_, i) => (
            <div key={i} className="border border-white/20 bg-background" />
          ))}

        {children}
      </div>
    </div>
  );
}
