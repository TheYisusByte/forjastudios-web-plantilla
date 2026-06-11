"use client";

import { useEffect, useRef } from "react";
import gsap from "gsap";

export function CursorE() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const dot = dotRef.current;
    const ring = ringRef.current;
    if (!dot || !ring) return;

    document.documentElement.classList.add("cursor-e");

    const xDot = gsap.quickTo(dot, "x", { duration: 0.1, ease: "none" });
    const yDot = gsap.quickTo(dot, "y", { duration: 0.1, ease: "none" });
    const xRing = gsap.quickTo(ring, "x", { duration: 0.55, ease: "power3.out" });
    const yRing = gsap.quickTo(ring, "y", { duration: 0.55, ease: "power3.out" });

    const onMove = (e: MouseEvent) => {
      xDot(e.clientX);
      yDot(e.clientY);
      xRing(e.clientX);
      yRing(e.clientY);
    };

    const onOver = (e: MouseEvent) => {
      if ((e.target as Element).closest("a, button, [data-interactive]")) {
        gsap.to(ring, { scale: 2.2, borderColor: "#FF6A2C", duration: 0.35 });
        gsap.to(dot, { opacity: 0, scale: 0, duration: 0.2 });
      }
    };
    const onOut = (e: MouseEvent) => {
      if ((e.target as Element).closest("a, button, [data-interactive]")) {
        gsap.to(ring, {
          scale: 1,
          borderColor: "rgba(244,241,236,0.45)",
          duration: 0.4,
        });
        gsap.to(dot, { opacity: 1, scale: 1, duration: 0.3 });
      }
    };

    window.addEventListener("mousemove", onMove, { passive: true });
    document.addEventListener("mouseover", onOver);
    document.addEventListener("mouseout", onOut);

    return () => {
      document.documentElement.classList.remove("cursor-e");
      window.removeEventListener("mousemove", onMove);
      document.removeEventListener("mouseover", onOver);
      document.removeEventListener("mouseout", onOut);
    };
  }, []);

  return (
    <>
      <div
        ref={dotRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden -translate-x-1/2 -translate-y-1/2 rounded-full bg-forja-bone mix-blend-difference md:block"
        style={{ width: 6, height: 6 }}
      />
      <div
        ref={ringRef}
        aria-hidden="true"
        className="pointer-events-none fixed left-0 top-0 z-[9999] hidden -translate-x-1/2 -translate-y-1/2 rounded-full border md:block"
        style={{
          width: 32,
          height: 32,
          borderColor: "rgba(244,241,236,0.45)",
        }}
      />
    </>
  );
}
