import { siteContent } from "@/lib/site-content";

export const CARD_FACES = siteContent.media.faces.map((face) => face.src);
export const CARD_BACK_SRC = siteContent.media.cardBack.src;
export const CARD_BACK_ALT = siteContent.media.cardBack.alt;

export type CardFace = (typeof siteContent.media.faces)[number]["src"];

function fileName(src: string) {
  return decodeURIComponent(src.split("/").pop() ?? src);
}

export function cardFaceAlt(src: string) {
  const file = fileName(src);
  return (
    siteContent.media.faces.find((face) => face.src === file)?.alt ??
    "Product tile"
  );
}

export function customerAlt(src: string) {
  return (
    siteContent.media.customers.find((customer) => customer.src === src)?.alt ??
    siteContent.tutorial.customerAlt
  );
}

export function mediaAlt(src: string) {
  const file = fileName(src);
  const face = siteContent.media.faces.find((item) => item.src === file);
  if (face) return face.alt;

  const { media } = siteContent;
  const assets = [
    media.logo,
    media.cardBack,
    media.rule,
    media.insiderRule,
    media.customerRule,
    media.scoreboard,
    media.rulebook,
    ...media.customers,
    media.board.top,
    media.board.left,
    media.board.right,
    media.board.leftSide,
    media.board.rightSide,
    ...Object.values(media.board.days),
    media.nav.menu,
    media.nav.menuOpen,
    media.nav.musicOn,
    media.nav.musicOff,
    media.nav.productPortrait,
    media.nav.productLandscape,
  ];
  return (
    assets.find((asset) => asset.src === src || fileName(asset.src) === file)
      ?.alt ?? "Wilmot's Warehouse card"
  );
}

export function cardBackAlt(src?: string) {
  if (!src) return CARD_BACK_ALT;
  const customer = siteContent.media.customers.find(
    (item) => item.src === src
  );
  return customer?.alt ?? CARD_BACK_ALT;
}

export function pickRandomCardFace(): CardFace {
  const faces = siteContent.media.faces;
  return faces[Math.floor(Math.random() * faces.length)].src;
}

export function resolveCardFaceSrc(src: string) {
  if (src.startsWith("/")) return src;
  return `/cards/faces/${encodeURIComponent(src).replace(/%2F/g, "/")}`;
}
