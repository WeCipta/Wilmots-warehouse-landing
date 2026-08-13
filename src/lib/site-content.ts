import type { CSSProperties } from "react";
import type { GridBreakpoint } from "@/lib/grid";

export type ContentSpan = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
};

const ORDER_URL = "https://www.cmyk.games/products/wilmot";

export const siteContent = {
  brand: "Wilmot's Warehouse",
  orderUrl: ORDER_URL,
  meta: {
    title: "Wilmot's Warehouse",
    description:
      "Created by Ricky Haggett, Richard Hogg, and David King (II). In Wilmot's Warehouse, your team will work co-operatively to organize the warehouse, using memory, imagination, and silly stories you make up.",
  },
  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "How to Play", href: "#how-to-play" },
      { label: "Creators", href: "#creators" },
      { label: "Gallery", href: "#gallery" },
    ],
    product: {
      portrait: "/images/nav/product-portrait.svg",
      landscape: "/images/nav/product-landscape.svg",
    },
  },
  credits: {
    creators: [
      { name: "Ricky Haggett" },
      { name: "Richard Hogg" },
      { name: "David King" },
    ] as { name: string; href?: string }[],
    publisher: {
      name: "CMYK",
      href: "https://www.cmyk.games",
    },
  },
  hero: {
    title: "Wilmot's Warehouse",
    tagline: "Organize the warehouse with memory, story, and imagination.",
    cta: "Order Now",
    content: {
      mobile: { colStart: 1, colEnd: 7, rowStart: 7, rowEnd: 10 },
      tablet: { colStart: 1, colEnd: 11, rowStart: 7, rowEnd: 10 },
      desktop: { colStart: 1, colEnd: 15, rowStart: 7, rowEnd: 10 },
    } satisfies Record<GridBreakpoint, ContentSpan>,
  },
  description: {
    body: "In this cooperative game, your team uses silly stories to memorize the locations of 35 face-down product tiles, then races a five-minute timer to match them with customer cards!",
    content: {
      mobile: { colStart: 2, colEnd: 6, rowStart: 1, rowEnd: 100 },
      tablet: { colStart: 3, colEnd: 9, rowStart: 1, rowEnd: 100 },
      desktop: { colStart: 4, colEnd: 12, rowStart: 1, rowEnd: 100 },
    } satisfies Record<GridBreakpoint, ContentSpan>,
  },
};

export function getHeroContentSpan(breakpoint: GridBreakpoint): ContentSpan {
  return siteContent.hero.content[breakpoint];
}

export function getDescriptionContentSpan(
  breakpoint: GridBreakpoint
): ContentSpan {
  return siteContent.description.content[breakpoint];
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

export function isDescriptionCellBlocked(
  breakpoint: GridBreakpoint,
  col: number,
  row: number
): boolean {
  const span = siteContent.description.content[breakpoint];
  return (
    col >= span.colStart &&
    col < span.colEnd &&
    row >= span.rowStart &&
    row < span.rowEnd
  );
}
