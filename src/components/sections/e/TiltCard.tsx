"use client";

import { useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import { cn } from "@/lib/utils";

interface TiltCardProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
}

export function TiltCard({ children, className, intensity = 14 }: TiltCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const shineRef = useRef<HTMLDivElement>(null);
  const xToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yToRef = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    const card = cardRef.current;
    if (!card) return;
    xToRef.current = gsap.quickTo(card, "rotateY", {
      duration: 0.4,
      ease: "power3.out",
    });
    yToRef.current = gsap.quickTo(card, "rotateX", {
      duration: 0.4,
      ease: "power3.out",
    });
    return () => {
      gsap.killTweensOf(card);
    };
  }, []);

  const handleMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const rect = cardRef.current.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width;
      const y = (e.clientY - rect.top) / rect.height;
      xToRef.current?.((x - 0.5) * intensity);
      yToRef.current?.(-(y - 0.5) * intensity);
      if (shineRef.current) {
        shineRef.current.style.setProperty("--sx", `${x * 100}%`);
        shineRef.current.style.setProperty("--sy", `${y * 100}%`);
        gsap.to(shineRef.current, { opacity: 1, duration: 0.25 });
      }
    },
    [intensity],
  );

  const handleLeave = useCallback(() => {
    xToRef.current?.(0);
    yToRef.current?.(0);
    if (shineRef.current) {
      gsap.to(shineRef.current, { opacity: 0, duration: 0.6 });
    }
  }, []);

  return (
    <div style={{ perspective: "900px" }} className={cn("h-full", className)}>
      <div
        ref={cardRef}
        onMouseMove={handleMove}
        onMouseLeave={handleLeave}
        className="relative h-full"
        style={{ transformStyle: "preserve-3d", willChange: "transform" }}
      >
        {children}
        <div
          ref={shineRef}
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 rounded-[inherit] opacity-0"
          style={{
            background:
              "radial-gradient(circle at var(--sx, 50%) var(--sy, 50%), rgba(255,178,62,0.42) 0%, rgba(255,106,44,0.14) 38%, transparent 62%)",
            mixBlendMode: "screen",
          }}
        />
      </div>
    </div>
  );
}
