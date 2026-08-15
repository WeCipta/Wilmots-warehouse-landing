"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/utils";
import { siteContent } from "@/lib/site-content";
import { KitCell } from "@/app/(landing)/_components/kit-cell";

export type BentoVariantId = "wrap" | "split" | "banner" | "mosaic";

const sectionClass =
  "flex min-h-[calc(100dvh-5.75rem)] flex-col justify-center gap-8 px-6 py-10 sm:px-10 md:px-16";

function SectionHeading({ caption }: { caption?: string }) {
  return (
    <header className="max-w-2xl">
      {caption ? (
        <p className="mb-2 text-xs font-black uppercase tracking-[0.2em] text-white/40">
          {caption}
        </p>
      ) : null}
      <h2 className="text-4xl font-black tracking-tight text-white sm:text-5xl md:text-6xl">
        {siteContent.whatYouGet.title}
      </h2>
      <p className="mt-3 max-w-md text-base font-semibold text-white/60 sm:text-lg">
        {siteContent.whatYouGet.body}
      </p>
    </header>
  );
}

function WrapBento() {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3",
        "md:grid-cols-4 md:grid-rows-[minmax(0,1.35fr)_minmax(0,1.35fr)_minmax(0,1fr)]",
        "md:min-h-[min(70vh,44rem)]"
      )}
    >
      <KitCell
        id="board"
        className="col-span-2 min-h-[17.5rem] md:col-span-3 md:row-span-2 md:min-h-0"
      />
      <KitCell id="tiles" className="min-h-40 md:min-h-0" />
      <KitCell id="customers" className="min-h-40 md:min-h-0" />
      <KitCell id="ideas" className="min-h-36 md:col-span-2 md:min-h-0" />
      <KitCell id="rulebook" className="min-h-36 md:col-span-2 md:min-h-0" />
    </div>
  );
}

function SplitBento() {
  return (
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
  );
}

function BannerBento() {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3",
        "md:grid-cols-4 md:grid-rows-[minmax(0,1.7fr)_minmax(0,1fr)]",
        "md:min-h-[min(70vh,44rem)]"
      )}
    >
      <KitCell
        id="board"
        className="col-span-2 min-h-44 md:col-span-4 md:min-h-0"
      />
      <KitCell id="tiles" className="min-h-32 md:min-h-0" />
      <KitCell id="customers" className="min-h-32 md:min-h-0" />
      <KitCell id="ideas" className="min-h-32 md:min-h-0" />
      <KitCell id="rulebook" className="min-h-32 md:min-h-0" />
    </div>
  );
}

function MosaicBento() {
  return (
    <div
      className={cn(
        "grid grid-cols-2 gap-3",
        "md:grid-cols-4 md:grid-rows-3",
        "md:min-h-[min(70vh,44rem)]"
      )}
    >
      <KitCell
        id="board"
        className="col-span-2 min-h-60 md:row-span-2 md:min-h-0"
      />
      <KitCell
        id="tiles"
        spread
        className="col-span-2 min-h-40 md:min-h-0"
      />
      <KitCell
        id="customers"
        spread
        className="col-span-2 min-h-40 md:min-h-0"
      />
      <KitCell id="ideas" className="min-h-36 md:col-span-2 md:min-h-0" />
      <KitCell id="rulebook" className="min-h-36 md:col-span-2 md:min-h-0" />
    </div>
  );
}

const BENTOS: Record<BentoVariantId, () => ReactNode> = {
  wrap: WrapBento,
  split: SplitBento,
  banner: BannerBento,
  mosaic: MosaicBento,
};

export function BentoSection({
  variant,
  caption,
}: {
  variant: BentoVariantId;
  caption?: string;
}) {
  const Bento = BENTOS[variant];
  return (
    <section className={sectionClass}>
      <SectionHeading caption={caption} />
      <Bento />
    </section>
  );
}

export const BENTO_VARIANTS: { id: BentoVariantId; label: string }[] = [
  { id: "wrap", label: "Wrap" },
  { id: "split", label: "Split" },
  { id: "banner", label: "Banner" },
  { id: "mosaic", label: "Mosaic" },
];
