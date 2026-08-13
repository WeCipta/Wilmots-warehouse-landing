"use client";

import { useEffect, useRef, useState } from "react";
import Matter from "matter-js";
import { GameCard } from "@/components/game-card";
import { ArrowUpRight } from "lucide-react";
import { CARD_FACES } from "@/lib/card-faces";
import { siteContent } from "@/lib/site-content";

const CARDS_COUNT = 12;
const CARD_SIZE = 200;

const FOOTER_ACCENTS = [
  "var(--btn-red)",
  "var(--btn-orange)",
  "var(--btn-yellow)",
  "var(--btn-green)",
  "var(--btn-blue)",
  "var(--btn-pink)",
  "var(--btn-salmon)",
] as const;

function pickAccent(previous?: string) {
  let next = FOOTER_ACCENTS[Math.floor(Math.random() * FOOTER_ACCENTS.length)];
  while (next === previous) {
    next = FOOTER_ACCENTS[Math.floor(Math.random() * FOOTER_ACCENTS.length)];
  }
  return next;
}

function ColorfulLink({ label, href }: { label: string; href: string }) {
  const accentRef = useRef<string>(FOOTER_ACCENTS[0]);
  const [accent, setAccent] = useState<string | undefined>();

  return (
    <a 
      href={href}
      onPointerEnter={() => {
        const next = pickAccent(accentRef.current);
        accentRef.current = next;
        setAccent(next);
      }}
      onPointerLeave={() => setAccent(undefined)}
      className="text-3xl md:text-5xl font-black tracking-tight text-black/70 hover:translate-x-2 transition-transform duration-300 w-fit"
      style={{
        color: accent || "rgba(0,0,0,0.7)",
      }}
    >
      {label}
    </a>
  );
}

function ColorfulButton({ href, children }: { href: string; children: React.ReactNode }) {
  const accentRef = useRef<string>(FOOTER_ACCENTS[0]);
  const [accent, setAccent] = useState<string | undefined>();

  return (
    <a 
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      onPointerEnter={() => {
        const next = pickAccent(accentRef.current);
        accentRef.current = next;
        setAccent(next);
      }}
      onPointerLeave={() => setAccent(undefined)}
      className="inline-flex items-center justify-center gap-2 text-white px-8 py-4 rounded-2xl text-xl font-bold hover:scale-105 hover:-rotate-2 transition-transform duration-300 w-fit shadow-xl"
      style={{
        backgroundColor: accent || "#000",
      }}
    >
      {children}
    </a>
  );
}

