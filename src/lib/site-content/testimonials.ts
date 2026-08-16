export type TestimonialCopy = {
  name: string;
  role: string;
  content: string;
  color: string;
  rotation: number;
  xOffset: number;
  yOffset: number;
};

export const testimonials = {
  title: "What Players\nSay",
  items: [
    {
      name: "Jonathan",
      role: "Game Night Host",
      content:
        "We spent the first half making up ridiculous stories for every tile, then the timer hit and the whole table went quiet. Best co-op we have played this year.",
      color: "var(--btn-yellow)",
      rotation: -4,
      xOffset: 0,
      yOffset: 20,
    },
    {
      name: "Nando",
      role: "Co-op Enthusiast",
      content:
        "It is rare to find a co-op this talkative. Sorting the warehouse together, then racing to match customers, made our game nights feel brand new.",
      color: "var(--btn-blue)",
      rotation: 2,
      xOffset: 0,
      yOffset: -10,
    },
    {
      name: "Boyang",
      role: "Puzzle Gamer",
      content:
        "The memory puzzle is sharp, but the silly stories are what make it stick. I still remember where we parked the frog because of a joke someone made.",
      color: "var(--btn-green)",
      rotation: -2,
      xOffset: 0,
      yOffset: 10,
    },
    {
      name: "Immanuel",
      role: "Game Master",
      content:
        "Teaching this is a joy. Place the tiles, talk through the layout, then race the clock. Pattern recognition under a timer, with the whole table involved.",
      color: "var(--btn-green)",
      rotation: -3,
      xOffset: 20,
      yOffset: 30,
    },
    {
      name: "Yosua",
      role: "Table Regular",
      content:
        "I picked this up on a whim and it immediately became the game I bring to every table. My recall got faster each round, and the stories got weirder.",
      color: "var(--btn-pink)",
      rotation: 4,
      xOffset: 0,
      yOffset: 40,
    },
    {
      name: "James",
      role: "Casual Gamer",
      content:
        "I am not a heavy gamer and I still had a blast. We scored better than I expected, and I kept wanting one more run at a cleaner warehouse.",
      color: "var(--btn-orange)",
      rotation: -5,
      xOffset: -20,
      yOffset: 20,
    },
  ] satisfies TestimonialCopy[],
};
