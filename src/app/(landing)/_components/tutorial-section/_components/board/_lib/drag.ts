import { useRef, type PointerEvent } from "react";
import {
  TUTORIAL_DISCUSS_STEP,
  TUTORIAL_REPEAT_STEP,
} from "../../context";
import type { DragData } from "./constants";

export function showsStoryBubbles(step: string) {
  return step === TUTORIAL_DISCUSS_STEP || step === TUTORIAL_REPEAT_STEP;
}

export function isRuleDrag(
  data: DragData | null
): data is Extract<DragData, { kind: "rule" | "placed-rule" }> {
  return data?.kind === "rule" || data?.kind === "placed-rule";
}

export function isCustomerDrag(
  data: DragData | null
): data is Extract<DragData, { kind: "customer" | "placed-customer" }> {
  return data?.kind === "customer" || data?.kind === "placed-customer";
}

export function selectionKey(data: DragData): string {
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

export function usePointerTap() {
  const origin = useRef<TapOrigin | null>(null);
  return {
    onPointerDown: (e: PointerEvent) => {
      origin.current = readTapOrigin(e);
    },
    consumeTap: (e: PointerEvent) => {
      const ok = isTap(origin.current, e);
      origin.current = null;
      return ok;
    },
  };
}
