"use client";

import { motion, useScroll, useTransform, useReducedMotion } from "framer-motion";
import { useRef } from "react";
import type { ReactNode } from "react";

interface ParallaxProps {
  children: ReactNode;
  className?: string;
  /** Fraction of travel relative to scroll (0.2 = subtle, 0.5 = strong). */
  speed?: number;
}

/** Vertical parallax tied to scroll progress. Static under reduced-motion. */
export function Parallax({ children, className, speed = 0.2 }: ParallaxProps) {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start end", "end start"],
  });
  const y = useTransform(
    scrollYProgress,
    [0, 1],
    [`${-speed * 50}%`, `${speed * 50}%`],
  );

  return (
    <motion.div ref={ref} style={{ y: reduce ? 0 : y }} className={className}>
      {children}
    </motion.div>
  );
}
