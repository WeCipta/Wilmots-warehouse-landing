import { siteContent } from "@/lib/site-content";

export const KIT_ITEMS = siteContent.whatYouGet.items;

export type KitItemId = (typeof KIT_ITEMS)[number]["id"];
export type KitItem = (typeof KIT_ITEMS)[number];

export const KIT_BY_ID = Object.fromEntries(
  KIT_ITEMS.map((item) => [item.id, item])
) as Record<KitItemId, KitItem>;

export const TILE_FACES = siteContent.whatYouGet.tileFaces;
export const BOARD_PLACEMENTS = siteContent.whatYouGet.boardPlacements;
export const CUSTOMER_SRCS = siteContent.media.customers.map(
  (customer) => customer.src
);
export const IDEA_CARDS = siteContent.whatYouGet.ideaCards;
export const BOARD_DAYS = Object.keys(
  siteContent.media.board.days
) as (keyof typeof siteContent.media.board.days)[];

export const BOARD_CHROME = {
  left: 115,
  grid: 1537,
  right: 115,
  top: 119,
  days: 147,
} as const;

export const BOARD_FRAME_W =
  BOARD_CHROME.left + BOARD_CHROME.grid + BOARD_CHROME.right;
export const BOARD_FRAME_H =
  BOARD_CHROME.top + BOARD_CHROME.grid + BOARD_CHROME.days;
