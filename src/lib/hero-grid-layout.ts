import type { CardVariant } from "@/components/game-card";
import type { GridBreakpoint } from "@/lib/grid";
import { GRID_VISIBLE_ROWS } from "@/lib/grid";
import {
  isContentCellBlocked,
  isDescriptionCellBlocked,
} from "@/lib/site-content";

export type HeroCardLayout = {
  col: number;
  row: number;
  src?: string;
  variant?: CardVariant;
};

export type HeroCardCatalogItem = {
  src?: string;
  variant?: CardVariant;
};

export type HeroLayout = {
  cards: HeroCardLayout[];
  isUiBlocked: (col: number, row: number) => boolean;
};

export const WAREHOUSE_CARD_COUNT = 11;

export const WAREHOUSE_CARDS: HeroCardCatalogItem[] = Array.from(
  { length: WAREHOUSE_CARD_COUNT },
  () => ({})
);

function hashSeed(breakpoint: GridBreakpoint, cols: number, rows: number) {
  let h = 2166136261;
  const key = `${breakpoint}:${cols}:${rows}`;
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function mulberry32(seed: number) {
  return () => {
    let t = (seed += 0x6d2b79f5);
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function shuffle<T>(items: T[], random: () => number): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function getDescriptionRowCount(
  cellPx: number,
  viewportHeight: number
): number {
  if (cellPx <= 0) return 20;
  return Math.max(20, Math.ceil((2 * viewportHeight) / cellPx));
}

export function placeHeroCards(
  breakpoint: GridBreakpoint,
  cols: number,
  rows: number = GRID_VISIBLE_ROWS
): HeroCardLayout[] {
  const freeCells: { col: number; row: number }[] = [];
  const maxRow = Math.min(rows, GRID_VISIBLE_ROWS);

  for (let row = 1; row <= maxRow; row++) {
    for (let col = 1; col <= cols; col++) {
      if (!isContentCellBlocked(breakpoint, col, row)) {
        freeCells.push({ col, row });
      }
    }
  }

  const shuffled = shuffle(
    freeCells,
    mulberry32(hashSeed(breakpoint, cols, maxRow))
  );
  const count = Math.min(WAREHOUSE_CARDS.length, shuffled.length);

  return WAREHOUSE_CARDS.slice(0, count).map((card, i) => ({
    ...card,
    col: shuffled[i].col,
    row: shuffled[i].row,
  }));
}

export function placeDescriptionCards(
  breakpoint: GridBreakpoint,
  cols: number,
  rows: number
): HeroCardLayout[] {
  const freeCells: { col: number; row: number }[] = [];

  for (let row = 1; row <= rows; row++) {
    for (let col = 1; col <= cols; col++) {
      if (!isDescriptionCellBlocked(breakpoint, col, row)) {
        freeCells.push({ col, row });
      }
    }
  }

  const shuffled = shuffle(
    freeCells,
    mulberry32(hashSeed(breakpoint, cols, rows) ^ 0xdec0)
  );

  const catalog = [...WAREHOUSE_CARDS, ...WAREHOUSE_CARDS, ...WAREHOUSE_CARDS];
  const targetCount = Math.min(
    catalog.length,
    Math.max(WAREHOUSE_CARDS.length, Math.floor(shuffled.length * 0.35))
  );

  return catalog.slice(0, targetCount).map((card, i) => ({
    ...card,
    col: shuffled[i].col,
    row: shuffled[i].row,
  }));
}

export function getHeroLayout(
  breakpoint: GridBreakpoint,
  cols: number,
  rows: number = GRID_VISIBLE_ROWS
): HeroLayout {
  return {
    cards: placeHeroCards(breakpoint, cols, rows),
    isUiBlocked: (col, row) => isContentCellBlocked(breakpoint, col, row),
  };
}

export function getDescriptionLayout(
  breakpoint: GridBreakpoint,
  cols: number,
  rows: number
): HeroLayout {
  return {
    cards: placeDescriptionCards(breakpoint, cols, rows),
    isUiBlocked: (col, row) => isDescriptionCellBlocked(breakpoint, col, row),
  };
}
