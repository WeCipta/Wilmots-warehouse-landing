"use client";

import { useCallback, type MutableRefObject, type ReactNode } from "react";
import { useDroppable } from "@dnd-kit/core";
import { cn } from "@/lib/utils";
import { PLAY_AREA_ID } from "../_lib/constants";
import { cellId, isPlayableCell } from "../_lib/geometry";
import { usePointerTap } from "../_lib/drag";

export function WarehouseCell({
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

export function PlayArea({
  children,
  playAreaRef,
  tapPlace,
  onTap,
}: {
  children: ReactNode;
  playAreaRef: MutableRefObject<HTMLDivElement | null>;
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
