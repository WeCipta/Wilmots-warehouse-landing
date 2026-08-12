"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GridOverlay } from "@/components/grid-overlay";
import { GameCard } from "@/components/game-card";
import { useGridMetrics } from "@/hooks/use-grid-metrics";
import { siteContent } from "@/lib/site-content";
import { NavLogo } from "./nav-logo";

const NAV_LINKS = siteContent.nav.links;

function NavTooltip({
  label,
  side,
}: {
  label: string;
  side: "left" | "right" | "top";
}) {
  return (
    <span
      role="tooltip"
      className={cn(
        "pointer-events-none absolute z-[60] whitespace-nowrap rounded-full bg-white px-3 py-1 text-xs font-black uppercase tracking-tight text-black opacity-0 transition-opacity duration-150 group-hover:opacity-100 group-focus-visible:opacity-100 mix-blend-difference",
        side === "left" && "right-full top-1/2 mr-2 -translate-y-1/2",
        side === "right" && "left-full top-1/2 ml-2 -translate-y-1/2",
        side === "top" && "bottom-full left-1/2 mb-2 -translate-x-1/2"
      )}
    >
      {label}
    </span>
  );
}

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { cellSizeCss, cellPx } = useGridMetrics();

  useEffect(() => {
    audioRef.current = new Audio("/sound.mp3");
    audioRef.current.loop = true;
    audioRef.current.volume = 0.1;
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

  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  return (
    <>
      <div className="fixed inset-0 pointer-events-none z-50">
        <Link
          href="/"
          aria-label="Wilmot's Warehouse — home"
          className="pointer-events-auto absolute top-0 left-0 flex items-center justify-center"
          style={{ width: cellSizeCss, height: cellSizeCss }}
        >
          <NavLogo size={cellPx * 0.75} />
        </Link>

        <button
          type="button"
          aria-label={menuOpen ? "Close navigation" : "Open navigation"}
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((v) => !v)}
          className="group pointer-events-auto absolute top-0 right-0 flex items-center justify-center cursor-none"
          style={{ width: cellSizeCss, height: cellSizeCss }}
        >
          <NavTooltip label={menuOpen ? "Close" : "Menu"} side="left" />
          <GameCard
            src={menuOpen ? "/nav/navbar-opened.svg" : "/nav/navbar.svg"}
            alt=""
            size={cellPx * 0.75}
            interactive
          />
        </button>

        <button
          type="button"
          aria-label={musicOn ? "Mute music" : "Play music"}
          onClick={toggleMusic}
          className="group pointer-events-auto absolute bottom-0 right-0 flex items-center justify-center cursor-none"
          style={{ width: cellSizeCss, height: cellSizeCss }}
        >
          <NavTooltip label={musicOn ? "Mute music" : "Play music"} side="top" />
          <GameCard
            src={musicOn ? "/nav/music-on.svg" : "/nav/music-off.svg"}
            alt=""
            size={cellPx * 0.75}
            interactive
          />
        </button>
      </div>

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
        <div className="absolute inset-0 bg-background">
          <GridOverlay aria-hidden="true" />
        </div>

        <nav
          aria-label="Primary navigation"
          className="relative z-10 flex flex-col justify-center items-center gap-3 flex-1"
          style={{ paddingBottom: cellSizeCss }}
        >
          {NAV_LINKS.map(({ label, href }, i) => (
            <a
              key={href}
              href={href}
              onClick={() => setMenuOpen(false)}
              className={cn(
                "group relative font-black uppercase tracking-tight text-foreground/70 hover:text-foreground transition-colors duration-150",
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
                <span className="absolute bottom-0 left-0 w-full h-px bg-foreground scale-x-0 group-hover:scale-x-100 transition-transform duration-200 origin-left" />
              </span>
            </a>
          ))}
        </nav>
      </div>
    </>
  );
}
