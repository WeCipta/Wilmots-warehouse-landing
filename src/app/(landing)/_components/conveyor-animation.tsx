"use client";

import { useRef, useState, useEffect } from "react";
import gsap from "gsap";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { useGSAP } from "@gsap/react";

if (typeof window !== "undefined") {
  gsap.registerPlugin(MotionPathPlugin);
}

const BOX_COUNT = 5;

const ALL_FACES = [
  "21 1.svg", "7star.svg", "8star.svg", "apple.svg", "banana-1.svg", "banana.svg", "bluecircle.svg", "bomb.svg", "buddha.svg", "confetti.svg", "constellation.svg", "cube.svg", "dandelion.svg", "diagonal.svg", "diamond.svg", "eye.svg", "fossil 1.svg", "four.svg", "frog.svg", "gem.svg", "hammer.svg", "horse.svg", "house.svg", "icecream.svg", "lava.svg", "lightbulb.svg", "linedown.svg", "mail.svg", "map.svg", "mask.svg", "matchstick.svg", "medical.svg", "milk.svg", "noodle.svg", "peanut.svg", "pentagon.svg", "piechart.svg", "pills.svg", "pins.svg", "plug.svg", "poison.svg", "popsicle.svg", "power.svg", "rainbow.svg", "reyna.svg", "rook.svg", "satellite.svg", "sewing.svg", "sharpener.svg", "sign.svg", "slither.svg", "sock.svg", "spade.svg", "spinner.svg", "steam.svg", "strips.svg", "sun.svg", "sunset.svg", "target.svg", "threaded.svg", "toggle.svg", "tree.svg", "triangle.svg", "viking.svg", "volcano.svg", "water.svg", "watermelon.svg", "wave.svg", "wavybands.svg", "wrench.svg"
];

export function ConveyorAnimation() {
  const containerRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<SVGPathElement>(null);
  const beltRef = useRef<SVGPathElement>(null);
  const boxRefs = useRef<(SVGGElement | null)[]>([]);

  const [randomFaces, setRandomFaces] = useState<string[]>([]);
  
  useEffect(() => {
    const shuffled = [...ALL_FACES].sort(() => 0.5 - Math.random());
    setRandomFaces(shuffled.slice(0, BOX_COUNT));
  }, []);

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
    const face = randomFaces[index] || ALL_FACES[index % ALL_FACES.length];
    return <img src={`/cards/faces/${face}`} alt="Game Card" className="w-12 h-12 object-contain rounded-sm" />;
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
          <g key={i} ref={(el: SVGGElement | null) => { boxRefs.current[i] = el; }}>
            <foreignObject
              width="100"
              height="100"
              x="-50"
              y="-50"
            >
              <div className="w-[48px] h-[48px] flex items-center justify-center transform rotate-12 ml-[26px] mt-[26px]">
                {getBoxIcon(i)}
              </div>
            </foreignObject>
          </g>
        ))}
      </svg>
    </div>
  );
}