export default function Footer() {
  const sceneRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const runnerRef = useRef<Matter.Runner | null>(null);

  const [cards] = useState(() => {
    const shuffledFaces = [...CARD_FACES].sort(() => 0.5 - Math.random());
    return Array.from({ length: CARDS_COUNT }).map((_, i) => ({
      id: i,
      src: shuffledFaces[i % shuffledFaces.length],
    }));
  });

  const cardRefs = useRef<{ [key: number]: HTMLDivElement | null }>({});
  const [inView, setInView] = useState(false);

  // Trigger when scrolled into view
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        setInView(entries[0].isIntersecting);
      },
      { threshold: 0.1 }
    );

    if (sceneRef.current) {
      observer.observe(sceneRef.current);
    }

    return () => observer.disconnect();
  }, []);
  
  useEffect(() => {
    if (!sceneRef.current || !inView) return;

    const engine = Matter.Engine.create();
    engineRef.current = engine;
    const world = engine.world;

    const width = sceneRef.current.clientWidth;
    const height = sceneRef.current.clientHeight;

    // Boundaries (Made very thick and tall to prevent tunneling and escaping)
    const ground = Matter.Bodies.rectangle(width / 2, height + 250, width * 2, 500, { isStatic: true });
    // Extend walls far upwards so thrown cards bounce back and don't escape
    const wallLeft = Matter.Bodies.rectangle(-250, -5000, 500, 15000, { isStatic: true });
    const wallRight = Matter.Bodies.rectangle(width + 250, -5000, 500, 15000, { isStatic: true });
    
    // We intentionally do not add a ceiling, so cards can be thrown high and fall back down via gravity
    Matter.Composite.add(world, [ground, wallLeft, wallRight]);

    const cardBodies = cards.map((card, i) => {
      // stagger drop vertically
      return Matter.Bodies.rectangle(
        width / 2 + (Math.random() * 300 - 150),
        -200 - (i * 120), 
        CARD_SIZE,
        CARD_SIZE,
        {
          restitution: 0.5, // Bounciness
          friction: 0.1,
          density: 0.05,
          chamfer: { radius: 10 }, // Matches rounded-[10px]
          label: `card-${card.id}`
        }
      );
    });

    Matter.Composite.add(world, cardBodies);

    // Add mouse control for interaction
    const mouse = Matter.Mouse.create(sceneRef.current);
    const mouseConstraint = Matter.MouseConstraint.create(engine, {
      mouse: mouse,
      constraint: {
        stiffness: 0.2,
        render: {
          visible: false
        }
      }
    });
    Matter.Composite.add(world, mouseConstraint);

    const runner = Matter.Runner.create();
    Matter.Runner.run(runner, engine);
    runnerRef.current = runner;

    // Sync Matter.js bodies with React elements
    Matter.Events.on(engine, "afterUpdate", () => {
      cardBodies.forEach((body, i) => {
        const el = cardRefs.current[cards[i].id];
        if (el) {
          const { x, y } = body.position;
          const offset = CARD_SIZE / 2;
          el.style.transform = `translate(${x - offset}px, ${y - offset}px) rotate(${body.angle}rad)`;
        }
      });
    });

    // Handle resize
    const handleResize = () => {
      if (sceneRef.current) {
        const newWidth = sceneRef.current.clientWidth;
        const newHeight = sceneRef.current.clientHeight;
        Matter.Body.setPosition(ground, { x: newWidth / 2, y: newHeight + 250 });
        Matter.Body.setPosition(wallRight, { x: newWidth + 250, y: newHeight / 2 });
      }
    };
    window.addEventListener("resize", handleResize);

    return () => {
      window.removeEventListener("resize", handleResize);
      Matter.Runner.stop(runner);
      Matter.Engine.clear(engine);
    };
  }, [cards, inView]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 h-screen w-full bg-background overflow-hidden relative">
      <div className="bg-white text-black w-full h-full px-8 pb-8 pt-28 md:px-6 md:pb-8 md:pt-40 flex flex-col justify-between relative z-10 pointer-events-auto border-r border-black/10">
        <div>
          <h2 className="text-5xl md:text-7xl font-black uppercase tracking-tighter mb-10 leading-[0.9]">
            {`Wilmot's`}<br/>Warehouse
          </h2>
          <nav className="flex flex-col gap-3">
            {siteContent.nav.links.map((link) => (
              <ColorfulLink key={link.href} href={link.href} label={link.label} />
            ))}
          </nav>
        </div>
        
        <div className="flex flex-col gap-8 mt-12">
          <ColorfulButton href={siteContent.orderUrl}>
            Order the Game <ArrowUpRight className="w-6 h-6" />
          </ColorfulButton>
          
          <div className="text-xs md:text-sm font-bold text-black/40 uppercase tracking-[0.2em] flex flex-col gap-2">
            <p>Created by {siteContent.credits.creators.map(c => c.name).join(", ")}</p>
            <p>Published by <a href={siteContent.credits.publisher.href} className="hover:text-black transition-colors underline decoration-2 underline-offset-4">{siteContent.credits.publisher.name}</a></p>
          </div>
        </div>
      </div>
      <div 
        className="relative h-full bg-background overflow-hidden hidden md:flex flex-col" 
        ref={sceneRef}
      > 
        {cards.map((card) => (
          <div
            key={card.id}
            ref={(el) => {
              cardRefs.current[card.id] = el;
            }}
            className="absolute top-0 left-0 will-change-transform cursor-grab active:cursor-grabbing z-0 pointer-events-auto"
            style={{ width: CARD_SIZE, height: CARD_SIZE }}
          >
            <GameCard size={CARD_SIZE} src={card.src} className="pointer-events-none" />
          </div>
        ))}
      </div>
    </div>
  );
}