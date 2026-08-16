const TILE_FACES = [
  "apple.svg",
  "horse.svg",
  "eye.svg",
  "frog.svg",
  "bomb.svg",
  "icecream.svg",
  "banana-yellow.svg",
  "gem.svg",
  "sun.svg",
  "noodle.svg",
  "sock.svg",
  "volcano.svg",
] as const;

const BOARD_PLACEMENTS = [
  { col: 2, row: 1, face: "apple.svg" },
  { col: 4, row: 1, face: "horse.svg" },
  { col: 7, row: 1, face: "eye.svg" },
  { col: 1, row: 2, face: "bomb.svg" },
  { col: 3, row: 2, face: "icecream.svg" },
  { col: 6, row: 2, face: "frog.svg" },
  { col: 2, row: 3, face: "banana-yellow.svg" },
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

const ITEMS = [
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

export const whatYouGet = {
  title: "What you get",
  body: "Everything packed in the box: tiles, customers, ideas, the warehouse board, and the rulebook.",
  items: ITEMS,
  tileFaces: TILE_FACES,
  boardPlacements: BOARD_PLACEMENTS,
};
