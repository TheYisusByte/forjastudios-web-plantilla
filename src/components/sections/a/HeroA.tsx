import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/Button";
import type { SiteContent } from "@/lib/content/types";

/** Concept A — minimal hero: strong type, fire accent on "flame", subtle glow. */
export async function HeroA({ content }: { content: SiteContent }) {
  const t = await getTranslations("Hero");
  return (
    <section
      id="top"
      className="relative flex min-h-dvh items-center overflow-hidden"
    >
      <div
        className="pointer-events-none absolute inset-0 opacity-50"
        style={{
          backgroundImage:
            "radial-gradient(60% 50% at 50% -5%, rgba(255,106,44,0.22), transparent 70%)",
        }}
      />
      <div className="relative mx-auto w-full max-w-7xl px-6">
        <p className="text-sm uppercase tracking-[0.2em] text-fg-muted">
          {content.meta.descriptor}
        </p>
        <h1 className="font-display mt-5 text-balance text-6xl font-bold uppercase leading-[0.92] sm:text-8xl">
          Forge your <span className="fire-text">flame</span>
        </h1>
        <p className="mt-6 max-w-xl text-pretty text-lg text-fg-muted">
          {t("lead")}
        </p>
        <div className="mt-10 flex flex-wrap gap-4">
          <Button href="#work">{t("ctaWork")}</Button>
          <Button href="#contact" variant="outline">
            {t("ctaContact")}
          </Button>
        </div>
      </div>
    </section>
  );
}
