import { getTranslations } from "next-intl/server";
import { Play } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteContent } from "@/lib/content/types";

/** Concept B — asymmetric bento grid mixing work, stats and services. */
export async function BentoB({ content }: { content: SiteContent }) {
  const ts = await getTranslations("Stats");
  const featured = content.projects[0];
  const cell =
    "rounded-3xl border border-border bg-surface p-6 flex flex-col justify-between";

  return (
    <Section id="studio">
      <div className="grid auto-rows-[minmax(150px,1fr)] grid-cols-2 gap-4 md:grid-cols-4">
        <Reveal className="col-span-2 row-span-2 md:col-span-2">
          <article
            className="group relative flex h-full min-h-72 flex-col justify-end overflow-hidden rounded-3xl border border-border p-6"
            style={{
              backgroundImage: `linear-gradient(135deg, ${featured.accent[0]}, ${featured.accent[1]})`,
            }}
          >
            <span className="flex size-12 items-center justify-center rounded-full bg-black/40 backdrop-blur-sm">
              <Play className="size-5 text-white" />
            </span>
            <div className="mt-auto pt-6 text-white">
              <span className="text-xs uppercase tracking-widest opacity-80">
                {featured.categoryLabel}
              </span>
              <h3 className="font-display text-3xl font-bold">{featured.title}</h3>
            </div>
          </article>
        </Reveal>

        <Reveal delay={0.05}>
          <div className={`${cell} h-full`}>
            <span className="font-display fire-text text-5xl font-bold">
              +{content.meta.stats.projects.toLocaleString()}
            </span>
            <span className="text-sm text-fg-muted">{ts("projects")}</span>
          </div>
        </Reveal>

        <Reveal delay={0.1}>
          <div className={`${cell} h-full`}>
            <span className="font-display text-2xl font-semibold">
              {content.services[0].label}
            </span>
            <span className="text-sm text-fg-muted">{content.services[3].label}</span>
          </div>
        </Reveal>

        <Reveal delay={0.15}>
          <div className={`${cell} h-full`}>
            <span className="font-display fire-text text-5xl font-bold">
              +{content.meta.stats.blacksmiths}
            </span>
            <span className="text-sm text-fg-muted">{ts("blacksmiths")}</span>
          </div>
        </Reveal>

        <Reveal delay={0.2}>
          <article
            className="relative h-full min-h-40 overflow-hidden rounded-3xl border border-border"
            style={{
              backgroundImage: `linear-gradient(135deg, ${content.projects[5].accent[0]}, ${content.projects[5].accent[1]})`,
            }}
          >
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
            <div className="absolute bottom-4 left-4 text-white">
              <span className="text-xs uppercase tracking-widest opacity-80">
                {content.projects[5].categoryLabel}
              </span>
              <h3 className="font-display text-xl font-bold">
                {content.projects[5].title}
              </h3>
            </div>
          </article>
        </Reveal>
      </div>
    </Section>
  );
}
