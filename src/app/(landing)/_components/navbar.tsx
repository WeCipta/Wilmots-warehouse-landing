"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";
import { GameCard } from "@/components/game-card";
import { Sheet, SheetTrigger } from "@/components/ui/sheet";
import { useGridMetrics } from "@/hooks/use-grid-metrics";
import { useLenisLock } from "@/hooks/use-lenis-lock";
import { NavLogo } from "./nav-logo";
import { NavMenu } from "./nav-menu";
import { siteContent } from "@/lib/site-content";

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
  const [scrollLocked, setScrollLocked] = useState(false);
  const [musicOn, setMusicOn] = useState(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const pendingScrollRef = useRef<string | null>(null);
  const { cellSizeCss, cellPx } = useGridMetrics();

  const lenis = useLenisLock(scrollLocked);

  useEffect(() => {
    if (menuOpen) setScrollLocked(true);
  }, [menuOpen]);

  useEffect(() => {
    if (scrollLocked) return;
    const target = pendingScrollRef.current;
    if (!target) return;
    pendingScrollRef.current = null;
    lenis?.scrollTo(target);
    if (target.startsWith("#")) {
      history.replaceState(null, "", target);
    }
  }, [scrollLocked, lenis]);

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

  return (
    <Sheet
      open={menuOpen}
      onOpenChange={(open) => setMenuOpen(open)}
      modal={false}
      disablePointerDismissal
      onOpenChangeComplete={(open) => {
        if (!open) setScrollLocked(false);
      }}
    >
      <div className="fixed inset-0 pointer-events-none z-50">
        <Link
          href="/"
          aria-label={siteContent.nav.homeAriaLabel}
          className="pointer-events-auto absolute top-0 left-0 flex items-center justify-center"
          style={{ width: cellSizeCss, height: cellSizeCss }}
        >
          <NavLogo size={cellPx * 0.75} />
        </Link>

        <SheetTrigger
          aria-label={menuOpen ? siteContent.nav.menuClose : siteContent.nav.menuOpen}
          className="group pointer-events-auto absolute top-0 right-0 flex items-center justify-center cursor-none"
          style={{ width: cellSizeCss, height: cellSizeCss }}
        >
          <NavTooltip label={menuOpen ? siteContent.nav.menuClose : siteContent.nav.menuOpen} side="left" />
          <GameCard
            src={menuOpen ? "/cards/nav/navbar-opened.svg" : "/cards/nav/navbar.svg"}
            alt=""
            size={cellPx * 0.75}
            interactive
          />
        </SheetTrigger>

        <button
          type="button"
          aria-label={musicOn ? siteContent.nav.musicMute : siteContent.nav.musicPlay}
          onClick={toggleMusic}
          className="group pointer-events-auto absolute bottom-0 right-0 flex items-center justify-center cursor-none"
          style={{ width: cellSizeCss, height: cellSizeCss }}
        >
          <NavTooltip label={musicOn ? siteContent.nav.musicMute : siteContent.nav.musicPlay} side="top" />
          <GameCard
            src={musicOn ? "/cards/nav/music-on.svg" : "/cards/nav/music-off.svg"}
            alt=""
            size={cellPx * 0.75}
            interactive
          />
        </button>
      </div>

      <NavMenu
        open={menuOpen}
        onNavigate={(href) => {
          if (href?.startsWith("#")) pendingScrollRef.current = href;
          setMenuOpen(false);
        }}
      />
    </Sheet>
  );
}
