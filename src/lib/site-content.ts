import type { CSSProperties } from "react";
import type { GridBreakpoint } from "@/lib/grid";

export type ContentSpan = {
  colStart: number;
  colEnd: number;
  rowStart: number;
  rowEnd: number;
};

const ORDER_URL = "https://www.cmyk.games/products/wilmot";

export type CreditPerson = {
  name: string;
  href: string;
  image: string;
};

const CREDIT_CREATORS: CreditPerson[] = [
  {
    name: "Ricky Haggett",
    href: "https://boardgamegeek.com/boardgamedesigner/162909/ricky-haggett",
    image: "/creators/ricky-haggett.webp",
  },
  {
    name: "Richard Hogg",
    href: "https://boardgamegeek.com/boardgameartist/162910/richard-hogg",
    image: "/creators/richard-hogg.webp",
  },
  {
    name: "David King II",
    href: "https://boardgamegeek.com/boardgamedesigner/162908/david-king-ii",
    image: "/creators/david-king-ii.webp",
  },
];

const CREDIT_PUBLISHER: CreditPerson = {
  name: "CMYK",
  href: "https://www.cmyk.games",
  image: "/creators/CMYK.webp",
};

export type TutorialStep = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  hint: string;
};

export type GalleryImage = {
  src: string;
  alt: string;
};

export type Testimonial = {
  name: string;
  role: string;
  content: string;
  avatar: string;
  color: string;
  rotation: number;
  xOffset: number;
  yOffset: number;
};

const WHAT_YOU_GET_ITEMS = [
  {
    id: "board",
    count: "1",
    label: "Warehouse Board",
    accent: "var(--btn-green)",
  },
  {
    id: "tiles",
    count: "150",
    label: "Product Tiles",
    accent: "var(--btn-yellow)",
  },
  {
    id: "customers",
    count: "150",
    label: "Customer Cards",
    accent: "var(--btn-blue)",
  },
  {
    id: "ideas",
    count: "30",
    label: "Idea Cards",
    accent: "var(--btn-pink)",
  },
  {
    id: "rulebook",
    count: "1",
    label: "Rulebook",
    accent: "var(--btn-red)",
  },
] as const;

const GALLERY_IMAGES: GalleryImage[] = [
  { src: "/images/gallery/1.jpg", alt: "Overhead view of the warehouse board on a wooden table, with a hand placing a product tile" },
  { src: "/images/gallery/2.jpg", alt: "Close-up of colorful product tiles on the warehouse grid" },
  { src: "/images/gallery/3.jpg", alt: "Game box, cloth bag, and tiles spread across the board" },
  { src: "/images/gallery/4.webp", alt: "Wilmot's Warehouse box standing on a yellow spring" },
  { src: "/images/gallery/5.webp", alt: "A family playing Wilmot's Warehouse at a table" },
  { src: "/images/gallery/6.webp", alt: "Product tiles filling the warehouse board" },
  { src: "/images/gallery/7.webp", alt: "Warehouse board with weekday tabs and rule cards along the side" },
  { src: "/images/gallery/8.webp", alt: "Wilmot's Warehouse components laid out for play" },
  { src: "/images/gallery/9.webp", alt: "Colorful product tiles stacked beside the board" },
  { src: "/images/gallery/10.webp", alt: "The warehouse grid mid-sort" },
  { src: "/images/gallery/11.webp", alt: "Players sorting tiles on the warehouse board" },
];

const TESTIMONIALS: Testimonial[] = [
  {
    name: "Jonathan",
    role: "Game Night Host",
    content:
      "We spent the first half making up ridiculous stories for every tile, then the timer hit and the whole table went quiet. Best co-op we have played this year.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-yellow)",
    rotation: -4,
    xOffset: 0,
    yOffset: 20,
  },
  {
    name: "Nando",
    role: "Co-op Enthusiast",
    content:
      "It is rare to find a co-op this talkative. Sorting the warehouse together, then racing to match customers, made our game nights feel brand new.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-blue)",
    rotation: 2,
    xOffset: 0,
    yOffset: -10,
  },
  {
    name: "Boyang",
    role: "Puzzle Gamer",
    content:
      "The memory puzzle is sharp, but the silly stories are what make it stick. I still remember where we parked the frog because of a joke someone made.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-green)",
    rotation: -2,
    xOffset: 0,
    yOffset: 10,
  },
  {
    name: "Immanuel",
    role: "Game Master",
    content:
      "Teaching this is a joy. Place the tiles, talk through the layout, then race the clock. Pattern recognition under a timer, with the whole table involved.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-green)",
    rotation: -3,
    xOffset: 20,
    yOffset: 30,
  },
  {
    name: "Yosua",
    role: "Table Regular",
    content:
      "I picked this up on a whim and it immediately became the game I bring to every table. My recall got faster each round, and the stories got weirder.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-pink)",
    rotation: 4,
    xOffset: 0,
    yOffset: 40,
  },
  {
    name: "James",
    role: "Casual Gamer",
    content:
      "I am not a heavy gamer and I still had a blast. We scored better than I expected, and I kept wanting one more run at a cleaner warehouse.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-orange)",
    rotation: -5,
    xOffset: -20,
    yOffset: 20,
  },
];

