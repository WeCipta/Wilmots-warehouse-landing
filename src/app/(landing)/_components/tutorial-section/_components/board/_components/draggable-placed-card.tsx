"use client";

import { useCallback, useRef, type MutableRefObject } from "react";
import { useDraggable, useDroppable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GameCard } from "@/components/game-card";
import { mediaAlt } from "@/lib/card-faces";
import { useFollowMouse } from "@/components/follow-mouse";
import { cn } from "@/lib/utils";
import type { PlacedCard } from "../../context";
import type { DragData } from "../_lib/constants";
import { frameFromRect, productDropId } from "../_lib/geometry";
import { usePointerTap } from "../_lib/drag";
import { SelectionOutline } from "./selection-outline";

export function DraggablePlacedCard({
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
  draggingRef: MutableRefObject<boolean>;
  didDragRef: MutableRefObject<boolean>;
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
        alt={mediaAlt(card.faceSrc)}
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
