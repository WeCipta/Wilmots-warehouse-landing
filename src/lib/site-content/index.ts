import type { CSSProperties } from "react";
import type { GridBreakpoint } from "@/lib/grid";
import { whatYouGet as whatYouGetCopy } from "./what-you-get";
import { credits as creditsCopy } from "./created-by";
import { description } from "./description";
import { footer } from "./footer";
import { gallery } from "./gallery";
import { hero } from "./hero";
import { nav as navCopy } from "./nav";
import { testimonials as testimonialsCopy } from "./testimonials";
import { tutorial as tutorialCopy } from "./tutorial";

export type ContentSpan = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
};

export type MediaAsset = {
  src: string;
  alt: string;
};

export type CreditPerson = {
  name: string;
  href: string;
  image: string;
  alt: string;
};

export type { GalleryImage } from "./gallery";
export type { TutorialStep } from "./tutorial";

export type Testimonial = {
  name: string;
  role: string;
  content: string;
  avatar: string;
  avatarAlt: string;
  color: string;
  rotation: number;
  xOffset: number;
  yOffset: number;
};

const ORDER_URL = "https://www.cmyk.games/products/wilmot";

const CREDIT_CREATORS: CreditPerson[] = [
  {
    name: "Ricky Haggett",
    href: "https://boardgamegeek.com/boardgamedesigner/162909/ricky-haggett",
    image: "/creators/ricky-haggett.webp",
    alt: "Portrait of Ricky Haggett",
  },
  {
    name: "Richard Hogg",
    href: "https://boardgamegeek.com/boardgameartist/162910/richard-hogg",
    image: "/creators/richard-hogg.webp",
    alt: "Portrait of Richard Hogg",
  },
  {
    name: "David King II",
    href: "https://boardgamegeek.com/boardgamedesigner/162908/david-king-ii",
    image: "/creators/david-king-ii.webp",
    alt: "Portrait of David King II",
  },
];

const CREDIT_PUBLISHER: CreditPerson = {
  name: "CMYK",
  href: "https://www.cmyk.games",
  image: "/creators/CMYK.webp",
  alt: "CMYK publisher logo",
};

