"use client";

import { useEffect, useState } from "react";
import { useLenis } from "lenis/react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  BENTO_VARIANTS,
  BentoSection,
  type BentoVariantId,
} from "./bento-layouts";

type LabMode = BentoVariantId | "all";

export function WhatYouGetLab() {
  const [mode, setMode] = useState<LabMode>("split");
  const lenis = useLenis();

  useEffect(() => {
    lenis?.scrollTo(0, { immediate: true });
  }, [mode, lenis]);

  return (
    <main className="flex flex-1 flex-col bg-background">
      <div
        className={cn(
          "sticky top-0 z-40 flex flex-wrap items-center justify-center gap-2 border-b border-white/20 bg-background/90 py-3 backdrop-blur-sm",
          "pl-[calc(var(--grid-cell)+0.75rem)] pr-[calc(var(--grid-cell)+0.75rem)]"
        )}
      >
        {BENTO_VARIANTS.map((variant) => (
          <Button
            key={variant.id}
            size="sm"
            variant={mode === variant.id ? "filled" : "outline"}
            onClick={() => setMode(variant.id)}
          >
            {variant.label}
          </Button>
        ))}
        <Button
          size="sm"
          variant={mode === "all" ? "filled" : "outline"}
          onClick={() => setMode("all")}
        >
          Show all
        </Button>
      </div>
      <p className="px-6 pt-4 text-center text-xs font-bold uppercase tracking-widest text-white/35 sm:px-10">
        Lab playground: split stacks below 1280px
      </p>
      {mode === "all" ? (
        BENTO_VARIANTS.map((variant) => (
          <BentoSection
            key={variant.id}
            variant={variant.id}
            caption={variant.label}
          />
        ))
      ) : (
        <BentoSection variant={mode} />
      )}
    </main>
  );
}
