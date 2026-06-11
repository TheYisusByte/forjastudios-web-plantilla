"use client";

import { motion, useReducedMotion } from "framer-motion";
import { cn } from "@/lib/utils";

interface MarqueeProps {
  items: string[];
  className?: string;
  /** Seconds for one full loop. */
  durationSec?: number;
}

/** Infinite horizontal marquee. Holds still under reduced-motion. */
export function Marquee({ items, className, durationSec = 24 }: MarqueeProps) {
  const reduce = useReducedMotion();
  const row = [...items, ...items];

  return (
    <div
      className={cn("overflow-hidden", className)}
      aria-label={items.join(", ")}
    >
      <motion.div
        className="flex w-max items-center gap-12"
        animate={reduce ? undefined : { x: ["0%", "-50%"] }}
        transition={{ duration: durationSec, ease: "linear", repeat: Infinity }}
      >
        {row.map((item, i) => (
          <span
            key={i}
            aria-hidden={i >= items.length}
            className="font-display whitespace-nowrap text-xl font-semibold uppercase tracking-wide text-fg-muted/70"
          >
            {item}
          </span>
        ))}
      </motion.div>
    </div>
  );
}
