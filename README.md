# Wilmot's Warehouse

A landing page for [Wilmot's Warehouse](https://www.cmyk.games/products/wilmot), the cooperative board game from [CMYK](https://www.cmyk.games).

Your team organizes a warehouse together. You invent silly stories so everyone can remember where the face-down product tiles sit. Then a five-minute timer starts, and the table races to match every customer card to the right tile.

Created by Ricky Haggett, Richard Hogg, and David King II.

## What's on the site

- A hero built from a live grid of product tiles
- A short pitch for how the game plays
- What's in the box: board, tiles, customer cards, idea cards, and the rulebook
- An interactive how-to-play tutorial you can walk through on the page
- Photos of the game on the table
- Notes from players
- A link to order the game on CMYK

Most of the copy, credits, gallery photos, and player quotes live in `src/lib/site-content.ts`.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

```bash
npm run build   # production build
npm run start   # serve the production build
npm run lint    # lint
```

## Stack

Next.js, React, Tailwind CSS, GSAP, Lenis, and Matter.js.
