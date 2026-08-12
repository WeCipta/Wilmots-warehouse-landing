"use client";

import { useEffect, useState } from "react";

const FINE_POINTER_QUERY = "(hover: hover) and (pointer: fine)";

export function useFinePointer() {
  const [hasFinePointer, setHasFinePointer] = useState(true);

  useEffect(() => {
    const mq = window.matchMedia(FINE_POINTER_QUERY);
    const onChange = () => setHasFinePointer(mq.matches);
    onChange();
    mq.addEventListener("change", onChange);
    return () => mq.removeEventListener("change", onChange);
  }, []);

  return hasFinePointer;
}
