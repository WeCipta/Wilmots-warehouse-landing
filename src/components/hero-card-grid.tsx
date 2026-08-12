"use client";

import { useMemo, useRef, useState, useCallback, useEffect } from "react";
import type { CSSProperties } from "react";
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDraggable,
  useDroppable,
  pointerWithin,
  closestCenter,
  type CollisionDetection,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GameCard, type CardVariant } from "@/components/game-card";
import { useFollowMouse, type FollowFrame } from "@/components/follow-mouse";
import { cn } from "@/lib/utils";
import type { HeroCardLayout } from "@/lib/hero-grid-layout";

export type HeroCardPlacement = {
  id: string;
  col: number;
  row: number;
  src?: string;
  variant?: CardVariant;
};

const CARD_RADIUS = 10;

function cellId(col: number, row: number) {
  return `cell-${col}-${row}`;
}

function parseCellId(id: string): { col: number; row: number } | null {
  const match = /^cell-(\d+)-(\d+)$/.exec(id);
  if (!match) return null;
  return { col: Number(match[1]), row: Number(match[2]) };
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
  if (pointer.length > 0) return pointer;
  return closestCenter(args);
};

function DroppableCell({
  col,
  row,
  disabled,
}: {
  col: number;
  row: number;
  disabled: boolean;
}) {
  const { setNodeRef, isOver } = useDroppable({
    id: cellId(col, row),
    disabled,
  });

  return (
    <div
      ref={setNodeRef}
      className={cn(
        "min-h-0 min-w-0",
        isOver && !disabled && "bg-white/10"
      )}
      style={{ gridColumn: col, gridRow: row }}
    />
  );
}

