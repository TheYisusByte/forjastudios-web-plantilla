"use client";

import { motion, useMotionValue, useSpring, useReducedMotion } from "framer-motion";
import type { ReactNode, MouseEvent } from "react";

interface MagneticButtonProps {
  children: ReactNode;
  className?: string;
  href?: string;
  /** Pull strength (px of max travel). */
  strength?: number;
}

/** Magnetic hover effect for primary CTAs (Concept B). Inert under reduced-motion. */
export function MagneticButton({
  children,
  className,
  href,
  strength = 14,
}: MagneticButtonProps) {
  const reduce = useReducedMotion();
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  const sx = useSpring(x, { stiffness: 250, damping: 18 });
  const sy = useSpring(y, { stiffness: 250, damping: 18 });

  function onMove(e: MouseEvent<HTMLElement>) {
    if (reduce) return;
    const rect = e.currentTarget.getBoundingClientRect();
    x.set(((e.clientX - rect.left) / rect.width - 0.5) * strength * 2);
    y.set(((e.clientY - rect.top) / rect.height - 0.5) * strength * 2);
  }
  function reset() {
    x.set(0);
    y.set(0);
  }

  const MotionTag = href ? motion.a : motion.button;

  return (
    <MotionTag
      href={href}
      style={{ x: sx, y: sy }}
      onMouseMove={onMove}
      onMouseLeave={reset}
      className={className}
    >
      {children}
    </MotionTag>
  );
}
