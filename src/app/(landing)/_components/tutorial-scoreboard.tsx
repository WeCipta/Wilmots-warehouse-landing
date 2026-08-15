"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";

const PRINT_STEPS = 16;
const STEP_MOVE = 0.09;
const STEP_HOLD = 0.07;

export function TutorialScoreboard({ active }: { active: boolean }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);
  const headRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const root = rootRef.current;
      const sheet = sheetRef.current;
      const head = headRef.current;
      if (!root || !sheet || !head) return;

      gsap.killTweensOf([root, sheet, head]);

      if (!active) {
        gsap.set(root, { autoAlpha: 0 });
        gsap.set(sheet, { yPercent: -100 });
        gsap.set(head, { autoAlpha: 0 });
        return;
      }

      gsap.set(root, { autoAlpha: 1 });
      gsap.set(sheet, { yPercent: -100 });
      gsap.set(head, { autoAlpha: 1 });

      const tl = gsap.timeline();
      for (let step = 1; step <= PRINT_STEPS; step++) {
        tl.to(sheet, {
          yPercent: -100 + (step / PRINT_STEPS) * 100,
          duration: STEP_MOVE,
          ease: "power1.inOut",
        });
        if (step < PRINT_STEPS) {
          tl.to({}, { duration: STEP_HOLD });
        }
      }
      tl.to(head, { autoAlpha: 0, duration: 0.12 });
    },
    { scope: rootRef, dependencies: [active] }
  );

  return (
    <div
      ref={rootRef}
      className="pointer-events-none absolute inset-0 z-60 overflow-hidden opacity-0"
    >
      <div
        ref={sheetRef}
        className="absolute top-0 left-1/2 w-[90%] max-w-285 -translate-x-1/2"
      >
        <img
          src="/images/scoreboard.svg"
          alt=""
          className="block h-auto w-full"
          draggable={false}
        />
      </div>
      <div
        ref={headRef}
        className="absolute inset-x-0 top-0 h-1 bg-black opacity-0"
      />
    </div>
  );
}
