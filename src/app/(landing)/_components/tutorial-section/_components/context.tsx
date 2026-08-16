"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import {
  pickTutorialCustomers,
  TUTORIAL_BUBBLE_COPY,
  TUTORIAL_BUBBLE_MAX_LENGTH,
  TUTORIAL_PRODUCT_FACES,
  TUTORIAL_CUSTOMER_SRCS,
  type TutorialCustomerCard,
} from "../_lib/data";

export const TUTORIAL_DRAW_STEP = "01";
export const TUTORIAL_DISCUSS_STEP = "02";
export const TUTORIAL_RULE_STEP = "03";
export const TUTORIAL_REPEAT_STEP = "04";
export const TUTORIAL_MATCH_STEP = "05";
export const TUTORIAL_SCORE_STEP = "06";

export type CardPlacement = {
  snapped: boolean;
  x: number;
  y: number;
  col?: number;
  row?: number;
};

export type RulePlacement = {
  x: number;
  y: number;
};

export type PlacedCard = CardPlacement & {
  id: string;
  faceSrc: string;
};

export type PlacedCustomer = {
  customerSrc: string;
  faceSrc: string;
  productId: string | null;
} & CardPlacement;

type StepVisibility = {
  number: string;
  ratio: number;
};

type TutorialBoardContextValue = {
  mondayPile: string[];
  placedCards: PlacedCard[];
  customers: TutorialCustomerCard[];
  customerPile: string[];
  placedCustomers: PlacedCustomer[];
  rulePlacement: RulePlacement | null;
  activeStep: string;
  visibilityByStep: Record<string, number>;
  hasPlacedCards: boolean;
  canDrawMonday: boolean;
  canDrawRule: boolean;
  bubbleText: Record<string, string>;
  resetBoard: () => void;
  setBubbleText: (faceSrc: string, value: string) => void;
  reportStepVisibility: (id: string, number: string, ratio: number) => void;
  clearStepVisibility: (id: string) => void;
  placeFromPile: (faceSrc: string, placement: CardPlacement) => void;
  movePlacedCard: (id: string, placement: CardPlacement) => void;
  returnPlacedToPile: (id: string) => void;
  relocatePlacedCards: (
    relocations: { id: string; placement: CardPlacement }[]
  ) => void;
  seedRemainingCards: (placements: CardPlacement[]) => void;
  placeRule: (placement: RulePlacement) => void;
  returnRuleToTuesday: () => void;
  placeCustomer: (
    customerSrc: string,
    placement: CardPlacement,
    productId: string | null
  ) => void;
  returnCustomer: (customerSrc: string) => void;
  clearCustomers: () => void;
};

const TutorialBoardContext = createContext<TutorialBoardContextValue | null>(
  null
);

function initialPile() {
  return [...TUTORIAL_PRODUCT_FACES];
}

function defaultCustomers(): TutorialCustomerCard[] {
  return TUTORIAL_PRODUCT_FACES.map((faceSrc, i) => ({
    customerSrc: TUTORIAL_CUSTOMER_SRCS[i],
    faceSrc,
  }));
}

function pileFromCustomers(customers: TutorialCustomerCard[]) {
  return customers.map((customer) => customer.customerSrc);
}

function initialBubbleText(): Record<string, string> {
  return { ...TUTORIAL_BUBBLE_COPY };
}

function ratiosByStep(map: Record<string, StepVisibility>) {
  const byNumber: Record<string, number> = {};
  for (const entry of Object.values(map)) {
    byNumber[entry.number] = Math.max(
      byNumber[entry.number] ?? 0,
      entry.ratio
    );
  }
  return byNumber;
}

