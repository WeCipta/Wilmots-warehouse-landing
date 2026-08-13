"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";
import { useFinePointer } from "@/hooks/use-fine-pointer";

const IDLE_RADIUS = 4;
const BUTTON_RADIUS = 15;
const LENS_RADIUS = 56;
const CARET_WIDTH = 2;
const CARET_HEIGHT_FALLBACK = 48;

function measureCaretHeight(el: Element): number {
  const rectHeight = el.getBoundingClientRect().height;
  const style = getComputedStyle(el);
  const lineHeight = parseFloat(style.lineHeight);

  if (!Number.isNaN(lineHeight) && lineHeight > 0) {
    if (rectHeight > lineHeight * 1.5) return lineHeight;
    if (rectHeight > 0) return rectHeight;
    return lineHeight;
  }

  if (rectHeight > 0) return rectHeight;

  const fontSize = parseFloat(style.fontSize);
  if (!Number.isNaN(fontSize) && fontSize > 0) return fontSize * 1.2;

  return CARET_HEIGHT_FALLBACK;
}

export type FollowFrame = {
  x: number;
  y: number;
  width: number;
  height: number;
  radius: number;
};

type CursorSize = {
  width: number;
  height: number;
  radius: number;
};

type FollowMode = "idle" | "lens" | "text" | "button";

type FollowMouseValue = {
  x: number;
  y: number;
  radius: number;
  hovering: boolean;
  textHovering: boolean;
  buttonHovering: boolean;
  pressed: boolean;
  frame: FollowFrame | null;
  cursorSize: CursorSize;
  setFollowFrame: (frame: FollowFrame | null) => void;
};

const FollowMouseContext = createContext<FollowMouseValue>({
  x: -9999,
  y: -9999,
  radius: IDLE_RADIUS,
  hovering: false,
  textHovering: false,
  buttonHovering: false,
  pressed: false,
  frame: null,
  cursorSize: {
    width: IDLE_RADIUS * 2,
    height: IDLE_RADIUS * 2,
    radius: 9999,
  },
  setFollowFrame: () => {},
});

export function useFollowMouse() {
  return useContext(FollowMouseContext);
}

