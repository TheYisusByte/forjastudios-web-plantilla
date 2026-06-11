import { getTranslations } from "next-intl/server";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

/** Concept C — narrative "Our story" block with a slow parallax visual. */
export async function StoryC() {
  const t = await getTranslations("Sections");
  return (
    <Section id="studio">
      <div className="grid items-center gap-12 md:grid-cols-2">
        <Reveal>
          <h2 className="font-display text-4xl font-medium sm:text-5xl">
            {t("story")}
          </h2>
          <p className="mt-6 text-pretty text-lg leading-relaxed text-fg-muted">
            {t("storyBody")}
          </p>
        </Reveal>
        <Reveal delay={0.1}>
          <Parallax speed={0.15}>
            <div
              className="aspect-[4/5] w-full rounded-3xl"
              style={{
                backgroundImage:
                  "linear-gradient(160deg, #2a1d16, #3a2418 40%, #7a3a1e)",
              }}
            />
          </Parallax>
        </Reveal>
      </div>
    </Section>
  );
}
