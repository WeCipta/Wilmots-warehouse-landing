"use client";

import Image from "next/image";
import { useRef, useCallback } from "react";
import gsap from "gsap";
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
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Random float in [min, max] */
function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

// ─── Component ────────────────────────────────────────────────────────────────

/**
 * GameCard
 *
 * A reusable tile that mirrors the chunky, illustrated card aesthetic from
 * Wilmot's Warehouse. It can render any SVG from /public/cards and supports
 * both "face-up" (illustrated) and "face-down" (patterned back) states.
 *
 * Click animation: the card jiggles to a random rotation with an elastic
 * bounce, then settles back to 0°. GSAP consumers can also target the
 * [data-game-card] attribute for external animations (skew, float, etc.).
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
  const cardRef = useRef<HTMLSpanElement>(null);

  const imageSrc =
    variant === "face-down" || !src ? "/cards/back.svg" : `/cards/${src}`;

  /** Fires on every click — picks a random rotation and bounces back. */
  const handleClick = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (cardRef.current) {
        const current = gsap.getProperty(cardRef.current, "rotation") as number;
        const sign = Math.random() < 0.5 ? -1 : 1;
        const delta = sign * rand(10, 25);
        // Clamp accumulated rotation to [-90, 90]
        const target = Math.min(45, Math.max(-45, current + delta));

        gsap.killTweensOf(cardRef.current);
        gsap.to(cardRef.current, {
          rotation: target,
          duration: 0.35,
          ease: "back.out(1.7)",
        });
      }
      onClick?.(e);
    },
    [onClick]
  );

  const card = (
    <span
      ref={cardRef}
      data-game-card
      className={cn(
        // Base shape
        "relative inline-block select-none overflow-hidden",
        // Chunky inset border that mimics the physical card feel
        "ring-[3px] ring-inset ring-white/30",
        "shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)]",
        // Rounded corners
        "rounded-[10px]",
        // Pre-allocate GPU layer for GSAP transforms
        "will-change-transform",
        // Interactive hover/active states
        interactive &&
          "cursor-pointer transition-[box-shadow] duration-150 ease-out hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]",
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

  // Always wrap in a button when interactive so the click handler works
  // whether or not a custom onClick is passed (for the rotation to fire).
  if (interactive) {
    return (
      <div
        onClick={handleClick}
        className="appearance-none bg-transparent p-0 border-0 focus-visible:outline-none cursor-pointer focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[10px]"
      >
        {card}
      </div>
    );
  }

  return card;
}
