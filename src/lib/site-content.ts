import type { CSSProperties } from "react";
import type { GridBreakpoint } from "@/lib/grid";

export type ContentSpan = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
};

export const siteContent = {
  brand: "Wilmot's Warehouse",
  meta: {
    title: "Wilmot's Warehouse",
    description:
      "Created by Ricky Haggett, Richard Hogg, and David King (II). In Wilmot's Warehouse, your team will work co-operatively to organize the warehouse, using memory, imagination, and silly stories you make up.",
  },
  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "How to Play", href: "#how-to-play" },
      { label: "Tutorial", href: "#tutorial" },
      { label: "Gallery", href: "#gallery" },
      { label: "Order Now", href: "#order" },
    ],
  },
  hero: {
    title: "Wilmot's Warehouse",
    tagline: "Organize the warehouse with memory and imagination.",
    cta: "Order Now",
    content: {
      mobile: { colStart: 1, colEnd: 7, rowStart: 2, rowEnd: 4 },
      tablet: { colStart: 3, colEnd: 9, rowStart: 3, rowEnd: 5 },
      desktop: { colStart: 5, colEnd: 11, rowStart: 3, rowEnd: 5 },
    } satisfies Record<GridBreakpoint, ContentSpan>,
  },
};

export function getHeroContentSpan(breakpoint: GridBreakpoint): ContentSpan {
  return siteContent.hero.content[breakpoint];
}

export function contentSpanStyle(span: ContentSpan): CSSProperties {
  return {
    gridColumn: `${span.colStart} / ${span.colEnd}`,
    gridRow: `${span.rowStart} / ${span.rowEnd}`,
  };
}

export function isContentCellBlocked(
  breakpoint: GridBreakpoint,
  col: number,
  row: number
): boolean {
  const span = siteContent.hero.content[breakpoint];
  return (
    col >= span.colStart &&
    col < span.colEnd &&
    row >= span.rowStart &&
    row < span.rowEnd
  );
}
