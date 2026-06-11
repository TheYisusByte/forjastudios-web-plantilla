import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import type { SiteContent } from "@/lib/content/types";

/** Concept A — showreel section embedding the studio reel (@ForjaCollective). */
export async function ShowreelA({ content }: { content: SiteContent }) {
  const t = await getTranslations("Showreel");

  return (
    <Section id="reel">
      <SectionHeading title={t("title")} sub={t("sub")} />
      <Reveal>
        <YouTubeEmbed id={content.meta.showreelId} title={t("title")} />
      </Reveal>
    </Section>
  );
}
