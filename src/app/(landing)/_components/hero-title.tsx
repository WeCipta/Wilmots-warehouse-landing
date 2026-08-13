"use client";

import { useRef, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { siteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText);

const WEIGHT_PEAK = 900;
const WEIGHT_FLOOR = 700;
const FALLOFF_RADIUS = 110;

const [titleLine1, titleLine2] = (() => {
  const parts = siteContent.hero.title.trim().split(/\s+/);
  return [parts[0] ?? siteContent.hero.title, parts.slice(1).join(" ")];
})();

export function HeroTitle({ className }: { className?: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const charsRef = useRef<Element[]>([]);

  useGSAP(
    () => {
      const el = titleRef.current;
      if (!el) return;

      const split = SplitText.create(el, {
        type: "chars,words",
        charsClass: "hero-title-char",
        wordsClass: "hero-title-word",
        autoSplit: true,
        onSplit(self) {
          charsRef.current = self.chars;
          gsap.set(self.chars, { fontWeight: WEIGHT_PEAK });
        },
      });

      return () => {
        charsRef.current = [];
        split.revert();
      };
    },
    { scope: titleRef }
  );

  const handlePointerMove = (e: PointerEvent<HTMLHeadingElement>) => {
    const chars = charsRef.current;
    if (!chars.length) return;

    for (const char of chars) {
      const rect = char.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dist = Math.hypot(e.clientX - cx, e.clientY - cy);
      const t = Math.min(dist / FALLOFF_RADIUS, 1);
      const weight = WEIGHT_FLOOR + (WEIGHT_PEAK - WEIGHT_FLOOR) * t;
      gsap.set(char, { fontWeight: weight });
    }
  };

  const handlePointerLeave = () => {
    const chars = charsRef.current;
    if (!chars.length) return;
    gsap.to(chars, {
      fontWeight: WEIGHT_PEAK,
      duration: 0.25,
      ease: "power2.out",
    });
  };

  return (
    <h1
      ref={titleRef}
      data-follow-text
      className={cn(
        "whitespace-nowrap text-5xl font-black tracking-tight sm:text-7xl xl:text-8xl",
        className
      )}
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {titleLine1}
      {titleLine2 ? (
        <>
          <br />
          {titleLine2}
        </>
      ) : null}
    </h1>
  );
}
