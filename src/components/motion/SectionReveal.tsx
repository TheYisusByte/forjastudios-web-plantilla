"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

interface SectionRevealProps {
  children: ReactNode;
  className?: string;
  /** Renders a fire-gradient hairline above the section. */
  divider?: boolean;
}

/**
 * Section-level scroll reveal: fades + slides the whole section in as it
 * enters the viewport. Accepts server component children (RSC-safe pattern).
 * No-op under prefers-reduced-motion.
 */
export function SectionReveal({
  children,
  className,
  divider = false,
}: SectionRevealProps) {
  const reduce = useReducedMotion();
  return (
    <motion.div
      initial={reduce ? false : { opacity: 0, y: 56 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-5%" }}
      transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
      className={cn(divider && "section-fire-divider", className)}
    >
      {children}
    </motion.div>
  );
}
