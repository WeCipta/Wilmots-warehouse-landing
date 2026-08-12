"use client";

import { useMemo } from "react";
import { Button } from "@/components/ui/button";
import { HeroCardGrid } from "@/components/hero-card-grid";
import { GridOverlay } from "@/components/grid-overlay";
import { useFinePointer } from "@/hooks/use-fine-pointer";
import { useGridMetrics } from "@/hooks/use-grid-metrics";
import { getHeroLayout } from "@/lib/hero-grid-layout";
import {
  contentSpanStyle,
  getHeroContentSpan,
  siteContent,
} from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { HeroTitle } from "./hero-title";

export function Hero() {
  const grid = useGridMetrics();
  const layout = useMemo(
    () => getHeroLayout(grid.breakpoint, grid.cols, grid.rows),
    [grid.breakpoint, grid.cols, grid.rows]
  );
  const contentStyle = contentSpanStyle(getHeroContentSpan(grid.breakpoint));
  const hasFinePointer = useFinePointer();

  return (
    <section
      className={cn(
        "relative isolate min-h-dvh h-[200dvh] overflow-hidden bg-background",
        hasFinePointer && "cursor-none"
      )}
    >
      <GridOverlay
        data-grid="hero-bg"
        data-hero-grid
        aria-hidden="true"
        cols={grid.cols}
        rows={grid.rows}
        cell={grid.cellPx}
      />

      <HeroCardGrid
        key={grid.breakpoint}
        cards={layout.cards}
        cols={grid.cols}
        rows={grid.rows}
        gridStyle={grid.gridStyle}
        isUiBlocked={layout.isUiBlocked}
        lensEnabled={hasFinePointer}
      />

      <div
        data-hero-content
        className="pointer-events-none absolute inset-x-0 top-0 z-20 w-full grid"
        style={grid.gridStyle}
      >
        <div
          className="pointer-events-auto flex flex-col justify-center items-center text-center px-4 bg-background border-white/20 border"
          style={contentStyle}
        >
          <HeroTitle />
          <p className="text-base font-semibold tracking-tight text-white/80 sm:text-lg">
            {siteContent.hero.tagline}
          </p>
          <Button variant="filled" size="lg" className="mt-8">
            {siteContent.hero.cta}
          </Button>
        </div>
      </div>
    </section>
  );
}
