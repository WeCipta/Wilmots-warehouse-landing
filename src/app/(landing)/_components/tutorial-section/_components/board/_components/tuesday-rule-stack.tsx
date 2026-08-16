"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useDraggable } from "@dnd-kit/core";
import { CSS } from "@dnd-kit/utilities";
import { GameCard } from "@/components/game-card";
import { CARD_BACK_ALT, CARD_BACK_SRC } from "@/lib/card-faces";
import { siteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import type { RulePlacement } from "../../context";
import {
  TUTORIAL_INSIDER_RULE_SRC,
  TUTORIAL_RULE_SRC,
} from "../../../_lib/data";
import {
  DECORATIVE_BACKS,
  MONDAY_JIGGLE,
  RULE_PILE_ID,
  RULE_PLACED_ID,
  type DragData,
} from "../_lib/constants";
import { stackRotate } from "../_lib/geometry";
import { usePointerTap } from "../_lib/drag";
import { SelectionOutline } from "./selection-outline";

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
        alt={siteContent.tutorial.ruleAlt}
        size={cardSize}
        jiggleEvery={dragging || isDragging || !jiggle ? undefined : MONDAY_JIGGLE}
      />
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}

export function TuesdayRuleStack({
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
          <GameCard src={CARD_BACK_SRC} alt={CARD_BACK_ALT} size={cardSize} />
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
            <GameCard
              src={TUTORIAL_RULE_SRC}
              alt={siteContent.tutorial.ruleAlt}
              size={cardSize}
            />
          )}
        </div>
      ) : null}
    </div>
  );
}

export function PlacedInsiderRule({
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
          alt={siteContent.tutorial.insiderRuleAlt}
          size={size}
        />
      </div>
      <SelectionOutline selected={!!selected} color={outlineColor} />
    </div>
  );
}