export function FollowMouseProvider({ children }: { children: ReactNode }) {
  const hasFinePointer = useFinePointer();
  const [x, setX] = useState(-9999);
  const [y, setY] = useState(-9999);
  const [hovering, setHovering] = useState(false);
  const [textHovering, setTextHovering] = useState(false);
  const [buttonHovering, setButtonHovering] = useState(false);
  const [radius, setRadius] = useState(IDLE_RADIUS);
  const [frame, setFrame] = useState<FollowFrame | null>(null);
  const [cursorSize, setCursorSize] = useState<CursorSize>({
    width: IDLE_RADIUS * 2,
    height: IDLE_RADIUS * 2,
    radius: 9999,
  });
  const [caretHeight, setCaretHeight] = useState(CARET_HEIGHT_FALLBACK);
  const sizeProxy = useRef({
    width: IDLE_RADIUS * 2,
    height: IDLE_RADIUS * 2,
    radius: 9999,
  });
  const hoveringRef = useRef(false);
  const textHoveringRef = useRef(false);
  const buttonHoveringRef = useRef(false);
  const caretHeightRef = useRef(CARET_HEIGHT_FALLBACK);
  const frameRef = useRef<FollowFrame | null>(null);
  const pressed = frame !== null;

  const setFollowFrame = useCallback((next: FollowFrame | null) => {
    frameRef.current = next;
    setFrame(next);
  }, []);

  const mode: FollowMode = textHovering
    ? "text"
    : buttonHovering
      ? "button"
      : hovering
        ? "lens"
        : "idle";

  useEffect(() => {
    document.body.classList.toggle("cursor-none", hasFinePointer);
    return () => {
      document.body.classList.remove("cursor-none");
    };
  }, [hasFinePointer]);

  useEffect(() => {
    if (pressed) return;

    const target =
      mode === "text"
        ? { width: CARET_WIDTH, height: caretHeight, radius: 9999 }
        : mode === "button"
          ? {
              width: BUTTON_RADIUS * 2,
              height: BUTTON_RADIUS * 2,
              radius: 9999,
            }
          : mode === "lens"
            ? {
                width: LENS_RADIUS * 2,
                height: LENS_RADIUS * 2,
                radius: 9999,
              }
            : {
                width: IDLE_RADIUS * 2,
                height: IDLE_RADIUS * 2,
                radius: 9999,
              };

    const tween = gsap.to(sizeProxy.current, {
      ...target,
      duration: 0.35,
      ease: "power3.out",
      onUpdate: () => {
        setCursorSize({
          width: sizeProxy.current.width,
          height: sizeProxy.current.height,
          radius: sizeProxy.current.radius,
        });
        setRadius(sizeProxy.current.width / 2);
      },
    });
    return () => {
      tween.kill();
    };
  }, [mode, pressed, caretHeight]);

  useEffect(() => {
    if (!hasFinePointer) {
      setX(-9999);
      setY(-9999);
      hoveringRef.current = false;
      textHoveringRef.current = false;
      buttonHoveringRef.current = false;
      setHovering(false);
      setTextHovering(false);
      setButtonHovering(false);
      return;
    }

    const onMove = (e: PointerEvent) => {
      setX(e.clientX);
      setY(e.clientY);

      if (frameRef.current !== null) return;

      const el = document.elementFromPoint(e.clientX, e.clientY);
      const textEl = el?.closest("[data-follow-text]") ?? null;
      const overText = !!textEl;
      const overButton =
        !overText && !!el?.closest('a, button, [data-slot="button"]');
      const overLens =
        !overText &&
        !overButton &&
        !!el?.closest("[data-game-card][data-follow-lens]");

      if (textEl) {
        const nextHeight = measureCaretHeight(textEl);
        if (Math.abs(nextHeight - caretHeightRef.current) > 0.5) {
          caretHeightRef.current = nextHeight;
          setCaretHeight(nextHeight);
        }
      }

      if (overText !== textHoveringRef.current) {
        textHoveringRef.current = overText;
        setTextHovering(overText);
      }
      if (overButton !== buttonHoveringRef.current) {
        buttonHoveringRef.current = overButton;
        setButtonHovering(overButton);
      }
      if (overLens !== hoveringRef.current) {
        hoveringRef.current = overLens;
        setHovering(overLens);
      }
    };

    const onLeave = () => {
      setX(-9999);
      setY(-9999);
      hoveringRef.current = false;
      textHoveringRef.current = false;
      buttonHoveringRef.current = false;
      setHovering(false);
      setTextHovering(false);
      setButtonHovering(false);
    };

    window.addEventListener("pointermove", onMove);
    window.addEventListener("blur", onLeave);
    document.addEventListener("mouseleave", onLeave);
    return () => {
      window.removeEventListener("pointermove", onMove);
      window.removeEventListener("blur", onLeave);
      document.removeEventListener("mouseleave", onLeave);
    };
  }, [hasFinePointer]);

  const value = useMemo(
    () => ({
      x,
      y,
      radius,
      hovering,
      textHovering,
      buttonHovering,
      pressed,
      frame,
      cursorSize,
      setFollowFrame,
    }),
    [
      x,
      y,
      radius,
      hovering,
      textHovering,
      buttonHovering,
      pressed,
      frame,
      cursorSize,
      setFollowFrame,
    ]
  );

  return (
    <FollowMouseContext.Provider value={value}>
      {children}
    </FollowMouseContext.Provider>
  );
}

export function FollowMouseCursor() {
  const hasFinePointer = useFinePointer();
  const {
    x,
    y,
    hovering,
    textHovering,
    buttonHovering,
    pressed,
    frame,
    cursorSize,
  } = useFollowMouse();

  if (!hasFinePointer) return null;

  if (pressed && frame) {
    return (
      <div
        aria-hidden
        className="pointer-events-none fixed z-100 border border-white bg-transparent mix-blend-difference"
        style={{
          left: frame.x,
          top: frame.y,
          width: frame.width,
          height: frame.height,
          borderRadius: frame.radius,
        }}
      />
    );
  }

  const visible = x > -1000 && y > -1000;
  const hollow = hovering && !textHovering && !buttonHovering;

  return (
    <div
      aria-hidden
      className={cn(
        "pointer-events-none fixed z-100 border border-white mix-blend-difference transition-colors duration-200",
        hollow ? "bg-transparent" : "bg-white",
        !visible && "opacity-0"
      )}
      style={{
        width: cursorSize.width,
        height: cursorSize.height,
        borderRadius: cursorSize.radius,
        left: x,
        top: y,
        transform: "translate(-50%, -50%)",
      }}
    />
  );
}
