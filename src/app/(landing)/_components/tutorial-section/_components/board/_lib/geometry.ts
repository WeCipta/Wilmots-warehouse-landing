import { pointerWithin, closestCenter, type CollisionDetection } from "@dnd-kit/core";
import type { CardPlacement, PlacedCard, PlacedCustomer } from "../../context";
import {
  cellId,
  parseCellId,
  frameFromRect,
} from "@/app/(landing)/_lib/card-dnd";
import {
  GRID_ROWS,
  MISMATCH_REVEAL_OFFSET,
  PLAYABLE_COLS,
  PLAYABLE_ROWS,
  ROTATION_FROM_TOP,
} from "./constants";

export { cellId, parseCellId, frameFromRect };

export function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

export function stackRotate(index: number, total: number) {
  if (total <= 1) return 0;
  const fromTop = total - 1 - index;
  return ROTATION_FROM_TOP[fromTop] ?? 0;
}

export function shuffleCells<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function hasOrthogonalNeighbor(
  col: number,
  row: number,
  occupied: Set<string>
) {
  return (
    occupied.has(`${col - 1}-${row}`) ||
    occupied.has(`${col + 1}-${row}`) ||
    occupied.has(`${col}-${row - 1}`) ||
    occupied.has(`${col}-${row + 1}`)
  );
}

export function violatesRule(card: PlacedCard, occupied: Set<string>) {
  if (!card.snapped || card.col == null || card.row == null) return false;
  if (card.col === 0) return true;
  if (card.row === GRID_ROWS - 1) return true;
  const others = new Set(occupied);
  others.delete(`${card.col}-${card.row}`);
  return !hasOrthogonalNeighbor(card.col, card.row, others);
}

export function isPlayableCell(col: number, row: number) {
  return (
    col >= 0 &&
    col < PLAYABLE_COLS &&
    row >= GRID_ROWS - PLAYABLE_ROWS &&
    row < GRID_ROWS
  );
}

export function interiorCells() {
  const cells: { col: number; row: number }[] = [];
  for (let row = GRID_ROWS - PLAYABLE_ROWS; row < GRID_ROWS - 1; row++) {
    for (let col = 1; col < PLAYABLE_COLS; col++) {
      cells.push({ col, row });
    }
  }
  return cells;
}

export function legalizeViolatingCards(
  cards: PlacedCard[],
  cellPx: number,
  pad: number
): { id: string; placement: CardPlacement }[] {
  const occupied = new Set<string>();
  for (const card of cards) {
    if (!card.snapped || card.col == null || card.row == null) continue;
    occupied.add(`${card.col}-${card.row}`);
  }

  const violators = cards.filter((card) => violatesRule(card, occupied));
  if (violators.length === 0) return [];

  for (const card of violators) {
    if (card.col == null || card.row == null) continue;
    occupied.delete(`${card.col}-${card.row}`);
  }

  const relocations: { id: string; placement: CardPlacement }[] = [];
  const slots = interiorCells();

  for (const card of violators) {
    const empty = slots.filter(
      (cell) => !occupied.has(`${cell.col}-${cell.row}`)
    );
    const adjacent = empty.filter((cell) =>
      hasOrthogonalNeighbor(cell.col, cell.row, occupied)
    );
    const pick = (adjacent.length > 0 ? adjacent : empty)[0];
    if (!pick) continue;
    occupied.add(`${pick.col}-${pick.row}`);
    relocations.push({
      id: card.id,
      placement: {
        snapped: true,
        col: pick.col,
        row: pick.row,
        x: pick.col * cellPx + pad,
        y: pick.row * cellPx + pad,
      },
    });
  }

  return relocations;
}

export function pickEmptyCells(
  count: number,
  occupied: Set<string>,
  cellPx: number,
  pad: number
): CardPlacement[] {
  const empty: { col: number; row: number }[] = [];
  const minRow = GRID_ROWS - PLAYABLE_ROWS;

  for (let row = minRow; row < GRID_ROWS; row++) {
    for (let col = 0; col < PLAYABLE_COLS; col++) {
      if (occupied.has(`${col}-${row}`)) continue;
      empty.push({ col, row });
    }
  }

  return shuffleCells(empty)
    .slice(0, count)
    .map(({ col, row }) => ({
      snapped: true,
      col,
      row,
      x: col * cellPx + pad,
      y: row * cellPx + pad,
    }));
}

export function productDropId(id: string) {
  return `product-${id}`;
}

export function parseProductId(id: string): string | null {
  const match = /^product-(.+)$/.exec(id);
  return match ? match[1] : null;
}

export const collisionDetection: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  const products = pointer.filter((hit) =>
    String(hit.id).startsWith("product-")
  );
  if (products.length > 0) return products;
  const cells = pointer.filter((hit) => String(hit.id).startsWith("cell-"));
  if (cells.length > 0) return cells;
  if (pointer.length > 0) return pointer;
  return closestCenter(args);
};

export function cardBoxStyle(
  card: PlacedCard,
  cardSize: number,
  boardCellPx: number,
  cellPad: number
) {
  return {
    left: card.snapped
      ? (card.col ?? 0) * boardCellPx + cellPad
      : card.x,
    top: card.snapped
      ? (card.row ?? 0) * boardCellPx + cellPad
      : card.y,
    width: cardSize,
    height: cardSize,
  };
}

export type ScorePenalty = {
  key: string;
  left: number;
  top: number;
  snapped: boolean;
  index: number;
};

export function scorePenalties(
  placedCards: PlacedCard[],
  placedCustomers: PlacedCustomer[],
  cardSize: number,
  boardCellPx: number,
  cellPad: number
): ScorePenalty[] {
  const penalties: Omit<ScorePenalty, "index">[] = [];
  const byProduct = new Map<string, PlacedCustomer>();
  for (const customer of placedCustomers) {
    if (customer.productId) byProduct.set(customer.productId, customer);
  }

  for (const card of placedCards) {
    const customer = byProduct.get(card.id);
    const box = cardBoxStyle(card, cardSize, boardCellPx, cellPad);
    if (!customer) {
      penalties.push({
        key: `empty-${card.id}`,
        left: box.left,
        top: box.top,
        snapped: card.snapped,
      });
      continue;
    }
    if (customer.faceSrc !== card.faceSrc) {
      penalties.push({
        key: `mismatch-${customer.customerSrc}`,
        left: box.left + MISMATCH_REVEAL_OFFSET,
        top: box.top + MISMATCH_REVEAL_OFFSET,
        snapped: card.snapped,
      });
    }
  }

  for (const customer of placedCustomers) {
    if (customer.productId) continue;
    penalties.push({
      key: `stray-${customer.customerSrc}`,
      left: customer.snapped
        ? (customer.col ?? 0) * boardCellPx + cellPad
        : customer.x,
      top: customer.snapped
        ? (customer.row ?? 0) * boardCellPx + cellPad
        : customer.y,
      snapped: customer.snapped,
    });
  }

  return penalties.map((penalty, index) => ({ ...penalty, index }));
}
