"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { useRef } from "react";
import { cn } from "@/lib/utils";
import {
  TUTORIAL_BUBBLE_MAX_LENGTH,
  TUTORIAL_BUBBLE_SHAPES,
  type TutorialBubbleShape,
} from "./tutorial-data";

const SHAPE_RADIUS: Record<TutorialBubbleShape, string> = {
  round: "rounded-full",
  oval: "rounded-[999px]",
  squircle: "rounded-[22px]",
  pill: "rounded-full",
};

const SHAPE_PAD: Record<TutorialBubbleShape, string> = {
  round: "px-4 py-3",
  oval: "px-5 py-3",
  squircle: "px-4 py-3",
  pill: "px-5 py-2.5",
};

const TEXT_CLASS =
  "text-center text-sm font-black leading-tight wrap-break-word [overflow-wrap:anywhere]";

export function TutorialBubble({
  faceSrc,
  text,
  onChange,
  readOnly = false,
  visible,
  delay = 0,
}: {
  faceSrc: string;
  text: string;
  onChange?: (value: string) => void;
  readOnly?: boolean;
  visible: boolean;
  delay?: number;
}) {
  const rootRef = useRef<HTMLDivElement>(null);
  const shape =
    TUTORIAL_BUBBLE_SHAPES[faceSrc as keyof typeof TUTORIAL_BUBBLE_SHAPES] ??
    "squircle";

  useGSAP(
    () => {
      const el = rootRef.current;
      if (!el) return;

      gsap.killTweensOf(el);

      if (!visible) {
        gsap.set(el, { scale: 0, autoAlpha: 0 });
        return;
      }

      gsap.fromTo(
        el,
        { scale: 0, autoAlpha: 0, y: 8 },
        {
          scale: 1,
          autoAlpha: 1,
          y: 0,
          duration: 0.35,
          delay,
          ease: "back.out(1.6)",
          onComplete() {
            gsap.to(el, {
              y: -3,
              duration: 1.4,
              yoyo: true,
              repeat: -1,
              ease: "sine.inOut",
            });
          },
        }
      );

      return () => {
        gsap.killTweensOf(el);
      };
    },
    { scope: rootRef, dependencies: [visible, delay] }
  );

  return (
    <div
      ref={rootRef}
      className="invisible absolute bottom-full left-full z-30 mb-3 -ml-3 origin-bottom-left scale-0 opacity-0"
    >
      <div
        className={cn(
          "relative w-max max-w-48",
          !readOnly && "pointer-events-auto"
        )}
        onPointerDown={(event) => event.stopPropagation()}
        onClick={(event) => event.stopPropagation()}
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          className="absolute top-[calc(100%-5px)] left-1 z-0 size-6 overflow-visible"
        >
          <path
            d="M8 2 L20 4 L2 22 Z"
            fill="#000"
            transform="translate(4 4)"
          />
          <path
            d="M8 2 L20 4 L2 22 Z"
            fill="#fff"
            stroke="#000"
            strokeWidth="2"
            strokeLinejoin="round"
          />
        </svg>
        <div
          className={cn(
            "relative z-10 w-max max-w-48 border-2 border-black bg-white text-black shadow-[5px_5px_0px_0px_#000]",
            SHAPE_RADIUS[shape]
          )}
        >
          <div className={cn("overflow-hidden", SHAPE_PAD[shape])}>
            {readOnly ? (
              <p className={cn("w-max max-w-full", TEXT_CLASS)}>{text}</p>
            ) : (
              <div className="relative w-max max-w-full">
                <p
                  aria-hidden="true"
                  className={cn("invisible whitespace-pre-wrap", TEXT_CLASS)}
                >
                  {text || "\u00a0"}
                </p>
                <textarea
                  value={text}
                  maxLength={TUTORIAL_BUBBLE_MAX_LENGTH}
                  rows={1}
                  aria-label="Story bubble"
                  onChange={(event) =>
                    onChange?.(
                      event.target.value.slice(0, TUTORIAL_BUBBLE_MAX_LENGTH)
                    )
                  }
                  className={cn(
                    "absolute inset-0 size-full resize-none overflow-hidden whitespace-pre-wrap bg-transparent text-black outline-none",
                    TEXT_CLASS
                  )}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
