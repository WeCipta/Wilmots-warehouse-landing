"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

export type CardVariant = "face-up" | "face-down";

export interface GameCardProps {
  /** Filename inside /public/cards (e.g. "apple.svg") */
  src?: string;
  /** Alt text for the card image */
  alt?: string;
  /**
   * Whether the card shows its illustrated face or the patterned back.
   * Defaults to "face-up".
   */
  variant?: CardVariant;
  /**
   * Size of the card in pixels. The card is always square.
   * Defaults to 96.
   */
  size?: number;
  /** Extra Tailwind / className overrides on the outermost wrapper. */
  className?: string;
  /** Makes the card interactive (hover lift + cursor pointer). */
  interactive?: boolean;
  onClick?: React.MouseEventHandler<HTMLButtonElement>;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GameCard
 *
 * A reusable tile that mirrors the chunky, illustrated card aesthetic from
 * Wilmot's Warehouse. It can render any SVG from /public/cards and supports
 * both "face-up" (illustrated) and "face-down" (patterned back) states.
 *
 * Animation (random skew / float) is intentionally left to the consumer so
 * that GSAP can target the [data-game-card] attribute.
 */
export function GameCard({
  src,
  alt = "card",
  variant = "face-up",
  size = 96,
  className,
  interactive = false,
  onClick,
}: GameCardProps) {
  const imageSrc =
    variant === "face-down" || !src ? "/cards/back.svg" : `/cards/${src}`;

  const card = (
    <span
      data-game-card
      className={cn(
        // Base shape
        "relative inline-block select-none overflow-hidden",
        // Chunky inset border that mimics the physical card feel:
        // a thick dark right + bottom shadow (offset box-shadow) with a
        // bright top/left inner highlight.
        "ring-[3px] ring-inset ring-white/30",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)]",
        // Rounded corners — slightly less than the global radius
        "rounded-[10px]",
        // Smooth transforms for GSAP-driven skew / scale
        "will-change-transform",
        // Interactive states
        interactive &&
          "cursor-pointer transition-[transform,box-shadow] duration-150 ease-out hover:-translate-y-1 hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:translate-y-0 active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]",
        className
      )}
      style={{ width: size, height: size }}
    >
      <Image
        src={imageSrc}
        alt={alt}
        width={size}
        height={size}
        className="block h-full w-full object-cover"
        draggable={false}
        priority={false}
      />
    </span>
  );

  if (interactive && onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="appearance-none bg-transparent p-0 border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[10px]"
      >
        {card}
      </button>
    );
  }

  return card;
}
