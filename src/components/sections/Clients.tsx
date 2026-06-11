import { getTranslations } from "next-intl/server";
import { Marquee } from "@/components/ui/Marquee";
import type { SiteContent } from "@/lib/content/types";

export async function Clients({ content }: { content: SiteContent }) {
  const t = await getTranslations("Sections");
  return (
    <section id="clients" className="border-y border-border py-10">
      <p className="mx-auto mb-6 max-w-7xl px-6 text-sm uppercase tracking-widest text-fg-muted">
        {t("clients")}
      </p>
      <Marquee items={content.clients.map((c) => c.name)} />
    </section>
  );
}
