"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { Client } from "@/lib/content/types";

/**
 * Concept D — "OUR CLIENTS" section.
 * Centered fire-glitch heading + infinite scrolling logo marquee.
 * Full-viewport-width band (no max-w constraint).
 */
export function ClientMarqueeD({ clients }: { clients: Client[] }) {
  const reduce = useReducedMotion();
  const names = clients.map((c) => c.name);

  // Enough repetitions to fill any display; duplicated for seamless loop.
  const chunk = [...names, ...names, ...names].flatMap((n) => [n, "·"]);
  const row = [...chunk, ...chunk];

  return (
    <section id="clients" className="bg-bg py-16">
      {/* Fire-glitch heading */}
      <h2 className="clients-heading font-display mb-10 text-center text-3xl font-black uppercase tracking-widest sm:text-4xl">
        Our Clients
      </h2>

      {/* Marquee band */}
      <div className="relative overflow-hidden border-y border-border py-6">
        {/* Left + right edge fade */}
        <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-bg to-transparent" />
        <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-bg to-transparent" />

        <motion.div
          aria-hidden="true"
          className="flex w-max items-center gap-12"
          animate={reduce ? undefined : { x: ["0%", "-50%"] }}
          transition={{ duration: 40, ease: "linear", repeat: Infinity }}
        >
          {row.map((item, i) =>
            item === "·" ? (
              <span key={i} className="fire-text font-display select-none text-xl font-black">
                ✦
              </span>
            ) : (
              <span
                key={i}
                className="font-display whitespace-nowrap text-xl font-black uppercase tracking-[0.12em] text-white/80 transition-colors hover:text-white"
              >
                {item}
              </span>
            ),
          )}
        </motion.div>
        <p className="sr-only">{names.join(", ")}</p>
      </div>
    </section>
  );
}
