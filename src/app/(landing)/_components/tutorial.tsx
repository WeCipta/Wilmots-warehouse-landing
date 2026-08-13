"use client";

import Image from "next/image";
import { useGridMetrics } from "@/hooks/use-grid-metrics";

const STEPS = [
  {
    number: "01",
    title: "Draw & Observe",
    subtitle: "Draw",
    description:
      "Each player draws a hand of product tiles and observes the symbols on their face.",
  },
  {
    number: "02",
    title: "Discuss & Create a Story",
    subtitle: "Discuss",
    description:
      "Together, make up a silly story to remember each product's position on the board.",
  },
  {
    number: "03",
    title: "Place & Flip",
    subtitle: "Place & Flip",
    description:
      "Place all product tiles face-down on the warehouse board in your agreed positions.",
  },
  {
    number: "04",
    title: "Face the Surprise Rules",
    subtitle: "The Rules",
    description:
      "A rule card is revealed — follow the special rule it brings to the round.",
  },
  {
    number: "05",
    title: "5 Thrilling Minutes!",
    subtitle: "Match & Rush",
    description:
      "Race the five-minute timer to flip and match product tiles with the customer orders.",
  },
];

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday"] as const;

// Cards: back on Monday, rule on Tue–Fri
const CARD_SRCS = [
  "/cards/backs/back.svg",
  "/cards/backs/rule.svg",
  "/cards/backs/rule.svg",
  "/cards/backs/rule.svg",
  "/cards/backs/rule.svg",
];

export default function Tutorial() {
  const grid = useGridMetrics();
  const isMobile = grid.breakpoint === "mobile";
  const isTablet = grid.breakpoint === "tablet";

  // Responsive board dimensions
  // On mobile: leftW=0 so left border + corner pieces are hidden,
  // day slots fill full width matching the section grid above.
  const leftW   = isMobile ? 0   : isTablet ? 44  : 56;
  const bottomH = isMobile ? 36  : isTablet ? 46  : 56;
  const cardSize = isMobile ? 52  : isTablet ? 70  : 96;
  const cardsH  = cardSize + 8;

  // Cell size for the board grid — matches the global grid cell for desktop,
  // and scales proportionally for smaller breakpoints.
  const boardCellPx = isMobile ? 48 : isTablet ? 64 : grid.cellPx;

  return (
    <section
      id="how-to-play"
      className="relative overflow-hidden bg-background"
      style={{ minHeight: "100svh" }}
    >
      <div className="grid h-full min-h-[inherit] grid-cols-1 lg:grid-cols-2">

        {/* ── LEFT COLUMN ── */}
        <div className="flex flex-col justify-center gap-8 px-8 py-16 sm:px-12 sm:py-20 md:px-16 lg:py-24">
          <h2 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl lg:text-7xl">
            How to Play
          </h2>

          <ol className="flex flex-col">
            {STEPS.map((step) => (
              <li
                key={step.number}
                className="group relative flex gap-4 border-t border-white/10 py-4 last:border-b last:border-white/10 sm:gap-5 sm:py-5"
              >
                {/* Step number */}
                <span className="mt-0.5 w-8 shrink-0 font-mono text-xs font-bold text-white/40 sm:w-10">
                  {step.number}
                </span>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-xs font-black uppercase tracking-wide text-white sm:text-sm">
                      {step.title}
                    </span>
                    <span className="rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                      {step.subtitle}
                    </span>
                  </div>
                  <p className="text-xs leading-relaxed text-white/50 sm:text-sm">
                    {step.description}
                  </p>
                </div>

                {/* Hover line */}
                <div
                  aria-hidden="true"
                  className="absolute left-0 top-0 h-[1px] w-0 bg-white transition-all duration-500 group-hover:w-full"
                />
              </li>
            ))}
          </ol>
        </div>

        {/* ── RIGHT COLUMN: board fills edge-to-edge ── */}
        {/*
         * On mobile/tablet this column is stacked below text.
         * We give it a fixed viewport-relative height so the absolute
         * board elements have a containing block to anchor to.
         */}
        <div
          className="relative overflow-hidden lg:h-auto"
          style={{ minHeight: isMobile ? "55svh" : isTablet ? "50svh" : undefined }}
        >
          {/* Left border strip — hidden on mobile, stops above cards row on tablet/desktop */}
          {!isMobile && (
            <div
              className="absolute left-0 top-0 z-10"
              style={{ width: leftW, bottom: cardsH }}
            >
              <Image
                src="/board/left.webp"
                alt="Board left border"
                fill
                className="object-cover object-top"
                sizes={`${leftW}px`}
                priority
              />
            </div>
          )}

          {/*
           * Inner grid — anchored bottom-left, overflows top + right.
           * repeat(20) ensures no right-side gap.
           */}
          <div
            className="absolute left-0 right-0 top-0 overflow-hidden"
            style={{ bottom: bottomH + cardsH }}
          >
            <div
              className="absolute bottom-0"
              style={{
                left: leftW,
                display: "grid",
                gridTemplateColumns: `repeat(20, ${boardCellPx}px)`,
                gridAutoRows: `${boardCellPx}px`,
              }}
            >
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-white/20 bg-background"
                  style={{ width: boardCellPx, height: boardCellPx }}
                />
              ))}
            </div>
          </div>

          {/*
           * Bottom border row.
           * Mobile: only the 5 day slots, no corner pieces → equal spacing.
           * Tablet/Desktop: left-side + days + right-side.
           */}
          <div
            className="absolute left-0 right-0 z-10 flex"
            style={{ bottom: cardsH, height: bottomH }}
          >
            {!isMobile && (
              <div className="relative shrink-0" style={{ width: leftW }}>
                <Image src="/board/left-side.webp" alt="" fill className="object-cover object-top" sizes={`${leftW}px`} />
              </div>
            )}
            {DAYS.map((day) => (
              <div key={day} className="relative flex-1">
                <Image src={`/board/${day}.webp`} alt={day} fill className="object-cover" sizes="20vw" />
              </div>
            ))}
            {!isMobile && (
              <div className="relative shrink-0" style={{ width: leftW }}>
                <Image src="/board/right-side.webp" alt="" fill className="object-cover object-top" sizes={`${leftW}px`} />
              </div>
            )}
          </div>

          {/*
           * Cards row — same flex structure as bottom border for perfect alignment.
           * back.svg → Monday, rule.svg × 4 → Tue–Fri
           */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex items-start"
            style={{ height: cardsH, paddingTop: 4 }}
          >
            {/* Left spacer — only on tablet/desktop */}
            {!isMobile && <div className="shrink-0" style={{ width: leftW }} />}

            {DAYS.map((day, idx) => (
              <div key={day} className="flex flex-1 justify-center">
                <div
                  className="relative overflow-hidden rounded-[10px] ring-[3px] ring-inset ring-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] bg-[#FFFDEB]"
                  style={{ width: cardSize, height: cardSize }}
                >
                  <Image
                    src={CARD_SRCS[idx]}
                    alt={idx === 0 ? "Card back" : "Rule card"}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            ))}

            {/* Right spacer — only on tablet/desktop */}
            {!isMobile && <div className="shrink-0" style={{ width: leftW }} />}
          </div>
        </div>

      </div>
    </section>
  );
}