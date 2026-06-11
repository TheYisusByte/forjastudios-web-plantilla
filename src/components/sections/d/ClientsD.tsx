import { getTranslations } from "next-intl/server";
import { ArrowUpRight } from "lucide-react";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteContent } from "@/lib/content/types";

/** Concept D — "Our clients" grid with a See-more link to the YouTube channel. */
export async function ClientsD({ content }: { content: SiteContent }) {
  const t = await getTranslations("ConceptD");
  const channel = content.meta.socials.find((s) => s.label === "YouTube")?.href;

  return (
    <Section id="clients">
      <SectionHeading title={t("clientsTitle")} />
      <div className="grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-border bg-border sm:grid-cols-3">
        {content.clients.map((c, i) => (
          <Reveal
            key={c.name}
            delay={i * 0.05}
            className="flex min-h-28 items-center justify-center bg-surface px-6 text-center"
          >
            <span className="font-display text-lg font-semibold uppercase tracking-wide text-fg-muted">
              {c.name}
            </span>
          </Reveal>
        ))}
      </div>
      {channel && (
        <a
          href={channel}
          target="_blank"
          rel="noreferrer"
          className="mt-8 inline-flex items-center gap-2 text-sm font-medium text-accent hover:brightness-110"
        >
          {t("seeMore")}
          <ArrowUpRight className="size-4" />
        </a>
      )}
    </Section>
  );
}
