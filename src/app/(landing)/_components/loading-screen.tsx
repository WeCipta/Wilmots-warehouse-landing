"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import { GameCard } from "@/components/game-card";

gsap.registerPlugin(Flip);

const FLICK_CARDS = [
  "banana.svg",
  "bomb.svg",
  "frog.svg",
  "gem.svg",
  "sun.svg",
  "mask.svg",
  "rainbow.svg",
  "volcano.svg",
  "icecream.svg",
  "horse.svg",
  "target.svg",
  "apple.svg",
  "watermelon.svg",
  "lightbulb.svg",
  "diamond.svg",
  "eye.svg",
  "cube.svg",
  "confetti.svg",
  "lava.svg",
  "satellite.svg",
  "spade.svg",
  "tree.svg",
  "wave.svg",
  "wrench.svg",
];

const LOGO = "logo.svg";
const FLICK_MS = 0.1;
const LOGO_HOLD = 0.85;
const FADE_DURATION = 0.65;
const CARD_SIZE = 128;

function preloadImages(filenames: string[]) {
  return Promise.all(
    filenames.map(
      (file) =>
        new Promise<void>((resolve) => {
          const img = new window.Image();
          img.onload = () => resolve();
          img.onerror = () => resolve();
          img.src = `/cards/${file}`;
        })
    )
  );
}

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export function LoadingScreen() {
  const bgRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [visible, setVisible] = useState(true);
  const [cardSrc, setCardSrc] = useState(FLICK_CARDS[0]);
  const [fading, setFading] = useState(false);

  useEffect(() => {
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    let cancelled = false;
    let tl: gsap.core.Timeline | null = null;

    (async () => {
      const sequence = [...shuffle(FLICK_CARDS).slice(0, 20), LOGO];
      await preloadImages(sequence);
      if (cancelled) return;

      tl = gsap.timeline({
        onComplete: () => {
          if (cancelled) return;
          const navLogo = document.querySelector<HTMLElement>("[data-nav-logo]");
          if (navLogo) gsap.set(navLogo, { visibility: "visible" });
          setVisible(false);
        },
      });

      sequence.forEach((file) => {
        const isLogo = file === LOGO;
        tl!.call(() => {
          if (!cancelled) setCardSrc(file);
        });
        tl!.to({}, { duration: isLogo ? LOGO_HOLD : FLICK_MS });
      });

      tl.call(() => {
        if (!cancelled) setFading(true);
      });

      tl.to(bgRef.current, {
        opacity: 0,
        duration: FADE_DURATION,
        ease: "power2.inOut",
        onStart: () => {
          if (cancelled) return;
          const loaderLogo = logoRef.current;
          const navLogo = document.querySelector<HTMLElement>("[data-nav-logo]");
          if (!loaderLogo || !navLogo) return;

          gsap.set(navLogo, { visibility: "hidden" });

          Flip.fit(loaderLogo, navLogo, {
            scale: true,
            duration: FADE_DURATION,
            ease: "power2.inOut",
          });
        },
      });
    })();

    return () => {
      cancelled = true;
      tl?.kill();
      const navLogo = document.querySelector<HTMLElement>("[data-nav-logo]");
      if (navLogo) gsap.set(navLogo, { visibility: "visible" });
      document.body.style.overflow = prevOverflow;
    };
  }, []);

  useEffect(() => {
    if (!visible) {
      document.body.style.overflow = "";
    }
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      role="status"
      aria-busy={!fading}
      aria-hidden={fading}
      className={`fixed inset-0 z-[100] flex items-center justify-center ${
        fading ? "pointer-events-none" : ""
      }`}
    >
      <div ref={bgRef} data-loader-bg className="absolute inset-0 bg-black" />
      <span className="sr-only">Loading</span>
      <div ref={logoRef} data-loader-logo className="relative z-10">
        <GameCard src={cardSrc} alt="" size={CARD_SIZE} />
      </div>
    </div>
  );
}
