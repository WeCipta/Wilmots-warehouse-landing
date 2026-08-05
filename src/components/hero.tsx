"use client";

import Image from "next/image";
import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const COLS = 14;
const ROWS = 9;

export function Hero() {
  const rootRef = useRef<HTMLElement>(null);

  useGSAP(
    () => {
      const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

      tl.from("[data-hero-grid] > *", {
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
      className="relative isolate min-h-dvh overflow-hidden bg-black text-white"
    >
      <div
        data-hero-grid
        className="absolute inset-0 grid"
        style={{
          gridTemplateColumns: `repeat(${COLS}, minmax(0, 1fr))`,
          gridTemplateRows: `repeat(${ROWS}, minmax(0, 1fr))`,
        }}
        aria-hidden="true"
      >
        {Array.from({ length: COLS * ROWS }, (_, index) => (
          <div
            key={index}
            className="border border-white bg-black"
          />
        ))}
      </div>

      <Image
        data-hero-frame
        src="/board/top.webp"
        alt=""
        width={1920}
        height={129}
        priority
        className="pointer-events-none absolute top-0 left-0 z-20 h-auto w-full select-none"
      />
      <Image
        data-hero-frame
        src="/board/bottom.webp"
        alt=""
        width={1920}
        height={130}
        priority
        className="pointer-events-none absolute bottom-0 left-0 z-10 h-auto w-full select-none"
      />
      <Image
        data-hero-frame
        src="/board/left.webp"
        alt=""
        width={115}
        height={1537}
        priority
        className="pointer-events-none absolute top-0 left-0 z-10 h-full w-auto select-none"
      />
      <Image
        data-hero-frame
        src="/board/right.webp"
        alt=""
        width={115}
        height={1537}
        priority
        className="pointer-events-none absolute top-0 right-0 z-10 h-full w-auto select-none"
      />

      <div className="relative z-20 flex min-h-dvh items-center justify-center px-8 py-24 sm:px-16">
        <div
          data-hero-content
          className="flex max-w-xl flex-col items-center text-center"
        >
          <p className="text-4xl font-extrabold tracking-tight sm:text-6xl md:text-7xl">
            Wilmot&apos;s Warehouse
          </p>
          <h1 className="mt-5 text-lg font-semibold tracking-tight text-white/90 sm:text-2xl">
            Organize the warehouse with memory and imagination.
          </h1>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-white/70 sm:text-base">
            A cooperative game of sorting, storytelling, and remembering where
            everything went.
          </p>
          <a
            href="#about"
            className="mt-8 inline-flex h-12 items-center justify-center bg-white px-7 text-sm font-bold tracking-wide text-black transition-colors hover:bg-white/90"
          >
            Discover the game
          </a>
        </div>
      </div>
    </section>
  );
}
