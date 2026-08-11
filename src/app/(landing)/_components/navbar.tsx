"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GridOverlay, cellSize } from "@/components/grid-overlay";
import { GameCard } from "@/components/game-card";

// ─── Nav links (dummy for now) ────────────────────────────────────────────────
const NAV_LINKS = [
  { label: "About", href: "#about" },
  { label: "How to Play", href: "#how-to-play" },
  { label: "Tutorial", href: "#tutorial" },
  { label: "Gallery", href: "#gallery" },
  { label: "Order Now", href: "#order" },
];

// ─── Cell size matches one grid cell ─────────────────────────────────────────
// Uses the same max() expression as the grid tracks so corners always
// align flush regardless of viewport width.
const CELL_SIZE = cellSize(); // "max(96px, calc(100vw / 14))"

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialise audio once
  useEffect(() => {
    audioRef.current = new Audio("/sound.mp3");
    audioRef.current.loop = true;
    return () => {
      audioRef.current?.pause();
    };
  }, []);

  const toggleMusic = () => {
    if (!audioRef.current) return;
    if (musicOn) {
      audioRef.current.pause();
    } else {
      audioRef.current.play().catch(() => {});
    }
    setMusicOn((prev) => !prev);
  };

  // Lock body scroll when menu is open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <>
      {/* ── Fixed corner buttons ──────────────────────────────────────────── */}
      <div className="fixed inset-0 pointer-events-none z-50">

        {/* TOP-LEFT: Logo */}
        <Link
          href="/"
          aria-label="Wilmot's Warehouse — home"
          className="pointer-events-auto absolute top-0 left-0 flex items-center justify-center border-r border-b-2 border-white/20 bg-background"
          style={{ width: CELL_SIZE, height: CELL_SIZE }}
        >
          <GameCard src="logo.svg" alt="Wilmot's Warehouse" size={72} interactive />
        </Link>

        {/* TOP-RIGHT: Navbar toggle */}
        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="pointer-events-auto absolute top-0 right-0 flex items-center justify-center border-l border-b-2 border-white/20 cursor-pointer bg-background"
          style={{ width: CELL_SIZE, height: CELL_SIZE }}
        >
          <GameCard
            src={menuOpen ? "navbar-opened.svg" : "navbar.svg"}
            alt=""
            size={72}
            interactive
          />
        </button>

        {/* BOTTOM-RIGHT: Music toggle */}
        <button
          type="button"
          aria-label={musicOn ? "Mute music" : "Play music"}
          onClick={toggleMusic}
          className="pointer-events-auto absolute bottom-0 right-0 flex items-center justify-center border-l border-t-3 border-white/20 bg-background cursor-pointer"
          style={{ width: CELL_SIZE, height: CELL_SIZE }}
        >
          <GameCard
            src={musicOn ? "musicon.svg" : "musicoff.svg"}
            alt=""
            size={72}
            interactive
          />
        </button>
      </div>

      {/* ── Full-screen menu overlay ──────────────────────────────────────── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={cn(
          "fixed inset-0 z-40 flex flex-col transition-all duration-300 ease-in-out",
          menuOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        )}
      >
        {/* Grid background fills entire viewport */}
        <div className="absolute inset-0 bg-background">
          <GridOverlay aria-hidden="true" />
        </div>

        {/* Nav content — leaves bottom row free for the music button */}
        <nav
          aria-label="Primary navigation"
          className="relative z-10 flex flex-col justify-center items-center gap-3 flex-1"
          style={{ paddingBottom: CELL_SIZE }}
        >
          {NAV_LINKS.map(({ label, href }, i) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "group relative font-black uppercase tracking-tight text-foreground/70 hover:text-foreground transition-colors duration-150",
                // Scale links by index for a staggered-size effect
                i === 0 && "text-4xl sm:text-5xl",
                i === 1 && "text-3xl sm:text-4xl",
                i === 2 && "text-2xl sm:text-3xl",
                i === 3 && "text-xl sm:text-2xl",
                i >= 4 && "text-lg sm:text-xl"
              )}
              style={{
                opacity: menuOpen ? 1 : 0,
                transform: menuOpen ? "translateY(0)" : "translateY(12px)",
                transition: `opacity 250ms ${i * 50 + 100}ms ease-out, transform 250ms ${i * 50 + 100}ms ease-out, color 150ms ease`,
              }}
            >
              <span className="relative">
                {label}
                {/* Underline on hover */}
                <span className="absolute bottom-0 left-0 w-full h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}