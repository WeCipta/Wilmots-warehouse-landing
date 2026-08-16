"use client";

import { ArrowUpRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";
import { customerAlt, mediaAlt } from "@/lib/card-faces";
import { siteContent } from "@/lib/site-content";
import { useTutorialBoard } from "./context";
import {
  TUTORIAL_INTRO,
  TUTORIAL_PRODUCT_FACES,
  TUTORIAL_RULE_SRC,
  TUTORIAL_VIDEO_URL,
} from "../_lib/data";

function TutorialKit() {
  const { customers } = useTutorialBoard();

  return (
    <div
      className="grid grid-cols-4 gap-2 sm:gap-3"
      aria-label={siteContent.tutorial.kitAriaLabel}
    >
      {TUTORIAL_PRODUCT_FACES.map((src) => (
        <div key={src} className="aspect-square w-full">
          <GameCard src={src} alt={mediaAlt(src)} size="100%" />
        </div>
      ))}
      {customers.map((customer) => (
        <div key={customer.customerSrc} className="aspect-square w-full">
          <GameCard
            src={customer.customerSrc}
            alt={customerAlt(customer.customerSrc)}
            size="100%"
          />
        </div>
      ))}
      <div className="aspect-square w-full">
        <GameCard
          src={TUTORIAL_RULE_SRC}
          alt={siteContent.tutorial.ruleAlt}
          size="100%"
        />
      </div>
    </div>
  );
}

export function TutorialIntro() {
  const { hasPlacedCards, resetBoard } = useTutorialBoard();

  return (
    <section className="relative overflow-hidden bg-background xl:min-h-svh">
      <div className="flex flex-col gap-8 px-8 pt-16 pb-10 sm:px-12 sm:pt-20 sm:pb-12 md:px-16 xl:grid xl:min-h-svh xl:grid-cols-2 xl:gap-0 xl:px-0 xl:py-0">
        <div className="flex flex-col items-start gap-6 xl:justify-center xl:px-16 xl:py-24">
          <h2 className="text-4xl font-black uppercase leading-none tracking-tighter text-white sm:text-5xl lg:text-7xl">
            {siteContent.tutorial.title}
          </h2>
          <p className="max-w-md text-sm leading-relaxed text-white/50 sm:text-base">
            {TUTORIAL_INTRO.blurb}
          </p>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="filled"
              size="default"
              className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base"
              nativeButton={false}
              render={
                <a
                  href={TUTORIAL_VIDEO_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                />
              }
            >
              {TUTORIAL_INTRO.videoLabel}
              <ArrowUpRight data-icon="inline-end" />
            </Button>
            {hasPlacedCards && (
              <Button
                variant="outline"
                size="default"
                className="h-11 px-5 text-sm sm:h-12 sm:px-6 sm:text-base"
                onClick={resetBoard}
              >
                {TUTORIAL_INTRO.resetLabel}
              </Button>
            )}
          </div>
        </div>

        <div className="xl:flex xl:flex-col xl:justify-center xl:px-16 xl:py-24">
          <div className="mx-auto w-full max-w-md sm:max-w-lg xl:mx-0 xl:max-w-xl">
            <TutorialKit />
          </div>
        </div>
      </div>
    </section>
  );
}
