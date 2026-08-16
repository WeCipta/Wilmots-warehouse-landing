"use client";

import { useMemo, type MutableRefObject } from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { GameCard } from "@/components/game-card";
import { customerAlt, mediaAlt } from "@/lib/card-faces";
import { siteContent } from "@/lib/site-content";
import {
  TUTORIAL_MATCH_STEP,
  TUTORIAL_REPEAT_STEP,
  TUTORIAL_RULE_STEP,
  TUTORIAL_SCORE_STEP,
  useTutorialBoard,
  type PlacedCard,
} from "../../context";
import { TUTORIAL_INTRO } from "../../../_lib/data";
import { TutorialScoreboard } from "../../scoreboard";
import {
  CUSTOMER_STACK_OFFSET,
  DAYS,
  GRID_COLS,
  GRID_ROWS,
  MISMATCH_REVEAL_OFFSET,
  MONDAY_JIGGLE,
  type DragData,
} from "../_lib/constants";
import { isCustomerDrag, isRuleDrag } from "../_lib/drag";
import {
  cardBoxStyle,
  cellId,
  scorePenalties,
  violatesRule,
} from "../_lib/geometry";
import { CustomerStack, StackedCustomer } from "./customer-stack";
import { DayColumnPile } from "./day-column-pile";
import { DecorativeDayStack } from "./decorative-day-stack";
import { DraggablePlacedCard } from "./draggable-placed-card";
import { MondayStack } from "./monday-stack";
import { ScoreFloat } from "./score-float";
import { TutorialCardBubbles } from "./card-bubbles";
import { PlacedInsiderRule, TuesdayRuleStack } from "./tuesday-rule-stack";
import { WarehouseCell } from "./play-area";

export type BoardCanvasLayout = {
  isMobile: boolean;
  leftW: number;
  cardSize: number;
  ruleSize: number;
  cardsGap: number;
  boardCellPx: number;
  cellPad: number;
  cardsH: number;
  cardsBottom: number;
  dayStripAspect: string;
  dayStripWidth: string;
};

export type BoardCanvasDrag = {
  dndReady: boolean;
  activeDrag: DragData | null;
  selected: DragData | null;
  outlineColor?: string;
  tapPlace: boolean;
  draggingRef: MutableRefObject<boolean>;
  didDragRef: MutableRefObject<boolean>;
  flippedIds: Set<string>;
  scoreboardActive: boolean;
};

export type BoardCanvasHandlers = {
  onToggleFlip: (id: string) => void;
  onTapPlacedCard: (card: PlacedCard) => void;
  onTapSelectable: (data: DragData) => void;
  onTapSelectedTarget: (
    overId: string,
    clientX: number,
    clientY: number
  ) => void;
  setScoreboardActive: (active: boolean) => void;
};

