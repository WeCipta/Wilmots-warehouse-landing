import { Fragment } from "react";
import { TutorialBoard } from "../board";
import { TutorialStep } from "./_components/step";
import { TutorialStepBreak } from "./_components/step-break";
import { STEPS } from "../../_lib/data";

export function TutorialSteps() {
  return (
    <>
      <div className="hidden xl:grid xl:grid-cols-2">
        <div>
          {STEPS.map((step) => (
            <TutorialStep key={step.number} step={step} />
          ))}
        </div>
        <div className="sticky top-0 h-svh">
          <TutorialBoard />
        </div>
      </div>

      <div className="relative xl:hidden">
        <div className="sticky top-0 z-0 h-svh">
          <TutorialBoard />
        </div>
        <div className="pointer-events-none relative z-10 -mt-[100svh]">
          {STEPS.map((step) => (
            <Fragment key={step.number}>
              <div className="pointer-events-auto">
                <TutorialStep
                  step={step}
                  className="border-y border-white/20"
                  trackVisibility={false}
                />
              </div>
              <TutorialStepBreak number={step.number} className="h-svh" />
            </Fragment>
          ))}
        </div>
      </div>
    </>
  );
}
