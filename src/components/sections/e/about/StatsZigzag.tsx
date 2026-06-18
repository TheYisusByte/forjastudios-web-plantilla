"use client";

import { useTranslations } from "next-intl";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import { cn } from "@/lib/utils";
import type { SiteMeta } from "@/lib/content/types";
import { buildAboutStats } from "./stats";

/**
 * Option B — "Editorial Zigzag".
 * Full-width alternating rows: oversized number + copy on one side, the GIF
 * framed on the other. Spacious, magazine-like, scroll-revealed.
 */
export function StatsZigzag({ stats }: { stats: SiteMeta["stats"] }) {
  const t = useTranslations("Stats");
  const items = buildAboutStats(stats);

  return (
    <section id="about" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-20 max-w-3xl">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-forja-muted">
            {t("sectionEyebrow")}
          </p>
          <h2
            className="font-display font-black uppercase leading-[0.9]"
            style={{ fontSize: "clamp(2rem, 5vw, 4rem)" }}
          >
            <span className="text-forja-bone">{t("sectionHeading1")} </span>
            <span className="fire-text">{t("sectionHeading2")}</span>
          </h2>
        </Reveal>

        <div className="flex flex-col gap-20 md:gap-28">
          {items.map((s, i) => {
            const reversed = i % 2 === 1;
            return (
              <div
                key={s.key}
                className="grid items-center gap-10 md:grid-cols-2 md:gap-16"
              >
                {/* Media */}
                <Reveal
                  y={40}
                  className={cn(reversed && "md:order-2")}
                >
                  <div className="relative overflow-hidden rounded-[2rem] border border-border">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={s.gif}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      className="aspect-[5/4] w-full object-cover"
                    />
                    <div className="pointer-events-none absolute inset-0 ring-1 ring-inset ring-white/5" />
                  </div>
                </Reveal>

                {/* Number + copy */}
                <Reveal
                  delay={0.1}
                  className={cn(reversed && "md:order-1")}
                >
                  <span
                    className="fire-text block font-display font-black leading-[0.82]"
                    style={{ fontSize: "clamp(4.5rem, 13vw, 11rem)" }}
                  >
                    <CountUp value={s.value} />
                  </span>
                  <p className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-forja-bone">
                    {t(`${s.key}Label`)}
                  </p>
                  <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-forja-muted">
                    {t(`${s.key}Body`)}
                  </p>
                </Reveal>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
