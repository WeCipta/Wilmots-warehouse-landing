export const BRAND_ACCENTS = [
  { color: "var(--btn-red)", foreground: "#fff" },
  { color: "var(--btn-orange)", foreground: "#000" },
  { color: "var(--btn-yellow)", foreground: "#000" },
  { color: "var(--btn-green)", foreground: "#fff" },
  { color: "var(--btn-blue)", foreground: "#fff" },
  { color: "var(--btn-pink)", foreground: "#000" },
  { color: "var(--btn-salmon)", foreground: "#000" },
] as const;

export type BrandAccent = (typeof BRAND_ACCENTS)[number];

export const BRAND_ACCENT_COLORS: readonly string[] = BRAND_ACCENTS.map(
  (accent) => accent.color
);

export function pickBrandAccent(previous?: BrandAccent): BrandAccent {
  const count = BRAND_ACCENTS.length;
  if (count === 1) return BRAND_ACCENTS[0];
  let next = BRAND_ACCENTS[Math.floor(Math.random() * count)];
  while (next === previous) {
    next = BRAND_ACCENTS[Math.floor(Math.random() * count)];
  }
  return next;
}
