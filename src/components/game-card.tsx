"use client";

import Image from "next/image";
import { useRef, useEffect, useLayoutEffect, useState } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useFollowMouse } from "@/components/follow-mouse";
import { GRID_CELL } from "@/lib/grid";

export type CardVariant = "face-up" | "face-down";

export interface GameCardProps {
  src?: string;
  alt?: string;
  variant?: CardVariant;
  size?: number | string;
  className?: string;
  interactive?: boolean;
  lens?: boolean;
  flipped?: boolean;
  onClick?: React.MouseEventHandler<HTMLDivElement>;
}

function rand(min: number, max: number) {
  return Math.random() * (max - min) + min;
}

function LensFace({
  src,
  alt,
  imageSize,
}: {
  src: string;
  alt: string;
  imageSize: number;
}) {
  const { x, y, radius } = useFollowMouse();
  const faceRef = useRef<HTMLSpanElement>(null);
  const [clipPath, setClipPath] = useState("circle(0px at 50% 50%)");

  useLayoutEffect(() => {
    const el = faceRef.current;
    if (!el || x < -1000) {
      setClipPath("circle(0px at 50% 50%)");
      return;
    }
    const rect = el.getBoundingClientRect();
    setClipPath(`circle(${radius}px at ${x - rect.left}px ${y - rect.top}px)`);
  }, [x, y, radius]);

  return (
    <span
      ref={faceRef}
      className="absolute inset-0 block"
      style={{ clipPath }}
    >
      <Image
        src={`/cards/${src}`}
        alt={alt}
        width={imageSize}
        height={imageSize}
        className="block h-full w-full object-cover"
        draggable={false}
        priority={false}
      />
    </span>
  );
}

const cardShellClass =
  "relative select-none overflow-hidden shrink-0 ring-[3px] ring-inset ring-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.15)] rounded-[10px] will-change-transform";

export function GameCard({
  src,
  alt = "card",
  variant = "face-up",
  size = GRID_CELL,
  className,
  interactive = false,
  lens = false,
  flipped,
  onClick,
}: GameCardProps) {
  const cardRef = useRef<HTMLSpanElement>(null);
  const flipInnerRef = useRef<HTMLSpanElement>(null);
  const imageSize = typeof size === "number" ? size : GRID_CELL;
  const fillsParent = typeof size === "string";
  const useFlip = !lens && !!src && typeof flipped === "boolean";

  const showLensFace = lens && !!src;
  const imageSrc =
    lens || variant === "face-down" || !src
      ? "/cards/back.svg"
      : `/cards/${src}`;

  useEffect(() => {
    if (!lens) return;
    const el = cardRef.current;
    if (!el) return;

    let delayTween: gsap.core.Tween | null = null;
    let shakeTl: gsap.core.Timeline | null = null;
    let cancelled = false;

    const schedule = () => {
      if (cancelled) return;
      delayTween = gsap.delayedCall(rand(6, 14), () => {
        if (cancelled || !cardRef.current) return;
        const sign = Math.random() < 0.5 ? -1 : 1;
        shakeTl = gsap
          .timeline({
            onComplete: schedule,
          })
          .to(cardRef.current, {
            x: sign * rand(2, 3),
            rotation: sign * rand(1, 2),
            duration: 0.09,
            ease: "power1.inOut",
          })
          .to(cardRef.current, {
            x: -sign * rand(1, 2),
            rotation: -sign * rand(0.5, 1.5),
            duration: 0.09,
            ease: "power1.inOut",
          })
          .to(cardRef.current, {
            x: 0,
            rotation: 0,
            duration: 0.14,
            ease: "power2.out",
          });
      });
    };

    schedule();

    return () => {
      cancelled = true;
      delayTween?.kill();
      shakeTl?.kill();
      gsap.killTweensOf(el);
      gsap.set(el, { x: 0, rotation: 0 });
    };
  }, [lens]);

  const flipMountedRef = useRef(false);

  useEffect(() => {
    if (!useFlip) {
      flipMountedRef.current = false;
      return;
    }
    const el = flipInnerRef.current;
    if (!el) return;

    const target = flipped ? 180 : 0;
    if (!flipMountedRef.current) {
      flipMountedRef.current = true;
      gsap.set(el, { rotateY: target });
      return;
    }

    gsap.to(el, {
      rotateY: target,
      duration: 0.35,
      ease: "power2.inOut",
    });
  }, [flipped, useFlip]);

  const interactiveClass =
    interactive &&
    (lens
      ? "cursor-none transition-shadow duration-150 ease-out hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]"
      : "cursor-pointer transition-shadow duration-150 ease-out hover:shadow-[4px_6px_0px_0px_rgba(0,0,0,0.85),inset_0_1px_0_0_rgba(255,255,255,0.2)] active:shadow-[2px_2px_0px_0px_rgba(0,0,0,0.85)]");

  const card = useFlip ? (
    <span
      ref={cardRef}
      data-game-card
      className={cn(
        cardShellClass,
        "overflow-visible [perspective:800px]",
        fillsParent ? "block h-full w-full" : "inline-block",
        interactiveClass,
        className
      )}
      style={{ width: size, height: size, aspectRatio: "1 / 1" }}
    >
      <span
        ref={flipInnerRef}
        className="relative block h-full w-full [transform-style:preserve-3d]"
      >
        <span className="absolute inset-0 overflow-hidden rounded-[10px] [backface-visibility:hidden]">
          <Image
            src="/cards/back.svg"
            alt=""
            width={imageSize}
            height={imageSize}
            className="block h-full w-full object-cover"
            draggable={false}
            priority={false}
          />
        </span>
        <span className="absolute inset-0 overflow-hidden rounded-[10px] [backface-visibility:hidden] [transform:rotateY(180deg)]">
          <Image
            src={`/cards/${src}`}
            alt={alt}
            width={imageSize}
            height={imageSize}
            className="block h-full w-full object-cover"
            draggable={false}
            priority={false}
          />
        </span>
      </span>
    </span>
  ) : (
    <span
      ref={cardRef}
      data-game-card
      {...(lens ? { "data-follow-lens": true } : {})}
      className={cn(
        cardShellClass,
        fillsParent ? "block h-full w-full" : "inline-block",
        interactiveClass,
        className
      )}
      style={{ width: size, height: size, aspectRatio: "1 / 1" }}
    >
      <Image
        src={imageSrc}
        alt={showLensFace ? "" : alt}
        width={imageSize}
        height={imageSize}
        className="block h-full w-full object-cover"
        draggable={false}
        priority={false}
      />
      {showLensFace && <LensFace src={src} alt={alt} imageSize={imageSize} />}
    </span>
  );

  if (interactive) {
    return (
      <div
        onClick={onClick}
        className={cn(
          "appearance-none bg-transparent p-0 border-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/60 focus-visible:ring-offset-2 focus-visible:ring-offset-background rounded-[10px]",
          fillsParent && "h-full w-full",
          lens ? "cursor-none" : "cursor-pointer"
        )}
      >
        {card}
      </div>
    );
  }

  return card;
}
