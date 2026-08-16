"use client";

import { useTutorialBoard } from "../../context";
import { TutorialBubble } from "../../bubble";
import type { PlacedCard } from "../../context";
import { showsStoryBubbles } from "../_lib/drag";
import { cardBoxStyle } from "../_lib/geometry";

export function TutorialCardBubbles({
  cards,
  startIndex,
  cardSize,
  boardCellPx,
  cellPad,
  hideId,
}: {
  cards: PlacedCard[];
  startIndex: number;
  cardSize: number;
  boardCellPx: number;
  cellPad: number;
  hideId?: string;
}) {
  const { activeStep, bubbleText, setBubbleText } = useTutorialBoard();
  if (!showsStoryBubbles(activeStep)) return null;

  return cards.map((card, index) => {
    if (card.id === hideId) return null;
    return (
      <div
        key={card.id}
        className="absolute"
        style={cardBoxStyle(card, cardSize, boardCellPx, cellPad)}
      >
        <TutorialBubble
          faceSrc={card.faceSrc}
          text={bubbleText[card.faceSrc] ?? ""}
          onChange={(value) => setBubbleText(card.faceSrc, value)}
          visible
          delay={(startIndex + index) * 0.08}
        />
      </div>
    );
  });
}
