"use client";

import { useEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { SplitText } from "gsap/SplitText";
import { CardGrid } from "./card-grid";
import { GridOverlay } from "@/components/grid-overlay";
import { useFinePointer } from "@/hooks/use-fine-pointer";
import { useGridMetrics } from "@/hooks/use-grid-metrics";
import {
  getDescriptionLayout,
  getDescriptionRowCount,
} from "../_lib/card-grid-layout";
import { gridStyle as buildGridStyle } from "@/lib/grid";
import { siteContent } from "@/lib/site-content";
import { BRAND_ACCENT_COLORS } from "@/lib/brand-accents";
import { cn } from "@/lib/utils";

gsap.registerPlugin(SplitText, ScrollTrigger);

const REST_COLOR = "#ffffff";
const FALLOFF_RADIUS = 130;
const CHAR_DIM_OPACITY = 0.14;

export function DescriptionSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const paragraphRef = useRef<HTMLParagraphElement>(null);
  const wordsRef = useRef<HTMLElement[]>([]);
  const trailTimersRef = useRef<Map<HTMLElement, gsap.core.Tween>>(new Map());
  const hasFinePointer = useFinePointer();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [viewportHeight, setViewportHeight] = useState(900);

  const grid = useGridMetrics();
  const descRows = useMemo(
    () => getDescriptionRowCount(grid.cellPx, viewportHeight),
    [grid.cellPx, viewportHeight]
  );
  const descGridStyle = useMemo(
    () => buildGridStyle(grid.cols, descRows),
    [grid.cols, descRows]
  );
  const layout = useMemo(
    () => getDescriptionLayout(grid.breakpoint, grid.cols, descRows),
    [grid.breakpoint, grid.cols, descRows]
  );

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    const onChange = () => setReducedMotion(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  useEffect(() => {
    const update = () => setViewportHeight(window.innerHeight);
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const sectionMinHeight = Math.max(viewportHeight * 2, descRows * grid.cellPx);

  useEffect(() => {
    ScrollTrigger.refresh();
  }, [sectionMinHeight, descRows]);

  const interactive = hasFinePointer && !reducedMotion;

  useGSAP(
    () => {
      const content = contentRef.current;
      const el = paragraphRef.current;
      if (!content || !el) return;

      const split = SplitText.create(el, {
        type: "chars,words",
        charsClass: "desc-char",
        wordsClass: "desc-word",
      });
      const chars = split.chars as HTMLElement[];
      wordsRef.current = split.words as HTMLElement[];

      gsap.set(chars, { opacity: CHAR_DIM_OPACITY });
      gsap.set(split.words, { color: REST_COLOR });

      let revealTween: gsap.core.Tween | undefined;

      if (reducedMotion) {
        gsap.set(chars, { opacity: 1 });
      } else {
        revealTween = gsap.fromTo(
          chars,
          { opacity: CHAR_DIM_OPACITY },
          {
            opacity: 1,
            ease: "none",
            stagger: 0.04,
            scrollTrigger: {
              trigger: content,
              start: "top top",
              end: "bottom bottom",
              scrub: 0.65,
            },
          }
        );
      }

      return () => {
        trailTimersRef.current.forEach((tween) => tween.kill());
        trailTimersRef.current.clear();
        wordsRef.current = [];
        revealTween?.scrollTrigger?.kill();
        revealTween?.kill();
        split.revert();
      };
    },
    { scope: paragraphRef, dependencies: [reducedMotion] }
  );

  const handlePointerMove = (e: PointerEvent<HTMLParagraphElement>) => {
    if (!interactive) return;
    const words = wordsRef.current;
    if (!words.length) return;

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      const rect = word.getBoundingClientRect();
      const dist = Math.hypot(
        e.clientX - (rect.left + rect.width / 2),
        e.clientY - (rect.top + rect.height / 2)
      );
      if (dist >= FALLOFF_RADIUS * 0.55) continue;

      const color = BRAND_ACCENT_COLORS[i % BRAND_ACCENT_COLORS.length];
      trailTimersRef.current.get(word)?.kill();
      gsap.set(word, { color });
      const tween = gsap.to(word, {
        color: REST_COLOR,
        duration: 0.9,
        delay: 0.15,
        ease: "power2.out",
      });
      trailTimersRef.current.set(word, tween);
    }
  };

  return (
    <section
      ref={sectionRef}
      id="about"
      className={cn(
        "relative isolate overflow-x-clip bg-background",
        hasFinePointer && "cursor-none"
      )}
      style={{ minHeight: sectionMinHeight }}
    >
      <div
        className="absolute inset-0"
        style={{
          maskImage:
            "linear-gradient(to bottom, transparent, #000 45vh, #000 calc(100% - 45vh), transparent)",
          WebkitMaskImage:
            "linear-gradient(to bottom, transparent, #000 45vh, #000 calc(100% - 45vh), transparent)",
        }}
      >
        <GridOverlay
          data-grid="description-bg"
          aria-hidden="true"
          cols={grid.cols}
          rows={descRows}
          cell={grid.cellPx}
        />

        <CardGrid
          key={`${grid.breakpoint}-${descRows}`}
          cards={layout.cards}
          cols={grid.cols}
          rows={descRows}
          gridStyle={descGridStyle}
          isUiBlocked={layout.isUiBlocked}
          lensEnabled={hasFinePointer}
        />
      </div>

      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 top-0 z-15 h-[45vh] bg-linear-to-b from-background from-25% via-background/80 to-transparent"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-x-0 bottom-0 z-15 h-[45vh] bg-linear-to-t from-background from-25% via-background/80 to-transparent"
      />

      <div
        ref={contentRef}
        className="pointer-events-none relative z-20"
        style={{ minHeight: `calc(${sectionMinHeight}px - 45vh)` }}
      >
        <div className="sticky top-0 flex h-dvh items-center justify-center px-6 sm:px-10 md:px-16">
          <p
            ref={paragraphRef}
            className="pointer-events-auto max-w-4xl text-center text-2xl uppercase font-black leading-[1.15] tracking-tight text-white [-webkit-text-stroke:0.08em_#000] [paint-order:stroke_fill] sm:text-3xl md:text-4xl lg:text-5xl"
            onPointerMove={interactive ? handlePointerMove : undefined}
          >
            {siteContent.description.body}
          </p>
        </div>
      </div>
    </section>
  );
}
