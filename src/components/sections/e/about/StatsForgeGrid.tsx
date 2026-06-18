"use client";

import { useTranslations } from "next-intl";
import { CountUp } from "@/components/motion/CountUp";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteMeta } from "@/lib/content/types";
import { buildAboutStats } from "./stats";

/**
 * Option A — "Forge Grid".
 * Three bento cards. Each card frames its animated GIF (dimmed by default,
 * ignites to full color on hover), with a big CountUp number on top.
 */
export function StatsForgeGrid({ stats }: { stats: SiteMeta["stats"] }) {
  const t = useTranslations("Stats");
  const items = buildAboutStats(stats);

  return (
    <section id="about" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6">
        <Reveal className="mb-14 max-w-2xl">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-forja-muted">
            {t("sectionEyebrow")}
          </p>
          <h2
            className="font-display font-black uppercase leading-[0.9]"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3.4rem)" }}
          >
            <span className="block text-forja-bone">{t("sectionHeading1")}</span>
            <span className="fire-text block">{t("sectionHeading2")}</span>
          </h2>
        </Reveal>

        <div className="grid gap-6 md:grid-cols-3">
          {items.map((s, i) => (
            <Reveal key={s.key} delay={i * 0.12}>
              <article className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-border bg-forja-carbon/40">
                {/* Media */}
                <div className="relative aspect-[4/3] overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.gif}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="h-full w-full scale-105 object-cover opacity-55 saturate-[0.6] transition-all duration-700 ease-out group-hover:scale-100 group-hover:opacity-100 group-hover:saturate-100"
                  />
                  <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forja-carbon via-forja-carbon/20 to-transparent" />
                </div>

                {/* Number + copy */}
                <div className="relative -mt-12 flex flex-1 flex-col px-7 pb-8">
                  <span
                    className="font-display font-black leading-none"
                    style={{ fontSize: "clamp(3rem, 6vw, 5rem)" }}
                  >
                    <CountUp value={s.value} className="fire-text" />
                  </span>
                  <p className="mt-3 font-display text-lg font-bold uppercase tracking-wide text-forja-bone">
                    {t(`${s.key}Label`)}
                  </p>
                  <p className="mt-2 text-sm leading-relaxed text-forja-muted">
                    {t(`${s.key}Body`)}
                  </p>
                </div>

                <div className="fire-bg absolute inset-x-0 bottom-0 h-0.5 origin-left scale-x-0 transition-transform duration-500 group-hover:scale-x-100" />
              </article>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
