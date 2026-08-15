import { siteContent } from "@/lib/site-content";

export const KIT_ITEMS = siteContent.whatYouGet.items;

export type KitItemId = (typeof KIT_ITEMS)[number]["id"];
export type KitItem = (typeof KIT_ITEMS)[number];

export const KIT_BY_ID = Object.fromEntries(
  KIT_ITEMS.map((item) => [item.id, item])
) as Record<KitItemId, KitItem>;

export const TILE_FACES = [
  "apple.svg",
  "horse.svg",
  "eye.svg",
  "frog.svg",
  "bomb.svg",
  "icecream.svg",
  "banana.svg",
  "gem.svg",
  "sun.svg",
  "noodle.svg",
  "sock.svg",
  "volcano.svg",
] as const;

export const BOARD_PLACEMENTS = [
  { col: 2, row: 1, face: "apple.svg" },
  { col: 4, row: 1, face: "horse.svg" },
  { col: 7, row: 1, face: "eye.svg" },
  { col: 1, row: 2, face: "bomb.svg" },
  { col: 3, row: 2, face: "icecream.svg" },
  { col: 6, row: 2, face: "frog.svg" },
  { col: 2, row: 3, face: "banana.svg" },
  { col: 5, row: 3, face: "gem.svg" },
  { col: 7, row: 3, face: "sun.svg" },
  { col: 3, row: 4, face: "noodle.svg" },
  { col: 4, row: 4, face: "sock.svg" },
  { col: 6, row: 4, face: "volcano.svg" },
  { col: 1, row: 5, face: "apple.svg" },
  { col: 5, row: 5, face: "horse.svg" },
  { col: 2, row: 6, face: "frog.svg" },
  { col: 7, row: 6, face: "gem.svg" },
  { col: 4, row: 7, face: "sun.svg" },
  { col: 6, row: 7, face: "bomb.svg" },
] as const;

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

export const CUSTOMER_SRCS = [
  "/cards/customers/customer-1.svg",
  "/cards/customers/customer-2.svg",
  "/cards/customers/customer-3.svg",
  "/cards/customers/customer-4.svg",
  "/cards/customers/customer-5.svg",
  "/cards/customers/customer-6.svg",
] as const;

export const IDEA_SRCS = [
  "/cards/backs/rule.svg",
  "/cards/faces/insider-rule.svg",
  "/cards/customers/rule.svg",
  "/cards/backs/rule.svg",
] as const;

export const BOARD_DAYS = [
  "monday",
  "tuesday",
  "wednesday",
  "thursday",
  "friday",
] as const;
