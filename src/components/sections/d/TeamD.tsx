import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedGif } from "@/components/ui/AnimatedGif";
import { forjaAssets } from "@/lib/content/assets";
import type { SiteContent } from "@/lib/content/types";

/** Concept D — "Our team": the blacksmiths blurb, real portraits, fist-bump gif. */
export async function TeamD({ content }: { content: SiteContent }) {
  const t = await getTranslations("ConceptD");

  return (
    <Section id="team">
      <div className="grid items-center gap-10 lg:grid-cols-[1fr_0.7fr]">
        <div>
          <SectionHeading title={t("teamTitle")} sub={t("teamBody")} />
          <div className="grid grid-cols-3 gap-4 sm:grid-cols-6 lg:grid-cols-3">
            {content.team.map((m, i) => (
              <Reveal key={m.name} delay={i * 0.06}>
                <div className="relative aspect-[3/4] overflow-hidden rounded-xl border border-border bg-surface">
                  <Image
                    src={forjaAssets.teamPhotos[i % forjaAssets.teamPhotos.length]}
                    alt={m.name}
                    fill
                    sizes="(max-width: 640px) 33vw, 160px"
                    className="object-cover"
                  />
                </div>
                <p className="mt-2 text-xs font-medium">{m.name}</p>
                <p className="text-xs text-fg-muted">{m.role}</p>
              </Reveal>
            ))}
          </div>
        </div>
        <Reveal delay={0.1}>
          <AnimatedGif
            asset={forjaAssets.anim.team}
            alt="Forja blacksmiths"
            className="aspect-square rounded-2xl border border-border bg-forja-red/10"
          />
        </Reveal>
      </div>
    </Section>
  );
}
