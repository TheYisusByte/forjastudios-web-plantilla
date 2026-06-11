import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { CountUp } from "@/components/motion/CountUp";
import type { SiteContent } from "@/lib/content/types";

export async function Stats({ content }: { content: SiteContent }) {
  const t = await getTranslations("Stats");
  const { years, blacksmiths, projects } = content.meta.stats;
  const items = [
    { value: years, label: t("years") },
    { value: blacksmiths, label: t("blacksmiths") },
    { value: projects, label: t("projects") },
  ];

  return (
    <Section id="stats">
      <div className="grid gap-10 sm:grid-cols-3">
        {items.map((s, i) => (
          <Reveal key={s.label} delay={i * 0.1} className="text-center sm:text-left">
            <div className="font-display fire-text text-6xl font-bold sm:text-7xl">
              <CountUp value={s.value} />
            </div>
            <p className="mt-2 text-fg-muted">{s.label}</p>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
