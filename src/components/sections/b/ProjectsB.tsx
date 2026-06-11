import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/Section";
import type { SiteContent } from "@/lib/content/types";

/** Concept B — horizontal scroll-snap strip of projects with glow on hover. */
export async function ProjectsB({ content }: { content: SiteContent }) {
  const t = await getTranslations("Sections");
  return (
    <section id="work" className="py-20 sm:py-28">
      <div className="mx-auto mb-10 max-w-7xl px-6">
        <SectionHeading title={t("projects")} sub={t("projectsSub")} />
      </div>
      <div className="flex snap-x snap-mandatory gap-6 overflow-x-auto px-6 pb-6">
        {content.projects.map((p) => (
          <article
            key={p.slug}
            className="group relative aspect-[3/4] w-[78vw] shrink-0 snap-start overflow-hidden rounded-3xl border border-border sm:w-[360px]"
          >
            <div
              className="absolute inset-0 transition-transform duration-500 group-hover:scale-105"
              style={{
                backgroundImage: `linear-gradient(135deg, ${p.accent[0]}, ${p.accent[1]})`,
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
            <div className="absolute bottom-0 p-6 text-white">
              <span className="text-xs uppercase tracking-widest opacity-80">
                {p.categoryLabel} · {p.year}
              </span>
              <h3 className="font-display text-2xl font-bold">{p.title}</h3>
              <p className="mt-1 text-sm text-white/70">{p.client}</p>
            </div>
            <div
              className="pointer-events-none absolute inset-0 rounded-3xl opacity-0 transition-opacity duration-300 group-hover:opacity-100"
              style={{ boxShadow: "inset 0 0 60px rgba(255,106,44,0.45)" }}
            />
          </article>
        ))}
      </div>
    </section>
  );
}
