import { getTranslations } from "next-intl/server";
import { SectionHeading } from "@/components/ui/Section";
import { ProjectGrid } from "@/components/ui/ProjectGrid";
import type { SiteContent } from "@/lib/content/types";

/**
 * Concept D — full-viewport-width projects grid.
 * Heading is constrained to max-w-7xl; the grid bleeds edge-to-edge.
 */
export async function WorksD({ content }: { content: SiteContent }) {
  const t = await getTranslations("Sections");
  return (
    <section id="work" className="pb-0 pt-20 sm:pt-28">
      <div className="mx-auto mb-12 max-w-7xl px-6">
        <SectionHeading title={t("projects")} sub={t("projectsSub")} />
      </div>
      <ProjectGrid projects={content.projects} />
    </section>
  );
}
