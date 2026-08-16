import { GameCard } from "@/components/game-card";
import { CARD_BACK_ALT, CARD_BACK_SRC } from "@/lib/card-faces";
import { siteContent } from "@/lib/site-content";
import { TUTORIAL_RULE_SRC } from "../../../_lib/data";
import { DECORATIVE_BACKS } from "../_lib/constants";
import { stackRotate } from "../_lib/geometry";

export function DecorativeDayStack({ cardSize }: { cardSize: number }) {
  const total = DECORATIVE_BACKS + 1;

  return (
    <div
      className="pointer-events-none relative"
      style={{ width: cardSize, height: cardSize }}
    >
      {Array.from({ length: DECORATIVE_BACKS }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0"
          style={{
            transform: `rotate(${stackRotate(i, total)}deg)`,
            zIndex: i,
          }}
        >
          <GameCard src={CARD_BACK_SRC} alt={CARD_BACK_ALT} size={cardSize} />
        </div>
      ))}
      <div
        className="absolute inset-0"
        style={{
          transform: `rotate(${stackRotate(DECORATIVE_BACKS, total)}deg)`,
          zIndex: DECORATIVE_BACKS,
        }}
      >
        <GameCard
          src={TUTORIAL_RULE_SRC}
          alt={siteContent.tutorial.ruleAlt}
          size={cardSize}
        />
      </div>
    </div>
  );
}
