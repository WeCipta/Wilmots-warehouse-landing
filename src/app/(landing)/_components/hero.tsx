"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";

// ─── Card placement data ───────────────────────────────────────────────────────
// Each entry maps to one grid cell. col/row are 1-based CSS grid indices.
const HERO_CARDS: {
  col: number;
  row: number;
  src?: string;
  variant?: "face-up" | "face-down";
}[] = [
  // ── Left column ──
  { col: 3, row: 2, src: "banana.svg" },
  { col: 4, row: 3, src: "bomb.svg" },
  { col: 3, row: 4, src: "frog.svg" },
  { col: 4, row: 5, variant: "face-down" },
  { col: 3, row: 6, src: "gem.svg" },

  // ── Right column ──
  { col: 12, row: 2, src: "sun.svg" },
  { col: 11, row: 3, variant: "face-down" },
  { col: 12, row: 4, src: "mask.svg" },
  { col: 11, row: 5, src: "rainbow.svg" },
  { col: 12, row: 6, variant: "face-down" },

  // ── Above title ──
  { col: 5, row: 2, variant: "face-down" },
  { col: 7, row: 2, src: "volcano.svg" },
  { col: 9, row: 2, variant: "face-down" },

  // ── Below button ──
  { col: 6, row: 7, src: "icecream.svg" },
  { col: 8, row: 7, src: "horse.svg" },
  { col: 5, row: 8, variant: "face-down" },
  { col: 7, row: 8, src: "target.svg" },
  { col: 9, row: 8, variant: "face-down" },
];

const COLS = 14;
const ROWS = 20;
const MIN_CELL = 96;

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-grid] .grid > *", {
        opacity: 0,
        scale: 0.92,
        duration: 0.45,
        stagger: {
          amount: 0.7,
          from: "center",
          grid: [ROWS, COLS],
        },
      })
        .from(
          "[data-hero-frame]",
          {
            opacity: 0,
            duration: 0.8,
            stagger: 0.08,
          },
          "-=0.35"
        )
        .from(
          "[data-hero-content] > *",
          {
            y: 28,
            opacity: 0,
            duration: 0.7,
            stagger: 0.12,
          },
          "-=0.45"
        );
    },
    { scope: rootRef }
  );

  return (
    <section
      ref={rootRef}
      className="relative isolate min-h-dvh overflow-hidden bg-background "
    >
      <div
        data-hero-grid
        className="absolute inset-0 overflow-hidden"
        aria-hidden="true"
      >
        <div
          className="absolute top-0 left-1/2 -translate-x-1/2 grid h-full"
          style={{
            gridTemplateColumns: `repeat(${COLS}, max(${MIN_CELL}px, calc(100vw / ${COLS})))`,
            gridTemplateRows: `repeat(${ROWS}, max(${MIN_CELL}px, calc(100vw / ${COLS})))`,
          }}
        >
          {Array.from({ length: COLS * ROWS }, (_, index) => (
            <div
              key={index}
              className="border border-white/20 bg-background"
            />
          ))}
        </div>
      </div>

      {/* Card ornament layer — z-10 sits between grid bg (z-0) and content (z-20) */}
      <div
        data-hero-cards
        aria-hidden="true"
        className="absolute top-0 left-1/2 -translate-x-1/2 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, max(${MIN_CELL}px, calc(100vw / ${COLS})))`,
          gridTemplateRows: `repeat(${ROWS}, max(${MIN_CELL}px, calc(100vw / ${COLS})))`,
          zIndex: 10,
        }}
      >
        {HERO_CARDS.map(({ col, row, src, variant }, i) => (
          <div
            key={i}
            className="flex items-center justify-center p-2"
            style={{ gridColumn: col, gridRow: row }}
          >
            <GameCard
              src={src}
              variant={variant}
              className="w-full h-full"
              size={MIN_CELL}
            />
          </div>
        ))}
      </div>


      <div
        data-hero-content
        className="absolute top-0 left-1/2 z-20 -translate-x-1/2 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, max(${MIN_CELL}px, calc(100vw / ${COLS})))`,
          gridTemplateRows: `repeat(${ROWS}, max(${MIN_CELL}px, calc(100vw / ${COLS})))`,
        }}
      >
        {/* Title — cols 2-8, rows 3-6 (2 rows tall) */}
        <div className="flex flex-col justify-center items-center text-center px-4 bg-background border-white/20 border" style={{ gridColumn: "5 / 11", gridRow: "3 / 5" }}>
          <h1 className="sm:text-5xl md:text-6xl text-4xl font-black tracking-tight">
            Wilmot&apos;s Warehouse
          </h1>
          <p className="text-base font-semibold tracking-tight text-white/80 sm:text-lg">
            Organize the warehouse with memory and imagination.
          </p>
        </div>

        <div style={{ gridColumn: "7 / 9", gridRow: "6 / 7" }}>
          <Button
            className="flex items-center w-full h-full rounded-none px-4 text-2xl font-semibold tracking-tight bg-white text-black cursor-pointer"
          >
            Order Now
          </Button>
        </div>
      </div>
    </section>
  );
}
