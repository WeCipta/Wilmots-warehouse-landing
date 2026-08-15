"use client";

import { useEffect } from "react";
import { useLenis } from "lenis/react";

let lockCount = 0;

export function useLenisLock(locked: boolean) {
  const lenis = useLenis();

  useEffect(() => {
    if (!lenis || !locked) return;

    lockCount += 1;
    lenis.stop();

    return () => {
      lockCount = Math.max(0, lockCount - 1);
      if (lockCount === 0) {
        lenis.start();
      }
    };
  }, [locked, lenis]);

  return lenis;
}
