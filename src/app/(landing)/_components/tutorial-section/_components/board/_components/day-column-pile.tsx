"use client";

import { useRef, type ReactNode } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

export function DayColumnPile({
  hidden,
  delay,
  children,
}: {
  hidden: boolean;
  delay: number;
  children: ReactNode;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const readyRef = useRef(false);

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;
      gsap.killTweensOf(el);
      if (!readyRef.current) {
        readyRef.current = true;
        gsap.set(el, hidden ? { autoAlpha: 0, y: 28 } : { autoAlpha: 1, y: 0 });
        return;
      }
      if (hidden) {
        gsap.to(el, {
          autoAlpha: 0,
          y: 28,
          duration: 0.35,
          delay,
          ease: "power2.in",
        });
        return;
      }
      gsap.to(el, {
        autoAlpha: 1,
        y: 0,
        duration: 0.4,
        delay,
        ease: "back.out(1.3)",
      });
    },
    { scope: rootRef, dependencies: [hidden, delay] }
  );

  return (
    <div
      ref={rootRef}
      className={cn(
        "flex flex-1 justify-center",
        hidden && "pointer-events-none"
      )}
    >
      {children}
    </div>
  );
}
