import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { Section, SectionHeading } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { AnimatedGif } from "@/components/ui/AnimatedGif";
import { forjaAssets } from "@/lib/content/assets";
import type { SiteContent } from "@/lib/content/types";

/** Concept D — "Our IP's": Carameloki + India Catalina, with the tomes animation. */
export async function IPsD({ content }: { content: SiteContent }) {
  const t = await getTranslations("ConceptD");

  return (
    <Section id="ip">
      <SectionHeading title={t("ipTitle")} sub={t("ipSub")} />
      <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
        {/* Carameloki */}
        <Reveal className="flex flex-col items-center justify-center gap-6 rounded-2xl border border-border bg-surface p-10 text-center">
          <Image
            src={forjaAssets.caramelokiLogo}
            alt="Carameloki"
            width={460}
            height={130}
            className="h-auto w-64"
          />
          <p className="max-w-sm text-pretty text-sm text-fg-muted">
            {content.ips.find((ip) => ip.slug === "carameloki")?.description}
          </p>
        </Reveal>

        {/* India Catalina */}
        <Reveal
          delay={0.1}
          className="relative flex min-h-72 flex-col justify-end overflow-hidden rounded-2xl border border-border p-10"
        >
          <Image
            src={forjaAssets.heroKeyArt}
            alt="India Catalina"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-forja-black via-forja-black/40 to-transparent" />
          <div className="relative">
            <h3 className="font-display text-3xl font-bold uppercase">
              India Catalina
            </h3>
            <p className="mt-2 max-w-sm text-pretty text-sm text-forja-bone/85">
              {content.ips.find((ip) => ip.slug === "india-catalina")?.description}
            </p>
          </div>
        </Reveal>
      </div>

      <Reveal className="mx-auto mt-10 w-full max-w-md">
        <AnimatedGif
          asset={forjaAssets.anim.ip}
          alt="The Forja tomes"
          className="aspect-square rounded-2xl border border-border bg-forja-red/10"
        />
      </Reveal>
    </Section>
  );
}
