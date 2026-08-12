import type { CardVariant } from "@/components/game-card";
import type { GridBreakpoint } from "@/lib/grid";
import { GRID_VISIBLE_ROWS } from "@/lib/grid";
import { isContentCellBlocked } from "@/lib/site-content";

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

const HERO_CARDS: HeroCardCatalogItem[] = [
  { src: "banana.svg" },
  { src: "bomb.svg" },
  { src: "frog.svg" },
  { src: "gem.svg" },
  { src: "sun.svg" },
  { src: "mask.svg" },
  { src: "rainbow.svg" },
  { src: "volcano.svg" },
  { src: "icecream.svg" },
  { src: "horse.svg" },
  { src: "target.svg" },
];

function shuffle<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
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

  const shuffled = shuffle(freeCells);
  const count = Math.min(HERO_CARDS.length, shuffled.length);

  return HERO_CARDS.slice(0, count).map((card, i) => ({
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
