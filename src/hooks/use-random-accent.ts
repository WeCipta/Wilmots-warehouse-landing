"use client";

import { useCallback, useRef, useState } from "react";
import {
  BRAND_ACCENTS,
  pickBrandAccent,
  type BrandAccent,
} from "@/lib/brand-accents";

type PersistedAccent = {
  accent: BrandAccent;
  color: string;
  foreground: string;
  randomize: () => void;
  clear: () => void;
};

type EphemeralAccent = {
  accent: BrandAccent | undefined;
  color: string | undefined;
  foreground: string | undefined;
  randomize: () => void;
  clear: () => void;
};

export function useRandomAccent(options: { persist: true }): PersistedAccent;
export function useRandomAccent(options?: { persist?: false }): EphemeralAccent;
export function useRandomAccent(
  options: { persist?: boolean } = {}
): PersistedAccent | EphemeralAccent {
  const persist = options.persist ?? false;
  const accentRef = useRef<BrandAccent>(BRAND_ACCENTS[0]);
  const [accent, setAccent] = useState<BrandAccent | undefined>(
    persist ? BRAND_ACCENTS[0] : undefined
  );

  const randomize = useCallback(() => {
    const next = pickBrandAccent(accentRef.current);
    accentRef.current = next;
    setAccent(next);
  }, []);

  const clear = useCallback(() => {
    if (!persist) setAccent(undefined);
  }, [persist]);

  return {
    accent,
    color: accent?.color,
    foreground: accent?.foreground,
    randomize,
    clear,
  };
}
