import type { GridBreakpoint } from "@/lib/grid";

export const hero = {
  title: "Wilmot's Warehouse",
  tagline: "Organize the warehouse with memory, story, and imagination.",
  cta: "Order Now",
  content: {
    mobile: { colStart: 1, colEnd: 7, rowStart: 7, rowEnd: 10 },
    tablet: { colStart: 1, colEnd: 11, rowStart: 7, rowEnd: 10 },
    desktop: { colStart: 1, colEnd: 15, rowStart: 7, rowEnd: 10 },
  } satisfies Record<
    GridBreakpoint,
    { colStart: number; colEnd: number; rowStart: number; rowEnd: number }
  >,
};
