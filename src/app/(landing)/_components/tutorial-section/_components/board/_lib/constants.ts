export const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
export const GRID_COLS = 20;
export const GRID_ROWS = 8;
export const PLAYABLE_COLS = 4;
export const PLAYABLE_ROWS = 5;
export const DECORATIVE_BACKS = 3;
export const PILE_ID = "monday-pile";
export const RULE_PILE_ID = "tuesday-rule";
export const RULE_PLACED_ID = "placed-rule";
export const PLAY_AREA_ID = "play-area";
export const ROTATION_FROM_TOP = [2, -5, 6, -8];
export const MONDAY_JIGGLE = 3;
export const CUSTOMER_STACK_OFFSET = 8;
export const MISMATCH_REVEAL_OFFSET = 22;

export type DragData =
  | { kind: "pile"; faceSrc: string }
  | { kind: "placed"; id: string; faceSrc: string }
  | { kind: "rule" }
  | { kind: "placed-rule" }
  | { kind: "customer"; customerSrc: string; faceSrc: string }
  | { kind: "placed-customer"; customerSrc: string; faceSrc: string };
