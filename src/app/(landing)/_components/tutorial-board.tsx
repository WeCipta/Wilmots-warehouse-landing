"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";
import { CARD_BACK_SRC } from "@/lib/card-faces";
import { useFollowMouse, type FollowFrame } from "@/components/follow-mouse";
import { useFinePointer } from "@/hooks/use-fine-pointer";
import { useGridMetrics } from "@/hooks/use-grid-metrics";
import { cn } from "@/lib/utils";
import { useRandomAccent } from "@/hooks/use-random-accent";
import {
  TUTORIAL_DISCUSS_STEP,
  TUTORIAL_MATCH_STEP,
  TUTORIAL_REPEAT_STEP,
  TUTORIAL_RULE_STEP,
  TUTORIAL_SCORE_STEP,
  useTutorialBoard,
  type CardPlacement,
  type PlacedCard,
  type PlacedCustomer,
  type RulePlacement,
} from "./tutorial-context";
import { TutorialBubble } from "./tutorial-bubble";
import { TutorialScoreboard } from "./tutorial-scoreboard";
import {
  TUTORIAL_INSIDER_RULE_SRC,
  TUTORIAL_INTRO,
  TUTORIAL_RULE_SRC,
} from "./tutorial-data";

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;
const GRID_COLS = 20;
const GRID_ROWS = 8;
const PLAYABLE_COLS = 4;
const PLAYABLE_ROWS = 5;
const DECORATIVE_BACKS = 3;
const PILE_ID = "monday-pile";
const RULE_PILE_ID = "tuesday-rule";
const RULE_PLACED_ID = "placed-rule";
const PLAY_AREA_ID = "play-area";
const ROTATION_FROM_TOP = [2, -5, 6, -8];
const CARD_RADIUS = 10;
const MONDAY_JIGGLE = 3;
const CUSTOMER_STACK_OFFSET = 8;
const MISMATCH_REVEAL_OFFSET = 22;

type DragData =
  | { kind: "pile"; faceSrc: string }
  | { kind: "placed"; id: string; faceSrc: string }
  | { kind: "rule" }
  | { kind: "placed-rule" }
  | { kind: "customer"; customerSrc: string; faceSrc: string }
  | { kind: "placed-customer"; customerSrc: string; faceSrc: string };

function clamp(value: number, min: number, max: number) {
  return Math.min(max, Math.max(min, value));
}

function stackRotate(index: number, total: number) {
  if (total <= 1) return 0;
  const fromTop = total - 1 - index;
  return ROTATION_FROM_TOP[fromTop] ?? 0;
}

function shuffleCells<T>(items: T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

function hasOrthogonalNeighbor(
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

function violatesRule(card: PlacedCard, occupied: Set<string>) {
  if (!card.snapped || card.col == null || card.row == null) return false;
  if (card.col === 0) return true;
  if (card.row === GRID_ROWS - 1) return true;
  const others = new Set(occupied);
  others.delete(`${card.col}-${card.row}`);
  return !hasOrthogonalNeighbor(card.col, card.row, others);
}

function showsStoryBubbles(step: string) {
  return step === TUTORIAL_DISCUSS_STEP || step === TUTORIAL_REPEAT_STEP;
}

function isRuleDrag(
  data: DragData | null
): data is Extract<DragData, { kind: "rule" | "placed-rule" }> {
  return data?.kind === "rule" || data?.kind === "placed-rule";
}

function isCustomerDrag(
  data: DragData | null
): data is Extract<DragData, { kind: "customer" | "placed-customer" }> {
  return data?.kind === "customer" || data?.kind === "placed-customer";
}

function selectionKey(data: DragData): string {
  switch (data.kind) {
    case "pile":
      return "pile";
    case "placed":
      return data.id;
    case "rule":
      return "rule";
    case "placed-rule":
      return "placed-rule";
    case "customer":
      return `customer:${data.customerSrc}`;
    case "placed-customer":
      return `placed-customer:${data.customerSrc}`;
  }
}

type TapOrigin = { x: number; y: number; scroll: number };

function readTapOrigin(e: { clientX: number; clientY: number }): TapOrigin {
  return { x: e.clientX, y: e.clientY, scroll: window.scrollY };
}

function isTap(
  origin: TapOrigin | null,
  e: { clientX: number; clientY: number }
) {
  if (!origin) return false;
  if (Math.abs(window.scrollY - origin.scroll) > 14) return false;
  return Math.hypot(e.clientX - origin.x, e.clientY - origin.y) < 18;
}

function usePointerTap() {
  const origin = useRef<TapOrigin | null>(null);
  return {
    onPointerDown: (e: React.PointerEvent) => {
      origin.current = readTapOrigin(e);
    },
    consumeTap: (e: React.PointerEvent) => {
      const ok = isTap(origin.current, e);
      origin.current = null;
      return ok;
    },
  };
}

function SelectionOutline({
  selected,
  color,
}: {
  selected: boolean;
  color?: string;
}) {
  if (!selected || !color) return null;
  return (
    <span
      aria-hidden
      className="pointer-events-none absolute inset-0 z-20 rounded-[6px]"
      style={{ boxShadow: `0 0 0 4px ${color}` }}
    />
  );
}

function isPlayableCell(col: number, row: number) {
  return (
    col >= 0 &&
    col < PLAYABLE_COLS &&
    row >= GRID_ROWS - PLAYABLE_ROWS &&
    row < GRID_ROWS
  );
}

function interiorCells() {
  const cells: { col: number; row: number }[] = [];
  for (let row = GRID_ROWS - PLAYABLE_ROWS; row < GRID_ROWS - 1; row++) {
    for (let col = 1; col < PLAYABLE_COLS; col++) {
      cells.push({ col, row });
    }
  }
  return cells;
}

function legalizeViolatingCards(
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

function pickEmptyCells(
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

function cellId(col: number, row: number) {
  return `cell-${col}-${row}`;
}

function parseCellId(id: string): { col: number; row: number } | null {
  const match = /^cell-(\d+)-(\d+)$/.exec(id);
  if (!match) return null;
  return { col: Number(match[1]), row: Number(match[2]) };
}

function productDropId(id: string) {
  return `product-${id}`;
}

function parseProductId(id: string): string | null {
  const match = /^product-(.+)$/.exec(id);
  return match ? match[1] : null;
}

function frameFromRect(rect: {
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

const collisionDetection: CollisionDetection = (args) => {
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

function DayColumnPile({
  hidden,
  delay,
  children,
}: {
  hidden: boolean;
  delay: number;
  children: React.ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      gsap.killTweensOf(el);
      if (!readyRef.current) {
        readyRef.current = true;
        gsap.set(el, hidden ? { autoAlpha: 0, y: 28 } : { autoAlpha: 1, y: 0 });
        return;
      }
      if (hidden) {
        gsap.to(el, {
          autoAlpha: 0,
          y: 28,
          duration: 0.35,
          delay,
          ease: "power2.in",
        });
        return;
      }
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        delay,
        ease: "back.out(1.3)",
      });
    },
    { scope: rootRef, dependencies: [hidden, delay] }
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex flex-1 justify-center",
        hidden && "pointer-events-none"
      )}
    >
      {children}
    </div>
  );
}

function DecorativeDayStack({ cardSize }: { cardSize: number }) {
  const total = DECORATIVE_BACKS + 1;

  return (
    <div
      className="pointer-events-none relative"
      style={{ width: cardSize, height: cardSize }}
    >
      {Array.from({ length: DECORATIVE_BACKS }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            transform: `rotate(${stackRotate(i, total)}deg)`,
            zIndex: i,
          }}
        >
          <GameCard src={CARD_BACK_SRC} alt="" size={cardSize} />
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{
          transform: `rotate(${stackRotate(DECORATIVE_BACKS, total)}deg)`,
          zIndex: DECORATIVE_BACKS,
        }}
      >
        <GameCard src={TUTORIAL_RULE_SRC} alt="Rule card" size={cardSize} />
      </div>
    </div>
  );
}

function DraggableTuesdayRule({
  cardSize,
  dragging,
  jiggle,
  tapPlace,
  selected,
  outlineColor,
  onTap,
}: {
  cardSize: number;
  dragging: boolean;
  jiggle: boolean;
  tapPlace?: boolean;
  selected?: boolean;
  outlineColor?: string;
  onTap?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: RULE_PILE_ID,
      data: { kind: "rule" } satisfies DragData,
      disabled: tapPlace,
    });
  const tap = usePointerTap();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative touch-none",
        tapPlace ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: dragging || isDragging ? 0 : 1,
      }}
      {...(tapPlace ? {} : { ...listeners, ...attributes })}
      onPointerDown={(e) => {
        tap.onPointerDown(e);
        if (tapPlace) {
          e.stopPropagation();
          return;
        }
        listeners?.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        if (!tapPlace || !onTap || !tap.consumeTap(e)) return;
        e.stopPropagation();
        onTap();
      }}
    >
      <GameCard
        src={TUTORIAL_RULE_SRC}
        alt="Rule card"
        size={cardSize}
        jiggleEvery={dragging || isDragging || !jiggle ? undefined : MONDAY_JIGGLE}
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