const TUTORIAL_STEPS: TutorialStep[] = [
  {
    number: "01",
    title: "Draw & Place",
    subtitle: "Draw",
    description:
      "Each player draws product tiles, checks the symbols, and places them face-down on the warehouse board right away.",
    hint: "Draw a tile on the Monday column, then drop it onto an open warehouse space.",
  },
  {
    number: "02",
    title: "Discuss & Strategize",
    subtitle: "Discuss",
    description:
      "Making up a silly story is a great way to remember the layout. Talk through positions too, and keep discussing until everyone agrees to end the day.",
    hint: "Move tiles around until the whole table agrees on the layout. The story on each bubble is editable.",
  },
  {
    number: "03",
    title: "Open the Next Day",
    subtitle: "Rule",
    description:
      "Reveal the next day's rule card and follow the special rule it brings.",
    hint: "Drag the rule card from the Tuesday column, then follow what it says.",
  },
  {
    number: "04",
    title: "Repeat Until Empty",
    subtitle: "Repeat",
    description:
      "Keep drawing, placing, discussing, rearranging, and opening the next rule until every pile under the days is empty.",
    hint: "Remember the faces of the products one last time. You may move tiles around as needed.",
  },
  {
    number: "05",
    title: "Start the Timer",
    subtitle: "Match",
    description:
      "Start the timer, then place every customer on top of its matching product tile.",
    hint: "Stack each customer card on the product it matches.",
  },
  {
    number: "06",
    title: "Calculate Score",
    subtitle: "Score",
    description:
      "The time you took is your score. Add 10 seconds for every mismatch, or for every product left without a customer.",
    hint: "Tally the clock, then add 10 seconds for each miss.",
  },
];

export const siteContent = {
  brand: "Wilmot's Warehouse",
  orderUrl: ORDER_URL,
  meta: {
    title: "Wilmot's Warehouse",
    description:
      "Created by Ricky Haggett, Richard Hogg, and David King (II). In Wilmot's Warehouse, your team will work co-operatively to organize the warehouse, using memory, imagination, and silly stories you make up.",
  },
  nav: {
    links: [
      { label: "About", href: "#about" },
      { label: "How to Play", href: "#how-to-play" },
      { label: "Creators", href: "#creators" },
      { label: "On the Table", href: "#gallery" },
    ],
    product: {
      portrait: "/images/nav/product-portrait.svg",
      landscape: "/images/nav/product-landscape.svg",
      alt: "Wilmot's Warehouse, order on CMYK",
      ariaLabel: "Order Wilmot's Warehouse on CMYK",
    },
    homeAriaLabel: "Wilmot's Warehouse home",
    menuOpen: "Menu",
    menuClose: "Close",
    musicPlay: "Play music",
    musicMute: "Mute music",
    menuTitle: "Navigation menu",
    menuDescription: "Site navigation, product, and credits",
    primaryAriaLabel: "Primary navigation",
    creditsCreatorsLabel: "Creators",
    creditsPublisherLabel: "Publisher",
  },
  credits: {
    label: "Created by",
    publishedByLabel: "Published by",
    creators: CREDIT_CREATORS,
    publisher: CREDIT_PUBLISHER,
    people: [...CREDIT_CREATORS, CREDIT_PUBLISHER],
  },
  hero: {
    title: "Wilmot's Warehouse",
    tagline: "Organize the warehouse with memory, story, and imagination.",
    cta: "Order Now",
    content: {
      mobile: { colStart: 1, colEnd: 7, rowStart: 7, rowEnd: 10 },
      tablet: { colStart: 1, colEnd: 11, rowStart: 7, rowEnd: 10 },
      desktop: { colStart: 1, colEnd: 15, rowStart: 7, rowEnd: 10 },
    } satisfies Record<GridBreakpoint, ContentSpan>,
  },
  description: {
    body: "In this cooperative game, your team uses silly stories to memorize the locations of 35 face-down product tiles, then races a five-minute timer to match them with customer cards!",
    content: {
      mobile: { colStart: 2, colEnd: 6, rowStart: 1, rowEnd: 100 },
      tablet: { colStart: 3, colEnd: 9, rowStart: 1, rowEnd: 100 },
      desktop: { colStart: 4, colEnd: 12, rowStart: 1, rowEnd: 100 },
    } satisfies Record<GridBreakpoint, ContentSpan>,
  },
  whatYouGet: {
    title: "What you get",
    body: "Everything packed in the box: tiles, customers, ideas, the warehouse board, and the rulebook.",
    items: WHAT_YOU_GET_ITEMS,
  },
  gallery: {
    title: "On the Table",
    body: "The box, the board, and the tiles in play. Bright icons, a filling warehouse, and a table mid-sort.",
    images: GALLERY_IMAGES,
  },
  testimonials: {
    title: "What Players\nSay",
    items: TESTIMONIALS,
  },
  tutorial: {
    title: "How to Play",
    kitAriaLabel: "Tutorial cards: 4 products, 4 customers, and 1 rule",
    customerAlt: "Customer",
    ruleAlt: "Rule card",
    videoUrl: "https://www.youtube.com/watch?v=aIDl5suP_QE",
    intro: {
      blurb: "This tutorial uses only 4 cards, 4 customers, and 1 rule card.",
      videoLabel: "Watch Tutorial",
      resetLabel: "Reset board",
      scoreboardLabel: "See Performance Summary",
    },
    bubbleCopy: {
      "horse.svg": "The Knight",
      "eye.svg": "Saw",
      "apple.svg": "The apple",
      "poison.svg": "Got poisoned",
    },
    steps: TUTORIAL_STEPS,
  },
  footer: {
    cta: "Order the Game",
  },
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
