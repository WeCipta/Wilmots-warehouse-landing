"use client";

import { useStepVisibility } from "../../../_hooks/use-step-visibility";

export function TutorialStepBreak({
  number,
  className,
}: {
  number: string;
  className?: string;
}) {
  const ref = useStepVisibility<HTMLDivElement>(number);
  return <div ref={ref} className={className} />;
}
