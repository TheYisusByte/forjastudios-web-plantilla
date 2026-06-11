import { getTranslations } from "next-intl/server";
import { Mail, Phone } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { Reveal } from "@/components/motion/Reveal";
import { Button } from "@/components/ui/Button";
import { AnimatedGif } from "@/components/ui/AnimatedGif";
import { forjaAssets } from "@/lib/content/assets";
import type { SiteContent } from "@/lib/content/types";

/** Concept D — "Contact us": CEO details + the parchment animation. */
export async function ContactD({ content }: { content: SiteContent }) {
  const t = await getTranslations("ConceptD");
  const { email, whatsapp } = content.meta.contact;
  const wa = whatsapp.replace(/\D/g, "");

  return (
    <Section id="contact">
      <div className="grid items-center gap-12 lg:grid-cols-[0.8fr_1fr]">
        <Reveal className="mx-auto w-full max-w-sm">
          <AnimatedGif
            asset={forjaAssets.anim.contact}
            alt="Contact us"
            className="aspect-square rounded-2xl border border-border bg-forja-red/10"
          />
        </Reveal>

        <Reveal delay={0.1}>
          <h2 className="font-display text-4xl font-bold uppercase sm:text-5xl">
            {t("contactTitle")}
          </h2>
          <p className="mt-4 max-w-md text-pretty text-fg-muted">
            {t("contactBody")}
          </p>

          <dl className="mt-8 space-y-1">
            <dt className="text-sm uppercase tracking-wide text-fg-muted">
              {t("contactRole")}
            </dt>
            <dd className="font-display text-2xl font-semibold">
              Oscar Darío Saldarriaga Sierra
            </dd>
          </dl>

          <div className="mt-8 flex flex-wrap gap-4">
            <Button href={`mailto:${email}`}>
              <Mail className="size-4" /> {email}
            </Button>
            <Button href={`https://wa.me/${wa}`} variant="outline">
              <Phone className="size-4" /> {whatsapp}
            </Button>
          </div>
        </Reveal>
      </div>
    </Section>
  );
}
