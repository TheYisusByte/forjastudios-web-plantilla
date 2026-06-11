import { getTranslations } from "next-intl/server";
import { ChevronDown } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { BreathingLight } from "@/components/motion/BreathingLight";
import type { SiteContent } from "@/lib/content/types";

/** Concept C — cinematic, warm, illustration-led hero with serif display. */
export async function HeroC({ content }: { content: SiteContent }) {
  const t = await getTranslations("Hero");
  return (
    <section
      id="top"
      className="relative flex min-h-dvh items-center justify-center overflow-hidden text-center"
    >
      {/* Warm layered backdrop (placeholder for the illustration). */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage:
            "radial-gradient(120% 90% at 50% 120%, rgba(255,178,62,0.30), transparent 60%), radial-gradient(80% 60% at 50% -10%, rgba(255,106,44,0.20), transparent 70%)",
        }}
      />
      <BreathingLight className="pointer-events-none absolute inset-0 bg-[radial-gradient(50%_40%_at_50%_60%,rgba(255,178,62,0.18),transparent_70%)]" />

      <div className="relative z-10 mx-auto max-w-3xl px-6">
        <p className="text-sm uppercase tracking-[0.25em] text-fg-muted">
          {content.meta.descriptor}
        </p>
        <h1 className="font-display mt-6 text-balance text-5xl font-medium leading-tight sm:text-7xl">
          Forge your flame
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-pretty text-lg text-fg-muted">
          {t("lead")}
        </p>
        <div className="mt-10 flex justify-center">
          <Button href="#studio">{t("ctaDiscover")}</Button>
        </div>
      </div>

      <div className="absolute bottom-8 left-1/2 flex -translate-x-1/2 items-center gap-2 text-sm text-fg-muted">
        <ChevronDown className="size-4" /> {t("scroll")}
      </div>
    </section>
  );
}
