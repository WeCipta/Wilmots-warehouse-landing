"use client";

import { useRef } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { Package, Archive } from "lucide-react";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

const BOX_COUNT = 5;

export function ConveyorAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const beltRef = useRef<SVGPathElement>(null);
  const boxRefs = useRef<(HTMLDivElement | null)[]>([]);

  // A winding path for the conveyor, aligned with the logo
  const pathData = "M -200,85 L 600,85 C 800,85 800,335 600,335 L 200,335 C 0,335 0,585 200,585 L 800,585 C 1000,585 1000,835 800,835 L -200,835";

  useGSAP(() => {
    if (!beltRef.current || !trackRef.current) return;

    // Animate the belt moving continuously
    gsap.to(beltRef.current, {
      strokeDashoffset: -40, // Should match strokeDasharray
      duration: 0.5,
      repeat: -1,
      ease: "none",
    });

    // Animate boxes along the track
    boxRefs.current.forEach((box, i) => {
      if (!box) return;

      const tween = gsap.to(box, {
        motionPath: {
          path: trackRef.current!,
          align: trackRef.current!,
          alignOrigin: [0.5, 0.5],
          autoRotate: false, 
        },
        duration: 20,
        repeat: -1,
        ease: "none",
      });

      // Spread the boxes evenly along the path immediately
      tween.progress(i / BOX_COUNT);
    });

  }, { scope: containerRef });

  const getBoxIcon = (index: number) => {
    const isEven = index % 2 === 0;
    return isEven ? <Package size={28} className="text-black/60" /> : <Archive size={28} className="text-black/60" />;
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-0 overflow-hidden" ref={containerRef}>
      <svg 
        className="w-full h-full absolute inset-0" 
        viewBox="0 0 1000 1000" 
        preserveAspectRatio="xMidYMid slice"
      >
        <g opacity="0.4">
          {/* Conveyor Shadow/Border */}
          <path
            d={pathData}
            fill="none"
            stroke="#000000"
            strokeWidth="64"
            strokeLinecap="round"
            strokeLinejoin="round"
            opacity="0.1"
          />
          {/* Conveyor Base */}
          <path
            d={pathData}
            fill="none"
            stroke="#f3f4f6"
            strokeWidth="60"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Conveyor Belt (Dashed line to show motion) */}
          <path
            ref={beltRef}
            d={pathData}
            fill="none"
            stroke="#d1d5db"
            strokeWidth="50"
            strokeDasharray="20 20"
            strokeLinecap="butt"
            strokeLinejoin="round"
          />
        </g>
        
        {/* Invisible track for boxes to follow */}
        <path
          ref={trackRef}
          d={pathData}
          fill="none"
          stroke="none"
        />
        
        {/* The boxes (inside SVG to guarantee perfect path alignment regardless of aspect ratio scaling) */}
        {Array.from({ length: BOX_COUNT }).map((_, i) => (
          <g key={i} ref={(el: SVGGElement | null) => { boxRefs.current[i] = el as any; }}>
            <foreignObject
              width="100"
              height="100"
              x="-50"
              y="-50"
            >
              <div className="w-[48px] h-[48px] bg-white border-2 border-black/20 rounded shadow-sm flex items-center justify-center transform rotate-12 ml-[26px] mt-[26px]">
                {getBoxIcon(i)}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </div>
  );
}
