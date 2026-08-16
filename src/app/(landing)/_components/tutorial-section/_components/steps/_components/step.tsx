"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { SplitText } from "gsap/SplitText";
import { pickBrandAccent } from "@/lib/brand-accents";
import { cn } from "@/lib/utils";
import { useStepVisibility } from "../../../_hooks/use-step-visibility";
import type { TutorialStep as TutorialStepData } from "../../../_lib/data";

gsap.registerPlugin(SplitText);

function StepTitle({ title }: { title: string }) {
  const titleRef = useRef<HTMLHeadingElement>(null);

  useGSAP(
    () => {
      const el = titleRef.current;
      if (!el) return;

      const split = SplitText.create(el, {
        type: "chars,words",
        charsClass: "step-title-char",
        wordsClass: "step-title-word",
        smartWrap: true,
        autoSplit: true,
        onSplit(self) {
          const chars = self.chars as HTMLElement[];
          gsap.set(chars, { transition: "color 150ms ease" });

          for (const char of chars) {
            const onEnter = () => {
              char.style.color = pickBrandAccent().color;
            };
            const onLeave = () => {
              char.style.color = "";
            };
            char.addEventListener("pointerenter", onEnter);
            char.addEventListener("pointerleave", onLeave);
          }
        },
      });

      return () => {
        split.revert();
      };
    },
    { scope: titleRef }
  );

  return (
    <h3
      ref={titleRef}
      className="text-3xl font-black uppercase leading-none tracking-tighter text-white sm:text-4xl lg:text-6xl"
    >
      {title}
    </h3>
  );
}

export function TutorialStep({
  step,
  className,
  trackVisibility = true,
}: {
  step: TutorialStepData;
  className?: string;
  trackVisibility?: boolean;
}) {
  const sectionRef = useStepVisibility<HTMLElement>(step.number, trackVisibility);

  return (
    <section
      ref={sectionRef}
      className={cn("relative min-h-svh bg-background", className)}
    >
      <div className="flex min-h-svh flex-col justify-center gap-6 px-8 py-16 sm:px-12 sm:py-20 md:px-16 lg:py-24">
        <span className="font-mono text-xs font-bold text-white/40 sm:text-sm">
          {step.number}
        </span>
        <StepTitle title={step.title} />
        <p className="max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
          {step.description}
        </p>
        <p className="font-mono text-[10px] uppercase tracking-wider text-white/40 sm:text-xs">
          {step.hint}
        </p>
      </div>
    </section>
  );
}
