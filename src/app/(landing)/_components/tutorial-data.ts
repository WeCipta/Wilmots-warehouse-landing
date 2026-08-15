import { siteContent, type TutorialStep } from "@/lib/site-content";

export type { TutorialStep };

export const TUTORIAL_VIDEO_URL = siteContent.tutorial.videoUrl;
export const TUTORIAL_INTRO = siteContent.tutorial.intro;
export const STEPS = siteContent.tutorial.steps;

export const TUTORIAL_PRODUCT_FACES = [
  "horse.svg",
  "eye.svg",
  "apple.svg",
  "poison.svg",
] as const;

export const TUTORIAL_BUBBLE_MAX_LENGTH = 28;

export const TUTORIAL_BUBBLE_COPY: Record<
  (typeof TUTORIAL_PRODUCT_FACES)[number],
  string
> = siteContent.tutorial.bubbleCopy;

export type TutorialBubbleShape = "round" | "oval" | "squircle" | "pill";

export const TUTORIAL_BUBBLE_SHAPES: Record<
  (typeof TUTORIAL_PRODUCT_FACES)[number],
  TutorialBubbleShape
> = {
  "horse.svg": "squircle",
  "eye.svg": "oval",
  "apple.svg": "round",
  "poison.svg": "pill",
};

export const TUTORIAL_CUSTOMER_SRCS = [
  "/cards/customers/customer-1.svg",
  "/cards/customers/customer-2.svg",
  "/cards/customers/customer-3.svg",
  "/cards/customers/customer-4.svg",
  "/cards/customers/customer-5.svg",
  "/cards/customers/customer-6.svg",
] as const;

export const TUTORIAL_RULE_SRC = "/cards/backs/rule.svg";
export const TUTORIAL_INSIDER_RULE_SRC = "/cards/faces/insider-rule.svg";

export type TutorialCustomerCard = {
  customerSrc: string;
  faceSrc: string;
};

function shuffle<T>(items: readonly T[]): T[] {
  const next = [...items];
  for (let i = next.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [next[i], next[j]] = [next[j], next[i]];
  }
  return next;
}

export function pickTutorialCustomers(): TutorialCustomerCard[] {
  const customers = shuffle(TUTORIAL_CUSTOMER_SRCS).slice(0, 4);
  const faces = shuffle(TUTORIAL_PRODUCT_FACES);
  return customers.map((customerSrc, i) => ({
    customerSrc,
    faceSrc: faces[i],
  }));
}
