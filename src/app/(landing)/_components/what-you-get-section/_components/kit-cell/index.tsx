"use client";

import Image from "next/image";
import type { CSSProperties } from "react";
import { GameCard } from "@/components/game-card";
import { useRandomAccent } from "@/hooks/use-random-accent";
import { cardFaceAlt, customerAlt } from "@/lib/card-faces";
import { siteContent } from "@/lib/site-content";
import { cn } from "@/lib/utils";
import {
  BOARD_CHROME,
  BOARD_DAYS,
  BOARD_FRAME_H,
  BOARD_FRAME_W,
  BOARD_PLACEMENTS,
  CUSTOMER_SRCS,
  IDEA_CARDS,
  KIT_BY_ID,
  TILE_FACES,
  type KitItemId,
} from "./_lib/kit";

type KitCellProps = {
  id: KitItemId;
  className?: string;
  spread?: boolean;
};

function CollageCard({
  src,
  alt,
  className,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  style?: CSSProperties;
}) {
  return (
    <div
      className={cn(
        "absolute aspect-square w-[22%] min-w-8 max-w-14 transition-transform duration-300 ease-out sm:w-[28%] sm:min-w-11 sm:max-w-20 xl:w-[36%] xl:max-w-28",
        className
      )}
      style={style}
    >
      <GameCard src={src} alt={alt} size="100%" />
    </div>
  );
}

function BoardCollage() {
  const occupied = new Map(
    BOARD_PLACEMENTS.map((placement) => [
      `${placement.col}-${placement.row}`,
      placement.face,
    ])
  );

  return (
    <div
      className="h-full w-full min-h-0"
      style={{ containerType: "size" }}
    >
      <div
        className="mx-auto grid overflow-hidden"
        style={{
          width: `min(100cqw, calc(100cqh * ${BOARD_FRAME_W} / ${BOARD_FRAME_H}))`,
          height: `min(100cqh, calc(100cqw * ${BOARD_FRAME_H} / ${BOARD_FRAME_W}))`,
          gridTemplateColumns: `${BOARD_CHROME.left}fr ${BOARD_CHROME.grid}fr ${BOARD_CHROME.right}fr`,
          gridTemplateRows: `${BOARD_CHROME.top}fr ${BOARD_CHROME.grid}fr ${BOARD_CHROME.days}fr`,
        }}
      >
        <div className="relative col-span-3">
          <Image
            src={siteContent.media.board.top.src}
            alt={siteContent.media.board.top.alt}
            fill
            className="object-cover"
            sizes="(max-width: 1280px) 90vw, 45vw"
          />
        </div>
        <div className="relative">
          <Image
            src={siteContent.media.board.left.src}
            alt={siteContent.media.board.left.alt}
            fill
            className="object-cover object-bottom"
            sizes="40px"
          />
        </div>
        <div className="grid grid-cols-7 grid-rows-7 bg-white/20">
          {Array.from({ length: 49 }, (_, index) => {
            const col = (index % 7) + 1;
            const row = Math.floor(index / 7) + 1;
            const face = occupied.get(`${col}-${row}`);
            return (
              <div
                key={`${col}-${row}`}
                className="min-h-0 min-w-0 overflow-hidden border-r border-b border-white/20 bg-background"
              >
                {face ? (
                  <GameCard src={face} alt={cardFaceAlt(face)} size="100%" />
                ) : null}
              </div>
            );
          })}
        </div>
        <div className="relative">
          <Image
            src={siteContent.media.board.right.src}
            alt={siteContent.media.board.right.alt}
            fill
            className="object-cover object-bottom"
            sizes="40px"
          />
        </div>
        <div className="relative">
          <Image
            src={siteContent.media.board.leftSide.src}
            alt={siteContent.media.board.leftSide.alt}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
        <div className="flex min-w-0">
          {BOARD_DAYS.map((day) => {
            const asset = siteContent.media.board.days[day];
            return (
              <div key={day} className="relative min-w-0 flex-1">
                <Image
                  src={asset.src}
                  alt={asset.alt}
                  fill
                  className="object-cover"
                  sizes="8vw"
                />
              </div>
            );
          })}
        </div>
        <div className="relative">
          <Image
            src={siteContent.media.board.rightSide.src}
            alt={siteContent.media.board.rightSide.alt}
            fill
            className="object-cover"
            sizes="40px"
          />
        </div>
      </div>
    </div>
  );
}

