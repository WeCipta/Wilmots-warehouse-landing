"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragMoveEvent,
  type DragStartEvent,
} from "@dnd-kit/core";
import { GameCard } from "@/components/game-card";
import { mediaAlt } from "@/lib/card-faces";
import { siteContent } from "@/lib/site-content";
import { useFollowMouse } from "@/components/follow-mouse";
import { useFinePointer } from "@/hooks/use-fine-pointer";
import { useGridMetrics } from "@/hooks/use-grid-metrics";
import { useRandomAccent } from "@/hooks/use-random-accent";
import {
  TUTORIAL_DISCUSS_STEP,
  TUTORIAL_MATCH_STEP,
  TUTORIAL_REPEAT_STEP,
  TUTORIAL_RULE_STEP,
  useTutorialBoard,
  type CardPlacement,
  type PlacedCard,
} from "../context";
import { TutorialBubble } from "../bubble";
import { TUTORIAL_INSIDER_RULE_SRC } from "../../_lib/data";
import {
  CUSTOMER_STACK_OFFSET,
  DAYS,
  PLAY_AREA_ID,
  type DragData,
} from "./_lib/constants";
import {
  clamp,
  collisionDetection,
  frameFromRect,
  isPlayableCell,
  legalizeViolatingCards,
  parseCellId,
  parseProductId,
  pickEmptyCells,
  productDropId,
} from "./_lib/geometry";
import {
  isCustomerDrag,
  isRuleDrag,
  selectionKey,
  showsStoryBubbles,
} from "./_lib/drag";
import { BoardCanvas } from "./_components/board-canvas";
import { PlayArea } from "./_components/play-area";

