import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import type { SiteContent } from "@/lib/content/types";

export async function IPs({ content }: { content: SiteContent }) {
  const t = await getTranslations("Sections");
  return (
    <Section id="ip">
      <SectionHeading title={t("ips")} sub={t("ipsSub")} />
      <div className="grid gap-6 md:grid-cols-2">
        {content.ips.map((ip, i) => (
          <Reveal key={ip.slug} delay={i * 0.1}>
            <article className="relative h-full overflow-hidden rounded-2xl border border-border bg-surface p-8">
              <div
                className="absolute -right-12 -top-12 size-44 rounded-full opacity-30 blur-2xl"
                style={{
                  backgroundImage: `linear-gradient(135deg, ${ip.accent[0]}, ${ip.accent[1]})`,
                }}
              />
              <h3 className="font-display text-3xl font-semibold">{ip.name}</h3>
              <p className="mt-3 max-w-md text-pretty text-fg-muted">
                {ip.description}
              </p>
            </article>
          </Reveal>
        ))}
      </div>
    </Section>
  );
}
