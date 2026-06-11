import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteContent } from "@/lib/content/types";

export async function Team({ content }: { content: SiteContent }) {
  const t = await getTranslations("Sections");
  return (
    <Section id="team">
      <SectionHeading title={t("team")} sub={t("teamSub")} />
      <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:grid-cols-6">
        {content.team.map((m, i) => (
          <Reveal key={m.name} delay={i * 0.05}>
            <figure className="text-center">
              <div
                className="font-display mx-auto flex size-20 items-center justify-center rounded-full text-xl font-bold text-[#0a0a0b]"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${m.accent[0]}, ${m.accent[1]})`,
                }}
                aria-hidden
              >
                {m.initials}
              </div>
              <figcaption className="mt-3">
                <p className="font-medium">{m.name}</p>
                <p className="text-sm text-fg-muted">{m.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