export function TutorialBoard() {
  const grid = useGridMetrics();
  const isMobile = grid.breakpoint === "mobile";
  const isTablet = grid.breakpoint === "tablet";
  const lensEnabled = useFinePointer();
  const { setFollowFrame } = useFollowMouse();
  const {
    mondayPile,
    placedCards,
    placedCustomers,
    rulePlacement,
    visibilityByStep,
    activeStep,
    bubbleText,
    placeFromPile,
    movePlacedCard,
    returnPlacedToPile,
    seedRemainingCards,
    relocatePlacedCards,
    placeRule,
    returnRuleToTuesday,
    placeCustomer,
    returnCustomer,
    clearCustomers,
  } = useTutorialBoard();

  const cardsGap = isMobile ? 20 : isTablet ? 28 : 32;
  const cardSize = isMobile ? 80 : isTablet ? 88 : 96;
  const layout = {
    isMobile,
    leftW: isMobile ? 0 : isTablet ? 44 : 56,
    cardSize,
    ruleSize: isMobile ? 168 : isTablet ? 200 : 280,
    cardsGap,
    boardCellPx: cardSize + cardsGap,
    cellPad: cardsGap / 2,
    cardsH: cardSize + cardsGap,
    cardsBottom: cardsGap,
    dayStripAspect: `${(isMobile || isTablet ? 3 : DAYS.length) * 1077} / 516`,
    dayStripWidth: `${(DAYS.length / (isMobile || isTablet ? 3 : DAYS.length)) * 100}%`,
  };
  const { boardCellPx, cellPad, ruleSize } = layout;

  const playAreaRef = useRef<HTMLDivElement | null>(null);
  const [dndReady, setDndReady] = useState(false);
  const [activeDrag, setActiveDrag] = useState<DragData | null>(null);
  const [selection, setSelection] = useState<{
    step: string;
    data: DragData;
  } | null>(null);
  const selected = selection?.step === activeStep ? selection.data : null;
  const [flippedIds, setFlippedIds] = useState<Set<string>>(() => new Set());
  const [scoreboardActive, setScoreboardActive] = useState(false);
  const [scoreboardStep, setScoreboardStep] = useState(activeStep);
  if (scoreboardStep !== activeStep) {
    setScoreboardStep(activeStep);
    setScoreboardActive(false);
  }
  const { color: outlineColor, randomize: randomizeOutline } = useRandomAccent({
    persist: true,
  });
  const tapPlace = !lensEnabled;
  const draggingRef = useRef(false);
  const didDragRef = useRef(false);
  const prevStepRef = useRef(activeStep);

  useEffect(() => {
    setDndReady(true);
  }, []);

  useEffect(() => {
    if (placedCards.length === 0) setFlippedIds(new Set());
  }, [placedCards.length]);

  useEffect(() => {
    if (lensEnabled) setFlippedIds(new Set());
  }, [lensEnabled]);

  const discussRatio = visibilityByStep[TUTORIAL_DISCUSS_STEP] ?? 0;
  const ruleRatio = visibilityByStep[TUTORIAL_RULE_STEP] ?? 0;
  const matchRatio = visibilityByStep[TUTORIAL_MATCH_STEP] ?? 0;
  const seedRatio = Math.max(discussRatio, ruleRatio, matchRatio);
  const productsLocked = activeStep >= TUTORIAL_MATCH_STEP;

  useEffect(() => {
    if (seedRatio < 0.5) return;
    if (mondayPile.length === 0) return;
    const occupied = new Set<string>();
    for (const card of placedCards) {
      if (!card.snapped || card.col == null || card.row == null) continue;
      occupied.add(`${card.col}-${card.row}`);
    }
    const placements = pickEmptyCells(
      mondayPile.length,
      occupied,
      boardCellPx,
      cellPad
    );
    if (placements.length === 0) return;
    seedRemainingCards(placements);
  }, [
    seedRatio,
    mondayPile.length,
    placedCards,
    boardCellPx,
    cellPad,
    seedRemainingCards,
  ]);

  useEffect(() => {
    const prev = prevStepRef.current;
    prevStepRef.current = activeStep;
    if (prev === TUTORIAL_MATCH_STEP && activeStep < TUTORIAL_MATCH_STEP) {
      clearCustomers();
    }
    if (activeStep === TUTORIAL_DISCUSS_STEP) {
      if (rulePlacement == null) return;
      if (prev === TUTORIAL_RULE_STEP) {
        const timeout = window.setTimeout(() => returnRuleToTuesday(), 320);
        return () => window.clearTimeout(timeout);
      }
      returnRuleToTuesday();
      return;
    }
    if (prev !== TUTORIAL_RULE_STEP && prev !== TUTORIAL_REPEAT_STEP) return;
    if (activeStep <= prev) return;
    const relocations = legalizeViolatingCards(
      placedCards,
      boardCellPx,
      cellPad
    );
    if (relocations.length === 0) return;
    relocatePlacedCards(relocations);
  }, [
    activeStep,
    rulePlacement,
    returnRuleToTuesday,
    placedCards,
    boardCellPx,
    cellPad,
    relocatePlacedCards,
    clearCustomers,
  ]);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 4 },
    })
  );

  const onToggleFlip = useCallback((id: string) => {
    setFlippedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  const freePlacementFromPoint = useCallback(
    (
      clientX: number,
      clientY: number,
      size = cardSize
    ): CardPlacement | null => {
      const play = playAreaRef.current;
      if (!play) return null;
      const rect = play.getBoundingClientRect();
      if (
        clientX < rect.left ||
        clientX > rect.right ||
        clientY < rect.top ||
        clientY > rect.bottom
      ) {
        return null;
      }
      return {
        snapped: false,
        x: clamp(clientX - rect.left - size / 2, 0, Math.max(0, rect.width - size)),
        y: clamp(clientY - rect.top - size / 2, 0, Math.max(0, rect.height - size)),
      };
    },
    [cardSize]
  );

  const applyPlacement = useCallback(
    (data: DragData, placement: CardPlacement) => {
      if (data.kind === "pile") {
        placeFromPile(data.faceSrc, placement);
        return;
      }
      if (data.kind === "placed") {
        movePlacedCard(data.id, placement);
      }
    },
    [placeFromPile, movePlacedCard]
  );

  const selectCard = useCallback(
    (data: DragData) => {
      setSelection({ step: activeStep, data });
      randomizeOutline();
    },
    [randomizeOutline, activeStep]
  );

  const onTapSelectable = useCallback(
    (data: DragData) => {
      if (selected && selectionKey(selected) === selectionKey(data)) {
        setSelection(null);
        return;
      }
      selectCard(data);
    },
    [selected, selectCard]
  );

  const commitPlacement = useCallback(
    (
      data: DragData,
      overId: string,
      center: { x: number; y: number } | null,
      mode: "drag" | "tap"
    ) => {
      if (isCustomerDrag(data)) {
        const productId = parseProductId(overId);
        const cell = parseCellId(overId);
        const product = productId
          ? placedCards.find((card) => card.id === productId)
          : cell
            ? placedCards.find(
                (card) =>
                  card.snapped &&
                  card.col === cell.col &&
                  card.row === cell.row
              )
            : undefined;
        const stackedOn = product?.id ?? null;

        let placement: CardPlacement | null = null;
        if (product) {
          const offset = CUSTOMER_STACK_OFFSET;
          placement = {
            snapped: product.snapped,
            col: product.col,
            row: product.row,
            x: product.snapped
              ? (product.col ?? 0) * boardCellPx + cellPad + offset
              : product.x + offset,
            y: product.snapped
              ? (product.row ?? 0) * boardCellPx + cellPad + offset
              : product.y + offset,
          };
        } else if (cell && isPlayableCell(cell.col, cell.row)) {
          placement = {
            snapped: true,
            col: cell.col,
            row: cell.row,
            x: cell.col * boardCellPx + cellPad,
            y: cell.row * boardCellPx + cellPad,
          };
        }

        if (!placement) {
          if (mode === "drag" && data.kind === "placed-customer") {
            returnCustomer(data.customerSrc);
          }
          return false;
        }

        const nextPlacement = placement;
        const occupant = placedCustomers.some((placed) => {
          if (placed.customerSrc === data.customerSrc) return false;
          if (stackedOn && placed.productId === stackedOn) return true;
          return (
            nextPlacement.snapped &&
            placed.snapped &&
            placed.col === nextPlacement.col &&
            placed.row === nextPlacement.row
          );
        });

        if (!occupant) {
          placeCustomer(data.customerSrc, nextPlacement, stackedOn);
          return true;
        }
        if (mode === "drag" && data.kind === "placed-customer") {
          returnCustomer(data.customerSrc);
        }
        return false;
      }

      if (isRuleDrag(data)) {
        const free = center
          ? freePlacementFromPoint(center.x, center.y, ruleSize)
          : null;
        if (free) {
          placeRule({ x: free.x, y: free.y });
          return true;
        }
        if (mode === "drag") returnRuleToTuesday();
        return false;
      }

      const occupied = new Set<string>();
      for (const card of placedCards) {
        if (!card.snapped || card.col == null || card.row == null) continue;
        if (data.kind === "placed" && data.id === card.id) continue;
        occupied.add(`${card.col}-${card.row}`);
      }

      const cell = parseCellId(overId);
      if (
        cell &&
        isPlayableCell(cell.col, cell.row) &&
        !occupied.has(`${cell.col}-${cell.row}`)
      ) {
        applyPlacement(data, {
          snapped: true,
          col: cell.col,
          row: cell.row,
          x: cell.col * boardCellPx + cellPad,
          y: cell.row * boardCellPx + cellPad,
        });
        return true;
      }

      const free = center ? freePlacementFromPoint(center.x, center.y) : null;
      if (free && mode === "drag") {
        applyPlacement(data, free);
        return true;
      }

      if (mode === "drag" && data.kind === "placed") {
        returnPlacedToPile(data.id);
      }
      return false;
    },
    [
      placedCards,
      placedCustomers,
      boardCellPx,
      cellPad,
      applyPlacement,
      freePlacementFromPoint,
      placeRule,
      returnRuleToTuesday,
      ruleSize,
      placeCustomer,
      returnCustomer,
      returnPlacedToPile,
    ]
  );

  const onTapSelectedTarget = useCallback(
    (overId: string, clientX: number, clientY: number) => {
      if (!selected) return;
      if (overId === PLAY_AREA_ID && !isRuleDrag(selected)) {
        setSelection(null);
        return;
      }
      const placed = commitPlacement(
        selected,
        overId,
        { x: clientX, y: clientY },
        "tap"
      );
      if (placed || overId !== PLAY_AREA_ID) setSelection(null);
    },
    [selected, commitPlacement]
  );

  const onTapPlacedCard = useCallback(
    (card: PlacedCard) => {
      const data: DragData = {
        kind: "placed",
        id: card.id,
        faceSrc: card.faceSrc,
      };
      if (selected && isCustomerDrag(selected)) {
        const placed = commitPlacement(
          selected,
          productDropId(card.id),
          null,
          "tap"
        );
        if (placed) setSelection(null);
        return;
      }
      if (selected && selectionKey(selected) === selectionKey(data)) {
        if (card.snapped && !productsLocked) {
          onToggleFlip(card.id);
          return;
        }
        setSelection(null);
        return;
      }
      if (productsLocked) return;
      selectCard(data);
    },
    [selected, commitPlacement, productsLocked, onToggleFlip, selectCard]
  );

  const onDragStart = useCallback((event: DragStartEvent) => {
    draggingRef.current = true;
    didDragRef.current = true;
    const data = event.active.data.current as DragData | undefined;
    if (data) setActiveDrag(data);
  }, []);

  const onDragMove = useCallback(
    (event: DragMoveEvent) => {
      const data = event.active.data.current as DragData | undefined;
      if (!lensEnabled || isRuleDrag(data ?? null) || isCustomerDrag(data ?? null)) {
        return;
      }
      const card = document.querySelector<HTMLElement>(
        `[data-tutorial-drag="${event.active.id}"] [data-game-card]`
      );
      if (card) {
        setFollowFrame(frameFromRect(card.getBoundingClientRect()));
        return;
      }
      const rect = event.active.rect.current.translated;
      if (rect) setFollowFrame(frameFromRect(rect));
    },
    [lensEnabled, setFollowFrame]
  );

  const onDragEnd = useCallback(
    (event: DragEndEvent) => {
      draggingRef.current = false;
      const data = event.active.data.current as DragData | undefined;
      const translated = event.active.rect.current.translated;
      setActiveDrag(null);
      setFollowFrame(null);
      if (!data) return;
      const overId = event.over ? String(event.over.id) : "";
      const center = translated
        ? {
            x: translated.left + translated.width / 2,
            y: translated.top + translated.height / 2,
          }
        : null;
      commitPlacement(data, overId, center, "drag");
    },
    [commitPlacement, setFollowFrame]
  );

  const onDragCancel = useCallback(() => {
    draggingRef.current = false;
    setActiveDrag(null);
    setFollowFrame(null);
  }, [setFollowFrame]);

  const canvas = (
    <BoardCanvas
      layout={layout}
      drag={{
        dndReady,
        activeDrag,
        selected,
        outlineColor,
        tapPlace,
        draggingRef,
        didDragRef,
        flippedIds,
        scoreboardActive,
      }}
      handlers={{
        onToggleFlip,
        onTapPlacedCard,
        onTapSelectable,
        onTapSelectedTarget,
        setScoreboardActive,
      }}
    />
  );

  if (!dndReady) {
    return (
      <div className="relative flex h-full flex-col justify-end overflow-hidden">
        {canvas}
      </div>
    );
  }

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetection}
      autoScroll={false}
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
      onDragCancel={onDragCancel}
    >
      <PlayArea
        playAreaRef={playAreaRef}
        tapPlace={tapPlace}
        onTap={(clientX, clientY) =>
          onTapSelectedTarget(PLAY_AREA_ID, clientX, clientY)
        }
      >
        {canvas}
      </PlayArea>
      <DragOverlay dropAnimation={null}>
        {activeDrag ? (
          isRuleDrag(activeDrag) ? (
            <GameCard
              src={TUTORIAL_INSIDER_RULE_SRC}
              alt={siteContent.tutorial.insiderRuleAlt}
              size={ruleSize}
            />
          ) : isCustomerDrag(activeDrag) ? (
            <GameCard
              src={activeDrag.faceSrc}
              alt={mediaAlt(activeDrag.faceSrc)}
              size={cardSize}
            />
          ) : (
            <div className="relative">
              {showsStoryBubbles(activeStep) &&
              "faceSrc" in activeDrag ? (
                <TutorialBubble
                  faceSrc={activeDrag.faceSrc}
                  text={bubbleText[activeDrag.faceSrc] ?? ""}
                  readOnly
                  visible
                  delay={0}
                />
              ) : null}
              {"faceSrc" in activeDrag ? (
                <GameCard
                  src={activeDrag.faceSrc}
                  alt={mediaAlt(activeDrag.faceSrc)}
                  size={cardSize}
                />
              ) : null}
            </div>
          )
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}
