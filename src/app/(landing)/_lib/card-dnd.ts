import {
  pointerWithin,
  closestCenter,
  type CollisionDetection,
} from "@dnd-kit/core";
import type { FollowFrame } from "@/components/follow-mouse";

export const CARD_RADIUS = 10;

export function cellId(col: number, row: number) {
  return `cell-${col}-${row}`;
}

export function parseCellId(id: string): { col: number; row: number } | null {
  const match = /^cell-(\d+)-(\d+)$/.exec(id);
  if (!match) return null;
  return { col: Number(match[1]), row: Number(match[2]) };
}

export function frameFromRect(rect: {
  left: number;
  top: number;
  width: number;
  height: number;
}): FollowFrame {
  return {
    x: rect.left,
    y: rect.top,
    width: rect.width,
    height: rect.height,
    radius: CARD_RADIUS,
  };
}

export const pointerThenClosest: CollisionDetection = (args) => {
  const pointer = pointerWithin(args);
  if (pointer.length > 0) return pointer;
  return closestCenter(args);
};
