"use client";

import { useTranslations } from "next-intl";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteMeta } from "@/lib/content/types";
import { buildAboutStats } from "./stats";

/**
 * Option D — "Interleaved board".
 * A 2×3 grid where GIFs and copy alternate like a checkerboard (G·T·G / T·G·T).
 * Every cell is a square of the same size; GIFs render borderless and
 * background-free (object-contain) so the forge illustrations float on the page.
 */
export function StatsInterleaved({ stats }: { stats: SiteMeta["stats"] }) {
  const t = useTranslations("Stats");
  const items = buildAboutStats(stats);

  // Flatten each stat into a [gif, text] pair → 6 cells that fill a 3-column
  // grid row by row, producing the alternating checkerboard automatically.
  const cells = items.flatMap((s) => [
    { kind: "gif" as const, stat: s },
    { kind: "text" as const, stat: s },
  ]);

  return (
    <section id="about" className="relative overflow-hidden pt-12 pb-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-14 max-w-2xl">
          <p className="mb-5 text-xs font-semibold uppercase tracking-[0.35em] text-forja-bone sm:text-sm">
            {t("sectionEyebrow")}
          </p>
          <h2
            className="font-display font-black uppercase leading-[0.9]"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3.4rem)" }}
          >
            <span className="text-forja-bone">{t("sectionHeading1")} </span>
            <span className="flame-text">{t("sectionHeading2")}</span>
          </h2>
        </Reveal>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {cells.map((c, i) => (
            <Reveal
              key={`${c.stat.key}-${c.kind}`}
              delay={i * 0.08}
              className="aspect-square"
            >
              {c.kind === "gif" ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  src={c.stat.gif}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className="h-full w-full object-contain"
                />
              ) : (
                <div className="flex h-full w-full flex-col items-center justify-center p-6 text-center">
                  <span
                    className="fire-text font-display font-black leading-[0.85]"
                    style={{ fontSize: "clamp(3.5rem, 7vw, 5.5rem)" }}
                  >
                    <CountUp value={c.stat.value} />
                  </span>
                  <p className="mt-2 font-display text-lg font-bold uppercase tracking-wide text-forja-bone">
                    {t(`${c.stat.key}Label`)}
                  </p>
                  <p className="mt-3 max-w-[26ch] text-pretty text-sm leading-relaxed text-forja-muted">
                    {t(`${c.stat.key}Body`)}
                  </p>
                </div>
              )}
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
