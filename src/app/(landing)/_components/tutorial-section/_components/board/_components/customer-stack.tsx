"use client";

import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GameCard } from "@/components/game-card";
import { customerAlt, mediaAlt } from "@/lib/card-faces";
import { cn } from "@/lib/utils";
import type { PlacedCustomer } from "../../context";
import { MONDAY_JIGGLE, type DragData } from "../_lib/constants";
import { stackRotate } from "../_lib/geometry";
import { usePointerTap } from "../_lib/drag";
import { SelectionOutline } from "./selection-outline";

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
        alt={mediaAlt(faceSrc)}
        size={cardSize}
        flipped={!!selected}
        jiggleEvery={dragging || isDragging ? undefined : MONDAY_JIGGLE}
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

export function CustomerStack({
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
                alt={customerAlt(kit.customerSrc)}
                size={cardSize}
              />
            )}
          </div>
        );
      })}
    </div>
  );
}

export function StackedCustomer({
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
        alt={mediaAlt(customer.faceSrc)}
        size={cardSize}
        flipped={revealFace || !!selected}
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}
