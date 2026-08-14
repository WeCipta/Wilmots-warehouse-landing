export type TutorialStep = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  hint: string;
};

export const TUTORIAL_VIDEO_URL = "https://www.youtube.com/watch?v=aIDl5suP_QE";

export const TUTORIAL_INTRO = {
  blurb: "This tutorial uses only 4 cards, 4 customers, and 1 rule card.",
  videoLabel: "Watch Tutorial",
  resetLabel: "Reset board",
};

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
> = {
  "horse.svg": "The Knight",
  "eye.svg": "Saw",
  "apple.svg": "The apple",
  "poison.svg": "Got poisoned",
};

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

export const STEPS: TutorialStep[] = [
  {
    number: "01",
    title: "Draw & Place",
    subtitle: "Draw",
    description:
      "Each player draws product tiles, checks the symbols, and places them face-down on the warehouse board right away.",
    hint: "Draw a tile on the Monday column, then drop it onto an open warehouse space.",
  },
  {
    number: "02",
    title: "Discuss & Strategize",
    subtitle: "Discuss",
    description:
      "Making up a silly story is a great way to remember the layout. Talk through positions too — keep discussing until everyone agrees to end the day.",
    hint: "Move tiles around until the whole table agrees on the layout. The story on each bubble is editable.",
  },
  {
    number: "03",
    title: "Open the Next Day",
    subtitle: "Rule",
    description:
      "Reveal the next day's rule card and follow the special rule it brings.",
    hint: "Drag the rule card from the Tuesday column, then follow what it says.",
  },
  {
    number: "04",
    title: "Repeat Until Empty",
    subtitle: "Repeat",
    description:
      "Keep drawing, placing, discussing, rearranging, and opening the next rule until every pile under the days is empty.",
    hint: "Remember the faces of the products one last time. You may move tiles around as needed.",
  },
  {
    number: "05",
    title: "Start the Timer",
    subtitle: "Match",
    description:
      "Start the timer, then place every customer on top of its matching product tile.",
    hint: "Stack each customer card on the product it matches.",
  },
  {
    number: "06",
    title: "Calculate Score",
    subtitle: "Score",
    description:
      "The time you took is your score. Add 10 seconds for every mismatch — or product left without a customer.",
    hint: "Tally the clock, then add 10 seconds for each miss.",
  },
];