function TuesdayRuleStack({
  cardSize,
  canDraw,
  dragging,
  showRule,
  tapPlace,
  selected,
  outlineColor,
  onTap,
}: {
  cardSize: number;
  canDraw: boolean;
  dragging: boolean;
  showRule: boolean;
  tapPlace?: boolean;
  selected?: boolean;
  outlineColor?: string;
  onTap?: () => void;
}) {
  const total = DECORATIVE_BACKS + (showRule ? 1 : 0);

  return (
    <div className="relative" style={{ width: cardSize, height: cardSize }}>
      {Array.from({ length: DECORATIVE_BACKS }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            transform: `rotate(${stackRotate(i, total)}deg)`,
            zIndex: i,
          }}
        >
          <GameCard src={CARD_BACK_SRC} alt="" size={cardSize} />
        </div>
      ))}
      {showRule ? (
        <div
          className="absolute inset-0"
          style={{
            transform: `rotate(${stackRotate(DECORATIVE_BACKS, total)}deg)`,
            zIndex: DECORATIVE_BACKS,
          }}
        >
          {canDraw ? (
            <DraggableTuesdayRule
              cardSize={cardSize}
              dragging={dragging}
              jiggle
              tapPlace={tapPlace}
              selected={selected}
              outlineColor={outlineColor}
              onTap={onTap}
            />
          ) : (
            <GameCard src={TUTORIAL_RULE_SRC} alt="Rule card" size={cardSize} />
          )}
        </div>
      ) : null}
    </div>
  );
}

function PlacedInsiderRule({
  placement,
  size,
  dragging,
  visible,
  tapPlace,
  selected,
  outlineColor,
  onTap,
}: {
  placement: RulePlacement;
  size: number;
  dragging: boolean;
  visible: boolean;
  tapPlace?: boolean;
  selected?: boolean;
  outlineColor?: string;
  onTap?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: RULE_PLACED_ID,
      data: { kind: "placed-rule" } satisfies DragData,
      disabled: !visible || tapPlace,
    });
  const animRef = useRef<HTMLDivElement>(null);
  const tap = usePointerTap();

  useGSAP(
    () => {
      const el = animRef.current;
      if (!el) return;
      gsap.killTweensOf(el);
      if (visible) {
        gsap.fromTo(
          el,
          { autoAlpha: 0, y: 20 },
          { autoAlpha: 1, y: 0, duration: 0.35, ease: "power2.out" }
        );
        return;
      }
      gsap.to(el, {
        autoAlpha: 0,
        y: 32,
        duration: 0.3,
        ease: "power2.in",
      });
    },
    { scope: animRef, dependencies: [visible] }
  );

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute touch-none",
        visible
          ? tapPlace
            ? "pointer-events-auto cursor-pointer"
            : "pointer-events-auto cursor-grab active:cursor-grabbing"
          : "pointer-events-none"
      )}
      style={{
        left: placement.x,
        top: placement.y,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 60 : 45,
        opacity: dragging || isDragging ? 0 : 1,
      }}
      {...(tapPlace || !visible ? {} : { ...listeners, ...attributes })}
      onPointerDown={(e) => {
        if (!visible) return;
        tap.onPointerDown(e);
        if (tapPlace) {
          e.stopPropagation();
          return;
        }
        listeners?.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        if (!visible || !tapPlace || !onTap || !tap.consumeTap(e)) return;
        e.stopPropagation();
        onTap();
      }}
    >
      <div ref={animRef} className="opacity-0">
        <GameCard
          src={TUTORIAL_INSIDER_RULE_SRC}
          alt="Insider rule"
          size={size}
        />
      </div>
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

function WarehouseCell({
  col,
  row,
  cellPx,
  occupied,
  disabled,
  allowOccupied,
  tapPlace,
  onTap,
}: {
  col: number;
  row: number;
  cellPx: number;
  occupied: boolean;
  disabled?: boolean;
  allowOccupied?: boolean;
  tapPlace?: boolean;
  onTap?: (col: number, row: number, clientX: number, clientY: number) => void;
}) {
  const playable = isPlayableCell(col, row);
  const { setNodeRef, isOver } = useDroppable({
    id: cellId(col, row),
    disabled: !playable || disabled || (occupied && !allowOccupied),
  });
  const tap = usePointerTap();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "border border-white/20 bg-background",
        isOver && (!occupied || allowOccupied) && "bg-white/10"
      )}
      style={{ width: cellPx, height: cellPx }}
      onPointerDown={tapPlace ? tap.onPointerDown : undefined}
      onPointerUp={(e) => {
        if (!tapPlace || !onTap || !tap.consumeTap(e)) return;
        e.stopPropagation();
        onTap(col, row, e.clientX, e.clientY);
      }}
    />
  );
}

