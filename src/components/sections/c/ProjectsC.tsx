import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { cn } from "@/lib/utils";
import type { SiteContent } from "@/lib/content/types";

/** Concept C — selected work, scene by scene (one full-bleed piece per block). */
export async function ProjectsC({ content }: { content: SiteContent }) {
  const t = await getTranslations("Sections");
  return (
    <section id="work" className="py-20 sm:py-28">
      <div className="mx-auto mb-16 max-w-7xl px-6">
        <SectionHeading title={t("projects")} sub={t("projectsSub")} />
      </div>
      <div className="flex flex-col gap-24">
        {content.projects.slice(0, 4).map((p, i) => (
          <Reveal key={p.slug}>
            <div
              className={cn(
                "mx-auto grid max-w-7xl items-center gap-10 px-6 md:grid-cols-2",
                i % 2 === 1 && "md:[&>*:first-child]:order-2",
              )}
            >
              <Parallax speed={0.12}>
                <div
                  className="aspect-[16/10] w-full rounded-3xl"
                  style={{
                    backgroundImage: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})`,
                  }}
                />
              </Parallax>
              <div>
                <span className="text-sm uppercase tracking-widest text-fg-muted">
                  {p.categoryLabel} · {p.year}
                </span>
                <h3 className="font-display mt-3 text-4xl font-medium">
                  {p.title}
                </h3>
                <p className="mt-4 max-w-md text-pretty text-fg-muted">
                  {p.description}
                </p>
              </div>
            </div>
          </Reveal>
        ))}
      </div>
    </section>
  );
}