const CARD_FACE_ASSETS = [
  { src: "wheel.svg", alt: "Wheel product tile" },
  { src: "7star.svg", alt: "Seven-pointed star product tile" },
  { src: "8star.svg", alt: "Eight-pointed star product tile" },
  { src: "apple.svg", alt: "Apple product tile" },
  { src: "banana-yellow.svg", alt: "Yellow banana product tile" },
  { src: "banana-purple.svg", alt: "Purple banana product tile" },
  { src: "bluecircle.svg", alt: "Blue circle product tile" },
  { src: "bomb.svg", alt: "Bomb product tile" },
  { src: "buddha.svg", alt: "Buddha product tile" },
  { src: "confetti.svg", alt: "Confetti product tile" },
  { src: "constellation.svg", alt: "Constellation product tile" },
  { src: "cube.svg", alt: "Cube product tile" },
  { src: "dandelion.svg", alt: "Dandelion product tile" },
  { src: "diagonal.svg", alt: "Diagonal stripes product tile" },
  { src: "diamond.svg", alt: "Diamond product tile" },
  { src: "eye.svg", alt: "Eye product tile" },
  { src: "fossil 1.svg", alt: "Fossil product tile" },
  { src: "four.svg", alt: "Four product tile" },
  { src: "frog.svg", alt: "Frog product tile" },
  { src: "gem.svg", alt: "Gem product tile" },
  { src: "hammer.svg", alt: "Hammer product tile" },
  { src: "horse.svg", alt: "Horse product tile" },
  { src: "house.svg", alt: "House product tile" },
  { src: "icecream.svg", alt: "Ice cream product tile" },
  { src: "poison.svg", alt: "Poison product tile" },
  { src: "lava.svg", alt: "Lava product tile" },
  { src: "lightbulb.svg", alt: "Light bulb product tile" },
  { src: "linedown.svg", alt: "Downward line product tile" },
  { src: "mail.svg", alt: "Mail product tile" },
  { src: "map.svg", alt: "Map product tile" },
  { src: "mask.svg", alt: "Mask product tile" },
  { src: "matchstick.svg", alt: "Matchstick product tile" },
  { src: "medical.svg", alt: "Medical cross product tile" },
  { src: "milk.svg", alt: "Milk product tile" },
  { src: "noodle.svg", alt: "Noodle product tile" },
  { src: "peanut.svg", alt: "Peanut product tile" },
  { src: "pentagon.svg", alt: "Pentagon product tile" },
  { src: "piechart.svg", alt: "Pie chart product tile" },
  { src: "pills.svg", alt: "Pills product tile" },
  { src: "pins.svg", alt: "Pins product tile" },
  { src: "plug.svg", alt: "Plug product tile" },
  { src: "popsicle.svg", alt: "Popsicle product tile" },
  { src: "power.svg", alt: "Power product tile" },
  { src: "rainbow.svg", alt: "Rainbow product tile" },
  { src: "reyna.svg", alt: "Reyna product tile" },
  { src: "rook.svg", alt: "Rook product tile" },
  { src: "satellite.svg", alt: "Satellite product tile" },
  { src: "sewing.svg", alt: "Sewing product tile" },
  { src: "sharpener.svg", alt: "Pencil sharpener product tile" },
  { src: "sign.svg", alt: "Sign product tile" },
  { src: "slither.svg", alt: "Snake product tile" },
  { src: "sock.svg", alt: "Sock product tile" },
  { src: "spade.svg", alt: "Spade product tile" },
  { src: "spinner.svg", alt: "Spinner product tile" },
  { src: "steam.svg", alt: "Steam product tile" },
  { src: "strips.svg", alt: "Stripes product tile" },
  { src: "sun.svg", alt: "Sun product tile" },
  { src: "sunset.svg", alt: "Sunset product tile" },
  { src: "target.svg", alt: "Target product tile" },
  { src: "threaded.svg", alt: "Thread product tile" },
  { src: "toggle.svg", alt: "Toggle product tile" },
  { src: "tree.svg", alt: "Tree product tile" },
  { src: "triangle.svg", alt: "Triangle product tile" },
  { src: "viking.svg", alt: "Viking product tile" },
  { src: "volcano.svg", alt: "Volcano product tile" },
  { src: "water.svg", alt: "Water product tile" },
  { src: "watermelon.svg", alt: "Watermelon product tile" },
  { src: "wave.svg", alt: "Wave product tile" },
  { src: "wavybands.svg", alt: "Wavy bands product tile" },
  { src: "wrench.svg", alt: "Wrench product tile" },
] as const satisfies readonly MediaAsset[];

const MEDIA = {
  logo: {
    src: "/nav/logo.svg",
    alt: "Wilmot's Warehouse logo",
  },
  cardBack: {
    src: "/cards/backs/back.svg",
    alt: "Face-down product tile",
  },
  rule: {
    src: "/cards/backs/rule.svg",
    alt: "Rule card",
  },
  insiderRule: {
    src: "/cards/faces/insider-rule.svg",
    alt: "Insider rule card",
  },
  customerRule: {
    src: "/cards/customers/rule.svg",
    alt: "Customer rule card",
  },
  scoreboard: {
    src: "/images/scoreboard.svg",
    alt: "Performance summary scoreboard",
  },
  rulebook: {
    src: "/images/rulebook.jpg",
    alt: "Wilmot's Warehouse rulebook cover",
  },
  faces: CARD_FACE_ASSETS,
  customers: [
    { src: "/cards/customers/customer-1.svg", alt: "Customer card 1" },
    { src: "/cards/customers/customer-2.svg", alt: "Customer card 2" },
    { src: "/cards/customers/customer-3.svg", alt: "Customer card 3" },
    { src: "/cards/customers/customer-4.svg", alt: "Customer card 4" },
    { src: "/cards/customers/customer-5.svg", alt: "Customer card 5" },
    { src: "/cards/customers/customer-6.svg", alt: "Customer card 6" },
  ] as const satisfies readonly MediaAsset[],
  board: {
    top: { src: "/board/top.webp", alt: "Top edge of the warehouse board" },
    left: { src: "/board/left.webp", alt: "Left edge of the warehouse board" },
    right: { src: "/board/right.webp", alt: "Right edge of the warehouse board" },
    leftSide: {
      src: "/board/left-side.webp",
      alt: "Left weekday rail of the warehouse board",
    },
    rightSide: {
      src: "/board/right-side.webp",
      alt: "Right weekday rail of the warehouse board",
    },
    days: {
      monday: { src: "/board/monday.webp", alt: "Monday column on the warehouse board" },
      tuesday: { src: "/board/tuesday.webp", alt: "Tuesday column on the warehouse board" },
      wednesday: {
        src: "/board/wednesday.webp",
        alt: "Wednesday column on the warehouse board",
      },
      thursday: {
        src: "/board/thursday.webp",
        alt: "Thursday column on the warehouse board",
      },
      friday: { src: "/board/friday.webp", alt: "Friday column on the warehouse board" },
    },
  },
  nav: {
    menu: { src: "/nav/navbar.svg", alt: "Open navigation menu" },
    menuOpen: { src: "/nav/navbar-opened.svg", alt: "Close navigation menu" },
    musicOn: { src: "/nav/music-on.svg", alt: "Mute music" },
    musicOff: { src: "/nav/music-off.svg", alt: "Play music" },
    productPortrait: {
      src: "/nav/nav-image-desktop.webp",
      alt: "Wilmot's Warehouse, order on CMYK",
    },
    productLandscape: {
      src: "/nav/nav-image-mobile.webp",
      alt: "Wilmot's Warehouse, order on CMYK",
    },
  },
} as const;