export function BoardCanvas({
  layout,
  drag,
  handlers,
}: {
  layout: BoardCanvasLayout;
  drag: BoardCanvasDrag;
  handlers: BoardCanvasHandlers;
}) {
  const {
    isMobile,
    leftW,
    cardSize,
    ruleSize,
    cardsGap,
    boardCellPx,
    cellPad,
    cardsH,
    cardsBottom,
    dayStripAspect,
    dayStripWidth,
  } = layout;
  const {
    dndReady,
    activeDrag,
    selected,
    outlineColor,
    tapPlace,
    draggingRef,
    didDragRef,
    flippedIds,
    scoreboardActive,
  } = drag;
  const {
    onToggleFlip,
    onTapPlacedCard,
    onTapSelectable,
    onTapSelectedTarget,
    setScoreboardActive,
  } = handlers;

  const {
    mondayPile,
    placedCards,
    customers,
    customerPile,
    placedCustomers,
    rulePlacement,
    canDrawMonday,
    canDrawRule,
    activeStep,
  } = useTutorialBoard();

  const productsLocked = activeStep >= TUTORIAL_MATCH_STEP;
  const matchStep = activeStep === TUTORIAL_MATCH_STEP;
  const scoreStep = activeStep === TUTORIAL_SCORE_STEP;
  const snappedCards = placedCards.filter((card) => card.snapped);
  const freeCards = placedCards.filter((card) => !card.snapped);
  const draggingPlacedId =
    activeDrag?.kind === "placed" ? activeDrag.id : undefined;
  const draggingCustomerSrc = isCustomerDrag(activeDrag)
    ? activeDrag.customerSrc
    : undefined;
  const ruleActive =
    isRuleDrag(activeDrag) ||
    (rulePlacement != null && activeStep === TUTORIAL_RULE_STEP) ||
    activeStep === TUTORIAL_REPEAT_STEP;

  const movingPlacedId =
    activeDrag?.kind === "placed"
      ? activeDrag.id
      : selected?.kind === "placed"
        ? selected.id
        : undefined;

  const occupiedByOthers = useMemo(() => {
    const set = new Set<string>();
    for (const card of placedCards) {
      if (!card.snapped) continue;
      if (card.id === movingPlacedId) continue;
      if (card.col == null || card.row == null) continue;
      set.add(`${card.col}-${card.row}`);
    }
    return set;
  }, [placedCards, movingPlacedId]);

  const occupiedProductIds = useMemo(() => {
    const set = new Set<string>();
    for (const placed of placedCustomers) {
      if (placed.customerSrc === draggingCustomerSrc) continue;
      if (placed.productId) set.add(placed.productId);
    }
    return set;
  }, [placedCustomers, draggingCustomerSrc]);

  const snappedOccupied = useMemo(() => {
    const set = new Set<string>();
    for (const card of snappedCards) {
      if (card.col == null || card.row == null) continue;
      set.add(`${card.col}-${card.row}`);
    }
    return set;
  }, [snappedCards]);

  const penalties = useMemo(
    () =>
      scorePenalties(
        placedCards,
        placedCustomers,
        cardSize,
        boardCellPx,
        cellPad
      ),
    [placedCards, placedCustomers, cardSize, boardCellPx, cellPad]
  );
  const bubbleLayerProps = {
    cardSize,
    boardCellPx,
    cellPad,
    hideId: draggingPlacedId,
  };

  const renderPlacedCard = (card: PlacedCard) =>
    dndReady ? (
      <DraggablePlacedCard
        key={card.id}
        card={card}
        cardSize={cardSize}
        cellPad={cellPad}
        dragging={activeDrag?.kind === "placed" && activeDrag.id === card.id}
        lensEnabled={!tapPlace}
        flipped={flippedIds.has(card.id)}
        draggingRef={draggingRef}
        didDragRef={didDragRef}
        onToggleFlip={onToggleFlip}
        locked={productsLocked}
        dropTarget={matchStep && !occupiedProductIds.has(card.id)}
        faceUp={scoreStep}
        tapPlace={tapPlace}
        selected={selected?.kind === "placed" && selected.id === card.id}
        outlineColor={outlineColor}
        onTap={() => onTapPlacedCard(card)}
        jiggleEvery={
          !productsLocked &&
          ruleActive &&
          violatesRule(card, snappedOccupied)
            ? MONDAY_JIGGLE
            : undefined
        }
      />
    ) : (
      <div
        key={card.id}
        className="pointer-events-auto absolute"
        style={{
          left: card.snapped
            ? (card.col ?? 0) * boardCellPx + cellPad
            : card.x,
          top: card.snapped
            ? (card.row ?? 0) * boardCellPx + cellPad
            : card.y,
        }}
      >
        <GameCard src={card.faceSrc} alt={mediaAlt(card.faceSrc)} size={cardSize} />
      </div>
    );

  const renderPlacedCustomers = (cards: PlacedCard[], snapped: boolean) =>
    placedCustomers.map((customer) => {
      if (customer.productId) {
        const product = cards.find((card) => card.id === customer.productId);
        if (!product || product.snapped !== snapped) return null;
        const mismatch = customer.faceSrc !== product.faceSrc;
        const revealFace = scoreStep && mismatch;
        const offset = revealFace
          ? MISMATCH_REVEAL_OFFSET
          : CUSTOMER_STACK_OFFSET;
        const box = cardBoxStyle(product, cardSize, boardCellPx, cellPad);
        return dndReady ? (
          <StackedCustomer
            key={customer.customerSrc}
            customer={customer}
            cardSize={cardSize}
            left={box.left + offset}
            top={box.top + offset}
            dragging={draggingCustomerSrc === customer.customerSrc}
            canDrag={matchStep}
            revealFace={revealFace}
            tapPlace={tapPlace}
            selected={
              selected?.kind === "placed-customer" &&
              selected.customerSrc === customer.customerSrc
            }
            outlineColor={outlineColor}
            onTap={() =>
              onTapSelectable({
                kind: "placed-customer",
                customerSrc: customer.customerSrc,
                faceSrc: customer.faceSrc,
              })
            }
          />
        ) : (
          <div
            key={customer.customerSrc}
            className="pointer-events-none absolute"
            style={{
              left: box.left + offset,
              top: box.top + offset,
            }}
          >
            <GameCard
              src={revealFace ? customer.faceSrc : customer.customerSrc}
              alt={
                revealFace
                  ? mediaAlt(customer.faceSrc)
                  : customerAlt(customer.customerSrc)
              }
              size={cardSize}
            />
          </div>
        );
      }
      if (customer.snapped !== snapped) return null;
      const left = customer.snapped
        ? (customer.col ?? 0) * boardCellPx + cellPad
        : customer.x;
      const top = customer.snapped
        ? (customer.row ?? 0) * boardCellPx + cellPad
        : customer.y;
      const revealFace = scoreStep;
      return dndReady ? (
        <StackedCustomer
          key={customer.customerSrc}
          customer={customer}
          cardSize={cardSize}
          left={left}
          top={top}
          dragging={draggingCustomerSrc === customer.customerSrc}
          canDrag={matchStep}
          revealFace={revealFace}
          tapPlace={tapPlace}
          selected={
            selected?.kind === "placed-customer" &&
            selected.customerSrc === customer.customerSrc
          }
          outlineColor={outlineColor}
          onTap={() =>
            onTapSelectable({
              kind: "placed-customer",
              customerSrc: customer.customerSrc,
              faceSrc: customer.faceSrc,
            })
          }
        />
      ) : (
        <div
          key={customer.customerSrc}
          className="pointer-events-none absolute"
          style={{ left, top }}
        >
          <GameCard
            src={revealFace ? customer.faceSrc : customer.customerSrc}
            alt={
              revealFace
                ? mediaAlt(customer.faceSrc)
                : customerAlt(customer.customerSrc)
            }
            size={cardSize}
          />
        </div>
      );
    });

  const renderScoreFloats = (snapped: boolean) =>
    penalties
      .filter((penalty) => penalty.snapped === snapped)
      .map((penalty) => (
        <ScoreFloat
          key={penalty.key}
          left={penalty.left}
          top={penalty.top}
          cardSize={cardSize}
          visible={scoreStep}
          delay={penalty.index * 0.12}
        />
      ));

  return (
    <>
      <div
        className="relative z-10 w-full shrink-0 xl:hidden"
        style={{ aspectRatio: "1920 / 129" }}
      >
        <Image
          src={siteContent.media.board.top.src}
          alt={siteContent.media.board.top.alt}
          fill
          className="object-cover"
          sizes="100vw"
        />
      </div>
      <div className="relative min-h-0 flex-1">
        {!isMobile && (
          <div
            className="absolute bottom-0 left-0 top-0 z-10"
            style={{ width: leftW }}
          >
            <Image
              src={siteContent.media.board.left.src}
              alt={siteContent.media.board.left.alt}
              fill
              className="object-cover object-bottom"
              sizes={`${leftW}px`}
            />
          </div>
        )}

        <div
          className="absolute bottom-0 overflow-hidden"
          style={{ left: leftW, right: 0, top: 0 }}
        >
          <div
            className="absolute bottom-0"
            style={{
              width: GRID_COLS * boardCellPx,
              height: GRID_ROWS * boardCellPx,
            }}
          >
            <div
              className="absolute inset-0"
              style={{
                display: "grid",
                gridTemplateColumns: `repeat(${GRID_COLS}, ${boardCellPx}px)`,
                gridAutoRows: `${boardCellPx}px`,
              }}
            >
              {Array.from({ length: GRID_COLS * GRID_ROWS }).map((_, i) => {
                const col = i % GRID_COLS;
                const row = Math.floor(i / GRID_COLS);
                if (!dndReady) {
                  return (
                    <div
                      key={cellId(col, row)}
                      className="border border-white/20 bg-background"
                      style={{ width: boardCellPx, height: boardCellPx }}
                    />
                  );
                }
                return (
                  <WarehouseCell
                    key={cellId(col, row)}
                    col={col}
                    row={row}
                    cellPx={boardCellPx}
                    occupied={occupiedByOthers.has(`${col}-${row}`)}
                    disabled={productsLocked && !matchStep}
                    allowOccupied={matchStep}
                    tapPlace={tapPlace}
                    onTap={(cellCol, cellRow, clientX, clientY) =>
                      onTapSelectedTarget(
                        cellId(cellCol, cellRow),
                        clientX,
                        clientY
                      )
                    }
                  />
                );
              })}
            </div>
          </div>
        </div>
        <div
          className="pointer-events-none absolute z-40 overflow-visible"
          style={{
            left: leftW,
            bottom: 0,
            width: GRID_COLS * boardCellPx,
            height: GRID_ROWS * boardCellPx,
          }}
        >
          {snappedCards.map((card) => renderPlacedCard(card))}
          {renderPlacedCustomers(snappedCards, true)}
          {renderScoreFloats(true)}
        </div>
        <div
          className="pointer-events-none absolute z-50 overflow-visible"
          style={{
            left: leftW,
            bottom: 0,
            width: GRID_COLS * boardCellPx,
            height: GRID_ROWS * boardCellPx,
          }}
        >
          <TutorialCardBubbles
            cards={snappedCards}
            startIndex={0}
            {...bubbleLayerProps}
          />
        </div>

        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-x-0 top-0 z-30 hidden h-[28%] bg-linear-to-b from-background from-25% via-background/80 to-transparent xl:block"
        />
        {!isMobile && (
          <div
            aria-hidden="true"
            className="pointer-events-none absolute inset-y-0 right-0 z-30 w-[20%] bg-linear-to-l from-background from-25% via-background/80 to-transparent"
          />
        )}
      </div>

      <div className="relative z-10 flex shrink-0">
        {!isMobile && (
          <div className="relative shrink-0" style={{ width: leftW }}>
            <Image
              src={siteContent.media.board.leftSide.src}
              alt={siteContent.media.board.leftSide.alt}
              fill
              className="object-cover object-top"
              sizes={`${leftW}px`}
            />
          </div>
        )}
        <div
          className="relative min-w-0 flex-1 self-auto overflow-hidden"
          style={{ aspectRatio: dayStripAspect }}
        >
          <div
            className="absolute inset-y-0 left-0 flex"
            style={{ width: dayStripWidth }}
          >
            {DAYS.map((day) => {
              const asset = siteContent.media.board.days[day];
              return (
                <div key={day} className="relative h-full flex-1">
                  <Image
                    src={asset.src}
                    alt={asset.alt}
                    fill
                    className="object-cover"
                    sizes="33vw"
                  />
                </div>
              );
            })}
          </div>
        </div>
        {!isMobile && (
          <div className="relative shrink-0" style={{ width: leftW }}>
            <Image
              src={siteContent.media.board.rightSide.src}
              alt={siteContent.media.board.rightSide.alt}
              fill
              className="object-cover object-top"
              sizes={`${leftW}px`}
            />
          </div>
        )}
      </div>

      <div
        className="relative z-20 flex shrink-0 items-start overflow-visible"
        style={{
          height: cardsH,
          paddingTop: cardsGap,
          marginBottom: cardsBottom,
        }}
      >
        <div
          className="relative z-30 shrink-0 overflow-visible"
          style={{ width: isMobile ? 0 : leftW }}
        >
          <div
            className="absolute top-0 left-0 pointer-events-auto"
            style={{ width: cardSize, height: cardSize }}
          >
            <DayColumnPile hidden={!matchStep} delay={0}>
              <CustomerStack
                pile={customerPile}
                customers={customers}
                cardSize={cardSize}
                canDraw={matchStep && dndReady}
                draggingSrc={draggingCustomerSrc}
                tapPlace={tapPlace}
                selectedSrc={
                  selected?.kind === "customer" ? selected.customerSrc : undefined
                }
                outlineColor={outlineColor}
                onTap={(customerSrc, faceSrc) =>
                  onTapSelectable({ kind: "customer", customerSrc, faceSrc })
                }
              />
            </DayColumnPile>
          </div>
        </div>

        <div className="min-w-0 flex-1 overflow-hidden">
          <div className="flex" style={{ width: dayStripWidth }}>
            {DAYS.map((day, index) => {
              const hideDays = activeStep >= TUTORIAL_REPEAT_STEP;
              const delay = hideDays
                ? index * 0.15
                : (DAYS.length - 1 - index) * 0.15;
              return (
                <DayColumnPile key={day} hidden={hideDays} delay={delay}>
                  {day === "monday" ? (
                    <MondayStack
                      pile={mondayPile}
                      cardSize={cardSize}
                      canDraw={canDrawMonday && dndReady}
                      draggingPile={activeDrag?.kind === "pile"}
                      tapPlace={tapPlace}
                      selected={selected?.kind === "pile"}
                      outlineColor={outlineColor}
                      onTap={(faceSrc) =>
                        onTapSelectable({ kind: "pile", faceSrc })
                      }
                    />
                  ) : day === "tuesday" ? (
                    <TuesdayRuleStack
                      cardSize={cardSize}
                      canDraw={canDrawRule && dndReady}
                      dragging={activeDrag?.kind === "rule"}
                      showRule={
                        rulePlacement == null &&
                        activeStep < TUTORIAL_REPEAT_STEP
                      }
                      tapPlace={tapPlace}
                      selected={selected?.kind === "rule"}
                      outlineColor={outlineColor}
                      onTap={() => onTapSelectable({ kind: "rule" })}
                    />
                  ) : (
                    <DecorativeDayStack cardSize={cardSize} />
                  )}
                </DayColumnPile>
              );
            })}
          </div>
        </div>

        {!isMobile && <div className="shrink-0" style={{ width: leftW }} />}
        {scoreStep ? (
          <div
            className="pointer-events-auto absolute inset-0 z-40 flex items-center justify-center px-3"
            onPointerDown={(e) => e.stopPropagation()}
            onPointerUp={(e) => e.stopPropagation()}
          >
            <Button
              variant="filled"
              size={isMobile ? "sm" : "default"}
              className="max-w-full"
              disabled={scoreboardActive}
              onClick={() => setScoreboardActive(true)}
            >
              {TUTORIAL_INTRO.scoreboardLabel}
            </Button>
          </div>
        ) : null}
      </div>

      <div className="pointer-events-none absolute inset-0 z-40 overflow-visible">
        {freeCards.map((card) => renderPlacedCard(card))}
        {renderPlacedCustomers(freeCards, false)}
        {renderScoreFloats(false)}
      </div>
      {rulePlacement ? (
        <div className="pointer-events-none absolute inset-0 z-45 overflow-visible">
          <PlacedInsiderRule
            placement={rulePlacement}
            size={ruleSize}
            dragging={activeDrag?.kind === "placed-rule"}
            visible={activeStep === TUTORIAL_RULE_STEP}
            tapPlace={tapPlace}
            selected={selected?.kind === "placed-rule"}
            outlineColor={outlineColor}
            onTap={() => onTapSelectable({ kind: "placed-rule" })}
          />
        </div>
      ) : null}
      <div className="pointer-events-none absolute inset-0 z-50 overflow-visible">
        <TutorialCardBubbles
          cards={freeCards}
          startIndex={snappedCards.length}
          {...bubbleLayerProps}
        />
      </div>
      {scoreStep ? <TutorialScoreboard active={scoreboardActive} /> : null}
    </>
  );
}
