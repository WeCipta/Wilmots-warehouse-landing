"use client";

import { useEffect, useId, useRef } from "react";
import { useTutorialBoard } from "../_components/context";

const STEP_VISIBILITY_THRESHOLDS = [0, 0.15, 0.3, 0.5, 0.7, 1];

export function useStepVisibility<T extends HTMLElement>(
  number: string,
  enabled = true
) {
  const id = useId();
  const ref = useRef<T | null>(null);
  const { reportStepVisibility, clearStepVisibility } = useTutorialBoard();

  useEffect(() => {
    const el = ref.current;
    if (!el || !enabled) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        reportStepVisibility(id, number, entry.intersectionRatio);
      },
      { threshold: STEP_VISIBILITY_THRESHOLDS }
    );
    observer.observe(el);

    return () => {
      observer.disconnect();
      clearStepVisibility(id);
    };
  }, [id, number, enabled, reportStepVisibility, clearStepVisibility]);

  return ref;
}
