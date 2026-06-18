"use client";

import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { CountUp } from "@/components/motion/CountUp";
import { cn } from "@/lib/utils";
import type { SiteMeta } from "@/lib/content/types";
import { buildAboutStats } from "./stats";

/**
 * Option C — "Sticky Spotlight".
 * The GIF column stays pinned while the three stats scroll past on the right;
 * the pinned media crossfades to match whichever stat is centered.
 */
export function StatsSpotlight({ stats }: { stats: SiteMeta["stats"] }) {
  const t = useTranslations("Stats");
  const items = buildAboutStats(stats);

  const [active, setActive] = useState(0);
  const blockRefs = useRef<(HTMLDivElement | null)[]>([]);

  useEffect(() => {
    const els = blockRefs.current.filter(Boolean) as HTMLDivElement[];
    if (!els.length) return;
    // Fire when a block crosses the vertical center of the viewport.
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Number((e.target as HTMLElement).dataset.idx);
            setActive(idx);
          }
        });
      },
      { rootMargin: "-50% 0px -50% 0px", threshold: 0 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  return (
    <section id="about" className="relative overflow-hidden py-24">
      <div className="mx-auto max-w-7xl px-6">
        <div className="mb-16 max-w-2xl">
          <p className="mb-5 text-xs uppercase tracking-[0.3em] text-forja-muted">
            {t("sectionEyebrow")}
          </p>
          <h2
            className="font-display font-black uppercase leading-[0.9]"
            style={{ fontSize: "clamp(1.9rem, 4vw, 3.4rem)" }}
          >
            <span className="text-forja-bone">{t("sectionHeading1")} </span>
            <span className="fire-text">{t("sectionHeading2")}</span>
          </h2>
        </div>

        <div className="grid gap-10 md:grid-cols-2 md:gap-16">
          {/* Pinned media */}
          <div className="hidden md:block">
            <div className="sticky top-24 aspect-square overflow-hidden rounded-[2rem] border border-border">
              {items.map((s, i) => (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img
                  key={s.key}
                  src={s.gif}
                  alt=""
                  loading="lazy"
                  decoding="async"
                  className={cn(
                    "absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ease-out",
                    i === active ? "opacity-100" : "opacity-0",
                  )}
                />
              ))}
              <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-forja-black/40 to-transparent" />
              {/* progress dots */}
              <div className="absolute bottom-5 left-5 flex gap-2">
                {items.map((s, i) => (
                  <span
                    key={s.key}
                    className={cn(
                      "h-1.5 rounded-full transition-all duration-500",
                      i === active ? "fire-bg w-8" : "w-1.5 bg-white/30",
                    )}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Scrolling stats */}
          <div>
            {items.map((s, i) => (
              <div
                key={s.key}
                data-idx={i}
                ref={(el) => {
                  blockRefs.current[i] = el;
                }}
                className="flex min-h-[60vh] flex-col justify-center border-t border-border/60 py-10 first:border-t-0"
              >
                {/* Mobile media (sticky column is hidden below md) */}
                <div className="mb-6 overflow-hidden rounded-2xl border border-border md:hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={s.gif}
                    alt=""
                    loading="lazy"
                    decoding="async"
                    className="aspect-[5/4] w-full object-cover"
                  />
                </div>

                <span
                  className={cn(
                    "fire-text block font-display font-black leading-[0.82] transition-opacity duration-500",
                    i === active ? "opacity-100" : "md:opacity-40",
                  )}
                  style={{ fontSize: "clamp(4rem, 11vw, 9rem)" }}
                >
                  <CountUp value={s.value} />
                </span>
                <p className="mt-2 font-display text-2xl font-bold uppercase tracking-wide text-forja-bone">
                  {t(`${s.key}Label`)}
                </p>
                <p className="mt-4 max-w-md text-pretty text-base leading-relaxed text-forja-muted">
                  {t(`${s.key}Body`)}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
