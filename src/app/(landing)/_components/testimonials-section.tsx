"use client";

import { useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";
import { siteContent } from "@/lib/site-content";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

const TESTIMONIALS = siteContent.testimonials.items;

export function TestimonialsSection() {
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
          {siteContent.testimonials.title.split("\n").map((line, i) => (
            <span key={line}>
              {i > 0 ? <br /> : null}
              {line}
            </span>
          ))}
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
                      alt={testimonial.avatarAlt}
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
