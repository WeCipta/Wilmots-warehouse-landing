"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GameCard } from "@/components/game-card";
import { useGridMetrics } from "@/hooks/use-grid-metrics";
import { NavLogo } from "./nav-logo";
import { NavMenu } from "./nav-menu";

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
            src={menuOpen ? "/cards/nav/navbar-opened.svg" : "/cards/nav/navbar.svg"}
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
            src={musicOn ? "/cards/nav/music-on.svg" : "/cards/nav/music-off.svg"}
            alt=""
            size={cellPx * 0.75}
            interactive
          />
        </button>
      </div>

      <NavMenu open={menuOpen} onNavigate={() => setMenuOpen(false)} />
    </>
  );
}
