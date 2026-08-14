"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { cn } from "@/lib/utils";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TESTIMONIALS = [
  {
    name: "Jonathan",
    role: "Boardgame's Master",
    content: "The Wilmot's Warehouse platform has proven to be a very effective tool, enabling the team to grow and engage our community. It's the best organization game I've played.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-yellow)",
    rotation: -4,
    xOffset: 0,
    yOffset: 20,
  },
  {
    name: "Nando",
    role: "Co-op Enthusiast",
    content: "Wilmot's Warehouse has helped to introduce a new and exciting way for the community to engage in tasks and participate in sorting experiences. It's a great addition to our game nights.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-blue)",
    rotation: 2,
    xOffset: 0,
    yOffset: -10,
  },
  {
    name: "Boyang",
    role: "Puzzle Gamer",
    content: "Wilmot's Warehouse connects gamers with high quality interaction, and also offers substantial growth to puzzle solving by leveling up the engagement from the community with wonderful sorting mechanics!",
    avatar: "/cards/logo.svg",
    color: "var(--btn-green)",
    rotation: -2,
    xOffset: 0,
    yOffset: 10,
  },
  {
    name: "Immanuel",
    role: "Game Master",
    content: "The platform has proven to be a very effective tool, enabling players to learn pattern recognition and optimize their workflow under time pressure. Highly recommended!",
    avatar: "/cards/logo.svg",
    color: "var(--btn-green)", 
    rotation: -3,
    xOffset: 20,
    yOffset: 30,
  },
  {
    name: "Yosua",
    role: "Co-op Enthusiast",
    content: "I came to know Wilmot's Warehouse very occasionally, and it turns out to be such a big surprise for me, my sorting speed grows rapidly. Tis the best experience in puzzle games that I've ever had!",
    avatar: "/cards/logo.svg",
    color: "var(--btn-pink)",
    rotation: 4,
    xOffset: 0,
    yOffset: 40,
  },
  {
    name: "James",
    role: "Casual Gamer",
    content: "It's an efficient way for brain exercise, and I got more than a thousand points after I played the game! It's never late to start on Wilmot's Warehouse! Let us dream bigger and create better layouts.",
    avatar: "/cards/logo.svg",
    color: "var(--btn-orange)",
    rotation: -5,
    xOffset: -20,
    yOffset: 20,
  },
];

export function Testimonials() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardsRef = useRef<(HTMLDivElement | null)[]>([]);

  useGSAP(() => {
    if (!containerRef.current) return;
    gsap.fromTo(
      cardsRef.current,
      {
        opacity: 0,
        y: 100,
        scale: 0.8,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.8,
        stagger: 0.15,
        ease: "back.out(1.2)",
        scrollTrigger: {
          trigger: containerRef.current,
          start: "top 75%",
        },
      }
    );

    cardsRef.current.forEach((card, i) => {
      if (!card) return;
      gsap.to(card, {
        y: "+=15",
        rotation: TESTIMONIALS[i].rotation + (Math.random() * 2 - 1),
        duration: 2 + Math.random(),
        repeat: -1,
        yoyo: true,
        ease: "sine.inOut",
        delay: Math.random(),
      });
    });
  }, { scope: containerRef });

  return (
    <section className="relative w-full bg-background py-24 lg:py-32 mb-16 md:mb-24" ref={containerRef}>
      <div className="mx-auto w-full px-8 sm:px-12 md:px-16">
        <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-16 max-w-2xl">
          Feedback from<br />Customers
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 px-2 sm:px-4 lg:px-8">
          {TESTIMONIALS.map((testimonial, i) => {
            return (
              <div
                key={i}
                ref={(el) => {
                  cardsRef.current[i] = el;
                }}
                className="relative will-change-transform"
                style={{
                  transform: `translate(${testimonial.xOffset}px, ${testimonial.yOffset}px)`,
                }}
              >
                <div
                  className="flex h-full flex-col gap-4 rounded-xl border-2 bg-black/40 p-6 sm:p-8 backdrop-blur-sm cursor-default transition-all duration-300 hover:scale-[1.05] hover:!rotate-0 hover:z-10"
                  style={{
                    borderColor: testimonial.color,
                    transform: `rotate(${testimonial.rotation}deg)`,
                    boxShadow: `0 8px 32px -8px ${testimonial.color}40`,
                  }}
                >
                  <div className="flex items-center gap-4">
                    <img
                      src={testimonial.avatar}
                      alt={testimonial.name}
                      className="h-10 w-10 shrink-0 rounded-sm object-contain"
                    />
                    <div>
                      <h3 className="text-lg font-bold text-white leading-tight">
                        {testimonial.name}
                      </h3>
                      <p className="text-sm font-medium text-white/60">
                        {testimonial.role}
                      </p>
                    </div>
                  </div>
                  <p className="text-sm sm:text-base leading-relaxed text-white/80">
                    {testimonial.content}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
