import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteContent } from "@/lib/content/types";

/** Concept A — clean 3-column project grid with subtle hover zoom. */
export async function ProjectsA({ content }: { content: SiteContent }) {
  const t = await getTranslations("Sections");
  return (
    <Section id="work">
      <SectionHeading title={t("projects")} sub={t("projectsSub")} />
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {content.projects.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 3) * 0.08}>
            <article className="group overflow-hidden rounded-2xl border border-border bg-surface">
              <div className="relative aspect-[4/3] overflow-hidden">
                <div
                  className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})`,
                  }}
                />
                <span className="absolute left-4 top-4 rounded-full bg-bg/70 px-3 py-1 text-xs text-fg backdrop-blur-sm">
                  {p.categoryLabel}
                </span>
              </div>
              <div className="flex items-center justify-between gap-3 p-5">
                <div>
                  <h3 className="font-display text-lg font-semibold">{p.title}</h3>
                  <p className="text-sm text-fg-muted">{p.client}</p>
                </div>
                <span className="text-sm text-fg-muted">{p.year}</span>
              </div>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
