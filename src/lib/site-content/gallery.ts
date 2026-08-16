export type GalleryImage = {
  src: string;
  alt: string;
};

export const gallery = {
  title: "On the Table",
  body: "The box, the board, and the tiles in play. Bright icons, a filling warehouse, and a table mid-sort.",
  images: [
    { src: "/gallery/1.jpg", alt: "Overhead view of the warehouse board on a wooden table, with a hand placing a product tile" },
    { src: "/gallery/2.jpg", alt: "Close-up of colorful product tiles on the warehouse grid" },
    { src: "/gallery/3.jpg", alt: "Game box, cloth bag, and tiles spread across the board" },
    { src: "/gallery/4.webp", alt: "Wilmot's Warehouse box standing on a yellow spring" },
    { src: "/gallery/5.webp", alt: "A family playing Wilmot's Warehouse at a table" },
    { src: "/gallery/6.webp", alt: "Product tiles filling the warehouse board" },
    { src: "/gallery/7.webp", alt: "Warehouse board with weekday tabs and rule cards along the side" },
    { src: "/gallery/8.webp", alt: "Wilmot's Warehouse components laid out for play" },
    { src: "/gallery/9.webp", alt: "Colorful product tiles stacked beside the board" },
    { src: "/gallery/10.webp", alt: "The warehouse grid mid-sort" },
    { src: "/gallery/11.webp", alt: "Players sorting tiles on the warehouse board" },
  ] satisfies GalleryImage[],
};
