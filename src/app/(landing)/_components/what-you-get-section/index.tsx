"use client";

import { siteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import { KitCell } from "./_components/kit-cell";

export function WhatYouGetSection() {
  return (
    <section
      id="what-you-get"
      className="relative flex min-h-dvh flex-col justify-center gap-8 bg-background px-6 py-16 sm:px-10 md:px-16"
    >
      <header className="max-w-2xl">
        <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
          {siteContent.whatYouGet.title}
        </h2>
        <p className="mt-3 max-w-md text-base font-semibold text-white/60 sm:text-lg">
          {siteContent.whatYouGet.body}
        </p>
      </header>
      <div
        className={cn(
          "grid grid-cols-2 gap-3",
          "xl:grid-cols-4 xl:grid-rows-2",
          "xl:min-h-[min(70vh,44rem)]"
        )}
      >
        <KitCell
          id="board"
          className="col-span-2 min-h-[22rem] sm:min-h-[26rem] xl:row-span-2 xl:min-h-0"
        />
        <KitCell id="tiles" className="min-h-32 sm:min-h-36 xl:min-h-0" />
        <KitCell id="customers" className="min-h-32 sm:min-h-36 xl:min-h-0" />
        <KitCell id="ideas" className="min-h-32 sm:min-h-36 xl:min-h-0" />
        <KitCell id="rulebook" className="min-h-32 sm:min-h-36 xl:min-h-0" />
      </div>
    </section>
  );
}
