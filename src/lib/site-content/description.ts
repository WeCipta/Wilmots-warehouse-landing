import type { GridBreakpoint } from "@/lib/grid";

export const description = {
  body: "In this cooperative game, your team uses silly stories to memorize the locations of 35 face-down product tiles, then races a five-minute timer to match them with customer cards!",
  content: {
    mobile: { colStart: 2, colEnd: 6, rowStart: 1, rowEnd: 100 },
    tablet: { colStart: 3, colEnd: 9, rowStart: 1, rowEnd: 100 },
    desktop: { colStart: 4, colEnd: 12, rowStart: 1, rowEnd: 100 },
  } satisfies Record<
    GridBreakpoint,
    { colStart: number; colEnd: number; rowStart: number; rowEnd: number }
  >,
};