function DraggableHeroCard({
  placement,
  draggingRef,
  didDragRef,
  lensEnabled,
  flipped,
  onToggleFlip,
}: {
  placement: HeroCardPlacement;
  draggingRef: React.MutableRefObject<boolean>;
  didDragRef: React.MutableRefObject<boolean>;
  lensEnabled: boolean;
  flipped: boolean;
  onToggleFlip: (id: string) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({ id: placement.id });
  const { setFollowFrame } = useFollowMouse();
  const wrapRef = useRef<HTMLDivElement>(null);

  const setRefs = useCallback(
    (node: HTMLDivElement | null) => {
      wrapRef.current = node;
      setNodeRef(node);
    },
    [setNodeRef]
  );

  const syncFrameFromCard = useCallback(() => {
    if (!lensEnabled) return;
    const card = wrapRef.current?.querySelector<HTMLElement>("[data-game-card]");
    if (!card) return;
    setFollowFrame(frameFromRect(card.getBoundingClientRect()));
  }, [lensEnabled, setFollowFrame]);

  return (
    <div
      ref={setRefs}
      data-hero-drag={placement.id}
      className={cn(
        "relative z-10 min-h-0 min-w-0 p-2 touch-none",
        lensEnabled ? "cursor-none" : "cursor-grab active:cursor-grabbing",
        isDragging && "z-30"
      )}
      style={{
        gridColumn: placement.col,
        gridRow: placement.row,
        transform: CSS.Translate.toString(transform),
      }}
      {...listeners}
      {...attributes}
      onPointerDown={(e) => {
        didDragRef.current = false;
        listeners?.onPointerDown?.(e);
        syncFrameFromCard();
      }}
      onPointerUp={() => {
        if (!draggingRef.current) setFollowFrame(null);
      }}
      onPointerCancel={() => {
        if (!draggingRef.current) setFollowFrame(null);
      }}
      onClick={() => {
        if (lensEnabled || didDragRef.current) return;
        onToggleFlip(placement.id);
      }}
    >
      <GameCard
        src={placement.src}
        variant={placement.variant}
        size="100%"
        lens={lensEnabled}
        flipped={lensEnabled ? undefined : flipped}
      />
    </div>
  );
}

function StaticHeroCard({
  placement,
  lensEnabled,
  flipped,
}: {
  placement: HeroCardPlacement;
  lensEnabled: boolean;
  flipped: boolean;
}) {
  return (
    <div
      data-hero-drag={placement.id}
      className={cn(
        "relative z-10 min-h-0 min-w-0 p-2 touch-none",
        lensEnabled ? "cursor-none" : "cursor-grab"
      )}
      style={{
        gridColumn: placement.col,
        gridRow: placement.row,
      }}
    >
      <GameCard
        src={placement.src}
        variant={placement.variant}
        size="100%"
        lens={lensEnabled}
        flipped={lensEnabled ? undefined : flipped}
      />
    </div>
  );
}

export function HeroCardGrid({
  cards: initialCards,
  cols,
  rows,
  gridStyle: gs,
  isUiBlocked,
  lensEnabled = true,
}: {
  cards: HeroCardLayout[];
  cols: number;
  rows: number;
  gridStyle: CSSProperties;
  isUiBlocked: (col: number, row: number) => boolean;
  lensEnabled?: boolean;
}) {
  const [cards, setCards] = useState<HeroCardPlacement[]>(() =>
    initialCards.map((card, i) => ({ ...card, id: `card-${i}` }))
  );
  const [activeId, setActiveId] = useState<string | null>(null);
  const [dndReady, setDndReady] = useState(false);
  const [flippedIds, setFlippedIds] = useState<Set<string>>(() => new Set());
  const { setFollowFrame } = useFollowMouse();
  const draggingRef = useRef(false);
  const didDragRef = useRef(false);

  useEffect(() => {
    setDndReady(true);
  }, []);

  useEffect(() => {
    setCards(initialCards.map((card, i) => ({ ...card, id: `card-${i}` })));
    setFlippedIds(new Set());
  }, [initialCards]);

  useEffect(() => {
    if (lensEnabled) setFlippedIds(new Set());
  }, [lensEnabled]);

  const occupiedByOthers = useMemo(() => {
    const set = new Set<string>();
    for (const card of cards) {
      if (card.id === activeId) continue;
      set.add(`${card.col}-${card.row}`);
    }
    return set;
  }, [cards, activeId]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: lensEnabled ? 4 : 8 },
    })
  );

  const cells = useMemo(() => {
    const list: { col: number; row: number; disabled: boolean }[] = [];
    for (let row = 1; row <= rows; row++) {
      for (let col = 1; col <= cols; col++) {
        const key = `${col}-${row}`;
        list.push({
          col,
          row,
          disabled: occupiedByOthers.has(key) || isUiBlocked(col, row),
        });
      }
    }
    return list;
  }, [occupiedByOthers, cols, rows, isUiBlocked]);

  const onToggleFlip = useCallback((id: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const onDragStart = useCallback((event: DragStartEvent) => {
    draggingRef.current = true;
    didDragRef.current = true;
    setActiveId(String(event.active.id));
  }, []);

  const onDragMove = useCallback(
    (event: DragMoveEvent) => {
      if (!lensEnabled) return;
      const card = document.querySelector<HTMLElement>(
        `[data-hero-drag="${event.active.id}"] [data-game-card]`
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
      setActiveId(null);
      setFollowFrame(null);

      const { active, over } = event;
      if (!over) return;

      const target = parseCellId(String(over.id));
      if (!target) return;
      if (isUiBlocked(target.col, target.row)) return;
      if (occupiedByOthers.has(`${target.col}-${target.row}`)) return;

      setCards((prev) =>
        prev.map((card) =>
          card.id === active.id
            ? { ...card, col: target.col, row: target.row }
            : card
        )
      );
    },
    [occupiedByOthers, setFollowFrame, isUiBlocked]
  );

  const onDragCancel = useCallback(() => {
    draggingRef.current = false;
    setActiveId(null);
    setFollowFrame(null);
  }, [setFollowFrame]);

  if (!dndReady) {
    return (
      <div
        data-hero-cards
        className="absolute inset-x-0 top-0 z-10 w-full grid"
        style={gs}
      >
        {cards.map((placement) => (
          <StaticHeroCard
            key={placement.id}
            placement={placement}
            lensEnabled={lensEnabled}
            flipped={flippedIds.has(placement.id)}
          />
        ))}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <div
        data-hero-cards
        className="absolute inset-x-0 top-0 z-10 w-full grid"
        style={gs}
      >
        {cells.map(({ col, row, disabled }) => (
          <DroppableCell
            key={cellId(col, row)}
            col={col}
            row={row}
            disabled={disabled}
          />
        ))}
        {cards.map((placement) => (
          <DraggableHeroCard
            key={placement.id}
            placement={placement}
            draggingRef={draggingRef}
            didDragRef={didDragRef}
            lensEnabled={lensEnabled}
            flipped={flippedIds.has(placement.id)}
            onToggleFlip={onToggleFlip}
          />
        ))}
      </div>
    </DndContext>
  );
}
