"use client";

import Image from "next/image";

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

// Width of the left border strip (px)
const LEFT_W = 56;
// Height of the bottom border strip (px)
const BOTTOM_H = 56;
// Height of cards row below bottom border (px)
const CARDS_H = 104;

export default function Tutorial() {
  return (
    <section
      id="how-to-play"
      className="relative overflow-hidden bg-background"
      style={{ minHeight: "100svh" }}
    >
      <div className="grid h-full min-h-[inherit] grid-cols-1 lg:grid-cols-2">
        <div className="flex flex-col justify-center gap-10 px-8 sm:px-12 md:px-16 lg:py-24">
          <h2 className="text-5xl font-black uppercase leading-none tracking-tighter text-white sm:text-6xl lg:text-7xl">
            How to Play
          </h2>

          <ol className="flex flex-col">
            {STEPS.map((step) => (
              <li
                key={step.number}
                className="group relative flex gap-5 border-t border-white/10 py-5 last:border-b last:border-white/10"
              >
                {/* Step number */}
                <span className="mt-0.5 w-10 shrink-0 font-mono text-xs font-bold text-white/40">
                  {step.number}
                </span>

                {/* Content */}
                <div className="flex flex-col gap-1">
                  <div className="flex flex-wrap items-baseline gap-2">
                    <span className="text-sm font-black uppercase tracking-wide text-white">
                      {step.title}
                    </span>
                    <span className="rounded border border-white/20 px-1.5 py-0.5 font-mono text-[10px] uppercase tracking-wider text-white/40">
                      {step.subtitle}
                    </span>
                  </div>
                  <p className="text-sm leading-relaxed text-white/50">
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

        {/* ── RIGHT COLUMN: board fills the column edge-to-edge, no padding ── */}
        <div className="relative overflow-hidden">

          {/* Left border strip — only alongside the grid, not the cards row */}
          <div
            className="absolute left-0 top-0 z-10"
            style={{ width: LEFT_W, bottom: CARDS_H }}
          >
            <Image
              src="/board/left.webp"
              alt="Board left border"
              fill
              className="object-cover object-top"
              sizes="56px"
              priority
            />
          </div>

          {/*
           * Inner grid — anchored bottom-left, overflows top + right.
           * repeat(20) guarantees full coverage with no right gap.
           */}
          <div
            className="absolute left-0 right-0 top-0 overflow-hidden"
            style={{ bottom: BOTTOM_H + CARDS_H }}
          >
            <div
              className="absolute bottom-0"
              style={{
                left: LEFT_W,
                display: "grid",
                gridTemplateColumns: `repeat(20, var(--grid-cell))`,
                gridAutoRows: "var(--grid-cell)",
              }}
            >
              {Array.from({ length: 200 }).map((_, i) => (
                <div
                  key={i}
                  className="border border-white/20 bg-background"
                  style={{ width: "var(--grid-cell)", height: "var(--grid-cell)" }}
                />
              ))}
            </div>
          </div>

          {/*
           * Bottom border — composed from individual day slot images.
           * Structure: [left-side] [monday] [tuesday] [wednesday] [thursday] [friday]
           * Using flex so each day slot stretches equally.
           */}
          <div
            className="absolute left-0 right-0 z-10 flex"
            style={{ bottom: CARDS_H, height: BOTTOM_H }}
          >
            {/* Left corner piece */}
            <div className="relative shrink-0" style={{ width: LEFT_W }}>
              <Image src="/board/left-side.webp" alt="" fill className="object-cover object-top" sizes="56px" />
            </div>
            {/* Day slots — equal flex */}
            {["monday", "tuesday", "wednesday", "thursday", "friday"].map((day) => (
              <div key={day} className="relative flex-1">
                <Image src={`/board/${day}.webp`} alt={day} fill className="object-cover" sizes="10vw" />
              </div>
            ))}
            {/* Right side piece */}
            <div className="relative shrink-0" style={{ width: LEFT_W }}>
              <Image src="/board/right-side.webp" alt="" fill className="object-cover object-top" sizes="56px" />
            </div>
          </div>

          {/*
           * Cards row — same flex structure as the bottom border so cards are
           * perfectly centered under each day slot image.
           * back.svg → Monday, rule.svg × 3 → Tue / Wed / Thu, Friday → empty
           */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20 flex items-start"
            style={{ height: CARDS_H, paddingTop: 6 }}
          >
            {/* Spacer matching left-side width */}
            <div className="shrink-0" style={{ width: LEFT_W }} />

            {/* Monday → back.svg */}
            <div className="flex flex-1 justify-center">
              <div
                className="relative overflow-hidden rounded-[10px] ring-[3px] ring-inset ring-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] bg-[#FFFDEB]"
                style={{ width: 96, height: 96 }}
              >
                <Image src="/cards/backs/back.svg" alt="Card back" fill className="object-cover" />
              </div>
            </div>

            {/* Tuesday → rule.svg */}
            <div className="flex flex-1 justify-center">
              <div
                className="relative overflow-hidden rounded-[10px] ring-[3px] ring-inset ring-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] bg-[#FFFDEB]"
                style={{ width: 96, height: 96 }}
              >
                <Image src="/cards/backs/rule.svg" alt="Rule card" fill className="object-cover" />
              </div>
            </div>

            {/* Wednesday → rule.svg */}
            <div className="flex flex-1 justify-center">
              <div
                className="relative overflow-hidden rounded-[10px] ring-[3px] ring-inset ring-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] bg-[#FFFDEB]"
                style={{ width: 96, height: 96 }}
              >
                <Image src="/cards/backs/rule.svg" alt="Rule card" fill className="object-cover" />
              </div>
            </div>

            {/* Thursday → rule.svg */}
            <div className="flex flex-1 justify-center">
              <div
                className="relative overflow-hidden rounded-[10px] ring-[3px] ring-inset ring-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] bg-[#FFFDEB]"
                style={{ width: 96, height: 96 }}
              >
                <Image src="/cards/backs/rule.svg" alt="Rule card" fill className="object-cover" />
              </div>
            </div>

            {/* Friday → rule.svg */}
            <div className="flex flex-1 justify-center">
              <div
                className="relative overflow-hidden rounded-[10px] ring-[3px] ring-inset ring-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] bg-[#FFFDEB]"
                style={{ width: 96, height: 96 }}
              >
                <Image src="/cards/backs/rule.svg" alt="Rule card" fill className="object-cover" />
              </div>
            </div>

            {/* Spacer matching right-side width */}
            <div className="shrink-0" style={{ width: LEFT_W }} />
          </div>
        </div>
      </div>
    </section>
  );
}