function PlayArea({
  children,
  playAreaRef,
  tapPlace,
  onTap,
}: {
  children: React.ReactNode;
  playAreaRef: React.MutableRefObject<HTMLDivElement | null>;
  tapPlace?: boolean;
  onTap?: (clientX: number, clientY: number) => void;
}) {
  const { setNodeRef } = useDroppable({ id: PLAY_AREA_ID });
  const tap = usePointerTap();

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      playAreaRef.current = node;
      setNodeRef(node);
    },
    [playAreaRef, setNodeRef]
  );

  return (
    <div
      ref={setRefs}
      className="relative flex h-full flex-col justify-end overflow-hidden"
      onPointerDown={tapPlace ? tap.onPointerDown : undefined}
      onPointerUp={(e) => {
        if (!tapPlace || !onTap || !tap.consumeTap(e)) return;
        onTap(e.clientX, e.clientY);
      }}
    >
      {children}
    </div>
  );
}

function DraggableCustomerPileCard({
  customerSrc,
  faceSrc,
  cardSize,
  dragging,
  tapPlace,
  selected,
  outlineColor,
  onTap,
}: {
  customerSrc: string;
  faceSrc: string;
  cardSize: number;
  dragging: boolean;
  tapPlace?: boolean;
  selected?: boolean;
  outlineColor?: string;
  onTap?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `customer-${customerSrc}`,
      data: { kind: "customer", customerSrc, faceSrc } satisfies DragData,
      disabled: tapPlace,
    });
  const tap = usePointerTap();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative touch-none",
        tapPlace ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: dragging || isDragging ? 0 : 1,
      }}
      {...(tapPlace ? {} : { ...listeners, ...attributes })}
      onPointerDown={(e) => {
        tap.onPointerDown(e);
        if (tapPlace) {
          e.stopPropagation();
          return;
        }
        listeners?.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        if (!tapPlace || !onTap || !tap.consumeTap(e)) return;
        e.stopPropagation();
        onTap();
      }}
    >
      <GameCard
        src={faceSrc}
        backSrc={customerSrc}
        alt="Customer"
        size={cardSize}
        flipped={!!selected}
        jiggleEvery={dragging || isDragging ? undefined : MONDAY_JIGGLE}
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