export type BoardDay = keyof typeof MEDIA.board.days;

export const siteContent = {
  brand: "Wilmot's Warehouse",
  orderUrl: ORDER_URL,
  media: MEDIA,
  meta: {
    title: "Wilmot's Warehouse",
    description:
      "Created by Ricky Haggett, Richard Hogg, and David King (II). In Wilmot's Warehouse, your team will work co-operatively to organize the warehouse, using memory, imagination, and silly stories you make up.",
  },
  nav: {
    ...navCopy,
    product: {
      portrait: MEDIA.nav.productPortrait.src,
      landscape: MEDIA.nav.productLandscape.src,
      alt: MEDIA.nav.productPortrait.alt,
      ariaLabel: navCopy.product.ariaLabel,
    },
  },
  credits: {
    ...creditsCopy,
    creators: CREDIT_CREATORS,
    publisher: CREDIT_PUBLISHER,
    people: [...CREDIT_CREATORS, CREDIT_PUBLISHER],
  },
  hero,
  description,
  whatYouGet: {
    ...whatYouGetCopy,
    ideaCards: [
      MEDIA.rule,
      MEDIA.insiderRule,
      MEDIA.customerRule,
      MEDIA.rule,
    ] as const,
  },
  gallery,
  testimonials: {
    title: testimonialsCopy.title,
    items: testimonialsCopy.items.map((item) => ({
      ...item,
      avatar: MEDIA.logo.src,
      avatarAlt: MEDIA.logo.alt,
    })),
  },
  tutorial: {
    ...tutorialCopy,
    ruleAlt: MEDIA.rule.alt,
    insiderRuleAlt: MEDIA.insiderRule.alt,
    customers: MEDIA.customers,
    rule: MEDIA.rule,
    insiderRule: MEDIA.insiderRule,
  },
  footer,
};

export function getHeroContentSpan(breakpoint: GridBreakpoint): ContentSpan {
  return siteContent.hero.content[breakpoint];
}

export function getDescriptionContentSpan(
  breakpoint: GridBreakpoint
): ContentSpan {
  return siteContent.description.content[breakpoint];
}

export function contentSpanStyle(span: ContentSpan): CSSProperties {
  return {
    gridColumn: `${span.colStart} / ${span.colEnd}`,
    gridRow: `${span.rowStart} / ${span.rowEnd}`,
  };
}

export function isContentCellBlocked(
  breakpoint: GridBreakpoint,
  col: number,
  row: number
): boolean {
  const span = siteContent.hero.content[breakpoint];
  return (
    col >= span.colStart &&
    col < span.colEnd &&
    row >= span.rowStart &&
    row < span.rowEnd
  );
}

export function isDescriptionCellBlocked(
  breakpoint: GridBreakpoint,
  col: number,
  row: number
): boolean {
  const span = siteContent.description.content[breakpoint];
  return (
    col >= span.colStart &&
    col < span.colEnd &&
    row >= span.rowStart &&
    row < span.rowEnd
  );
}
