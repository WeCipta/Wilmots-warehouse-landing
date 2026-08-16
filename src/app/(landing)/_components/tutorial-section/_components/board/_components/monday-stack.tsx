"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GameCard } from "@/components/game-card";
import { CARD_BACK_ALT, CARD_BACK_SRC } from "@/lib/card-faces";
import { cn } from "@/lib/utils";
import { MONDAY_JIGGLE, PILE_ID, type DragData } from "../_lib/constants";
import { stackRotate } from "../_lib/geometry";
import { usePointerTap } from "../_lib/drag";
import { SelectionOutline } from "./selection-outline";

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
        alt={CARD_BACK_ALT}
        size={cardSize}
        jiggleEvery={dragging || isDragging ? undefined : MONDAY_JIGGLE}
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

export function MondayStack({
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
                alt={CARD_BACK_ALT}
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