export function TutorialProvider({ children }: { children: ReactNode }) {
  const [mondayPile, setMondayPile] = useState<string[]>(initialPile);
  const [placedCards, setPlacedCards] = useState<PlacedCard[]>([]);
  const [customers, setCustomers] =
    useState<TutorialCustomerCard[]>(defaultCustomers);
  const [customerPile, setCustomerPile] = useState<string[]>(() =>
    pileFromCustomers(defaultCustomers())
  );
  const [placedCustomers, setPlacedCustomers] = useState<PlacedCustomer[]>([]);
  const [activeStep, setActiveStep] = useState(TUTORIAL_DRAW_STEP);
  const [visibilityByStep, setVisibilityByStep] = useState<
    Record<string, number>
  >({});
  const [bubbleText, setBubbleTextState] =
    useState<Record<string, string>>(initialBubbleText);
  const [rulePlacement, setRulePlacement] = useState<RulePlacement | null>(
    null
  );
  const idRef = useRef(0);
  const pileRef = useRef(mondayPile);
  const placedRef = useRef(placedCards);
  const customersRef = useRef(customers);
  const customerPileRef = useRef(customerPile);
  const placedCustomersRef = useRef(placedCustomers);
  const visibilityRef = useRef<Record<string, StepVisibility>>({});
  pileRef.current = mondayPile;
  placedRef.current = placedCards;
  customersRef.current = customers;
  customerPileRef.current = customerPile;
  placedCustomersRef.current = placedCustomers;

  const applyCustomerKit = useCallback((next: TutorialCustomerCard[]) => {
    customersRef.current = next;
    customerPileRef.current = pileFromCustomers(next);
    placedCustomersRef.current = [];
    setCustomers(next);
    setCustomerPile(customerPileRef.current);
    setPlacedCustomers([]);
  }, []);

  useEffect(() => {
    applyCustomerKit(pickTutorialCustomers());
  }, [applyCustomerKit]);

  const syncActiveStep = useCallback(() => {
    const byNumber = ratiosByStep(visibilityRef.current);
    setVisibilityByStep(byNumber);
    let best: string | null = null;
    let bestRatio = 0;
    for (const [number, ratio] of Object.entries(byNumber)) {
      if (ratio > bestRatio) {
        best = number;
        bestRatio = ratio;
      }
    }
    if (best && bestRatio > 0) {
      setActiveStep(best);
    }
  }, []);

  const reportStepVisibility = useCallback(
    (id: string, number: string, ratio: number) => {
      visibilityRef.current[id] = { number, ratio };
      syncActiveStep();
    },
    [syncActiveStep]
  );

  const clearStepVisibility = useCallback(
    (id: string) => {
      delete visibilityRef.current[id];
      syncActiveStep();
    },
    [syncActiveStep]
  );

  const resetBoard = useCallback(() => {
    pileRef.current = initialPile();
    placedRef.current = [];
    setMondayPile(pileRef.current);
    setPlacedCards([]);
    setRulePlacement(null);
    setBubbleTextState(initialBubbleText());
    applyCustomerKit(pickTutorialCustomers());
  }, [applyCustomerKit]);

  const setBubbleText = useCallback((faceSrc: string, value: string) => {
    setBubbleTextState((prev) => ({
      ...prev,
      [faceSrc]: value.slice(0, TUTORIAL_BUBBLE_MAX_LENGTH),
    }));
  }, []);

  const placeFromPile = useCallback(
    (faceSrc: string, placement: CardPlacement) => {
      const pile = pileRef.current;
      if (pile[pile.length - 1] !== faceSrc) return;
      pileRef.current = pile.slice(0, -1);
      setMondayPile(pileRef.current);
      idRef.current += 1;
      const next: PlacedCard = {
        id: `placed-${idRef.current}`,
        faceSrc,
        ...placement,
      };
      placedRef.current = [...placedRef.current, next];
      setPlacedCards(placedRef.current);
    },
    []
  );

  const movePlacedCard = useCallback(
    (id: string, placement: CardPlacement) => {
      placedRef.current = placedRef.current.map((card) =>
        card.id === id ? { ...card, ...placement } : card
      );
      setPlacedCards(placedRef.current);
    },
    []
  );

  const returnPlacedToPile = useCallback((id: string) => {
    const card = placedRef.current.find((item) => item.id === id);
    if (!card) return;
    placedRef.current = placedRef.current.filter((item) => item.id !== id);
    pileRef.current = [...pileRef.current, card.faceSrc];
    setPlacedCards(placedRef.current);
    setMondayPile(pileRef.current);
  }, []);

  const seedRemainingCards = useCallback((placements: CardPlacement[]) => {
    const remaining = [...pileRef.current];
    if (remaining.length === 0 || placements.length === 0) return;
    const count = Math.min(remaining.length, placements.length);
    const faces = remaining.slice(0, count);
    pileRef.current = remaining.slice(count);
    const added = faces.map((faceSrc, i) => {
      idRef.current += 1;
      return {
        id: `placed-${idRef.current}`,
        faceSrc,
        ...placements[i],
      };
    });
    placedRef.current = [...placedRef.current, ...added];
    setMondayPile(pileRef.current);
    setPlacedCards(placedRef.current);
  }, []);

  const relocatePlacedCards = useCallback(
    (relocations: { id: string; placement: CardPlacement }[]) => {
      if (relocations.length === 0) return;
      const byId = new Map(
        relocations.map((item) => [item.id, item.placement])
      );
      placedRef.current = placedRef.current.map((card) => {
        const next = byId.get(card.id);
        return next ? { ...card, ...next } : card;
      });
      setPlacedCards(placedRef.current);
    },
    []
  );

  const placeRule = useCallback((placement: RulePlacement) => {
    setRulePlacement(placement);
  }, []);

  const returnRuleToTuesday = useCallback(() => {
    setRulePlacement(null);
  }, []);

  const placeCustomer = useCallback(
    (
      customerSrc: string,
      placement: CardPlacement,
      productId: string | null
    ) => {
      const kit = customersRef.current.find(
        (customer) => customer.customerSrc === customerSrc
      );
      if (!kit) return;
      const occupant = placedCustomersRef.current.find((placed) => {
        if (placed.customerSrc === customerSrc) return false;
        if (productId && placed.productId === productId) return true;
        return (
          placement.snapped &&
          placed.snapped &&
          placed.col === placement.col &&
          placed.row === placement.row
        );
      });
      if (occupant) return;

      customerPileRef.current = customerPileRef.current.filter(
        (src) => src !== customerSrc
      );
      setCustomerPile(customerPileRef.current);

      const next: PlacedCustomer = {
        customerSrc,
        faceSrc: kit.faceSrc,
        productId,
        ...placement,
      };
      const existing = placedCustomersRef.current.find(
        (placed) => placed.customerSrc === customerSrc
      );
      if (existing) {
        placedCustomersRef.current = placedCustomersRef.current.map((placed) =>
          placed.customerSrc === customerSrc ? next : placed
        );
      } else {
        placedCustomersRef.current = [...placedCustomersRef.current, next];
      }
      setPlacedCustomers(placedCustomersRef.current);
    },
    []
  );

  const returnCustomer = useCallback((customerSrc: string) => {
    const placed = placedCustomersRef.current.find(
      (item) => item.customerSrc === customerSrc
    );
    if (!placed) return;
    placedCustomersRef.current = placedCustomersRef.current.filter(
      (item) => item.customerSrc !== customerSrc
    );
    if (!customerPileRef.current.includes(customerSrc)) {
      customerPileRef.current = [...customerPileRef.current, customerSrc];
    }
    setPlacedCustomers(placedCustomersRef.current);
    setCustomerPile(customerPileRef.current);
  }, []);

  const clearCustomers = useCallback(() => {
    customerPileRef.current = pileFromCustomers(customersRef.current);
    placedCustomersRef.current = [];
    setCustomerPile(customerPileRef.current);
    setPlacedCustomers([]);
  }, []);

  const value = useMemo<TutorialBoardContextValue>(
    () => ({
      mondayPile,
      placedCards,
      customers,
      customerPile,
      placedCustomers,
      rulePlacement,
      activeStep,
      visibilityByStep,
      hasPlacedCards:
        placedCards.length > 0 ||
        placedCustomers.length > 0 ||
        rulePlacement != null,
      canDrawMonday: activeStep === TUTORIAL_DRAW_STEP,
      canDrawRule: activeStep === TUTORIAL_RULE_STEP && rulePlacement == null,
      bubbleText,
      resetBoard,
      setBubbleText,
      reportStepVisibility,
      clearStepVisibility,
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
    }),
    [
      mondayPile,
      placedCards,
      customers,
      customerPile,
      placedCustomers,
      rulePlacement,
      activeStep,
      visibilityByStep,
      bubbleText,
      resetBoard,
      setBubbleText,
      reportStepVisibility,
      clearStepVisibility,
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
    ]
  );

  return (
    <TutorialBoardContext.Provider value={value}>
      {children}
    </TutorialBoardContext.Provider>
  );
}

export function useTutorialBoard() {
  const ctx = useContext(TutorialBoardContext);
  if (!ctx) {
    throw new Error("useTutorialBoard must be used within TutorialProvider");
  }
  return ctx;
}
