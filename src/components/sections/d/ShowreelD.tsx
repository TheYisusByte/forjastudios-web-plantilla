import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/ui/Section";
import { YouTubeEmbed } from "@/components/ui/YouTubeEmbed";
import type { SiteContent } from "@/lib/content/types";

/** Concept D — full showreel section with lazy YouTube embed. */
export async function ShowreelD({ content }: { content: SiteContent }) {
  const t = await getTranslations("Showreel");
  return (
    <Section id="showreel">
      <SectionHeading title={t("title")} sub={t("sub")} />
      <YouTubeEmbed id={content.meta.showreelId} title={t("title")} />
    </Section>
  );
}
