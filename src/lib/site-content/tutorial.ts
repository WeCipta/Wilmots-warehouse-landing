export type TutorialStep = {
  number: string;
  title: string;
  subtitle: string;
  description: string;
  hint: string;
};

const PRODUCT_FACES = [
  "horse.svg",
  "eye.svg",
  "apple.svg",
  "poison.svg",
] as const;

const STEPS: TutorialStep[] = [
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
      "Making up a silly story is a great way to remember the layout. Talk through positions too, and keep discussing until everyone agrees to end the day.",
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
      "The time you took is your score. Add 10 seconds for every mismatch, or for every product left without a customer.",
    hint: "Tally the clock, then add 10 seconds for each miss.",
  },
];

export const tutorial = {
  title: "How to Play",
  kitAriaLabel: "Tutorial cards: 4 products, 4 customers, and 1 rule",
  customerAlt: "Customer card",
  videoUrl: "https://www.youtube.com/watch?v=aIDl5suP_QE",
  productFaces: PRODUCT_FACES,
  intro: {
    blurb: "This tutorial uses only 4 cards, 4 customers, and 1 rule card.",
    videoLabel: "Watch Tutorial",
    resetLabel: "Reset board",
    scoreboardLabel: "See Performance Summary",
  },
  bubbleCopy: {
    "horse.svg": "The Knight",
    "eye.svg": "Saw",
    "apple.svg": "The apple",
    "poison.svg": "Got poisoned",
  },
  steps: STEPS,
};
