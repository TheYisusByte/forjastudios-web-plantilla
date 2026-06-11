import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteContent } from "@/lib/content/types";

/** Concept C — "What we craft": services as an editorial list. */
export async function CraftC({ content }: { content: SiteContent }) {
  const t = await getTranslations("Sections");
  return (
    <Section id="craft">
      <SectionHeading title={t("craft")} sub={t("craftSub")} />
      <ul className="border-t border-border">
        {content.services.map((s, i) => (
          <Reveal key={s.key} delay={i * 0.04}>
            <li className="flex items-baseline justify-between gap-6 border-b border-border py-6">
              <span className="font-display text-2xl sm:text-4xl">{s.label}</span>
              <span className="text-sm text-fg-muted">
                {String(i + 1).padStart(2, "0")}
              </span>
            </li>
          </Reveal>
        ))}
      </ul>
    </Section>
  );
}
