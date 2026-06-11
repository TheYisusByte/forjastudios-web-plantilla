import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import { forjaAssets } from "@/lib/content/assets";
import type { SiteContent } from "@/lib/content/types";

/** Concept D — about blurb + the three signature stats (original copy). */
export async function StudioD({ content }: { content: SiteContent }) {
  const t = await getTranslations("ConceptD");
  const { years, blacksmiths, projects } = content.meta.stats;

  const stats = [
    { value: blacksmiths, label: t("statBlacksmiths"), sub: t("statBlacksmithsSub") },
    { value: projects, label: t("statProjects"), sub: t("statProjectsSub") },
    { value: years, label: t("statYears"), sub: t("statYearsSub") },
  ];

  return (
    <Section id="studio">
      <div className="grid items-center gap-12 lg:grid-cols-[1fr_0.8fr]">
        <Reveal>
          <p className="font-display text-2xl font-semibold uppercase leading-tight sm:text-3xl">
            {t("aboutHeading")}
          </p>
          <p className="mt-5 max-w-xl text-pretty text-fg-muted">{t("intro")}</p>
        </Reveal>
        <Reveal delay={0.1} className="relative mx-auto w-full max-w-sm">
          <Image
            src={forjaAssets.blacksmiths}
            alt="Forja blacksmiths"
            width={600}
            height={600}
            className="h-auto w-full opacity-90 [filter:invert(1)]"
          />
        </Reveal>
      </div>

      <div className="mt-16 grid gap-10 border-t border-border pt-12 sm:grid-cols-3">
        {stats.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1}>
            <div className="font-display fire-text text-6xl font-bold sm:text-7xl">
              <CountUp value={s.value} />
            </div>
            <p className="mt-2 font-display text-lg font-semibold uppercase tracking-wide">
              {s.label}
            </p>
            <p className="mt-1 text-sm text-fg-muted">{s.sub}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