function TilesCollage({ spread }: { spread?: boolean }) {
  const faces = TILE_FACES.slice(0, spread ? 8 : 6);
  return (
    <>
      {faces.map((face, index) => {
        const t = index / Math.max(faces.length - 1, 1);
        return (
          <CollageCard
            key={`${face}-${index}`}
            src={face}
            alt={cardFaceAlt(face)}
            className="group-hover:-translate-y-2 group-hover:rotate-3"
            style={{
              right: spread
                ? `${4 + t * 58}%`
                : `${6 + (index % 3) * 16}%`,
              bottom: spread
                ? `${10 + (index % 2) * 18}%`
                : `${8 + Math.floor(index / 3) * 22}%`,
              rotate: `${-16 + index * 7}deg`,
              transitionDelay: `${index * 28}ms`,
              zIndex: index,
            }}
          />
        );
      })}
    </>
  );
}

function CustomersCollage({ spread }: { spread?: boolean }) {
  const srcs = spread ? CUSTOMER_SRCS : CUSTOMER_SRCS.slice(0, 5);
  return (
    <>
      {srcs.map((src, index) => {
        const t = index / Math.max(srcs.length - 1, 1);
        return (
          <CollageCard
            key={src}
            src={src}
            alt={customerAlt(src)}
            className="group-hover:-translate-y-2 group-hover:-rotate-2"
            style={{
              right: spread ? `${2 + t * 62}%` : `${8 + index * 9}%`,
              bottom: spread
                ? `${12 + Math.sin(index) * 8}%`
                : `${10 + (index % 2) * 14}%`,
              rotate: `${-18 + index * 8}deg`,
              transitionDelay: `${index * 24}ms`,
              zIndex: index,
            }}
          />
        );
      })}
    </>
  );
}

function IdeasCollage() {
  return (
    <>
      {IDEA_CARDS.map((card, index) => (
        <CollageCard
          key={`${card.src}-${index}`}
          src={card.src}
          alt={card.alt}
          className="w-[28%] max-w-16 sm:w-[34%] sm:max-w-24 xl:w-[42%] xl:max-w-32 group-hover:-translate-y-1.5"
          style={{
            right: `${10 + index * 7}%`,
            bottom: `${12 + index * 5}%`,
            rotate: `${-10 + index * 6}deg`,
            transitionDelay: `${index * 30}ms`,
            zIndex: index,
          }}
        />
      ))}
    </>
  );
}

function RulebookCollage() {
  return (
    <div className="absolute right-[8%] bottom-[10%] aspect-[1086/1552] h-[48%] max-h-28 min-h-16 rotate-3 transition-transform duration-300 ease-out group-hover:-translate-y-2 group-hover:rotate-6 sm:h-[60%] sm:max-h-40 sm:min-h-24 xl:h-[72%] xl:max-h-56 xl:min-h-32">
      <div className="absolute inset-0 translate-x-2 translate-y-1 rotate-6 bg-white" />
      <div className="absolute inset-0 overflow-hidden ring-[3px] ring-inset ring-white/30 shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)]">
        <Image
          src={siteContent.media.rulebook.src}
          alt={siteContent.media.rulebook.alt}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 30vw, (max-width: 1280px) 22vw, 16vw"
        />
      </div>
    </div>
  );
}

function CellCollage({ id, spread }: { id: KitItemId; spread?: boolean }) {
  switch (id) {
    case "tiles":
      return <TilesCollage spread={spread} />;
    case "customers":
      return <CustomersCollage spread={spread} />;
    case "ideas":
      return <IdeasCollage />;
    case "rulebook":
      return <RulebookCollage />;
    default:
      return null;
  }
}

export function KitCell({ id, className, spread }: KitCellProps) {
  const item = KIT_BY_ID[id];
  const { color, randomize, clear } = useRandomAccent();
  const isBoard = id === "board";

  return (
    <article
      className={cn(
        "group relative isolate flex min-h-0 flex-col overflow-hidden rounded-[6px] border-2 border-white/20 bg-background shadow-[4px_4px_0px_0px_rgba(0,0,0,0.85)] transition-[border-color] duration-200",
        className
      )}
      style={{ borderColor: color ?? "rgba(255,255,255,0.2)" }}
      onMouseEnter={randomize}
      onMouseLeave={clear}
    >
      {!isBoard ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 overflow-hidden"
        >
          <CellCollage id={id} spread={spread} />
        </div>
      ) : null}
      <div className="relative z-20 flex h-full min-h-0 flex-col gap-2 p-3 sm:gap-3 sm:p-4">
        <span
          className="text-4xl font-black leading-none tracking-tight transition-colors duration-200 sm:text-5xl md:text-6xl xl:text-7xl"
          style={{ color: color ?? "#ffffff" }}
        >
          {item.count}
        </span>
        {isBoard ? (
          <div className="min-h-0 min-w-0 flex-1">
            <BoardCollage />
          </div>
        ) : (
          <div className="min-h-0 flex-1" />
        )}
        <span className="w-fit rounded-none border border-black bg-white px-2 py-0.5 text-xs font-black uppercase leading-tight tracking-tight text-black sm:px-2.5 sm:py-1 sm:text-sm">
          {item.label}
        </span>
      </div>
    </article>
  );
}
