import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import { HeroBgVideo } from "./HeroBgVideo";
import { meta } from "@/lib/content/data";

/** Concept D — hero with YouTube showreel as full-bleed background video. */
export async function HeroD() {
  const t = await getTranslations("ConceptD");

  return (
    <section
      id="top"
      className="relative flex min-h-dvh items-end overflow-hidden"
    >
      {/* Muted autoplay video background */}
      <HeroBgVideo videoId={meta.showreelId} />

      {/* Scrim — stronger at top (nav readability) and bottom (text readability) */}
      <div
        className="absolute inset-0"
        style={{
          background:
            "linear-gradient(180deg, rgba(10,10,11,0.65) 0%, rgba(10,10,11,0.10) 40%, rgba(10,10,11,0.88) 100%)",
        }}
      />

      <div className="relative mx-auto w-full max-w-7xl px-6 pb-20 pt-32">
        <h1 className="font-display max-w-4xl text-balance text-6xl font-bold uppercase leading-[0.92] sm:text-8xl">
          Forge your <span className="fire-text">flame</span>
        </h1>
        <p className="mt-6 max-w-2xl text-pretty text-lg text-forja-bone/85">
          {t("intro")}
        </p>
        <div className="mt-9 flex flex-wrap gap-4">
          <Button href="#work">{t("navIp")}</Button>
          <Button href="#contact" variant="outline">
            {t("navContact")}
          </Button>
        </div>
      </div>
    </section>
  );
}
