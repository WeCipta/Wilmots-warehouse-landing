"use client";

import { useRef, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { siteContent } from "@/lib/site-content";

gsap.registerPlugin(SplitText);

const WEIGHT_PEAK = 900;
const WEIGHT_FLOOR = 700;
const FALLOFF_RADIUS = 110;

export function HeroTitle() {
  const titleRef = useRef<HTMLHeadingElement>(null);
  const charsRef = useRef<Element[]>([]);

  useGSAP(
    () => {
      const el = titleRef.current;
      if (!el) return;

      const split = SplitText.create(el, {
        type: "chars",
        charsClass: "hero-title-char inline-block",
      });
      charsRef.current = split.chars;
      gsap.set(split.chars, { fontWeight: WEIGHT_PEAK });

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
      const weight = WEIGHT_PEAK + (WEIGHT_FLOOR - WEIGHT_PEAK) * t;
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
      className="sm:text-5xl md:text-6xl text-4xl font-black tracking-tight"
      onPointerMove={handlePointerMove}
      onPointerLeave={handlePointerLeave}
    >
      {siteContent.hero.title}
    </h1>
  );
}
