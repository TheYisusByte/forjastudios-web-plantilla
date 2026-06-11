"use client";

import { motion, useReducedMotion, type Variants } from "framer-motion";
import { useTranslations } from "next-intl";
import { MagneticButton } from "@/components/motion/MagneticButton";

const container: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.12, delayChildren: 0.1 } },
};
const item: Variants = {
  hidden: { opacity: 0, y: 28 },
  show: { opacity: 1, y: 0, transition: { duration: 0.6, ease: [0.22, 1, 0.36, 1] } },
};

/** Concept B — kinetic hero: words reveal in sequence, "flame" ignites. */
export function HeroB({ descriptor }: { descriptor: string }) {
  const t = useTranslations("Hero");
  const reduce = useReducedMotion();

  return (
    <section id="top" className="relative flex min-h-dvh items-center overflow-hidden">
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(50% 50% at 72% 32%, rgba(255,106,44,0.20), transparent 70%)",
        }}
      />
      <motion.div
        variants={container}
        initial={reduce ? false : "hidden"}
        animate={reduce ? false : "show"}
        className="relative mx-auto w-full max-w-7xl px-6"
      >
        <motion.p
          variants={item}
          className="text-sm uppercase tracking-[0.3em] text-fg-muted"
        >
          {descriptor}
        </motion.p>
        <h1 className="font-display mt-4 text-7xl font-bold uppercase leading-[0.88] sm:text-9xl">
          <motion.span variants={item} className="block">
            Forge your
          </motion.span>
          <motion.span
            variants={item}
            className="fire-text block drop-shadow-[0_0_40px_rgba(255,106,44,0.45)]"
          >
            flame
          </motion.span>
        </h1>
        <motion.p variants={item} className="mt-6 max-w-xl text-lg text-fg-muted">
          {t("lead")}
        </motion.p>
        <motion.div variants={item} className="mt-10">
          <MagneticButton
            href="#work"
            className="fire-bg inline-flex cursor-pointer items-center gap-2 rounded-full px-7 py-3 font-semibold text-[#0a0a0b]"
          >
            {t("ctaShowreel")}
          </MagneticButton>
        </motion.div>
      </motion.div>
    </section>
  );
}
