"use client";

import { useRef } from "react";
import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { siteContent } from "@/lib/site-content";

gsap.registerPlugin(ScrollTrigger);

export function GallerySection() {
  const containerRef = useRef<HTMLElement>(null);
  const scrollWrapperRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useGSAP(
    () => {
      const track = trackRef.current;
      const container = containerRef.current;
      if (!track || !container) return;

      const getScrollAmount = () => {
        let trackWidth = track.scrollWidth;
        return -(trackWidth - window.innerWidth);
      };

      const tween = gsap.to(track, {
        x: getScrollAmount,
        ease: "none",
      });

      ScrollTrigger.create({
        trigger: scrollWrapperRef.current,
        start: "top top",
        end: () => `+=${getScrollAmount() * -1}`,
        pin: true,
        animation: tween,
        scrub: 1,
        invalidateOnRefresh: true,
      });

      return () => {
        tween.kill();
      };
    },
    { scope: containerRef }
  );

  return (
    <section ref={containerRef} id="gallery" className="relative bg-background">
      <div ref={scrollWrapperRef} className="h-screen w-full overflow-hidden flex flex-col justify-center bg-black/5">
        <div className="px-8 sm:px-12 md:px-16 mb-8 md:mb-12 shrink-0">
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight text-white mb-4 uppercase">
            {siteContent.gallery.title}
          </h2>
          <p className="text-white/60 max-w-md">
            {siteContent.gallery.body}
          </p>
        </div>

        <div
          ref={trackRef}
          className="flex gap-4 sm:gap-8 px-8 sm:px-12 md:px-16 items-center"
          style={{ width: "fit-content" }}
        >
          {siteContent.gallery.images.map((img, i) => (
            <div
              key={i}
              className="relative shrink-0 rounded-2xl overflow-hidden border-4 border-white/10 shadow-2xl transition-transform hover:scale-[1.02] aspect-square w-[75vw] sm:w-[50vw] md:w-[40vw] lg:w-[30vw] max-w-[500px]"
            >
              <img
                src={img.src}
                alt={img.alt}
                className="w-full h-full object-cover"
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