function CustomerStack({
  pile,
  customers,
  cardSize,
  canDraw,
  draggingSrc,
  tapPlace,
  selectedSrc,
  outlineColor,
  onTap,
}: {
  pile: string[];
  customers: { customerSrc: string; faceSrc: string }[];
  cardSize: number;
  canDraw: boolean;
  draggingSrc?: string;
  tapPlace?: boolean;
  selectedSrc?: string;
  outlineColor?: string;
  onTap?: (customerSrc: string, faceSrc: string) => void;
}) {
  const bySrc = new Map(
    customers.map((customer) => [customer.customerSrc, customer])
  );

  if (pile.length === 0) {
    return <div style={{ width: cardSize, height: cardSize }} />;
  }

  return (
    <div className="relative" style={{ width: cardSize, height: cardSize }}>
      {pile.map((customerSrc, i) => {
        const kit = bySrc.get(customerSrc);
        if (!kit) return null;
        const isTop = i === pile.length - 1;
        return (
          <div
            key={customerSrc}
            className="absolute inset-0"
            style={{
              transform: `rotate(${stackRotate(i, pile.length)}deg)`,
              zIndex: i,
            }}
          >
            {isTop && canDraw ? (
              <DraggableCustomerPileCard
                customerSrc={kit.customerSrc}
                faceSrc={kit.faceSrc}
                cardSize={cardSize}
                dragging={draggingSrc === kit.customerSrc}
                tapPlace={tapPlace}
                selected={selectedSrc === kit.customerSrc}
                outlineColor={outlineColor}
                onTap={() => onTap?.(kit.customerSrc, kit.faceSrc)}
              />
            ) : (
              <GameCard
                src={kit.customerSrc}
                alt="Customer"
                size={cardSize}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function StackedCustomer({
  customer,
  cardSize,
  left,
  top,
  dragging,
  canDrag,
  revealFace,
  tapPlace,
  selected,
  outlineColor,
  onTap,
}: {
  customer: PlacedCustomer;
  cardSize: number;
  left: number;
  top: number;
  dragging: boolean;
  canDrag: boolean;
  revealFace: boolean;
  tapPlace?: boolean;
  selected?: boolean;
  outlineColor?: string;
  onTap?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `placed-customer-${customer.customerSrc}`,
      data: {
        kind: "placed-customer",
        customerSrc: customer.customerSrc,
        faceSrc: customer.faceSrc,
      } satisfies DragData,
      disabled: !canDrag || tapPlace,
    });
  const tap = usePointerTap();
  const interactive = canDrag;

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "absolute touch-none",
        interactive
          ? tapPlace
            ? "pointer-events-auto cursor-pointer"
            : "pointer-events-auto cursor-grab active:cursor-grabbing"
          : "pointer-events-none"
      )}
      style={{
        left,
        top,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 30,
        opacity: dragging || isDragging ? 0 : 1,
      }}
      {...(canDrag && !tapPlace ? { ...listeners, ...attributes } : {})}
      onPointerDown={(e) => {
        if (!interactive) return;
        tap.onPointerDown(e);
        if (tapPlace) {
          e.stopPropagation();
          return;
        }
        listeners?.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        if (!tapPlace || !onTap || !tap.consumeTap(e)) return;
        e.stopPropagation();
        onTap();
      }}
    >
      <GameCard
        src={customer.faceSrc}
        backSrc={customer.customerSrc}
        alt="Customer"
        size={cardSize}
        flipped={revealFace || !!selected}
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

function DraggablePileCard({
  faceSrc,
  cardSize,
  dragging,
  tapPlace,
  selected,
  outlineColor,
  onTap,
}: {
  faceSrc: string;
  cardSize: number;
  dragging: boolean;
  tapPlace?: boolean;
  selected?: boolean;
  outlineColor?: string;
  onTap?: () => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: PILE_ID,
      data: { kind: "pile", faceSrc } satisfies DragData,
      disabled: tapPlace,
    });
  const tap = usePointerTap();

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "relative touch-none",
        tapPlace ? "cursor-pointer" : "cursor-grab active:cursor-grabbing"
      )}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: dragging || isDragging ? 0 : 1,
      }}
      {...(tapPlace ? {} : { ...listeners, ...attributes })}
      onPointerDown={(e) => {
        tap.onPointerDown(e);
        if (tapPlace) {
          e.stopPropagation();
          return;
        }
        listeners?.onPointerDown?.(e);
      }}
      onPointerUp={(e) => {
        if (!tapPlace || !onTap || !tap.consumeTap(e)) return;
        e.stopPropagation();
        onTap();
      }}
    >
      <GameCard
        src={CARD_BACK_SRC}
        alt=""
        size={cardSize}
        jiggleEvery={dragging || isDragging ? undefined : MONDAY_JIGGLE}
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

function MondayStack({
  pile,
  cardSize,
  canDraw,
  draggingPile,
  tapPlace,
  selected,
  outlineColor,
  onTap,
}: {
  pile: string[];
  cardSize: number;
  canDraw: boolean;
  draggingPile: boolean;
  tapPlace?: boolean;
  selected?: boolean;
  outlineColor?: string;
  onTap?: (faceSrc: string) => void;
}) {
  if (pile.length === 0) {
    return <div style={{ width: cardSize, height: cardSize }} />;
  }

  return (
    <div className="relative" style={{ width: cardSize, height: cardSize }}>
      {pile.map((faceSrc, i) => {
        const isTop = i === pile.length - 1;
        return (
          <div
            key={faceSrc}
            className="absolute inset-0"
            style={{
              transform: `rotate(${stackRotate(i, pile.length)}deg)`,
              zIndex: i,
            }}
          >
            {isTop && canDraw ? (
              <DraggablePileCard
                faceSrc={faceSrc}
                cardSize={cardSize}
                dragging={draggingPile}
                tapPlace={tapPlace}
                selected={selected}
                outlineColor={outlineColor}
                onTap={() => onTap?.(faceSrc)}
              />
            ) : (
              <GameCard
                src={CARD_BACK_SRC}
                alt=""
                size={cardSize}
                jiggleEvery={MONDAY_JIGGLE}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

function cardBoxStyle(
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

type ScorePenalty = {
  key: string;
  left: number;
  top: number;
  snapped: boolean;
  index: number;
};

function scorePenalties(
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

function ScoreFloat({
  left,
  top,
  cardSize,
  visible,
  delay,
}: {
  left: number;
  top: number;
  cardSize: number;
  visible: boolean;
  delay: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      gsap.killTweensOf(el);
      if (!visible) {
        gsap.set(el, { autoAlpha: 0, y: 0 });
        return;
      }
      gsap.fromTo(
        el,
        { y: 16, autoAlpha: 0, scale: 0.7 },
        {
          y: -12,
          autoAlpha: 1,
          scale: 1,
          duration: 0.55,
          delay,
          ease: "back.out(1.4)",
        }
      );
    },
    { scope: rootRef, dependencies: [visible, delay] }
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute z-50 flex items-center justify-center text-4xl font-black text-red-500 opacity-0 [-webkit-text-stroke:4px_white] [paint-order:stroke_fill] sm:text-5xl"
      style={{ left, top, width: cardSize, height: cardSize }}
    >
      +10s
    </div>
  );
}

function TutorialCardBubbles({
  cards,
  startIndex,
  cardSize,
  boardCellPx,
  cellPad,
  hideId,
}: {
  cards: PlacedCard[];
  startIndex: number;
  cardSize: number;
  boardCellPx: number;
  cellPad: number;
  hideId?: string;
}) {
  const { activeStep, bubbleText, setBubbleText } = useTutorialBoard();
  if (!showsStoryBubbles(activeStep)) return null;

  return cards.map((card, index) => {
    if (card.id === hideId) return null;
    return (
      <div
        key={card.id}
        className="absolute"
        style={cardBoxStyle(card, cardSize, boardCellPx, cellPad)}
      >
        <TutorialBubble
          faceSrc={card.faceSrc}
          text={bubbleText[card.faceSrc] ?? ""}
          onChange={(value) => setBubbleText(card.faceSrc, value)}
          visible
          delay={(startIndex + index) * 0.08}
        />
      </div>
    );
  });
}

function DraggablePlacedCard({
  card,
  cardSize,
  cellPad,
  dragging,
  lensEnabled,
  flipped,
  draggingRef,
  didDragRef,
  onToggleFlip,
  jiggleEvery,
  locked,
  dropTarget,
  faceUp,
  tapPlace,
  selected,
  outlineColor,
  onTap,
}: {
  card: PlacedCard;
  cardSize: number;
  cellPad: number;
  dragging: boolean;
  lensEnabled: boolean;
  flipped: boolean;
  draggingRef: React.MutableRefObject<boolean>;
  didDragRef: React.MutableRefObject<boolean>;
  onToggleFlip: (id: string) => void;
  jiggleEvery?: number;
  locked: boolean;
  dropTarget: boolean;
  faceUp?: boolean;
  tapPlace?: boolean;
  selected?: boolean;
  outlineColor?: string;
  onTap?: () => void;
}) {
  const { attributes, listeners, setNodeRef: setDragRef, transform, isDragging } =
    useDraggable({
      id: card.id,
      data: {
        kind: "placed",
        id: card.id,
        faceSrc: card.faceSrc,
      } satisfies DragData,
      disabled: locked || tapPlace,
    });
  const { setNodeRef: setDropRef, isOver } = useDroppable({
    id: productDropId(card.id),
    disabled: !dropTarget,
  });
  const { setFollowFrame } = useFollowMouse();
  const wrapRef = useRef<HTMLDivElement>(null);
  const tap = usePointerTap();
  const snapped = card.snapped;
  const useLens = snapped && lensEnabled && !locked;

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      wrapRef.current = node;
      setDragRef(node);
      setDropRef(node);
    },
    [setDragRef, setDropRef]
  );

  const syncFrameFromCard = useCallback(() => {
    if (!useLens) return;
    const el = wrapRef.current?.querySelector<HTMLElement>("[data-game-card]");
    if (!el) return;
    setFollowFrame(frameFromRect(el.getBoundingClientRect()));
  }, [useLens, setFollowFrame]);

  return (
    <div
      ref={setRefs}
      data-tutorial-drag={card.id}
      className={cn(
        "pointer-events-auto absolute overflow-visible touch-none",
        locked
          ? tapPlace
            ? "cursor-pointer"
            : ""
          : useLens
            ? "cursor-none"
            : tapPlace
              ? "cursor-pointer"
              : "cursor-grab active:cursor-grabbing",
        isOver && dropTarget && "ring-2 ring-white/40"
      )}
      style={{
        left: snapped ? (card.col ?? 0) * (cardSize + cellPad * 2) + cellPad : card.x,
        top: snapped ? (card.row ?? 0) * (cardSize + cellPad * 2) + cellPad : card.y,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 50 : 20,
        opacity: dragging || isDragging ? 0 : 1,
      }}
      {...(locked || tapPlace ? {} : { ...listeners, ...attributes })}
      onPointerDown={(e) => {
        tap.onPointerDown(e);
        if (tapPlace) {
          e.stopPropagation();
          return;
        }
        if (locked) return;
        didDragRef.current = false;
        listeners?.onPointerDown?.(e);
        syncFrameFromCard();
      }}
      onPointerUp={(e) => {
        if (!draggingRef.current) setFollowFrame(null);
        if (!tapPlace || !onTap || !tap.consumeTap(e)) return;
        e.stopPropagation();
        onTap();
      }}
      onPointerCancel={() => {
        if (!draggingRef.current) setFollowFrame(null);
      }}
      onClick={() => {
        if (tapPlace || locked || !snapped || useLens || didDragRef.current) {
          return;
        }
        onToggleFlip(card.id);
      }}
    >
      <GameCard
        src={card.faceSrc}
        alt=""
        size={cardSize}
        lens={useLens}
        jiggle={false}
        jiggleEvery={jiggleEvery}
        flipped={
          faceUp ? true : useLens || !snapped ? undefined : flipped
        }
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

export function TutorialBoard() {
  const grid = useGridMetrics();
  const isMobile = grid.breakpoint === "mobile";
  const isTablet = grid.breakpoint === "tablet";
  const lensEnabled = useFinePointer();
  const { setFollowFrame } = useFollowMouse();
  const {
    mondayPile,
    placedCards,
    customers,
    customerPile,
    placedCustomers,
    rulePlacement,
    canDrawMonday,
    canDrawRule,
    visibilityByStep,
    activeStep,
    bubbleText,
    placeFromPile,
    movePlacedCard,
    returnPlacedToPile,
    seedRemainingCards,
    relocatePlacedCards,
    placeRule,
    returnRuleToTuesday,
    placeCustomer,
    returnCustomer,
    clearCustomers,
  } = useTutorialBoard();

  const leftW = isMobile ? 0 : isTablet ? 44 : 56;
  const cardSize = isMobile ? 80 : isTablet ? 88 : 96;
  const ruleSize = isMobile ? 168 : isTablet ? 200 : 280;
  const cardsGap = isMobile ? 20 : isTablet ? 28 : 32;
  const boardCellPx = cardSize + cardsGap;
  const cellPad = cardsGap / 2;
  const cardsH = cardSize + cardsGap;
  const cardsBottom = cardsGap;
  const visibleDays = isMobile || isTablet ? 3 : DAYS.length;
  const dayStripAspect = `${visibleDays * 1077} / 516`;
  const dayStripWidth = `${(DAYS.length / visibleDays) * 100}%`;

  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const [dndReady, setDndReady] = useState(false);
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);
  const [selection, setSelection] = useState<{
    step: string;
    data: DragData;
  } | null>(null);
  const selected = selection?.step === activeStep ? selection.data : null;
  const [flippedIds, setFlippedIds] = useState<Set<string>>(() => new Set());
  const [scoreboardActive, setScoreboardActive] = useState(false);
  const [scoreboardStep, setScoreboardStep] = useState(activeStep);
  if (scoreboardStep !== activeStep) {
    setScoreboardStep(activeStep);
    setScoreboardActive(false);
  }
  const { color: outlineColor, randomize: randomizeOutline } = useRandomAccent({
    persist: true,
  });
  const tapPlace = !lensEnabled;
  const draggingRef = useRef(false);
  const didDragRef = useRef(false);
  const prevStepRef = useRef(activeStep);

  useEffect(() => {
    setDndReady(true);
  }, []);

  useEffect(() => {
    if (placedCards.length === 0) setFlippedIds(new Set());
  }, [placedCards.length]);

  useEffect(() => {
    if (lensEnabled) setFlippedIds(new Set());
  }, [lensEnabled]);

  const discussRatio = visibilityByStep[TUTORIAL_DISCUSS_STEP] ?? 0;
  const ruleRatio = visibilityByStep[TUTORIAL_RULE_STEP] ?? 0;
  const matchRatio = visibilityByStep[TUTORIAL_MATCH_STEP] ?? 0;
  const seedRatio = Math.max(discussRatio, ruleRatio, matchRatio);
  const productsLocked = activeStep >= TUTORIAL_MATCH_STEP;
  const matchStep = activeStep === TUTORIAL_MATCH_STEP;
  const scoreStep = activeStep === TUTORIAL_SCORE_STEP;

  useEffect(() => {
    if (seedRatio < 0.5) return;
    if (mondayPile.length === 0) return;
    const occupied = new Set<string>();
    for (const card of placedCards) {
      if (!card.snapped || card.col == null || card.row == null) continue;
      occupied.add(`${card.col}-${card.row}`);
    }
    const placements = pickEmptyCells(
      mondayPile.length,
      occupied,
      boardCellPx,
      cellPad
    );
    if (placements.length === 0) return;
    seedRemainingCards(placements);
  }, [
    seedRatio,
    mondayPile.length,
    placedCards,
    boardCellPx,
    cellPad,
    seedRemainingCards,
  ]);

  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = activeStep;
    if (prev === TUTORIAL_MATCH_STEP && activeStep < TUTORIAL_MATCH_STEP) {
      clearCustomers();
    }
    if (activeStep === TUTORIAL_DISCUSS_STEP) {
      if (rulePlacement == null) return;
      if (prev === TUTORIAL_RULE_STEP) {
        const timeout = window.setTimeout(() => returnRuleToTuesday(), 320);
        return () => window.clearTimeout(timeout);
      }
      returnRuleToTuesday();
      return;
    }
    if (prev !== TUTORIAL_RULE_STEP && prev !== TUTORIAL_REPEAT_STEP) return;
    if (activeStep <= prev) return;
    const relocations = legalizeViolatingCards(
      placedCards,
      boardCellPx,
      cellPad
    );
    if (relocations.length === 0) return;
    relocatePlacedCards(relocations);
  }, [
    activeStep,
    rulePlacement,
    returnRuleToTuesday,
    placedCards,
    boardCellPx,
    cellPad,
    relocatePlacedCards,
    clearCustomers,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const movingPlacedId =
    activeDrag?.kind === "placed"
      ? activeDrag.id
      : selected?.kind === "placed"
        ? selected.id
        : undefined;

  const occupiedByOthers = useMemo(() => {
    const set = new Set<string>();
    for (const card of placedCards) {
      if (!card.snapped) continue;
      if (card.id === movingPlacedId) continue;
      if (card.col == null || card.row == null) continue;
      set.add(`${card.col}-${card.row}`);
    }
    return set;
  }, [placedCards, movingPlacedId]);

  const onToggleFlip = useCallback((id: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const freePlacementFromPoint = useCallback(
    (
      clientX: number,
      clientY: number,
      size = cardSize
    ): CardPlacement | null => {
      const play = playAreaRef.current;
      if (!play) return null;
      const rect = play.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }
      return {
        snapped: false,
        x: clamp(clientX - rect.left - size / 2, 0, Math.max(0, rect.width - size)),
        y: clamp(clientY - rect.top - size / 2, 0, Math.max(0, rect.height - size)),
      };
    },
    [cardSize]
  );

  const applyPlacement = useCallback(
    (data: DragData, placement: CardPlacement) => {
      if (data.kind === "pile") {
        placeFromPile(data.faceSrc, placement);
        return;
      }
      if (data.kind === "placed") {
        movePlacedCard(data.id, placement);
      }
    },
    [placeFromPile, movePlacedCard]
  );

  const selectCard = useCallback(
    (data: DragData) => {
      setSelection({ step: activeStep, data });
      randomizeOutline();
    },
    [randomizeOutline, activeStep]
  );

  const onTapSelectable = useCallback(
    (data: DragData) => {
      if (selected && selectionKey(selected) === selectionKey(data)) {
        setSelection(null);
        return;
      }
      selectCard(data);
    },
    [selected, selectCard]
  );

  const commitPlacement = useCallback(
    (
      data: DragData,
      overId: string,
      center: { x: number; y: number } | null,
      mode: "drag" | "tap"
    ) => {
      if (isCustomerDrag(data)) {
        const productId = parseProductId(overId);
        const cell = parseCellId(overId);
        const product = productId
          ? placedCards.find((card) => card.id === productId)
          : cell
            ? placedCards.find(
                (card) =>
                  card.snapped &&
                  card.col === cell.col &&
                  card.row === cell.row
              )
            : undefined;
        const stackedOn = product?.id ?? null;

        let placement: CardPlacement | null = null;
        if (product) {
          const offset = CUSTOMER_STACK_OFFSET;
          placement = {
            snapped: product.snapped,
            col: product.col,
            row: product.row,
            x: product.snapped
              ? (product.col ?? 0) * boardCellPx + cellPad + offset
              : product.x + offset,
            y: product.snapped
              ? (product.row ?? 0) * boardCellPx + cellPad + offset
              : product.y + offset,
          };
        } else if (cell && isPlayableCell(cell.col, cell.row)) {
          placement = {
            snapped: true,
            col: cell.col,
            row: cell.row,
            x: cell.col * boardCellPx + cellPad,
            y: cell.row * boardCellPx + cellPad,
          };
        }

        if (!placement) {
          if (mode === "drag" && data.kind === "placed-customer") {
            returnCustomer(data.customerSrc);
          }
          return false;
        }

        const nextPlacement = placement;
        const occupant = placedCustomers.some((placed) => {
          if (placed.customerSrc === data.customerSrc) return false;
          if (stackedOn && placed.productId === stackedOn) return true;
          return (
            nextPlacement.snapped &&
            placed.snapped &&
            placed.col === nextPlacement.col &&
            placed.row === nextPlacement.row
          );
        });

        if (!occupant) {
          placeCustomer(data.customerSrc, nextPlacement, stackedOn);
          return true;
        }
        if (mode === "drag" && data.kind === "placed-customer") {
          returnCustomer(data.customerSrc);
        }
        return false;
      }

      if (isRuleDrag(data)) {
        const free = center
          ? freePlacementFromPoint(center.x, center.y, ruleSize)
          : null;
        if (free) {
          placeRule({ x: free.x, y: free.y });
          return true;
        }
        if (mode === "drag") returnRuleToTuesday();
        return false;
      }

      const occupied = new Set<string>();
      for (const card of placedCards) {
        if (!card.snapped || card.col == null || card.row == null) continue;
        if (data.kind === "placed" && data.id === card.id) continue;
        occupied.add(`${card.col}-${card.row}`);
      }

      const cell = parseCellId(overId);
      if (
        cell &&
        isPlayableCell(cell.col, cell.row) &&
        !occupied.has(`${cell.col}-${cell.row}`)
      ) {
        applyPlacement(data, {
          snapped: true,
          col: cell.col,
          row: cell.row,
          x: cell.col * boardCellPx + cellPad,
          y: cell.row * boardCellPx + cellPad,
        });
        return true;
      }

      const free = center ? freePlacementFromPoint(center.x, center.y) : null;
      if (free && mode === "drag") {
        applyPlacement(data, free);
        return true;
      }

      if (mode === "drag" && data.kind === "placed") {
        returnPlacedToPile(data.id);
      }
      return false;
    },
    [
      placedCards,
      placedCustomers,
      boardCellPx,
      cellPad,
      applyPlacement,
      freePlacementFromPoint,
      placeRule,
      returnRuleToTuesday,
      ruleSize,
      placeCustomer,
      returnCustomer,
      returnPlacedToPile,
    ]
  );

  const onTapSelectedTarget = useCallback(
    (overId: string, clientX: number, clientY: number) => {
      if (!selected) return;
      if (overId === PLAY_AREA_ID && !isRuleDrag(selected)) {
        setSelection(null);
        return;
      }
      const placed = commitPlacement(
        selected,
        overId,
        { x: clientX, y: clientY },
        "tap"
      );
      if (placed || overId !== PLAY_AREA_ID) setSelection(null);
    },
    [selected, commitPlacement]
  );

  const onTapPlacedCard = useCallback(
    (card: PlacedCard) => {
      const data: DragData = {
        kind: "placed",
        id: card.id,
        faceSrc: card.faceSrc,
      };
      if (selected && isCustomerDrag(selected)) {
        const placed = commitPlacement(
          selected,
          productDropId(card.id),
          null,
          "tap"
        );
        if (placed) setSelection(null);
        return;
      }
      if (selected && selectionKey(selected) === selectionKey(data)) {
        if (card.snapped && !productsLocked) {
          onToggleFlip(card.id);
          return;
        }
        setSelection(null);
        return;
      }
      if (productsLocked) return;
      selectCard(data);
    },
    [selected, commitPlacement, productsLocked, onToggleFlip, selectCard]
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    draggingRef.current = true;
    didDragRef.current = true;
    const data = event.active.data.current as DragData | undefined;
    if (data) setActiveDrag(data);
  }, []);

  const onDragMove = useCallback(
    (event: DragMoveEvent) => {
      const data = event.active.data.current as DragData | undefined;
      if (!lensEnabled || isRuleDrag(data ?? null) || isCustomerDrag(data ?? null)) {
        return;
      }
      const card = document.querySelector<HTMLElement>(
        `[data-tutorial-drag="${event.active.id}"] [data-game-card]`
      );
      if (card) {
        setFollowFrame(frameFromRect(card.getBoundingClientRect()));
        return;
      }
      const rect = event.active.rect.current.translated;
      if (rect) setFollowFrame(frameFromRect(rect));
    },
    [lensEnabled, setFollowFrame]
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      draggingRef.current = false;
      const data = event.active.data.current as DragData | undefined;
      const translated = event.active.rect.current.translated;
      setActiveDrag(null);
      setFollowFrame(null);
      if (!data) return;
      const overId = event.over ? String(event.over.id) : "";
      const center = translated
        ? {
            x: translated.left + translated.width / 2,
            y: translated.top + translated.height / 2,
          }
        : null;
      commitPlacement(data, overId, center, "drag");
    },
    [commitPlacement, setFollowFrame]
  );

  const onDragCancel = useCallback(() => {
    draggingRef.current = false;
    setActiveDrag(null);
    setFollowFrame(null);
  }, [setFollowFrame]);

  const snappedCards = placedCards.filter((card) => card.snapped);
  const freeCards = placedCards.filter((card) => !card.snapped);
  const draggingPlacedId =
    activeDrag?.kind === "placed" ? activeDrag.id : undefined;
  const draggingCustomerSrc = isCustomerDrag(activeDrag)
    ? activeDrag.customerSrc
    : undefined;
  const draggingRule = isRuleDrag(activeDrag);
  const ruleActive =
    draggingRule ||
    (rulePlacement != null && activeStep === TUTORIAL_RULE_STEP) ||
    activeStep === TUTORIAL_REPEAT_STEP;

  const occupiedProductIds = useMemo(() => {
    const set = new Set<string>();
    for (const placed of placedCustomers) {
      if (placed.customerSrc === draggingCustomerSrc) continue;
      if (placed.productId) set.add(placed.productId);
    }
    return set;
  }, [placedCustomers, draggingCustomerSrc]);

  const snappedOccupied = useMemo(() => {
    const set = new Set<string>();
    for (const card of snappedCards) {
      if (card.col == null || card.row == null) continue;
      set.add(`${card.col}-${card.row}`);
    }
    return set;
  }, [snappedCards]);

  const bubbleLayerProps = {
    cardSize,
    boardCellPx,
    cellPad,
    hideId: draggingPlacedId,
  };

  const penalties = useMemo(
    () =>
      scorePenalties(
        placedCards,
        placedCustomers,
        cardSize,
        boardCellPx,
        cellPad
      ),
    [placedCards, placedCustomers, cardSize, boardCellPx, cellPad]
  );

  const renderPlacedCard = (card: PlacedCard) =>
    dndReady ? (
      <DraggablePlacedCard
        key={card.id}
        card={card}
        cardSize={cardSize}
        cellPad={cellPad}
        dragging={activeDrag?.kind === "placed" && activeDrag.id === card.id}
        lensEnabled={lensEnabled}
        flipped={flippedIds.has(card.id)}
        draggingRef={draggingRef}
        didDragRef={didDragRef}
        onToggleFlip={onToggleFlip}
        locked={productsLocked}
        dropTarget={matchStep && !occupiedProductIds.has(card.id)}
        faceUp={scoreStep}
        tapPlace={tapPlace}
        selected={selected?.kind === "placed" && selected.id === card.id}
        outlineColor={outlineColor}
        onTap={() => onTapPlacedCard(card)}
        jiggleEvery={
          !productsLocked &&
          ruleActive &&
          violatesRule(card, snappedOccupied)
            ? MONDAY_JIGGLE
            : undefined
        }
      />
    ) : (
      <div
        key={card.id}
        className="pointer-events-auto absolute"
        style={{
          left: card.snapped
            ? (card.col ?? 0) * boardCellPx + cellPad
            : card.x,
          top: card.snapped
            ? (card.row ?? 0) * boardCellPx + cellPad
            : card.y,
        }}
      >
        <GameCard src={card.faceSrc} alt="" size={cardSize} />
      </div>
    );

  const renderPlacedCustomers = (cards: PlacedCard[], snapped: boolean) =>
    placedCustomers.map((customer) => {
      if (customer.productId) {
        const product = cards.find((card) => card.id === customer.productId);
        if (!product || product.snapped !== snapped) return null;
        const mismatch = customer.faceSrc !== product.faceSrc;
        const revealFace = scoreStep && mismatch;
        const offset = revealFace
          ? MISMATCH_REVEAL_OFFSET
          : CUSTOMER_STACK_OFFSET;
        const box = cardBoxStyle(product, cardSize, boardCellPx, cellPad);
        return dndReady ? (
          <StackedCustomer
            key={customer.customerSrc}
            customer={customer}
            cardSize={cardSize}
            left={box.left + offset}
            top={box.top + offset}
            dragging={draggingCustomerSrc === customer.customerSrc}
            canDrag={matchStep}
            revealFace={revealFace}
            tapPlace={tapPlace}
            selected={
              selected?.kind === "placed-customer" &&
              selected.customerSrc === customer.customerSrc
            }
            outlineColor={outlineColor}
            onTap={() =>
              onTapSelectable({
                kind: "placed-customer",
                customerSrc: customer.customerSrc,
                faceSrc: customer.faceSrc,
              })
            }
          />
        ) : (
          <div
            key={customer.customerSrc}
            className="pointer-events-none absolute"
            style={{
              left: box.left + offset,
              top: box.top + offset,
            }}
          >
            <GameCard
              src={revealFace ? customer.faceSrc : customer.customerSrc}
              alt="Customer"
              size={cardSize}
            />
          </div>
        );
      }
      if (customer.snapped !== snapped) return null;
      const left = customer.snapped
        ? (customer.col ?? 0) * boardCellPx + cellPad
        : customer.x;
      const top = customer.snapped
        ? (customer.row ?? 0) * boardCellPx + cellPad
        : customer.y;
      const revealFace = scoreStep;
      return dndReady ? (
        <StackedCustomer
          key={customer.customerSrc}
          customer={customer}
          cardSize={cardSize}
          left={left}
          top={top}
          dragging={draggingCustomerSrc === customer.customerSrc}
          canDrag={matchStep}
          revealFace={revealFace}
          tapPlace={tapPlace}
          selected={
            selected?.kind === "placed-customer" &&
            selected.customerSrc === customer.customerSrc
          }
          outlineColor={outlineColor}
          onTap={() =>
            onTapSelectable({
              kind: "placed-customer",
              customerSrc: customer.customerSrc,
              faceSrc: customer.faceSrc,
            })
          }
        />
      ) : (
        <div
          key={customer.customerSrc}
          className="pointer-events-none absolute"
          style={{ left, top }}
        >
          <GameCard
            src={revealFace ? customer.faceSrc : customer.customerSrc}
            alt="Customer"
            size={cardSize}
          />
        </div>
      );
    });

  const renderScoreFloats = (snapped: boolean) =>
    penalties
      .filter((penalty) => penalty.snapped === snapped)
      .map((penalty) => (
        <ScoreFloat
          key={penalty.key}
          left={penalty.left}
          top={penalty.top}
          cardSize={cardSize}
          visible={scoreStep}
          delay={penalty.index * 0.12}
        />
      ));

  const boardInner = (
    <>
      <div
        className="relative z-10 w-full shrink-0 xl:hidden"
        style={{ aspectRatio: "1920 / 129" }}
      >
        <Image
          src="/board/top.webp"
          alt=""
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="relative min-h-0 flex-1">
        {!isMobile && (
          <div
            className="absolute bottom-0 left-0 top-0 z-10"
            style={{ width: leftW }}
          >
            <Image
              src="/board/left.webp"
              alt="Board left border"
              fill
              className="object-cover object-bottom"
              sizes={`${leftW}px`}
            />
          </div>
        )}

        <div
          className="absolute bottom-0 overflow-hidden"
          style={{ left: leftW, right: 0, top: 0 }}
        >
          <div
            className="absolute bottom-0"
            style={{
              width: GRID_COLS * boardCellPx,
              height: GRID_ROWS * boardCellPx,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${GRID_COLS}, ${boardCellPx}px)`,
                gridAutoRows: `${boardCellPx}px`,
              }}
            >
              {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
                const col = i % GRID_COLS;
                const row = Math.floor(i / GRID_COLS);
                if (!dndReady) {
                  return (
                    <div
                      key={cellId(col, row)}
                      className="border border-white/20 bg-background"
                      style={{ width: boardCellPx, height: boardCellPx }}
                    />
                  );
                }
                return (
                  <WarehouseCell
                    key={cellId(col, row)}
                    col={col}
                    row={row}
                    cellPx={boardCellPx}
                    occupied={occupiedByOthers.has(`${col}-${row}`)}
                    disabled={productsLocked && !matchStep}
                    allowOccupied={matchStep}
                    tapPlace={tapPlace}
                    onTap={(cellCol, cellRow, clientX, clientY) =>
                      onTapSelectedTarget(
                        cellId(cellCol, cellRow),
                        clientX,
                        clientY
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute z-40 overflow-visible"
          style={{
            left: leftW,
            bottom: 0,
            width: GRID_COLS * boardCellPx,
            height: GRID_ROWS * boardCellPx,
          }}
        >
          {snappedCards.map((card) => renderPlacedCard(card))}
          {renderPlacedCustomers(snappedCards, true)}
          {renderScoreFloats(true)}
        </div>
        <div
          className="pointer-events-none absolute z-50 overflow-visible"
          style={{
            left: leftW,
            bottom: 0,
            width: GRID_COLS * boardCellPx,
            height: GRID_ROWS * boardCellPx,
          }}
        >
          <TutorialCardBubbles
            cards={snappedCards}
            startIndex={0}
            {...bubbleLayerProps}
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden h-[28%] bg-linear-to-b from-background from-25% via-background/80 to-transparent xl:block"
        />
        {!isMobile && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[20%] bg-linear-to-l from-background from-25% via-background/80 to-transparent"
          />
        )}
      </div>

      <div className="relative z-10 flex shrink-0">
        {!isMobile && (
          <div className="relative shrink-0" style={{ width: leftW }}>
            <Image
              src="/board/left-side.webp"
              alt=""
              fill
              className="object-cover object-top"
              sizes={`${leftW}px`}
            />
          </div>
        )}
        <div
          className="relative min-w-0 flex-1 self-auto overflow-hidden"
          style={{ aspectRatio: dayStripAspect }}
        >
          <div
            className="absolute inset-y-0 left-0 flex"
            style={{ width: dayStripWidth }}
          >
            {DAYS.map((day) => (
              <div key={day} className="relative h-full flex-1">
                <Image
                  src={`/board/${day}.webp`}
                  alt={day}
                  fill
                  className="object-cover"
                  sizes="33vw"
                />
              </div>
            ))}
          </div>
        </div>
        {!isMobile && (
          <div className="relative shrink-0" style={{ width: leftW }}>
            <Image
              src="/board/right-side.webp"
              alt=""
              fill
              className="object-cover object-top"
              sizes={`${leftW}px`}
            />
          </div>
        )}
      </div>

      <div
        className="relative z-20 flex shrink-0 items-start overflow-visible"
        style={{
          height: cardsH,
          paddingTop: cardsGap,
          marginBottom: cardsBottom,
        }}
      >
        <div
          className="relative z-30 shrink-0 overflow-visible"
          style={{ width: isMobile ? 0 : leftW }}
        >
          <div
            className="absolute top-0 left-0 pointer-events-auto"
            style={{ width: cardSize, height: cardSize }}
          >
            <DayColumnPile hidden={!matchStep} delay={0}>
              <CustomerStack
                pile={customerPile}
                customers={customers}
                cardSize={cardSize}
                canDraw={matchStep && dndReady}
                draggingSrc={draggingCustomerSrc}
                tapPlace={tapPlace}
                selectedSrc={
                  selected?.kind === "customer" ? selected.customerSrc : undefined
                }
                outlineColor={outlineColor}
                onTap={(customerSrc, faceSrc) =>
                  onTapSelectable({ kind: "customer", customerSrc, faceSrc })
                }
              />
            </DayColumnPile>
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex" style={{ width: dayStripWidth }}>
            {DAYS.map((day, index) => {
              const hideDays = activeStep >= TUTORIAL_REPEAT_STEP;
              const delay = hideDays
                ? index * 0.15
                : (DAYS.length - 1 - index) * 0.15;
              return (
                <DayColumnPile key={day} hidden={hideDays} delay={delay}>
                  {day === "monday" ? (
                    <MondayStack
                      pile={mondayPile}
                      cardSize={cardSize}
                      canDraw={canDrawMonday && dndReady}
                      draggingPile={activeDrag?.kind === "pile"}
                      tapPlace={tapPlace}
                      selected={selected?.kind === "pile"}
                      outlineColor={outlineColor}
                      onTap={(faceSrc) =>
                        onTapSelectable({ kind: "pile", faceSrc })
                      }
                    />
                  ) : day === "tuesday" ? (
                    <TuesdayRuleStack
                      cardSize={cardSize}
                      canDraw={canDrawRule && dndReady}
                      dragging={activeDrag?.kind === "rule"}
                      showRule={
                        rulePlacement == null &&
                        activeStep < TUTORIAL_REPEAT_STEP
                      }
                      tapPlace={tapPlace}
                      selected={selected?.kind === "rule"}
                      outlineColor={outlineColor}
                      onTap={() => onTapSelectable({ kind: "rule" })}
                    />
                  ) : (
                    <DecorativeDayStack cardSize={cardSize} />
                  )}
                </DayColumnPile>
              );
            })}
          </div>
        </div>

        {!isMobile && <div className="shrink-0" style={{ width: leftW }} />}
        {scoreStep ? (
          <div
            className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center px-3"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <Button
              variant="filled"
              size={isMobile ? "sm" : "default"}
              className="max-w-full"
              disabled={scoreboardActive}
              onClick={() => setScoreboardActive(true)}
            >
              {TUTORIAL_INTRO.scoreboardLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
        {freeCards.map((card) => renderPlacedCard(card))}
        {renderPlacedCustomers(freeCards, false)}
        {renderScoreFloats(false)}
      </div>
      {rulePlacement ? (
        <div className="pointer-events-none absolute inset-0 z-45 overflow-visible">
          <PlacedInsiderRule
            placement={rulePlacement}
            size={ruleSize}
            dragging={activeDrag?.kind === "placed-rule"}
            visible={activeStep === TUTORIAL_RULE_STEP}
            tapPlace={tapPlace}
            selected={selected?.kind === "placed-rule"}
            outlineColor={outlineColor}
            onTap={() => onTapSelectable({ kind: "placed-rule" })}
          />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 z-50 overflow-visible">
        <TutorialCardBubbles
          cards={freeCards}
          startIndex={snappedCards.length}
          {...bubbleLayerProps}
        />
      </div>
      {scoreStep ? <TutorialScoreboard active={scoreboardActive} /> : null}
    </>
  );

  if (!dndReady) {
    return (
      <div className="relative flex h-full flex-col justify-end overflow-hidden">
        {boardInner}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      autoScroll={false}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <PlayArea
        playAreaRef={playAreaRef}
        tapPlace={tapPlace}
        onTap={(clientX, clientY) =>
          onTapSelectedTarget(PLAY_AREA_ID, clientX, clientY)
        }
      >
        {boardInner}
      </PlayArea>
      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          isRuleDrag(activeDrag) ? (
            <GameCard
              src={TUTORIAL_INSIDER_RULE_SRC}
              alt="Insider rule"
              size={ruleSize}
            />
          ) : isCustomerDrag(activeDrag) ? (
            <GameCard src={activeDrag.faceSrc} alt="" size={cardSize} />
          ) : (
            <div className="relative">
              {showsStoryBubbles(activeStep) &&
              "faceSrc" in activeDrag ? (
                <TutorialBubble
                  faceSrc={activeDrag.faceSrc}
                  text={bubbleText[activeDrag.faceSrc] ?? ""}
                  readOnly
                  visible
                  delay={0}
                />
              ) : null}
              {"faceSrc" in activeDrag ? (
                <GameCard src={activeDrag.faceSrc} alt="" size={cardSize} />
              ) : null}
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
