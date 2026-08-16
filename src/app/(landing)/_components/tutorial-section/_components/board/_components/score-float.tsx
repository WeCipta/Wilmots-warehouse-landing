"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

export function ScoreFloat({
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
