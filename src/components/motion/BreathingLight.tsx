"use client";

import { motion, useReducedMotion } from "framer-motion";

/** Slowly pulsing ambient glow (Concept C). Static under reduced-motion. */
export function BreathingLight({ className }: { className?: string }) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      aria-hidden
      className={className}
      animate={reduce ? undefined : { opacity: [0.35, 0.65, 0.35] }}
      transition={{ duration: 8, ease: "easeInOut", repeat: Infinity }}
    />
  );
}
